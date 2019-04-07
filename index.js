const config = require('./config/config');
require('./config/db')(config.settings);
const app = require('./config/setup');
const logger = require('debug')('dev');
let port = config.server.port;
const http = require('http').Server(app);

app.set('config', config.settings);

global.io = require('socket.io')(http);

io.on('connection', () => {
  console.log('New user connected');
  io.emit('newConn', 'New connection');
});

io.on('login', (data) => {
  console.log('New user logged in: ', data);
  io.emit('join', data);
})

http.listen(port, () => {
  console.log('#########################################');
  console.log(`Server launched on port: ${port}`);
  console.log('#########################################');
  logger(`server started on port ${port}`);
});
