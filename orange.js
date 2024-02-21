var body = $response.body;
var obj = JSON.parse(body);

for (profile of obj.data) {
	profile.userProfile.avatar.picUrl = profile.userProfile.avatar.picUrl.replace('/blur/100x200', '');
}

console.log(obj)
console.log(body)

$done(body);