var body = $response.body;

var obj = JSON.parse(body);

obj.isVIP = true
obj.privilege.vipTL = 9999999


var newBody = JSON.stringify(obj);

$done(newBody);