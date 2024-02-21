var body = $response.body;


console.log('哈哈哈哈')
// var obj = JSON.parse(body);
// for (let profile of obj.data) {
// 	profile.userProfile?.avatar?.picUrl = profile.userProfile.avatar.picUrl.replace('/blur/100x200', '');
// }

// console.log(obj)
// console.log(body)

$done(body);