const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const assert = require("node:assert/strict");

function run(url, body) {
  const code = fs.readFileSync(path.join(__dirname, "..", "jxedt_content.js"), "utf8");
  let done;
  vm.runInNewContext(code, {
    console,
    $request: { url },
    $response: { body },
    $done: (v) => {
      done = v;
    },
  }, { filename: "jxedt_content.js" });
  return done;
}

test("jxedt_content: topicDetail 标记为已购买且保留其他字段", () => {
  const body = JSON.stringify({
    code: 0,
    msg: "OK",
    result: {
      liveId: "2114024394236907520",
      topicIntro: { boughtState: "0", title: "直播回放" },
    },
  });
  const out = JSON.parse(run("https://op.ksedt.com/jxedtLive/h5/topicDetail?liveId=1", body));
  assert.equal(out.result.topicIntro.boughtState, "1");
  assert.equal(out.result.topicIntro.title, "直播回放");
  assert.equal(out.result.liveId, "2114024394236907520");
});

test("jxedt_content: 考场视频列表放开购买态并补齐 m3u8 地址", () => {
  const body = JSON.stringify({
    code: 0,
    result: {
      buyStatus: 0,
      vipStatus: 0,
      videoList: [
        { m3u8Video: "https://cdn.example.com/a.m3u8", src: "" },
        { m3u8Video: "https://cdn.example.com/b.m3u8", src: "https://cdn.example.com/b.mp4" },
        { src: "https://cdn.example.com/c.mp4" },
      ],
    },
  });
  const out = JSON.parse(run("https://kaoshiapi.ksedt.com/exam/place/video/list", body));
  assert.equal(out.result.buyStatus, 1);
  assert.equal(out.result.vipStatus, 1);
  assert.equal(out.result.videoList[0].src, "https://cdn.example.com/a.m3u8");
  assert.equal(out.result.videoList[0].isM3U8, 1);
  assert.equal(out.result.videoList[1].src, "https://cdn.example.com/b.mp4");
  assert.equal(out.result.videoList[2].src, "https://cdn.example.com/c.mp4");
});

test("jxedt_content: 真实考场模拟资源标记为已开通", () => {
  const body = JSON.stringify({
    code: 0,
    msg: "OK",
    result: {
      resourceId: "resource-1",
      status: "0",
      beginTime: "2026-10-31",
      endTime: "2026-10-31",
    },
  });
  const out = JSON.parse(run("https://kaoshiapi.ksedt.com/realPlace/getResourceBycityId", body));
  assert.equal(out.result.status, "1");
  assert.equal(out.result.beginTime, "1970-01-01");
  assert.equal(out.result.endTime, "2099-12-31");
  assert.equal(out.result.resourceId, "resource-1");
});

test("jxedt_content: 非 JSON 和非目标接口原样放行", () => {
  const raw = "<html>error</html>";
  assert.equal(run("https://op.ksedt.com/jxedtLive/h5/topicDetail", raw), raw);

  const other = JSON.stringify({ code: 0, result: { status: "0" } });
  assert.equal(run("https://kaoshiapi.ksedt.com/other", other), other);
});
