// Make connection
const socket = io();

// Query DOM
const message = document.getElementById('message'),
      userName = document.getElementById('user-name'),
      sendMessageForm = document.getElementById('send-message-form'),
      chatContainer = document.getElementById('chat-container'),
      chatWindow = document.getElementById('chat-window'),
      output = document.getElementById('output'),
      feedback = document.getElementById('feedback'),
      chosenChar = document.getElementById('chosen-char'),
      suggestBtn = document.getElementById('suggest-btn'),
      startChatBtn = document.getElementById('start-chat-btn'),
      practiceModeBtn = document.getElementById('practice-mode-btn'),
      endChatBtn = document.getElementById('end-chat-btn'),
      sendMessageBtn = document.getElementById('send-message-btn'),
      chatBtns = [startChatBtn, practiceModeBtn];
      buttons = document.querySelectorAll('.btn');
      lookingForSomeone = document.getElementById('looking-for-someone');

suggestBtn.addEventListener('click', suggestNewCharacter);

//disables chatBtns if character input field is blank
disableBtnsIfNoCharChosen();

//ensures both character input fields have same values. Also disables chatBtns if blank input
keepCharInputFieldsTheSame();

practiceModeBtn.addEventListener('click', () => {
  [sendMessageForm, chatContainer].forEach(element => element.classList.remove('hide'));
  output.innerHTML = `<p><em>You have entered </em><strong>PRACTICE MODE</strong><em>! Try out various characters, make your own stories, experiment...</em></p>`;
  prepareChat();
});


//EMIT events
startChatBtn.addEventListener('click', () => {
  socket.emit('new login', chosenChar.value);
  startChatBtn.classList.add('hide');
  lookingForSomeone.innerHTML = "LOOKING FOR SOMEONE TO PAIR YOU WITH..."
});

sendMessageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendChatMessage();
});

message.addEventListener('input', () => {
  //emits 'typing' if user starts typing a message
  socket.emit('typing', userName.value);
});

endChatBtn.addEventListener('click', () => {
  endChat('You');
  socket.emit('leave room');
});


//LISTEN for events

socket.on('chat start' , peersName => {
  [sendMessageForm, endChatBtn, chatContainer].forEach(element => element.classList.remove('hide'));
  lookingForSomeone.innerHTML = "";
  output.innerHTML = `<p><em><strong>${peersName || 'Someone'}</strong> has entered. Get the conversation going.</em></p>`;
  prepareChat();
});

socket.on('chat end', () => {
  endChat('Your peer');
});

socket.on('chat message', msg => {
  feedback.innerHTML = '';
  outputMessage(msg.userName, msg.message);
  scrollToBottomOfChat();
});

socket.on('typing', userName => {
  userTyping(userName);
});


//HELPER FUNCTIONS

//suggests a new character - always different than previous one
function suggestNewCharacter() {
  let randomChar;
  do {
    const characterList = ['Whoopee Cushion Maker', 'Elfin Archer', 'Powerful Circus Clown', 'Ballerina Spy', 'Website Builder', 'Mad Prankster', 'Mighty Knight', 'Dragon slayer', 'Viking Warrior','Leader of Warrior Army','Laughing Jack', 'Plumbing SuperHero', '9th Level Wizard', 'Charming Beggar', 'Vampire Hunter', 'Alien Warlord', 'Alien with green tail', 'Pirate Captain', 'Laughing Sorcerer', 'Maniac Magician', 'Hypnotist Master', 'Defender of the Righteous', 'Job Applicant', 'Rebel Leader', 'Tiny Warlord', 'Dancing Champion', 'Scared Scuba Diver', 'Potty Training Coach', 'Forgetful Daredevil', 'Founder of Farters R Us', 'Therapist', 'News Reporter', 'Food Salesperson', 'Productivity Coach'];
    const randomChoice = Math.floor(Math.random() * characterList.length);
    randomChar = characterList[randomChoice];
  } while (randomChar === userName.value);
  chosenChar.value = randomChar;
  userName.value = randomChar;
  if(chosenChar.value) chatBtns.forEach(btn => {
    btn.classList.remove('disabled');
    btn.disabled = false;
  });
  message.focus();
}

function disableBtnsIfNoCharChosen(){
  if (chosenChar.value) chatBtns.forEach(btn => {
    btn.classList.remove('disabled');
    btn.disabled = false;
  })
  else chatBtns.forEach(btn => {
    btn.classList.add('disabled');
    btn.disabled = true;
  });
}

function keepCharInputFieldsTheSame(){
  userName.addEventListener('input',() => {
    chosenChar.value = userName.value;
    disableBtnsIfNoCharChosen();
  });
  chosenChar.addEventListener('input', () => {
    userName.value = chosenChar.value;
    disableBtnsIfNoCharChosen();
  });
}

function sendChatMessage() {
  socket.emit('chat message', {
    userName: userName.value,
    message: message.value
  });
  outputMessage(userName.value, message.value);
  message.value = '';
  message.focus();
  scrollToBottomOfChat();
}

function scrollToBottomOfChat(){
  //scrolls viewport to bottom of sendMessageBtn
  sendMessageBtn.scrollIntoView(false);
}

function endChat(name){
  output.innerHTML += `<p id="left-chat"><em><strong>${name}</strong> left the chat</em></p>`;
  buttons.forEach(btn => btn.classList.remove('small-btn'));
  [sendMessageForm, endChatBtn].forEach(element => element.classList.add('hide'));
  chatBtns.forEach(btn => btn.classList.remove('hide'));
  feedback.innerHTML = '';
}

let eraseTypingNotice;
function userTyping(userName) {
  feedback.innerHTML = "<p><em>" + (userName || 'Someone') + ' is typing...</em></p>';
  if(eraseTypingNotice) clearTimeout(eraseTypingNotice);
  eraseTypingNotice = setTimeout(() => feedback.innerHTML = '', 5000);
  scrollToBottomOfChat();
}

function outputMessage(userName, message){
  output.innerHTML += `<p><strong>${userName}:</strong> ${message}</p>`;
}

function prepareChat(){
  buttons.forEach(btn => btn.classList.add('small-btn'));
  practiceModeBtn.classList.add('hide');
  message.focus();
}
