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

const chatQueue = []; // array of sockets waiting to chat
const rooms = {}; // map socket.id => room
const names = {}; // map socket.id => name
const allUsers = {}; // map socket.id => socket

function findPeerForLoneSocket(socket) {
  if (chatQueue.length) {
    // somebody is in queue, pair them!
   const peer = chatQueue.pop();
   const room = socket.id + '#' + peer.id;
   // join them both to room
   peer.join(room);
   socket.join(room);
   // register rooms to their names
   rooms[peer.id] = room;
   rooms[socket.id] = room;
   // exchange names between the two of them and start the chat
   console.log("people have been matched!!")
   peer.emit('chat start', {'peerName': names[socket.id], 'room':room});
   socket.emit('chat start', {'peerName': names[peer.id], 'room':room});
  }
  else chatQueue.unshift(socket); // queue is empty, add our lone socket
}

io.on('connection', socket => {
  console.log('made socket connection', socket.id);

  //Handle new person logging in
  socket.on('new login', userName => {
    console.log(`${userName} has entered the chatQueue`)
    names[socket.id] = userName;
    allUsers[socket.id] = socket;
    //check if someone is in queue
    findPeerForLoneSocket(socket, userName);
  })

  //Handle new chat message
  socket.on('chat message', msg => {
    const room = rooms[socket.id];
    socket.to(room).emit('chat message', msg);
  });

  socket.on('leave room', endChat);
  socket.on('disconnect', endChat); //copy of 'leave room', may be able to combine functions

  function endChat(){
    const room = rooms[socket.id];
    if(room){
      socket.to(room).emit('chat end');
      const socketAndPeerIDs = room.split('#');
      socketAndPeerIDs.forEach(socketID => allUsers[socketID].leave(room));
    }
  }

  socket.on('typing', userName => {
    const room = rooms[socket.id];
    socket.to(room).emit('typing', userName)
  });

});
