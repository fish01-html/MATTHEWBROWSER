import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import express from "express";
import compression from "compression";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const require = createRequire(import.meta.url);
const dirOf = specifier => path.dirname(require.resolve(specifier));
const app = express();
const port = Number(process.env.PORT || 8080);

app.disable("x-powered-by");
app.use(compression());

app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

const immutableStatic = { maxAge: "7d", immutable: true, etag: true };
app.use("/scram/", express.static(scramjetPath, immutableStatic));
app.use("/utils/", express.static(dirOf("@mercuryworkshop/scramjet-utils"), immutableStatic));
app.use("/controller/", express.static(dirOf("@mercuryworkshop/scramjet-controller"), immutableStatic));
app.use("/libcurl/", express.static(dirOf("@mercuryworkshop/libcurl-transport"), immutableStatic));
app.use(express.static("public", { maxAge: "1h", etag: true, setHeaders(res, file) {
  if (file.endsWith("index.html") || file.endsWith("MatthewBrowser.html") || file.endsWith("sw.js")) res.setHeader("Cache-Control", "no-cache");
} }));

const server = http.createServer(app);
server.on("upgrade", (req, socket, head) => {
  const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
  if (pathname === "/wisp/") {
    req.url = pathname;
    wisp.routeRequest(req, socket, head);
    return;
  }
  socket.end();
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Matthew Browser running at http://localhost:${port}`);
});
