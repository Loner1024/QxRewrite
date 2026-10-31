/*
 * 驾校一点通：放开直播回放、考场视频和真实考场模拟的客户端门禁。
 *
 * 只改响应里的状态位，不动业务数据：
 * - jxedtLive/h5/topicDetail: topicIntro.boughtState 置为 "1"
 * - exam/place/video/list: buyStatus/vipStatus 置为 1，src 为空时用 m3u8Video 补上
 * - realPlace/getResourceBycityId: status 置为 "1"，补 beginTime/endTime
 */

var body = $response.body;
var url = ($request && $request.url) || "";
var newBody = body;

function fillVideoList(list) {
    if (!list || typeof list !== "object") return;
    for (var key in list) {
        if (!Object.prototype.hasOwnProperty.call(list, key)) continue;
        var video = list[key];
        if (!video || typeof video !== "object") continue;
        if (video.m3u8Video && !video.src) {
            video.src = video.m3u8Video;
            video.isM3U8 = 1;
        }
    }
}

try {
    var obj = JSON.parse(body);
    var result = obj && obj.result;

    if (result && typeof result === "object") {
        if (url.indexOf("/jxedtLive/h5/topicDetail") !== -1 && result.topicIntro && typeof result.topicIntro === "object") {
            result.topicIntro.boughtState = "1";
            newBody = JSON.stringify(obj);
        } else if (url.indexOf("/exam/place/video/list") !== -1) {
            result.buyStatus = 1;
            result.vipStatus = 1;
            fillVideoList(result.videoList);
            newBody = JSON.stringify(obj);
        } else if (url.indexOf("/realPlace/getResourceBycityId") !== -1) {
            result.beginTime = "1970-01-01";
            result.endTime = "2099-12-31";
            result.status = "1";
            newBody = JSON.stringify(obj);
        }
    }
} catch (e) {
    console.log("jxedt_content: skip non-JSON body");
}

$done(newBody);
