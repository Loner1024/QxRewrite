var reqBody = $request.body;
var reqObj = JSON.parse(reqBody);

reqObj.mode = 2

var newReqBody = JSON.stringify(reqObj);

$done(newReqBody);