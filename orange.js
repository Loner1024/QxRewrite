var body = $response.body;
var path = $request.path;

console.log(path)

var obj = JSON.parse(body);

var data = obj.data

if (path === '/1.0/maleInboxCards/list') {
    data.map(x => x.userProfile.avatar.picUrl = x.userProfile.avatar.picUrl.replace('/blur/100x200', ''));
}

$done(body);