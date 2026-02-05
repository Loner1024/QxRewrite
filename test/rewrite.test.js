const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const zlib = require("node:zlib");
const test = require("node:test");
const assert = require("node:assert/strict");

function dechunk(buf) {
  let i = 0;
  const chunks = [];
  while (i < buf.length) {
    const j = buf.indexOf("\r\n", i, "ascii");
    if (j === -1) throw new Error("invalid chunked body: missing size line");
    const sizeLine = buf.slice(i, j).toString("ascii");
    const sizeHex = sizeLine.split(";", 1)[0].trim();
    const size = parseInt(sizeHex || "0", 16);
    i = j + 2;
    if (size === 0) break;
    chunks.push(buf.slice(i, i + size));
    i += size;
    if (buf.slice(i, i + 2).toString("ascii") !== "\r\n") {
      throw new Error("invalid chunked body: missing CRLF after chunk");
    }
    i += 2;
  }
  return Buffer.concat(chunks);
}

function decodeExampleBody(relPath) {
  const abs = path.join(__dirname, "..", relPath);
  const raw = fs.readFileSync(abs);

  // Most bodies are plain JSON, but some are chunked + gzip (per response_headers).
  // We detect chunked bodies by the leading hex size line.
  const startsLikeChunked = /^[0-9a-fA-F]+\r\n/.test(raw.slice(0, 16).toString("ascii"));
  if (!startsLikeChunked) return raw.toString("utf8");

  const payload = dechunk(raw);
  const isGzip = payload.length >= 2 && payload[0] === 0x1f && payload[1] === 0x8b;
  return (isGzip ? zlib.gunzipSync(payload) : payload).toString("utf8");
}

function runScript(scriptRelPath, { body, reqPath, headers }) {
  const scriptAbs = path.join(__dirname, "..", scriptRelPath);
  const code = fs.readFileSync(scriptAbs, "utf8");

  let doneValue;
  const context = {
    console,
    $request: { path: reqPath, headers },
    $response: { body },
    $done: (v) => {
      doneValue = v;
    },
  };

  vm.runInNewContext(code, context, { filename: scriptRelPath });
  return doneValue;
}

function extractBody(doneValue) {
  if (typeof doneValue === "string") return doneValue;
  if (doneValue && typeof doneValue === "object" && typeof doneValue.body === "string") {
    return doneValue.body;
  }
  throw new Error("script did not $done() with body string");
}

test("orange_blur: 去掉 maleInboxCards/list 返回头像 URL 的 blur 段", () => {
  const body = decodeExampleBody("example/2026-02-05-140432/8259/response_body");
  const done = runScript("orange_blur.js", { body, reqPath: "/1.0/maleInboxCards/list" });
  const outBody = extractBody(done);
  const obj = JSON.parse(outBody);

  assert.ok(Array.isArray(obj.data));
  for (const card of obj.data) {
    const picUrl = card?.userProfile?.avatar?.picUrl;
    if (typeof picUrl === "string") assert.equal(picUrl.includes("/blur/100x200"), false);
  }
});

test("orange_blur: 遇到非 JSON body 不应抛错，应原样放行", () => {
  const raw = fs.readFileSync(
    path.join(__dirname, "..", "example/2026-02-05-140432/8259/response_body"),
    "utf8",
  );
  const done = runScript("orange_blur.js", { body: raw, reqPath: "/1.0/maleInboxCards/list" });
  const outBody = extractBody(done);
  assert.equal(outBody, raw);
});

test("orange_membership: wallet/get membership 置为 BASIC", () => {
  const body = decodeExampleBody("example/2026-02-05-140432/8240/response_body");
  const done = runScript("orange_membership.js", { body, reqPath: "/1.0/wallet/get" });
  const outBody = extractBody(done);
  const obj = JSON.parse(outBody);
  assert.equal(obj.membership, "BASIC");
});

test("orange_membership: 遇到非 JSON body 不应抛错，应原样放行", () => {
  const raw = fs.readFileSync(
    path.join(__dirname, "..", "example/2026-02-05-140432/8242/response_body"),
    "utf8",
  );
  const done = runScript("orange_membership.js", { body: raw, reqPath: "/1.0/profile/getOne" });
  const outBody = extractBody(done);
  assert.equal(outBody, raw);
});

test("orange_request_header: 强制 Accept-Encoding=identity 以避免 gzip 导致脚本 JSON.parse 失败", () => {
  const headers = {
    Host: "api.orangelovely.com",
    "User-Agent": "Orange/100003 CFNetwork/3860.100.1 Darwin/25.0.0",
    "Accept-Encoding": "gzip, deflate, br",
  };
  const done = runScript("orange_request_header.js", { headers, reqPath: "/1.0/profile/getOne" });
  assert.ok(done && typeof done === "object" && done.headers);
  assert.equal(done.headers["Accept-Encoding"], "identity");
});

