var body = $response.body;
var path = $request.path

var obj = JSON.parse(body);

obj.privilege.vipTL = 1744293856268;
obj.privilege.blackVipTL = 1744293856268
obj.blackVipAccessible = false
obj.blockGiftCard = true;

var newBody = JSON.stringify(obj);

$done(newBody);