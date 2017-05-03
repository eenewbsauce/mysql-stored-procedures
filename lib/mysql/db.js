const mysql      = require('mysql');
const dbParams   = require('../envs');

const connection = mysql.createConnection({
  host     : dbParams.host,
  user     : dbParams.user,
  password : dbParams.password,
});

module.exports = connection;
// connection.connect(function(err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }
//
//   console.log('connected as id ' + connection.threadId);
// });

// connection.end(function(err) {
//   // The connection is terminated now
// });
