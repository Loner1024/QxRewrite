var body = $response.body;
var path = $request.path

var obj = JSON.parse(body);

obj.privilege.vipTL = 9999999;
obj.blockGiftCard = true;

var newBody = JSON.stringify(obj);

$done(newBody);