const config = require('../config/config');
require('../config/db')(
    Object.assign(
        config.settings,
        { DB_URI: 'mongodb://localhost/photobook_test' }
    )
);
const app = require('../config/setup');
const http = require('http').Server(app);

app.set('config', config.settings);

global.io = require('socket.io')(http);

describe('App', function () {
    after(function (done) {
        if (mongoose.connection.db.databaseName === 'photobook_test') {
            console.log('Dropping Test Database...')
            mongoose.connection.db.dropDatabase(done);
        }
    });
});

module.exports = app;
