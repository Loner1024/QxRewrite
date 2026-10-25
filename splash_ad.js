/*
 * 通用开屏广告响应处理。
 * 新增 App：在 handlers 中添加 match/handle，并在 QxRewrite.conf 添加对应重写规则。
 */

var body = $response.body;
var url = ($request && $request.url) || "";
var newBody = body;

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

var handlers = [
    {
        match: function (u) {
            return u.indexOf("app.bilibili.com/x/v2/splash/") !== -1;
        },
        handle: function (data) {
            if (Array.isArray(data.show)) data.show = [];
            if (Array.isArray(data.event_list)) data.event_list = [];
            if (data.keep_ids !== undefined) data.keep_ids = [];
            if (typeof data.max_time !== "undefined") data.max_time = 0;
            if (typeof data.min_interval !== "undefined") data.min_interval = 31536000;
            if (typeof data.pull_interval !== "undefined") data.pull_interval = 31536000;
            if (isObject(data.list) && Array.isArray(data.list.show)) data.list.show = [];
            return true;
        }
    },
    {
        match: function (u) {
            return u.indexOf("app.bilibili.com/x/resource/peak/download") !== -1;
        },
        handle: function (data) {
            if (!Array.isArray(data.resource)) return false;
            data.resource = data.resource.filter(function (item) {
                return !item || item.type !== "brand_splash";
            });
            return true;
        }
    },
    {
        match: function (u) {
            return /(splash|launch|startup|start[_-]?ad|boot[_-]?ad|open[_-]?screen)/i.test(u);
        },
        handle: function (data) {
            var changed = false;
            var keys = ["show", "event_list", "ad", "ads", "ad_list", "adList", "splash", "splash_list", "startup", "startup_ad", "launch", "launch_ad"];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (Array.isArray(data[key]) && data[key].length) {
                    data[key] = [];
                    changed = true;
                } else if (isObject(data[key])) {
                    data[key] = {};
                    changed = true;
                }
            }
            return changed;
        }
    }
];

try {
    var obj = JSON.parse(body);
    var data = obj && obj.data;

    if (isObject(data)) {
        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i].match(url) && handlers[i].handle(data)) {
                newBody = JSON.stringify(obj);
                break;
            }
        }
    }
} catch (e) {
    console.log("splash_ad: skip non-JSON body");
}

$done(newBody);
