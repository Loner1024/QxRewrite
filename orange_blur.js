var body = $response.body;
var path = $request.path

var obj = JSON.parse(body);


for (let profile of obj.data) {
    profile.userProfile.avatar.picUrl = profile.userProfile.avatar.picUrl.replace('/blur/100x200', '');
}


var newBody = JSON.stringify(obj);

$done(newBody);