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
var session = require('express-session');
var Store = require('connect-redis')(session);
var functions = require('./functions');

app.use(session({
    store: new Store({
        ttl: 3600,
        host: 'localhost',
        port: 6379
    }),
    resave: false,
    saveUninitialized: true,
    secret: 'my super fun secret'
}));


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
    if (!req.session.user) {
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

app.get('/name/index.html', function (req, res) {
    res.render('index');
})

app.get('/twitterFeed', function(req, res) {

    getTweetsUsingPromises().then(function(tweets) {
        res.json(tweets);
    }).catch(function(err) {
        console.log(err);
        res.sendStatus(500);
    });
});

app.get('/login', function (req, res) {
    res.render('login');
})

app.post('/login', function (req, res) {

    if (!req.body.email.length || !req.body.password.length) {

        loginErrorHandlingMessage();
    }

    var client = functions.createNewPsqlClient(credentials.pgUser, credentials.pgPassword);

    var query = 'SELECT * FROM user_names WHERE user_names.email = $1';
    var email = req.body.email;

    client.query(query, [email], function (err, results) {
        if (!results.rows.length) {
            err = true;
        }
        if (err) {
            loginErrorHandlingMessage();
        } else {
            client.end();
            functions.checkPassword(req.body.password, results.rows[0].hash, function (err, doesMatch) {
                if (err) {
                    loginErrorHandlingMessage();
                }
                if (doesMatch == true) {

                    res.end('password match!!!!');
                } else {
                    loginErrorHandlingMessage();
                }
            });
        }
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

});

app.post('/name', function(req, res) {
    cache.del('users');
    if (!req.body.firstname.length || !req.body.lastname.length) {
        res.redirect('/name/index.html');
        return;
    } else {
        var client = functions.createNewPsqlClient(credentials.pgUser, credentials.pgPassword);

        var query = 'INSERT INTO user_names(name, surname, email, hash) VALUES($1, $2, $3, $4) RETURNING id';
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;

        functions.hashPassword(req.body.password, function(err, hash) {
            if (err) {
                console.log(err);
            }

            client.query(query, [firstname, lastname, email, hash], function(err, results) {
                if (err) {
                    console.log(err);

                    var duplicateEmailError = ['Email exists in a database'];

                    res.render('index', {emailError: duplicateEmailError});

                } else {
                    client.end();

                    req.session.user = {
                        data: req.body.firstname + ' ' + req.body.lastname,
                        userID: results.rows[0].id,
                        email: email
                    }
                    res.redirect('/name/details.html');
                }
            });
        });
    }
});

app.post('/details', function(req, res) {
    if (!req.body.Age || !req.body.City || !req.body.homepageURL || !req.body.favoriteColor) {
        res.redirect('/name/details.html');
        return;
    } else {
        var client = functions.createNewPsqlClient(credentials.pgUser, credentials.pgPassword);

        var query = 'INSERT INTO user_profile(age, city_of_residence, homepage_url, favorite_color, user_id) VALUES($1, $2, $3, $4, $5)';
        var age = req.body.Age;
        var city = req.body.City;
        var homepage = req.body.homepageURL;
        var favColor = req.body.favoriteColor;
        var foreignID = req.session.user.userID;

        client.query(query, [age, city, homepage, favColor, foreignID], function (err, results) {
            if (err) {
                console.log(err);
            } else {
                client.end();
                res.redirect('/users');
            }
        });
    }
});

var returnObjectForHandlebars = function (item) {
    return {
        name: item.name,
        surname: item.surname,
        age: item.age,
        city_of_residence: item.city_of_residence,
        homepage_url: item.homepage_url,
        favorite_color: item.favorite_color
    }
}

app.get('/users', function(req, res) {

    cache.get('users', function (err, data) {

        if (data !== null && !err) {

            try {
                var parsedCachedData = JSON.parse(data);

            } catch (err) {
                console.log(err);
            }
            var uniqueCities = [];
            parsedCachedData.forEach(function(item) {
                if (uniqueCities.indexOf(item.city_of_residence) < 0) {
                    uniqueCities.push(item.city_of_residence);
                }
            });

            var dataAboutUsers = parsedCachedData.map(returnObjectForHandlebars);
            res.render('usersData', {users: dataAboutUsers, cities: uniqueCities});

        } else {

            var client = functions.createNewPsqlClient(credentials.pgUser, credentials.pgPassword);


            var query = 'SELECT * FROM user_names JOIN user_profile ON user_names.id = user_profile.user_id;';
            client.query(query, function (err, results) {
                if (err) {
                    console.log(err);
                } else {

                    cache.set('users', JSON.stringify(results.rows));
                    client.end();

                    var dataAboutUsers = results.rows.map(returnObjectForHandlebars);
                    var cityData = results.rows.map(returnObjectForHandlebars);
                }

                res.render('usersData', {users: dataAboutUsers, cities: cityData});
            });
        }
    });
});

app.post('/city', function(req, res) {
    var client = functions.createNewPsqlClient(credentials.pgUser, credentials.pgPassword);


    var counter = 2;
    var dataForCitySelection;
    var usersDataBasedOnCity;

    var query = 'SELECT * FROM user_names JOIN user_profile ON user_names.id = user_profile.user_id;';
    client.query(query, function (err, results) {
        if (err) {
            console.log(err);
        } else {
            client.end();

                detaForCitySelection = results.rows.map(returnObjectForHandlebars);
            counter--;

            if (counter == 0) {

                res.render('usersData', {cities: detaForCitySelection, users: usersDataBasedOnCity});
            }
        }
    });

    var client1 = functions.createNewPsqlClient(credentials.pgUser, credentials.pgPassword);


    var query1 = 'SELECT * FROM user_names JOIN user_profile ON user_names.id = user_profile.user_id WHERE user_profile.city_of_residence = $1;';
    client1.query(query1, [req.body.select], function (err, results) {
        if (err) {
            console.log(err);
        } else {
            client1.end();

                usersDataBasedOnCity = results.rows.map(returnObjectForHandlebars);
            counter--;
            if (counter == 0) {
                res.render('usersData', {cities: detaForCitySelection, users: usersDataBasedOnCity});
            }
        }
    });
});

app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        }
    });
    res.redirect('/name/index.html');
});

app.get('/hello/world', function(req, res) {
    res.send('<!doctype html><title>Hello World!</title><p>Hello World!</html>');
});

app.listen(8080);
