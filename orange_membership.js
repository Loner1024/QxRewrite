var body = $response.body;
var path = $request.path

var obj = JSON.parse(body);

obj.membership = 'BASIC';

var newBody = JSON.stringify(obj);

$done(newBody);