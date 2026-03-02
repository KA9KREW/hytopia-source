# HYTOPIA Server

This server is the core of the HYTOPIA game engine. This is the unbundled codebase
that is closed source and not intended to be used by the public. All development
of the server is done in this codebase.

## Running locally

For quick testing and development of the server without having to bundle it,
you can run the server locally with the following steps.

1. Create an `assets` directory in the root of the project, do not commit this directory - it should already be ignored by .gitignore
2. Copy the contents of the HYTOPIA Assets package into the created `assets` directory: https://www.npmjs.com/package/@hytopia.com/assets
3. From the root of the project, run the server with the following command: 

```bash
bun run dev
```

Then either run the client repository locally, or head over to hytopia.com/play to test the server.

## Bundling for release

To bundle the server for release, run:

```bash
bun run build
```

This will bundle the server and automatically generate the latest API documentation. All of this will
be generated in the `sdk` directory, which is a git submodule of the public SDK repository.
