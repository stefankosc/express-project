var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var hb = require('express-handlebars');
var pg = require('pg');
//var getTweets = require('./projects/ticker/twitterRequest');
var getTweetsUsingPromises = require('./projects/ticker/twitterRequestUsingPromises');
var credentials = require('./credentials');
var redis = require('redis');

app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/projects'));
app.use(express.static(__dirname + '/static'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: false
}));


var cache = redis.createClient({
    host: 'localhost',
    port: 6379
});

cache.on('error', function (err) {
    console.log(err);
})




app.use(function (req, res, next) {
    if (!req.cookies.data) {
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
        });
    } else {
        res.sendStatus(404);
    }
});

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
        var client = new pg.Client('postgres://' + credentials.pgUser + ':' + credentials.pgPassword + '@localhost:5432/users');
        client.connect(function(err) {
            if (err) {
                console.log("There was an error when creating to database" + err);
            }
        });
        var query = 'INSERT INTO user_names(name, surname) VALUES($1, $2) RETURNING id';
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        client.query(query, [firstname, lastname], function(err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log(results.rows[0].id);
                client.end();
                res.cookie('data', req.body.firstname + ' ' + req.body.lastname );
                res.cookie('userID', results.rows[0].id);
                res.redirect('/name/details.html');
            }
        });
    }
});

app.post('/details', function(req, res) {
    if (!req.body.Age || !req.body.City || !req.body.homepageURL || !req.body.favoriteColor) {
        res.redirect('/name/details.html');
        return;
    } else {
        var client = new pg.Client('postgres://' + credentials.pgUser + ':' + credentials.pgPassword + '@localhost:5432/users');
        client.connect(function(err) {
            if (err) {
                console.log(err);
            }
        });
        var query = 'INSERT INTO user_profile(age, city_of_residence, homepage_url, favorite_color, user_id) VALUES($1, $2, $3, $4, $5)';
        var age = req.body.Age;
        var city = req.body.City;
        var homepage = req.body.homepageURL;
        var favColor = req.body.favoriteColor;
        var foreignID = req.cookies.userID;
        client.query(query, [age, city, homepage, favColor, foreignID], function (err, results) {
            if (err) {
                console.log(err);
            } else {
                client.end();
                res.redirect('/users');
            }
        });
    }
    var request = req.body;
});




app.get('/users', function(req, res) {
    cache.get('users', function (err, data) {

        if (err == null) {

            var client = new pg.Client('postgres://' + credentials.pgUser + ':' + credentials.pgPassword + '@localhost:5432/users');
            client.connect(function(err) {
                if (err) {
                    console.log(err);
                }
            });

            var query = 'SELECT * FROM user_names JOIN user_profile ON user_names.id = user_profile.user_id;';
            client.query(query, function (err, results) {
                if (err) {
                    console.log(err);
                } else {

                    cache.set('users', JSON.stringify(results.rows));
                    client.end();
                    var usersData = {
                        data: results.rows.map(function(item) {
                            return {
                                name: item.name,
                                surname: item.surname,
                                age: item.age,
                                city_of_residence: item.city_of_residence,
                                homepage_url: item.homepage_url,
                                favorite_color: item.favorite_color
                            }
                        })
                    }
                }
                res.render('usersData', usersData);
            });
        } 
    });
});


app.post('/city', function(req, res) {
    var client = new pg.Client('postgres://' + credentials.pgUser + ':' + credentials.pgPassword + '@localhost:5432/users');
    client.connect(function(err) {
        if (err) {
            console.log(err);
        }
    });

    var counter = 2;
    var cities;
    var filteredRows;


    var query1 = 'SELECT * FROM user_names JOIN user_profile ON user_names.id = user_profile.user_id;';
    client.query(query1, function (err, results) {
        if (err) {
            console.log(err);
        } else {
            client.end();
            var detailData = {
                cityData: results.rows.map(function(item) {
                    return {
                        name: item.name,
                        surname: item.surname,
                        age: item.age,
                        city_of_residence: item.city_of_residence,
                        homepage_url: item.homepage_url,
                        favorite_color: item.favorite_color
                    }
                })

            }

            counter--;
            //if (counter == 0)
        }

    });

    var query2 = 'SELECT * FROM user_names JOIN user_profile ON user_names.id = user_profile.user_id WHERE user_profile.city_of_residence = $1;';
    client.query(query2, [req.body.select], function (err, results) {
        if (err) {
            console.log(err);
        } else {
            client.end();
            var usersData = {
                data: results.rows.map(function(item) {
                    return {
                        name: item.name,
                        surname: item.surname,
                        age: item.age,
                        city_of_residence: item.city_of_residence,
                        homepage_url: item.homepage_url,
                        favorite_color: item.favorite_color
                    }
                })
            }
            counter--;
        }


    })


})

app.get('/hello/world', function(req, res) {
    res.send('<!doctype html><title>Hello World!</title><p>Hello World!</html>');
});

app.listen(8080);
