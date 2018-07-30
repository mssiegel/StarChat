// Make connection
const socket = io();

// Query DOM
const suggestBtn = document.getElementById('suggest-btn');
      message = document.getElementById('message'),
      userName = document.getElementById('user-name'),
      form = document.getElementById('chat-form'),
      chatContainer = document.getElementById('chat-container'),
      chatWindow = document.getElementById('chat-window'),
      output = document.getElementById('output'),
      feedback = document.getElementById('feedback'),
      chosenChar = document.getElementById('chosen-char'),
      startChatBtn = document.getElementById('start-chat-btn'),
      practiceModeBtn = document.getElementById('practice-mode-btn'),
      endChatBtn = document.getElementById('end-chat-btn'),
      sendMessageBtn = document.getElementById('send-message-btn'),
      lookingForSomeone = document.getElementById('looking-for-someone');


//suggests a new character - always different than previous one
suggestBtn.addEventListener('click', suggestNewCharacter);

function suggestNewCharacter() {
  let randomChar;
  do {
    const characterList = ['Ceo of Whoopee Cushions R Us', 'Elfin Archer', 'Circus Clown with Powers', 'Ballerina Spy', 'Website Builder', 'Mad Prank Artist', 'Mighty Knight', 'Dragon slayer', 'Viking Warrior','Leader of a Warrior Army','Laughing Jack', 'Elf with a scowl', 'Wizard with a scarred cheek', 'Beggar with Super Powered Charm', 'Vampire Hunter', 'Alien Warlord', 'Alien with a Green Tail', 'Pirate Captain', 'Sorcerer with a maniacal laugh', 'Maniac Magician', 'Hypnotist Master', 'Defender of the Righteous', 'Job Applicant', 'Warrior Kingdom Rebel'];
    const randomChoice = Math.floor(Math.random() * characterList.length);
    randomChar = characterList[randomChoice];
  } while (randomChar === userName.value);
  chosenChar.value = randomChar;
  userName.value = randomChar;
}

//EMIT events
startChatBtn.addEventListener('click', () => {
  socket.emit('new login', chosenChar.value);
  startChatBtn.classList.add('hide');
  lookingForSomeone.innerHTML = "LOOKING FOR SOMEONE TO PAIR YOUR WITH..."
});

form.addEventListener('submit', (e) => {
  socket.emit('chat message', {
    message: message.value,
    userName: userName.value
  });
  output.innerHTML += '<p><strong>' + userName.value + ':</strong> ' + message.value + '</p>';
  message.value = '';
  e.preventDefault();
});

message.addEventListener('keypress', () => {
  socket.emit('typing', userName.value);
});

function tearDownForm(){
  form.classList.add('hide')
  startChatBtn.classList.remove('hide');
}

endChatBtn.addEventListener('click', () => {
  output.innerHTML += `<p><em><strong>You</strong> have left the chat</em></p>`;
  tearDownForm();
  socket.emit('leave room');
});


//LISTEN for events
socket.on('chat start' , chatInfo => {
  [endChatBtn, chatContainer].forEach(element => element.classList.remove('hide'));
  lookingForSomeone.innerHTML = "";
  output.innerHTML = `<p><em><strong>${chatInfo.peerName || 'Someone'}</strong> has entered. Get the conversation going.</em></p>`;
  feedback.innerHTML = '';
});

socket.on('chat end', function(data) {
    output.innerHTML += `<p><em><strong>The other person</strong> has left the chat</em></p>`;
    tearDownForm();
});

socket.on('chat message', msg => {
  feedback.innerHTML = '';
  output.innerHTML += '<p><strong>' + msg.userName + ':</strong> ' + msg.message + '</p>';
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

socket.on('typing', userName => {
  feedback.innerHTML = "<p><em>" + (userName || 'Someone') + ' is typing a message...</em></p>';
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
