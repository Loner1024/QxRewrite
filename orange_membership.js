var body = $response.body;
var newBody = body;

try {
    var obj = JSON.parse(body);
    if (obj && typeof obj === 'object') {
        obj.membership = 'BASIC';
        newBody = JSON.stringify(obj);
    }
} catch (e) {
    console.log("orange_membership: skip non-JSON body");
}

$done(newBody);
