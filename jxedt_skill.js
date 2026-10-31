/*
 * 驾校一点通：放开答题技巧、顽固错题和 VIP/极速VIP/SVIP 权益。
 *
 * 说明：
 * - getQuestionInfo 的 skillEntity 里本来就带有 qbAnalyse / skillExplain，
 *   客户端根据 vipStatus、buttonText 决定是否隐藏，这里把状态改成已解锁。
 * - batchCheckRights 只放开下面白名单里的权益；PURE_NOADS_VIP、REAL_SIMULATE_KM1、
 *   JINGJIAN_SINGLE_KM1 等仍保持服务端返回的状态。
 */

var body = $response.body;
var url = ($request && $request.url) || "";
var newBody = body;

var OPEN_RIGHTS = [
    "VIP",
    "SVIP",
    "SVIP_LIVECAMP",
    "RELIABLE_VIP_KM1",
    "RELIABLE_VIP_KM4",
    "SPEED_VIP_KM1",
    "SPEED_VIP_KM2",
    "SPEED_VIP_KM3",
    "SPEED_VIP_KM4"
];

function activateRight(right) {
    if (!right || typeof right !== "object") return;
    right.status = "2";
    right.level = 1;
    right.beginTime = "2026-01-01";
    right.endTime = "2099-12-31";
    right.residualSecond = "2300000000";
    right.overdueSecond = "0";
}

function activateKnownRights(result) {
    for (var i = 0; i < OPEN_RIGHTS.length; i++) {
        activateRight(result[OPEN_RIGHTS[i]]);
    }
    activateRight(result.EXAM_SKILL_KM1);
    activateRight(result.OVER_REPEAT_WRONG_KM1);
}

try {
    var obj = JSON.parse(body);
    var result = obj && obj.result;

    if (url.indexOf("/sns/exam/getQuestionInfo") !== -1 && result && typeof result === "object") {
        var wasVip = String(result.vipStatus) === "1";
        result.vipStatus = typeof result.vipStatus === "number" ? 1 : "1";
        if (!wasVip) {
            if (typeof result.buttonText === "string") result.buttonText = "速记口诀";
            if (typeof result.usesButtonText === "string") result.usesButtonText = "速记口诀";
        }
        newBody = JSON.stringify(obj);
    } else if (url.indexOf("/store/batchCheckRights") !== -1 && result && typeof result === "object") {
        activateKnownRights(result);
        newBody = JSON.stringify(obj);
    } else if (url.indexOf("/store/checkRightsOnFunction") !== -1 &&
               result && typeof result === "object" &&
               (url.indexOf("placeType=TRAIN_EXAM") !== -1 || url.indexOf("placeType=OverRepeatWrong") !== -1)) {
        result.replyResult = true;
        newBody = JSON.stringify(obj);
    }
} catch (e) {
    console.log("jxedt_skill: skip non-JSON body");
}

$done(newBody);
