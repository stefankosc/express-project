const https = require('https');
var credentials = require('../../credentials');
var key = credentials.consumerKey + ':' + credentials.consumerSecret;
var keyB64 = Buffer(key).toString('base64');

var options = {
    hostname: 'api.twitter.com',
    port: 443,
    path: '/oauth2/token',
    method: 'POST',
    headers: {
        Authorization: 'Basic ' + keyB64,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF=8'
    }
}

function makeRequestPromise(options) {

    return new Promise(function(resolve, reject) {

        var req = https.request(options, function(res) {
            var body = '';
            if (res.statusCode !== 200) {
                reject(res.statusCode);
            } else {
                console.log(res.statusCode);
                res.on('data', function(dane) {
                    body += dane;

                }).on('end', function() {
                    try {
                        var data = JSON.parse(body);
                        resolve(data);
                    } catch (err) {
                        reject(err);
                    }
                });
            }
        });
        if (options.method == 'POST') {
            req.write('grant_type=client_credentials');
        }
        req.end();
    });
}

function getTweets () {

    return tokenPromise.then(function(data) {

        var options = {
            hostname: 'api.twitter.com',
            port: 443,
            path: '/1.1/statuses/user_timeline.json?screen_name=ReutersBiz&count=10',
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + data
            }
        }
        return makeRequestPromise(options);
    });
}
var tokenPromise = makeRequestPromise(options).then(function (data) {
    return data.access_token;
});

module.exports = function() {
    return getTweets().then(function(tweets) {

        var headlineTweets = {};

        for (var i = 0; i < tweets.length; i++){
            var myFormattedText = tweets[i].text.replace(/http.*$/, '');
            try {
                headlineTweets[tweets[i].entities.urls[0].url] = myFormattedText;
            }
            catch (e) {
                console.log(e);
            }
        }
        return headlineTweets;
    })
}
