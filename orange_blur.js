var body = $response.body;
var path = $request.path

var obj = JSON.parse(body);


for (let profile of obj.data) {
    console.log("start")
    console.log(JSON.stringify(profile))
    console.log(profile)
    console.log("end")
    profile.userProfile.avatar.picUrl = profile.userProfile.avatar.picUrl.replace('/blur/100x200', '');
    profile.modelType = 'UserProfile'
    profile.status = 'liked';
    if(profile.fuzzy) {
        profile.fuzzy = false;
    }
}


var newBody = JSON.stringify(obj);

$done(newBody);
