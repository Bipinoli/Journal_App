

var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'journal_db_user',
    password : 'journal_db_password',
    database : 'journal_db'
});

module.exports = {
    connect: function () {
        connection.connect();
        return connection;
    },

    disconnect: function() {
        connection.end();
    }
};