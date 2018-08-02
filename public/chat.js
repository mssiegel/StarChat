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


suggestBtn.addEventListener('click', suggestNewCharacter);

practiceModeBtn.addEventListener('click', () => {
  [form, chatContainer].forEach(element => element.classList.remove('hide'));
  output.innerHTML = `<p><strong>You have entered practice mode! Try out various characters, make your own stories, experiment...</strong></p>`;
  message.focus();
  practiceModeBtn.classList.add('hide');
});

{//ensures both character input fields always display same values
  userName.addEventListener('input',() => {
    chosenChar.value = userName.value;
  });
  chosenChar.addEventListener('input', () => {
    userName.value = chosenChar.value;
  });
}

function scrollToBottomOfChat(){
  //scrolls to bottom of sendMessageBtn
  sendMessageBtn.scrollIntoView(false);
}

function tearDownForm(){
  form.classList.add('hide')
  startChatBtn.classList.remove('hide');
  endChatBtn.classList.add('hide');
}

//suggests a new character - always different than previous one
function suggestNewCharacter() {
  let randomChar;
  do {
    const characterList = ['Ceo of Whoopee Cushions R Us', 'Elfin Archer', 'Circus Clown with Powers', 'Ballerina Spy', 'Website Builder', 'Mad Prank Artist', 'Mighty Knight', 'Dragon slayer', 'Viking Warrior','Leader of a Warrior Army','Laughing Jack', 'Elf with a scowl', 'Wizard with a scarred cheek', 'Beggar with Super Powered Charm', 'Vampire Hunter', 'Alien Warlord', 'Alien with a Green Tail', 'Pirate Captain', 'Sorcerer with a maniacal laugh', 'Maniac Magician', 'Hypnotist Master', 'Defender of the Righteous', 'Job Applicant', 'Warrior Kingdom Rebel'];
    const randomChoice = Math.floor(Math.random() * characterList.length);
    randomChar = characterList[randomChoice];
  } while (randomChar === userName.value);
  chosenChar.value = randomChar;
  userName.value = randomChar;
  message.focus();
}

//EMIT events
startChatBtn.addEventListener('click', () => {
  socket.emit('new login', chosenChar.value);
  startChatBtn.classList.add('hide');
  lookingForSomeone.innerHTML = "LOOKING FOR SOMEONE TO PAIR YOU WITH..."
});

form.addEventListener('submit', (e) => {
  socket.emit('chat message', {
    message: message.value,
    userName: userName.value
  });
  output.innerHTML += '<p><strong>' + userName.value + ':</strong> ' + message.value + '</p>';
  message.value = '';
  message.focus();
  e.preventDefault();
});

message.addEventListener('input', () => {
  socket.emit('typing', userName.value);
});

endChatBtn.addEventListener('click', () => {
  output.innerHTML += `<p><em><strong>You</strong> have left the chat</em></p>`;
  tearDownForm();
  practiceModeBtn.classList.remove('hide');
  socket.emit('leave room');
});


//LISTEN for events
socket.on('chat start' , peersName => {
  [form, endChatBtn, chatContainer].forEach(element => element.classList.remove('hide'));
  practiceModeBtn.classList.add('hide');
  lookingForSomeone.innerHTML = "";
  output.innerHTML = `<p><em><strong>${peersName || 'Someone'}</strong> has entered. Get the conversation going.</em></p>`;
  feedback.innerHTML = '';
  message.focus();
});

socket.on('chat end', function(data) {
    output.innerHTML += `<p><em><strong>The other person</strong> has left the chat</em></p>`;
    tearDownForm();
    practiceModeBtn.classList.remove('hide');
});

socket.on('chat message', msg => {
  feedback.innerHTML = '';
  output.innerHTML += '<p><strong>' + msg.userName + ':</strong> ' + msg.message + '</p>';
  scrollToBottomOfChat();
});

let typingNotice;
socket.on('typing', userName => {
  feedback.innerHTML = "<p><em>" + (userName || 'Someone') + ' is typing...</em></p>';
  if(typingNotice) clearTimeout(typingNotice);
  typingNotice = setTimeout(() => feedback.innerHTML = '', 5000);
  scrollToBottomOfChat();
});
