var reqBody = $request.body;
var reqObj = JSON.parse(reqBody);

reqObj.mode = 2

var newReqBody = JSON.stringify(reqObj);

$done(newReqBody);

var body = $response.body;

var obj = JSON.parse(body);

obj.isVIP = true
obj.privilege.vipTL = 1744293856268
obj.privilege.blackVipTL = 1744293856268

var newBody = JSON.stringify(obj);

$done(newBody);