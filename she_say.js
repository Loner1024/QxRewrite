var body = $response.body;
var path = $request.path

var obj = JSON.parse(body);

obj.privilege.vipTL = 100;

var newBody = JSON.stringify(obj);

$done(newBody);