var body = $response.body;

var obj = JSON.parse(body);

const regex = /album\/([^\/]+)/;

obj.isBlackVip = true;
obj.showExposure = true;
for (let user of obj.userList) {
    const uid = user.avatar.match(regex);
    if (uid[1]) {
        user.uid = uid[1]
    }
}

var newBody = JSON.stringify(obj);

$done(newBody);