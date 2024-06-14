var body = $response.body;

var obj = JSON.parse(body);

const regex = /album\/([^\/]+)/;

obj.isVIP = true
obj.privilege.vipTL = 1744293856268
obj.privilege.blackVipTL = 1744293856268
for (let info of obj.showedInfo) {
    if (info.uid) {
        continue
    }
    const uid = info.avatar.match(regex);
    if (uid[1]) {
        info.uid = uid[1]
    }
}


var newBody = JSON.stringify(obj);

$done(newBody);