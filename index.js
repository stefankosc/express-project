var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var hb = require('express-handlebars');

app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/projects'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(function (req, res, next) {
    if (!req.cookies.cook) {
        if (!req.url.startsWith('/name')) {
            res.redirect('/name/index.html');
            return;
        }
    }
    next();
});

var directory = ['/projects/hangMan/', '/projects/kittyWebsite/', '/projects/ticker/', '/projects/spotifySearch/', '/projects/reichstagWebsite/'];
var dataForTemplate = {
    projects: directory.map(function(item) {
        return {
            url: item,
            text: item.slice(10)
        };
    })
}
console.log(dataForTemplate.projects);
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
        res.cookie('cook', 'value');
        res.redirect('/hello/world');
    };
});

app.get('/hello/world', function(req, res) {
    res.send('<!doctype html><title>Hello World!</title><p>Hello World!</html>');
});
app.listen(8080);
