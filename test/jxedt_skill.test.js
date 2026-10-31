const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const assert = require("node:assert/strict");

function run(url, body) {
  const code = fs.readFileSync(path.join(__dirname, "..", "jxedt_skill.js"), "utf8");
  let done;
  vm.runInNewContext(code, {
    console,
    $request: { url },
    $response: { body },
    $done: (v) => {
      done = v;
    },
  }, { filename: "jxedt_skill.js" });
  return done;
}

const question = {
  code: 0,
  msg: "OK",
  result: {
    vipStatus: "0",
    buttonText: "立即查看完整技巧",
    usesButtonText: "立即解锁全部技巧",
    skillPanelText: { skillText: "速记技巧BR简单好记" },
    skillEntity: {
      qbContent: "申请人以欺【骗】、贿赂等不正当手段取得机动车驾驶证的，申请人在多长时间内不得再次申领机动车驾驶证。",
      qbAnswers: ["3年"],
      qbAnalyse: "速记口诀：假1【骗3】毒3醉5逃终生",
      qbReadAnalyse: "速记口诀：假1骗3毒3醉5逃终生。",
      qbSkillAudioLink: "https://wos.58cdn.com.cn/XyVuTsRqXyf/audios/qb_1900372920367104002.mp3",
      skillExplain: "假1：提供【虚假】材料…\n骗3：有欺【骗】等不正当手段…\n逃终生：造成交通事故后【逃】逸后构成犯罪的【终生】",
    },
  },
};

test("jxedt_skill: getQuestionInfo 改成已解锁并保留口诀内容", () => {
  const out = JSON.parse(run("https://kaoshiapi.ksedt.com/sns/exam/getQuestionInfo", JSON.stringify(question)));
  assert.equal(out.result.vipStatus, "1");
  assert.equal(out.result.buttonText, "速记口诀");
  assert.equal(out.result.usesButtonText, "速记口诀");
  assert.equal(out.result.skillEntity.qbAnalyse, "速记口诀：假1【骗3】毒3醉5逃终生");
  assert.match(out.result.skillEntity.skillExplain, /逃终生/);
});

test("jxedt_skill: 已是 VIP 时保留原文案和 vipStatus 类型", () => {
  const body = JSON.stringify({
    code: 0,
    result: { vipStatus: 1, buttonText: "下一题", usesButtonText: "下一题", skillEntity: { qbAnalyse: "口诀" } },
  });
  const out = JSON.parse(run("https://kaoshiapi.ksedt.com/sns/exam/getQuestionInfo", body));
  assert.equal(out.result.vipStatus, 1);
  assert.equal(out.result.buttonText, "下一题");
  assert.equal(out.result.usesButtonText, "下一题");
});

test("jxedt_skill: batchCheckRights 放开 VIP/极速VIP/SVIP 白名单", () => {
  const open = [
    "VIP",
    "SVIP",
    "SVIP_LIVECAMP",
    "RELIABLE_VIP_KM1",
    "RELIABLE_VIP_KM4",
    "SPEED_VIP_KM1",
    "SPEED_VIP_KM2",
    "SPEED_VIP_KM3",
    "SPEED_VIP_KM4",
    "EXAM_SKILL_KM1",
    "OVER_REPEAT_WRONG_KM1",
  ];
  const closed = [
    "PURE_NOADS_VIP",
    "REAL_SIMULATE_KM1",
    "JINGJIAN_SINGLE_KM1",
    "SVIP_EXP",
    "VIP_KM1_EXP",
    "VIP_KM4_EXP",
    "RELIABLE_VIP_KM1_T",
  ];
  const result = {};
  for (const key of open.concat(closed)) {
    result[key] = { status: "5", level: 0, beginTime: "2026-10-25", endTime: "2026-10-25" };
  }

  const out = JSON.parse(run(
    "https://vipapi.ksedt.com/store/batchCheckRights",
    JSON.stringify({ code: 0, msg: "ok", result }),
  ));

  for (const key of open) {
    assert.equal(out.result[key].status, "2", key);
    assert.equal(out.result[key].level, 1, key);
    assert.equal(out.result[key].endTime, "2099-12-31", key);
  }
  for (const key of closed) {
    assert.equal(out.result[key].status, "5", key);
    assert.equal(out.result[key].level, 0, key);
  }
});

test("jxedt_skill: 只返回顽固错题权益时也能放开", () => {
  const body = JSON.stringify({
    code: 0,
    msg: "ok",
    result: {
      OVER_REPEAT_WRONG_KM1: { status: "5", level: 0, residualSecond: "0", endTime: "2026-10-31" },
      REAL_SIMULATE_KM1: { status: "5", level: 0 },
    },
  });
  const out = JSON.parse(run("https://vipapi.ksedt.com/store/batchCheckRights", body));
  assert.equal(out.result.OVER_REPEAT_WRONG_KM1.status, "2");
  assert.equal(out.result.OVER_REPEAT_WRONG_KM1.residualSecond, "2300000000");
  assert.equal(out.result.REAL_SIMULATE_KM1.status, "5");
});

test("jxedt_skill: 没有白名单权益时保持原样", () => {
  const body = JSON.stringify({
    code: 0,
    result: {
      PURE_NOADS_VIP: { status: "5", level: 0 },
      REAL_SIMULATE_KM1: { status: "5", level: 0 },
    },
  });
  assert.equal(run("https://vipapi.ksedt.com/store/batchCheckRights", body), body);
});

test("jxedt_skill: 只放开 TRAIN_EXAM 和 OverRepeatWrong 的功能校验", () => {
  const body = JSON.stringify({ code: 0, msg: "ok", result: { replyResult: false } });
  const on = JSON.parse(run("https://vipapi.ksedt.com/store/checkRightsOnFunction?kemuType=1&placeType=TRAIN_EXAM", body));
  assert.equal(on.result.replyResult, true);

  const wrong = JSON.parse(run("https://vipapi.ksedt.com/store/checkRightsOnFunction?kemuType=1&placeType=OverRepeatWrong", body));
  assert.equal(wrong.result.replyResult, true);

  const other = JSON.parse(run("https://vipapi.ksedt.com/store/checkRightsOnFunction?kemuType=1&placeType=OTHER", body));
  assert.equal(other.result.replyResult, false);
});

test("jxedt_skill: 非 JSON body 原样放行", () => {
  const raw = "<html>error</html>";
  assert.equal(run("https://kaoshiapi.ksedt.com/sns/exam/getQuestionInfo", raw), raw);
  assert.equal(run("https://example.com/other", raw), raw);
});
