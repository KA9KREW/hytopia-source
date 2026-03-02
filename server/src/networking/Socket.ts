import { randomBytes } from 'crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { Http3Server } from '@fails-components/webtransport';
import ErrorHandler from '@/errors/ErrorHandler';
import EventRouter from '@/events/EventRouter';
import Connection, { ConnectionEvent } from '@/networking/Connection';
import PlatformGateway from '@/networking/PlatformGateway';
import { WebServerEvent, PORT } from '@/networking/WebServer';
import { SSL_CERT, SSL_KEY } from '@/networking/ssl/certs';
import type { IncomingMessage } from 'http';
import type { Socket as RawSocket } from 'net';
import type { Session } from '@/networking/PlatformGateway';
import type { WebTransportSessionImpl } from '@fails-components/webtransport/dist/lib/types';

declare module '@fails-components/webtransport/dist/lib/types' {
  interface WebTransportSessionImpl {
    userData: {
      connectionId?: string,
      connectionParams?: URLSearchParams,
      session?: Session,
      onclose?: () => void,
    };
  }
}

/**
 * Manages WebSocket and WebTransport connections for the server.
 *
 * When to use: internal network transport management only.
 * Do NOT use for: gameplay logic; use `Connection` or higher-level managers.
 *
 * @remarks
 * Listens for `WebServerEvent.UPGRADE` to accept WebSocket connections
 * and runs a WebTransport server on the same port for modern clients.
 *
 * Pattern: use the singleton `Socket.instance` created at server startup.
 * Anti-pattern: creating additional Socket instances (will bind duplicate listeners).
 *
 * **Category:** Networking
 * @internal
 */
export default class Socket extends EventRouter {
  /**
   * Singleton instance.
   *
   * **Category:** Networking
   */
  public static readonly instance: Socket = new Socket();
  
  private _connectionIdConnections: Map<string, Connection> = new Map();
  private _userIdConnections: Map<string, Connection> = new Map();
  private _wss: WebSocketServer;  
  private _wts: Http3Server;

  /**
   * Creates the socket manager and starts listening for connections.
   *
   * **Side effects:** Starts the WebTransport server and registers upgrade listeners.
   *
   * **Category:** Networking
   */
  public constructor() {
    super();

    // Setup WebSocket Server
    this._wss = new WebSocketServer({ noServer: true });
    this._wss.on('connection', (ws, req) => this._onConnection(ws, undefined, req.connectionId, req.connectionParams, req.session));
    
    this._wts = new Http3Server({
      port: PORT,
      host: '0.0.0.0',
      secret: randomBytes(32).toString('hex'),
      cert: SSL_CERT,
      privKey: SSL_KEY,
      defaultDatagramsReadableMode: 'bytes',
      initialStreamFlowControlWindow: 1 * 1024 * 1024, // 1 MB - handles worst case 500KB+ packets without blocking
      streamShouldAutoTuneReceiveWindow: true, // Auto-grows window based on actual throughput
      streamFlowControlWindowSizeLimit: 6 * 1024 * 1024, // (Chrome Standard) - allows multiple large packets in flight
      initialSessionFlowControlWindow: 2 * 1024 * 1024, // 2 MB - allows multiple streams/packets in flight
      sessionShouldAutoTuneReceiveWindow: true, // Auto-grows session window to prevent bottlenecks
      sessionFlowControlWindowSizeLimit: 15 * 1024 * 1024, // (Chrome Standard) - handles sustained high throughput
    });

    this._wts.setRequestCallback(this._onWebTransportRequest);
    
    this._startWebTransport().catch(error => {
      ErrorHandler.error(`Socket: WebTransport server failed to start or crashed while listening for sessions. Error: ${error as Error}`);
    });

    EventRouter.globalInstance.on(WebServerEvent.UPGRADE, async ({ req, socket, head }) => {
      socket.on('error', () => { /* NOOP */ }); // Ignore socket errors to prevent process crash.

      await this._authorizeAndConnectWebsocket(req, socket, head);
    });
  }

  private async _authorizeAndConnectWebsocket(req: IncomingMessage, socket: RawSocket, head: Buffer) {
    const authorizeResult = await this._authorizeConnection(req.url ?? '');

    if (authorizeResult.error) {
      socket.end();

      return;
    }

    req.connectionId = authorizeResult.connectionId;
    req.connectionParams = authorizeResult.connectionParams;
    req.session = authorizeResult.session;

    // Disable Nagle's algorithm to reduce latency
    socket.setNoDelay(true);

    this._wss.handleUpgrade(req, socket, head, ws => {
      if (ws.readyState !== WebSocket.OPEN) {
        ws.once('open', () => this._wss.emit('connection', ws, req));
      } else {
        this._wss.emit('connection', ws, req);
      }
    });
  }

  private async _authorizeConnection(connectionUrl: string): Promise<{ connectionId?: string, connectionParams?: URLSearchParams, session?: Session, error?: unknown }> {
    const search = connectionUrl.includes('?') ? connectionUrl.slice(connectionUrl.indexOf('?')) : '';
    const connectionParams = new URLSearchParams(search);
    const connectionId = connectionParams.get('connectionId') ?? undefined;
    const sessionToken = connectionParams.get('sessionToken') ?? '';

    if (connectionId && this._isValidConnectionId(connectionId)) {
      return { connectionId, connectionParams };
    } else {
      const sessionResult = await PlatformGateway.instance.getPlayerSession(sessionToken);
      
      if (sessionResult?.error) {
        return { error: sessionResult.error };
      } else if (sessionResult) {
        return { connectionParams, session: sessionResult as Session };
      }
    }

    // Reached if no session such as in local development.
    return { connectionParams };
  }

  private _isValidConnectionId(connectionId: string): boolean {
    return this._connectionIdConnections.has(connectionId);
  }

  private _onConnection = (ws?: WebSocket, wt?: WebTransportSessionImpl, connectionId?: string, connectionParams?: URLSearchParams, session?: Session) => {
    const userId = session?.user.id;

    const existingConnectionForConnectionId = connectionId && this._connectionIdConnections.get(connectionId);
    const existingConnectionForUserId = userId && this._userIdConnections.get(userId);
    
    if (!existingConnectionForConnectionId && existingConnectionForUserId) {
      // We'll create a new connection, kill the existing one for this user.
      existingConnectionForUserId.killDuplicateConnection();
    }

    if (existingConnectionForConnectionId) {
      if (ws) {
        existingConnectionForConnectionId.bindWs(ws);
      }

      if (wt) {
        void existingConnectionForConnectionId.bindWt(wt).catch(error => {
          ErrorHandler.error(`Socket._onConnection(): WebTransport binding failed. Error: ${error as Error}`);
        });
      }
    } else {
      const connection = new Connection(ws, wt, connectionParams, session);

      connection.on(ConnectionEvent.CLOSED, () => {
        this._connectionIdConnections.delete(connection.id);

        if (userId && this._userIdConnections.get(userId) === connection) {
          this._userIdConnections.delete(userId);
        }
      });

      this._connectionIdConnections.set(connection.id, connection);      
      
      if (userId) {
        this._userIdConnections.set(userId, connection);
      }
    }
  };

  private _onWebTransportRequest = async ({ header }: { header: Record<string, string> }) => {
    const { connectionId, connectionParams, session, error } = await this._authorizeConnection(header[':path'] ?? '');
    
    return {
      status: error ? 401 : 200,
      path: '/',
      userData: { connectionId, connectionParams, session },
    };
  };

  private async _startWebTransport() {
    this._wts.startServer();

    // Listen for webtransport sessions being opened and bind them to a connection
    for await (const wt of this._wts.sessionStream('/')) {
      try {
        const { connectionId, connectionParams, session } = wt.userData;

        this._onConnection(undefined, wt, connectionId, connectionParams, session);
      } catch (error) {
        ErrorHandler.error(`Socket._startWebTransport(): WebTransport connection failed. Error: ${error as Error}`);
      }
    }
  }
}
