var pg = require('pg');
var credentials = require('../credentials');
var client = new pg.Client('postgres://' + credentials.pgUser + ':' + credentials.pgPassword + '@localhost:5432/users');
client.connect();

client.query('SELECT * FROM user_names', function (err, results) {
    console.log(results.rows);
    client.end();
})

//\l to list databases
