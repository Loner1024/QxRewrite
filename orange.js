var body = $response.body;

console.log(body)

// if (body) {
// 	var obj = JSON.parse(body);
// 	console.log('哈哈哈哈')
// 	console.log(obj)
// 	for (let profile of obj.data) {
// 		profile.userProfile?.avatar?.picUrl = profile.userProfile.avatar.picUrl.replace('/blur/100x200', '');
// 	}

// 	console.log(obj)
// }
// console.log(body)

$done(body);