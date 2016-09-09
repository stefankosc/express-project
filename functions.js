var bcrypt = require('bcrypt');
var pg = require('pg');
var credentials = require('./credentials');
var exports = module.exports = {};

exports.hashPassword = function (plainTextPassword, callback) {
    bcrypt.genSalt(function(err, salt) {
        if (err) {
            return callback(err);
        }
        console.log(salt);
        bcrypt.hash(plainTextPassword, salt, function(err, hash) {
            if (err) {
                return callback(err);
            }
            console.log(hash);
            callback(null, hash);
        });
    });
}

exports.checkPassword = function (textEnteredInLoginForm, hashedPasswordFromDatabase, callback) {
    bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(err, doesMatch) {
        if (err) {
            return callback(err);
        }
        console.log(doesMatch);
        callback(null, doesMatch);
    });
}

exports.loginErrorHandlingMessage = function(res) {
        var errorWhileLogin = ['Email adress or password is incorrect'];
        res.render('login', {loginError: errorWhileLogin});
    }

exports.createNewPsqlClient = function (pgUser, pgPassword) {
    var client = new pg.Client('postgres://' + credentials.pgUser + ':' + credentials.pgPassword + '@localhost:5432/users');
    client.connect(function(err) {
        if (err) {
            console.log(err);
        }
    });
    return client;

}
