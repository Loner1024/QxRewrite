var body = $response.body;
var newBody = body;

try {
    var obj = JSON.parse(body);
    if (obj && Array.isArray(obj.data)) {
        for (let profile of obj.data) {
            profile.modelType = 'UserProfile';
            profile.status = 'liked';

            var userProfile = profile && profile.userProfile;
            var avatar = userProfile && userProfile.avatar;
            var picUrl = avatar && avatar.picUrl;
            if (typeof picUrl === 'string') {
                avatar.picUrl = picUrl.replace('/blur/100x200', '');
            }

            if (profile.fuzzy) {
                profile.fuzzy = false;
            }
        }
        newBody = JSON.stringify(obj);
    }
} catch (e) {
    console.log("orange_blur: skip non-JSON body");
}

$done(newBody);
