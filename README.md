# HYTOPIA Game Engine

This is the monorepo for the core HYTOPIA game engine.

The following are included in the monorepo:

- [`assets`](./assets): The default game assets provided to creators by HYTOPIA. Published as an npm package to `@hytopia.com/assets`.

- [`client`](./client): The game client that runs in the browser, currently at play.hytopia.com internally, but publicly accessible via hytopia.com games or hytopia.com/play for overlay features.

- [`protocol`](./protocol): The networking protocol defining the packet structures for data sent between the client and server. Published as an npm package to `@hytopia.com/server-protocol`.

- [`sdk`](./sdk): A git submodule pointing to the public HYTOPIA SDK repository. This is included as a submodule for the convenience of compiling the server to new SDK versions for release. The public repo can be found here: https://github.com/hytopiagg/sdk/ 

- [`server`](./server): The source code for the game server, when built it compiles as a single `server.js` file to the `sdk` submodule directory for convenience.

## Quick Start

You can quickly run a local version of the client and server for development as follows.

Install dependencies
```bash
cd server && npm install && cd ../client && npm install
```

Next, run the server in a new terminal window, it will start a local server at `localhost:8080`. This is running the uncompiled version of the server using hot reloading with the file in server/src/playground.ts for fast debugging and testing.
```bash
cd server && npm run dev
```

Then, also run the client in a new terminal window, it will start a local client at `localhost:5173`.
```bash
cd client && npm run dev
```

In the browser, open `localhost:5173` and you should see the client and be able to connect to your local server.

You can edit code for your server by editing the `server/src/playground.ts` file. When you run `npm run dev` for the `server` directory, this will run the server from the `src/playground.ts` file.
