/*
 * 驾校一点通：清空自有广告瀑布流。
 *
 * 只处理 richmanrules.ksedt.com 的两个广告接口，业务接口和配置接口不动：
 * - /intellectWaterfall/find：接口自身在无广告时返回 result.data = null
 * - /intellectWaterfallBidding/find：data 是数组，置空数组
 */

var body = $response.body;
var url = ($request && $request.url) || "";
var newBody = body;

try {
    var obj = JSON.parse(body);
    var result = obj && obj.result;

    if (result && typeof result === "object") {
        if (url.indexOf("/intellectWaterfallBidding/find") !== -1) {
            result.data = [];
            newBody = JSON.stringify(obj);
        } else if (url.indexOf("/intellectWaterfall/find") !== -1) {
            result.data = null;
            newBody = JSON.stringify(obj);
        }
    }
} catch (e) {
    console.log("jxedt_ad: skip non-JSON body");
}

$done(newBody);
