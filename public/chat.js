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
      chatBtns = [startChatBtn, practiceModeBtn],
      buttons = document.querySelectorAll('.btn'),
      appState = document.getElementById('app-state');

//Global variables
let constantInternet;
let chatInSession;
const youLostInternet = 'You lost internet and';

//BASIC SET UP

suggestBtn.addEventListener('click', suggestNewCharacter);

//1. ensures both character input fields have same values
//2. disables chatBtns if character input field is blank
monitorCharInputFields();

practiceModeBtn.addEventListener('click', () => {
  startPracticeMode();
});


//EMIT socket events

startChatBtn.addEventListener('click', startChatBtnClicked);

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
  socket.emit('end chat');
});


//LISTEN for socket events

socket.on('chat start' , peersName => {
  startChat(peersName);
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
    const characterList = ['Whoopee Cushion Maker', 'Elfin Archer', 'Powerful Circus Clown', 'Ballerina Spy', 'Website Builder', 'Mad Prankster', 'Mighty Knight', 'Dragon slayer', 'Viking Warrior','Leader of Warrior Army','Laughing Jack', 'Plumbing SuperHero', '9th Level Wizard', 'Charming Beggar', 'Vampire Hunter', 'Alien Warlord', 'Alien with green tail', 'Pirate Captain', 'Laughing Sorcerer', 'Maniac Magician', 'Hypnotist Master', 'Defender of the Righteous', 'Job Applicant', 'Rebel Leader', 'Tiny Warlord', 'Dancing Champion', 'Scared Scuba Diver', 'Potty Training Coach', 'Founder of Farters R Us', 'Therapist', 'News Reporter', 'Food Salesperson', 'Productivity Coach', 'Karate Dude', 'Forgetful Surgeon', 'Evil Lawyer' ,'Empathetic listener', 'Dude with diaper gun'];
    const randomChoice = Math.floor(Math.random() * characterList.length);
    randomChar = characterList[randomChoice];
  } while (randomChar === userName.value);
  chosenChar.value = randomChar;
  userName.value = randomChar;
  chatBtns.forEach(btn => {
    btn.classList.remove('disabled');
    btn.disabled = false;
  });
  message.focus();
}

//disables or enables chatBtns depending on if character input field is blank
function disableOrEnableChatBtns(){
  if (chosenChar.value) chatBtns.forEach(enableButton);
  else chatBtns.forEach(disableButton);
}

function enableButton(btn){
  btn.classList.remove('disabled');
  btn.disabled = false;
}

function disableButton(btn){
  btn.classList.add('disabled');
  btn.disabled = true;
}

function monitorCharInputFields(){
  disableOrEnableChatBtns();

  userName.addEventListener('input',() => {
    chosenChar.value = userName.value;
    disableOrEnableChatBtns();
  });
  chosenChar.addEventListener('input', () => {
    userName.value = chosenChar.value;
    disableOrEnableChatBtns();
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
  if (chatInSession){
    chatInSession = false;
    output.innerHTML += `<p class="left-chat"><em><strong>${name}</strong> left the chat</em></p>`;
    buttons.forEach(btn => btn.classList.remove('small-btn'));
    [sendMessageForm, endChatBtn].forEach(element => element.classList.add('hide'));
    chatBtns.forEach(btn => btn.classList.remove('hide'));
    feedback.innerHTML = '';
    clearInterval(constantInternet);
  }
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

function startChat(peersName) {
  chatInSession = true;
  [sendMessageForm, endChatBtn, chatContainer].forEach(element => element.classList.remove('hide'));
  appState.className = "hide";
  appState.innerHTML = "";
  output.innerHTML = `<p><em>You got matched with <strong>${peersName}</strong>. Start chatting...</em></p>`;
  prepareChat();
}

function startPracticeMode() {
  [sendMessageForm, chatContainer].forEach(element => element.classList.remove('hide'));
  output.innerHTML = `<p><em>You have entered </em><strong>PRACTICE MODE</strong><em>! Try out various characters, make your own stories, experiment...</em></p>`;
  prepareChat();
}


//ASYNC HELPER FUNCTIONS

async function startChatBtnClicked() {
  startChatBtn.classList.add('hide');
  const internet = await checkInternetConnection(noInternetError);
  if(internet) {
    socket.emit('new login', chosenChar.value);
    appState.className = "looking-for-peer";
    appState.innerHTML = "Looking for someone to pair you with...";
    //checks internet every 8 seconds
    //ending chat or losing internet always clears constantInternet
    constantInternet = setInterval(() => {
      checkInternetConnection(noInternetError, youLostInternet)},
      8000);
  }
}

async function checkInternetConnection(callback, argForCallback){
  //if internet returns truthy value
  //if no internet runs callback and returns undefined
  const request = {method: 'HEAD', mode: 'no-cors'};
  try {return await fetch('https://www.google.com', request)}
  catch(e){
     try {return await fetch('https://www.amazon.com/', request)}
     catch(e){
       if(callback) callback(argForCallback);
     }
   }
}

function noInternetError(msg){
    //if you reconnect while still the same socket you will tell server 'end chat' which will notify server to end chat for your peer
    //if you reconnect after many seconds, you will be assigned a new socket and emitted 'end chat' will have no effect
    if(msg === youLostInternet) socket.emit('end chat');

    endChat(msg);
    appState.className = 'internet-error';
    appState.innerHTML = "Oh no. There's no internet connection. Please reconnect and try again";
    startChatBtn.classList.remove('hide');
    disableButton(startChatBtn);
    continuallyRecheckInternet();
}

//rechecks internet connection every 4 seconds
async function continuallyRecheckInternet() {
  const recheckForInternet = setInterval(async () => {
    const internet = await checkInternetConnection();
    if (internet) {
      clearInterval(recheckForInternet);
      appState.className = "internet-reconnected";
      appState.innerHTML = "Whoohoo! Internet was reconnected. You're good to go!";
      enableButton(startChatBtn);
    }
  }, 4000);
}
