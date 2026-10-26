const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const assert = require("node:assert/strict");

function run(url, body) {
  const code = fs.readFileSync(path.join(__dirname, "..", "jxedt_ad.js"), "utf8");
  let done;
  vm.runInNewContext(code, {
    console,
    $request: { url },
    $response: { body },
    $done: (v) => {
      done = v;
    },
  }, { filename: "jxedt_ad.js" });
  return done;
}

test("jxedt_ad: intellectWaterfall/find 清空 data", () => {
  const body = JSON.stringify({
    code: 0,
    msg: "OK",
    result: { requestId: "r1", data: [[[{ adVO: { title: "广告" } }]]] },
  });
  const out = JSON.parse(run("https://richmanrules.ksedt.com/intellectWaterfall/find?adSlot=guide", body));
  assert.equal(out.result.data, null);
  assert.equal(out.result.requestId, "r1");
  assert.equal(out.code, 0);
});

test("jxedt_ad: intellectWaterfallBidding/find 置为空数组", () => {
  const body = JSON.stringify({
    code: 0,
    result: { data: [{ fixedPriceList: [], biddingList: [{ adSlot: "guide" }] }] },
  });
  const out = JSON.parse(run("https://richmanrules.ksedt.com/intellectWaterfallBidding/find", body));
  assert.deepEqual(out.result.data, []);
});

test("jxedt_ad: 其他 richmanrules 接口保持原样", () => {
  const body = JSON.stringify({ code: 0, result: { data: { domains: ["jxedt.com"] } } });
  assert.equal(run("https://richmanrules.ksedt.com/serverConfig/allowJxedtUaDomains.json", body), body);
});

test("jxedt_ad: 非 JSON body 原样放行", () => {
  const raw = "<html>error</html>";
  assert.equal(run("https://richmanrules.ksedt.com/intellectWaterfall/find", raw), raw);
});
