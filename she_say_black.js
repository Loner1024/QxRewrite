var body = $response.body;

var obj = JSON.parse(body);

const regex = /album\/([^\/]+)/;

obj.isBlackVip = true;
obj.showExposure = true;
for (let user of obj.userList) {
    const uid = user.avatar.match(regex);
    if (uid) {
        console.log(match[1]);
    }
    user.uid = uid
}

var newBody = JSON.stringify(obj);

$done(newBody);