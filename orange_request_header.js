/*
 * Force server to return plain JSON (no gzip/br), so rewrite scripts can JSON.parse reliably.
 *
 * Quantumult X: script-request-header
 * Surge/Loon: compatible shape ($request.headers -> $done({ headers }))
 */

var headers = ($request && $request.headers) ? $request.headers : {};
var newHeaders = {};

for (var k in headers) {
    if (!Object.prototype.hasOwnProperty.call(headers, k)) continue;
    if (String(k).toLowerCase() === "accept-encoding") continue;
    newHeaders[k] = headers[k];
}

newHeaders["Accept-Encoding"] = "identity";

$done({ headers: newHeaders });

