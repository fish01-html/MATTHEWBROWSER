import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import express from "express";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const require = createRequire(import.meta.url);
const dirOf = specifier => path.dirname(require.resolve(specifier));
const app = express();
const port = Number(process.env.PORT || 8080);

app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cache-Control", "no-cache");
  next();
});

app.use("/scram/", express.static(scramjetPath));
app.use("/utils/", express.static(dirOf("@mercuryworkshop/scramjet-utils")));
app.use("/controller/", express.static(dirOf("@mercuryworkshop/scramjet-controller")));
app.use("/libcurl/", express.static(dirOf("@mercuryworkshop/libcurl-transport")));
app.use(express.static("public"));

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
