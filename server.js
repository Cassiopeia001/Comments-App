/*server side*/
//Initialize Express
var express = require('express');
var app = express();

//socket IO
var http = require('http').Server(app);
var io = require('socket.io')(http);

//native NodeJS module for resolving paths
var path = require('path');

//get our port
var port = 3000;

//setup, configure, and connect to MongoDB
var mongoose = require('mongoose');
var configDB = require('./server/config/database.js');
mongoose.connect(configDB.url);
var Chat = require('./server/models/message');

//Set our view engine to EJS, and set the directory our views will be stored in
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'client', 'views'));

//serve static files from client folder.
app.use(express.static(path.resolve(__dirname, 'client')));


io.on('connection', function(socket) {
  console.log("A User has Connected!");

  var query = Chat.find({});
  query.exec(function(err, history) {  //.sort('-created').limit(20)
      if (err) throw err;
      console.log('sending messages history!')
      socket.emit('DB', history);
  })

  socket.on('sendMessage', function(data){
    var mail = data.mail.trim();
    var msg = data.msg.trim();
    var newMsg = new Chat({mail:mail , msg:msg});
    newMsg.save(function(err) {
      if (err) throw err;
    });
    io.emit('newMessage', {mail: data.mail, msg: data.msg});
  });

  socket.on('req', function(data) {
      var filter_result = Chat.find(
          {$or: [ {mail: new RegExp(data, 'i')} , {msg: new RegExp(data, 'i')} ] }
      );
      filter_result.exec(function (err, data) {
          if (err) throw err;
          console.log('sending filtered msgs!');
          socket.emit('DB', data);
      });
  });
});


//set our first route
app.get('/', function(req, res) {
  res.render('index.ejs');
});

app.get('/*', function(req, res) {
  res.render('index.ejs');
});

//make our app listen for incoming requests on the port assigned above
http.listen(port, function() {
  console.log('SERVER RUNNING... PORT: ' + port);
})