/*
 * 驾校一点通：让答题页的速记口诀直接展示，不再显示“立即解锁全部技巧”。
 *
 * 说明：
 * - getQuestionInfo 的 skillEntity 里本来就带有 qbAnalyse / skillExplain，
 *   客户端根据 vipStatus、buttonText 决定是否隐藏，这里把状态改成已解锁。
 * - 部分版本还会查 VIP 权益，这里只放开 EXAM_SKILL_KM1（答题技巧），
 *   不动 VIP / SVIP / 去广告等其他权益。
 */

var body = $response.body;
var url = ($request && $request.url) || "";
var newBody = body;

function activateSkillRight(right) {
    if (!right || typeof right !== "object") return;
    right.status = "2";
    right.level = 1;
    right.beginTime = "2026-01-01";
    right.endTime = "2099-12-31";
    right.residualSecond = "2300000000";
    right.overdueSecond = "0";
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
        activateSkillRight(result.EXAM_SKILL_KM1);
        newBody = JSON.stringify(obj);
    } else if (url.indexOf("/store/checkRightsOnFunction") !== -1 && url.indexOf("placeType=TRAIN_EXAM") !== -1 && result && typeof result === "object") {
        result.replyResult = true;
        newBody = JSON.stringify(obj);
    }
} catch (e) {
    console.log("jxedt_skill: skip non-JSON body");
}

$done(newBody);
