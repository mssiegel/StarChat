const express = require('express');
const socket = require('socket.io');

//App setup
const app = express();
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`listening to requests on port ${port}`);
});

//Static files
app.use(express.static('public'));

//Socket setup
const io = socket(server);

io.on('connection', socket => {
  console.log('made socket connection', socket.id);

  //Handle chat event
  socket.on('chat', msg => {
    io.emit('chat', msg)
  });

  socket.on('typing', userHandle => {
    socket.broadcast.emit('typing', userHandle)
  });

});
