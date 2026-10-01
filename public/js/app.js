const $ = s => document.querySelector(s);
const status = $("#status");
const address = $("#address");
const homeAddress = $("#homeAddress");
const iframe = $("#view");
const start = $("#start");
let frame;

function normalize(input) {
  const value = input.trim();
  if (!value) return "https://www.google.com/";
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(value)) return `https://${value}`;
  return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
}
function loadScript(src) { return new Promise((resolve,reject)=>{ const s=document.createElement("script"); s.src=src; s.onload=resolve; s.onerror=()=>reject(new Error(`Failed to load ${src}`)); document.head.append(s); }); }
async function boot() {
  status.textContent = "Starting…";
  const registration = await navigator.serviceWorker.register("/sw.js", {scope:"/",updateViaCache:"none"});
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) await new Promise(r=>navigator.serviceWorker.addEventListener("controllerchange",r,{once:true}));
  const serviceworker = navigator.serviceWorker.controller ?? registration.active;
  if (!serviceworker) throw new Error("Service worker did not become active");
  for (const src of ["/scram/scramjet.js","/controller/controller.api.js","/utils/scramjet-utils.js"]) await loadScript(src);
  const api = window.$scramjetController;
  const utils = window.$scramjetUtils;
  const {default: LibcurlClient} = await import("/libcurl/index.mjs");
  const scheme = location.protocol === "https:" ? "wss:" : "ws:";
  const transport = new LibcurlClient({wisp:`${scheme}//${location.host}/wisp/`});
  const controller = new api.Controller({serviceworker,transport,config:{scramjetPath:"/scram/scramjet.js",wasmPath:"/scram/scramjet.wasm",injectPath:"/controller/controller.inject.js"},scramjetConfig:{flags:{allowFailedIntercepts:true}}});
  await controller.wait();
  frame = controller.createFrame(iframe,{plugins:[new utils.HttpCachePlugin(),new utils.UrlWatcherPlugin(url=>{address.value=String(url);})]});
  setInterval(()=>navigator.serviceWorker.controller?.postMessage("keepalive"),15000);
  status.textContent = "Ready";
}
function go(raw){ if(!frame) return; const url=normalize(raw); address.value=url; start.style.display="none"; iframe.style.display="block"; status.textContent="Loading…"; frame.go(url); }
$("#nav").addEventListener("submit",e=>{e.preventDefault();go(address.value)});
$("#homeNav").addEventListener("submit",e=>{e.preventDefault();go(homeAddress.value)});
$("#back").onclick=()=>frame?.back(); $("#forward").onclick=()=>frame?.forward(); $("#reload").onclick=()=>frame?.reload();
iframe.addEventListener("load",()=>{status.textContent="Ready"});
boot().catch(err=>{console.error(err);status.textContent="Error";start.innerHTML=`<h1>Matthew Browser</h1><p>Startup failed: ${String(err.message||err)}</p><p>Run this project through its Node server, not by opening index.html directly.</p>`;});
