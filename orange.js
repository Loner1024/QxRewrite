var body = $response.body;


if (body) {
	var obj = JSON.parse(body);
	for (let profile of obj.data) {
		profile.userProfile?.avatar?.picUrl = profile.userProfile.avatar.picUrl.replace('/blur/100x200', '');
	}

	console.log(obj)
}
console.log(body)

$done(body);