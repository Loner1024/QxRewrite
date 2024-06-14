var body = $response.body;

var obj = JSON.parse(body);

obj.isVIP = true
obj.privilege.vipTL = 1744293856268


var newBody = JSON.stringify(obj);

$done(newBody);