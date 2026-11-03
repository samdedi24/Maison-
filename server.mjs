import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import {
  dirname,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const publicDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "public",
);
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function isWithin(root, file) {
  const location = relative(root, file);
  return (
    location !== ".." &&
    !location.startsWith(`..${sep}`) &&
    !isAbsolute(location)
  );
}

function reply(response, status, message, head = false) {
  const body = Buffer.from(message + "\n");
  response.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(head ? undefined : body);
}

/** Static demo server only: there is currently no Home Assistant API or proxy. */
export function createStaticServer({ root = publicDirectory } = {}) {
  return createServer(async (request, response) => {
    const head = request.method === "HEAD";
    if (!["GET", "HEAD"].includes(request.method)) {
      response.setHeader("Allow", "GET, HEAD");
      reply(response, 405, "Méthode non autorisée.", head);
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
    } catch {
      reply(response, 400, "Adresse invalide.", head);
      return;
    }
    if (
      pathname.includes("\0") ||
      pathname.split(/[\\/]/).some((part) => part.startsWith("."))
    ) {
      reply(response, 404, "Fichier introuvable.", head);
      return;
    }
    const target = resolve(
      root,
      `.${pathname === "/" ? "/index.html" : pathname}`,
    );
    if (!isWithin(root, target)) {
      reply(response, 404, "Fichier introuvable.", head);
      return;
    }
    try {
      const realRoot = await realpath(root);
      const file = await realpath(target);
      if (!isWithin(realRoot, file) || !(await stat(file)).isFile()) {
        reply(response, 404, "Fichier introuvable.", head);
        return;
      }
      const body = await readFile(file);
      const extension = extname(file).toLowerCase();
      response.writeHead(200, {
        "Content-Type": contentTypes[extension] || "application/octet-stream",
        "Content-Length": body.length,
        "Cache-Control": [".html", ".js", ".css"].includes(extension)
          ? "no-cache"
          : "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      });
      response.end(head ? undefined : body);
    } catch (error) {
      reply(
        response,
        ["ENOENT", "ENOTDIR", "EACCES"].includes(error.code) ? 404 : 500,
        ["ENOENT", "ENOTDIR", "EACCES"].includes(error.code)
          ? "Fichier introuvable."
          : "Erreur du serveur.",
        head,
      );
    }
  });
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || "127.0.0.1";
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("PORT doit être un entier entre 1 et 65535.");
    process.exitCode = 1;
  } else {
    const server = createStaticServer();
    server.on("error", (error) => {
      console.error(
        `Le serveur ne peut pas démarrer : ${error.code || error.message}`,
      );
      process.exitCode = 1;
    });
    server.listen(port, host, () =>
      console.log(`Maison+ · Démo : http://${host}:${port}`),
    );
    for (const signal of ["SIGINT", "SIGTERM"]) {
      process.once(signal, () => server.close());
    }
  }
}
