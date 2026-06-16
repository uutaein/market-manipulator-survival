import { spawn } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";
import { createServer, type ViteDevServer } from "vite";

const host = "127.0.0.1";
const port = 4173;
const forwardedArgs = process.argv.slice(2);

let server: ViteDevServer | undefined;

async function closeServer(): Promise<void> {
  if (!server) {
    return;
  }

  const serverToClose = server;
  server = undefined;
  await serverToClose.close();
}

async function run(): Promise<number> {
  server = await createServer({
    clearScreen: false,
    logLevel: "error",
    server: {
      host,
      port,
      strictPort: true
    }
  });

  await server.listen();

  const playwrightCli = resolve("node_modules", "playwright", "cli.js");
  const child = spawn(process.execPath, [playwrightCli, "test", ...forwardedArgs], {
    stdio: "inherit"
  });

  const [code, signal] = (await once(child, "exit")) as [number | null, NodeJS.Signals | null];

  if (signal) {
    return 1;
  }

  return code ?? 1;
}

run()
  .then(async (code) => {
    await closeServer();
    process.exit(code);
  })
  .catch(async (error: unknown) => {
    await closeServer();
    console.error(error);
    process.exit(1);
  });
