import fs from 'fs';
import path from 'path';
import ErrorHandler from '@/errors/ErrorHandler';

/**
 * Manages the assets library and synchronization of assets
 * to the local assets directory in development.
 *
 * When to use: pulling assets from the shared library during local development.
 * Do NOT use for: production asset loading; the library is disabled in production.
 *
 * @remarks
 * The AssetsLibrary is created internally as a global
 * singleton accessible via `AssetsLibrary.instance`.
 *
 * Assets automatically sync to local assets in development mode the first
 * time an asset in the library is requested by the client. You generally do
 * not need to call `AssetsLibrary.syncAsset` unless you have a specific reason to.
 *
 * @example
 * ```typescript
 * import { AssetsLibrary } from 'hytopia';
 *
 * const assetsLibrary = AssetsLibrary.instance;
 * assetsLibrary.syncAsset('assets/models/player.gltf');
 * ```
 *
 * **Category:** Assets
 * @public
 */
export default class AssetsLibrary {
  /**
   * The global AssetsLibrary instance as a singleton.
   *
   * **Category:** Assets
   */
  public static readonly instance: AssetsLibrary = new AssetsLibrary();

  /**
   * The path to the assets library package. Null if assets library is not available.
   *
   * **Category:** Assets
   */
  public static readonly assetsLibraryPath: string | null = (() => {
    if (process.env.NODE_ENV === 'production') return null; // We don't use @hytopia.com/assets package in production.
    const assetsPackage = '@hytopia.com/assets'; // Must be a const to prevent build time resolution of path.
    try { return path.dirname(require.resolve(assetsPackage)); } catch { return null; }
  })();

  /**
   * Synchronizes an asset from the assets library to the local assets directory.
   *
   * @remarks
   * Syncs an asset from the assets library to local assets in development.
   * The assets library is unavailable in production, so assets must be local to the project.
   *
   * @param assetPath - The path of the asset to copy to local assets.
   *
   * **Requires:** Assets library must be available (development only).
   *
   * **Side effects:** Writes files into the local `assets/` directory.
   *
   * **Category:** Assets
   */
  public syncAsset(assetPath: string): void {
    if (!AssetsLibrary.assetsLibraryPath) {
      return ErrorHandler.warning('AssetsLibrary.syncAsset(): Assets library is not available.');
    }

    try {
      const relativePath = path.relative(AssetsLibrary.assetsLibraryPath, assetPath);
      const localPath = path.join('assets', relativePath);
      
      if (!fs.existsSync(assetPath)) return;
      if (fs.existsSync(localPath)) return;
      
      const optimizedMatch = relativePath.match(/^(.+?)\/\.optimized\/([^/]+)\//);
      
      if (optimizedMatch) {
        const [ , baseDir, modelName ] = optimizedMatch;
        const pkgOptimized = path.join(AssetsLibrary.assetsLibraryPath, baseDir, '.optimized', modelName);
        const localOptimized = path.join('assets', baseDir, '.optimized', modelName);
        
        // Copy the entire optimized directory
        fs.cpSync(pkgOptimized, localOptimized, { recursive: true, force: false });
        
        // Also copy the original model files
        [ '.gltf', '.glb' ].forEach(ext => {
          const pkgOriginal = path.join(AssetsLibrary.assetsLibraryPath!, baseDir, `${modelName}${ext}`);
          const localOriginal = path.join('assets', baseDir, `${modelName}${ext}`);
          
          if (fs.existsSync(pkgOriginal) && !fs.existsSync(localOriginal)) {
            fs.mkdirSync(path.dirname(localOriginal), { recursive: true });
            fs.copyFileSync(pkgOriginal, localOriginal);
          }
        });
        
        console.log(`AssetsLibrary.syncAsset(): Copied model from asset library to local assets: ${baseDir}/${modelName}`);
      } else {
        fs.mkdirSync(path.dirname(localPath), { recursive: true });
        fs.copyFileSync(assetPath, localPath);
        console.log(`AssetsLibrary.syncAsset(): Copied asset from asset library to local assets: ${relativePath}`);
      }
    } catch (error) {
      ErrorHandler.warning(`AssetsLibrary.syncAsset(): Failed to copy asset "${assetPath}" to local assets: ${error as Error}`);
    }
  };
} 
