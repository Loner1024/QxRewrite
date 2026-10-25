var body = $response.body;
var url = ($request && $request.url) || "";
var newBody = body;

try {
    var obj = JSON.parse(body);
    var data = obj && obj.data;

    if (data && typeof data === 'object') {
        if (url.indexOf('/x/v2/splash/') !== -1) {
            if (Array.isArray(data.show)) data.show = [];
            if (Array.isArray(data.event_list)) data.event_list = [];
            if (data.keep_ids !== undefined) data.keep_ids = [];
            if (typeof data.max_time !== 'undefined') data.max_time = 0;
            if (typeof data.min_interval !== 'undefined') data.min_interval = 31536000;
            if (typeof data.pull_interval !== 'undefined') data.pull_interval = 31536000;
            if (data.list && typeof data.list === 'object' && Array.isArray(data.list.show)) {
                data.list.show = [];
            }
            newBody = JSON.stringify(obj);
        } else if (url.indexOf('/x/resource/peak/download') !== -1 && Array.isArray(data.resource)) {
            data.resource = data.resource.filter(function (item) {
                return !item || item.type !== 'brand_splash';
            });
            newBody = JSON.stringify(obj);
        }
    }
} catch (e) {
    console.log("bilibili_splash: skip non-JSON body");
}

$done(newBody);
