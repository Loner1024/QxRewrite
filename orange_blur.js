var body = $response.body;
var path = $request.path

var obj = JSON.parse(body);


for (let profile of obj.data) {
    profile.modelType = 'UserProfile'
    profile.status = 'liked';
    try {
        profile.userProfile.avatar.picUrl = profile.userProfile.avatar.picUrl.replace('/blur/100x200', '');  
    } catch (e) {
        console.log(e);
        continue;
    }
    if(profile.fuzzy) {
        profile.fuzzy = false;
    }
}


var newBody = JSON.stringify(obj);

$done(newBody);
