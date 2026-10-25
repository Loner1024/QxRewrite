const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const assert = require("node:assert/strict");

function run(url, body) {
  const code = fs.readFileSync(path.join(__dirname, "..", "splash_ad.js"), "utf8");
  let done;
  vm.runInNewContext(code, {
    console,
    $request: { url },
    $response: { body },
    $done: (v) => {
      done = v;
    },
  }, { filename: "splash_ad.js" });
  return done;
}

const base = "https://app.bilibili.com";

test("splash_ad: splash/list 取消缓存并拉长间隔", () => {
  const out = run(`${base}/x/v2/splash/list?mobi_app=iphone`, JSON.stringify({
    code: 0,
    message: "OK",
    data: {
      max_time: 0,
      min_interval: 0,
      pull_interval: 0,
      keep_ids: null,
      splash_request_id: "req",
    },
  }));
  const obj = JSON.parse(out);
  assert.equal(obj.code, 0);
  assert.equal(obj.data.max_time, 0);
  assert.equal(obj.data.min_interval, 31536000);
  assert.equal(obj.data.pull_interval, 31536000);
  assert.deepEqual(obj.data.keep_ids, []);
  assert.equal(obj.data.splash_request_id, "req");
});

test("splash_ad: splash/show 和 event/list2 清空广告数组", () => {
  const show = JSON.parse(run(`${base}/x/v2/splash/show`, JSON.stringify({
    code: 0,
    data: { show: [{ id: 1, uri: "bilibili://ad" }], splash_request_id: "req" },
  })));
  assert.deepEqual(show.data.show, []);
  assert.equal(show.data.splash_request_id, "req");

  const events = JSON.parse(run(`${base}/x/v2/splash/event/list2`, JSON.stringify({
    code: 0,
    data: { event_list: [{ id: 1 }], account: { vip: 0 } },
  })));
  assert.deepEqual(events.data.event_list, []);
  assert.deepEqual(events.data.account, { vip: 0 });
});

test("splash_ad: peak/download 只移除 brand_splash", () => {
  const out = run(`${base}/x/resource/peak/download?mobi_app=iphone`, JSON.stringify({
    code: 0,
    data: {
      ver: "1",
      resource: [
        { type: "egg", list: [{ url: "a" }] },
        { type: "mod", list: [] },
        { type: "brand_splash", list: [{ url: "http://i0.hdslb.com/ad.png" }] },
      ],
    },
  }));
  const obj = JSON.parse(out);
  assert.deepEqual(obj.data.resource.map((r) => r.type), ["egg", "mod"]);
  assert.deepEqual(obj.data.resource[0].list, [{ url: "a" }]);
});

test("splash_ad: 通用 splash 响应清空常见广告字段", () => {
  const out = run("https://example.com/api/splash/list", JSON.stringify({
    code: 0,
    data: { show: [{ id: 1 }], ad: { id: 2 }, title: "keep" },
  }));
  const obj = JSON.parse(out);
  assert.deepEqual(obj.data.show, []);
  assert.deepEqual(obj.data.ad, {});
  assert.equal(obj.data.title, "keep");
  assert.equal(obj.code, 0);
});

test("splash_ad: 非 JSON 和非开屏路径原样放行", () => {
  const raw = "<html>error</html>";
  assert.equal(run(`${base}/x/v2/splash/list`, raw), raw);

  const other = JSON.stringify({ code: 0, data: { show: [1] } });
  assert.equal(run(`${base}/x/v2/feed/index`, other), other);
});
