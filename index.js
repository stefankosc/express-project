var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var hb = require('express-handlebars');
//var getTweets = require('./projects/ticker/twitterRequest');
var getTweetsUsingPromises = require('./projects/ticker/twitterRequestUsingPromises');

app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/projects'));
app.use(express.static(__dirname + '/static'));

app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(function (req, res, next) {
    if (!req.cookies.cookied) {
        if (!req.url.startsWith('/name')) {
            res.redirect('/name/index.html');
            return;
        }
    }
    next();
});

var directory = ['/kittyWebsite/', '/ticker/', '/spotifySearch/', '/reichstagWebsite/', '/hangMan/'];
var dataForTemplate = {
    projects: directory.map(function(item) {
        return {
            url: '/projects' + item,
            text: item.slice(1, -1)
        }
    })
}

app.get('/twitterFeed', function(req, res) {

    getTweetsUsingPromises().then(function(tweets) {
        console.log(tweets);
        res.json(tweets);
    }).catch(function(err) {
        console.log(err);
        res.sendStatus(500);
    });
});

app.get('/projects/:name', function(req, res) {

    var matched = directory.some(function(item) {
        return item.slice(1,-1) == req.params.name;
    })
    if (matched) {
        var description = require('./projects/' + req.params.name + '/description.json').description;
        res.render('project', {
            description: 'This is ' + description + ' ' + req.params.name,
            link: req.params.name,
            layout: 'myPortfolio'
        })
    } else {
        res.sendStatus(404);
    }
})
app.get('/website', function (req, res) {

    res.render('website', dataForTemplate);
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/projects/name/index.html');
    console.log(req.cookies);
});

app.post('/name', function(req, res) {
    if (!req.body.firstname.length || !req.body.lastname.length) {
        res.redirect('/name/index.html');
        return;
    } else {
        res.cookie('cookied', 'value');
        res.redirect('/hello/world');
    }
});

app.get('/hello/world', function(req, res) {
    res.send('<!doctype html><title>Hello World!</title><p>Hello World!</html>');
});
app.listen(8080);
