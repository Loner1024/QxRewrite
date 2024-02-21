var body = $response.body;

var obj = JSON.parse(body);

obj.isBlackVip = true;
obj.showExposure = true

var newBody = JSON.stringify(obj);

$done(newBody);