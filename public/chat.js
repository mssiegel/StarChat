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
      chatBtns = [startChatBtn, practiceModeBtn];
      buttons = document.querySelectorAll('.btn');
      lookingForSomeone = document.getElementById('looking-for-someone');

suggestBtn.addEventListener('click', suggestNewCharacter);
if(!chosenChar.value) chatBtns.forEach(btn => {
  btn.classList.add('disabled');
  btn.disabled = true;
});

practiceModeBtn.addEventListener('click', () => {
  [form, chatContainer].forEach(element => element.classList.remove('hide'));
  buttons.forEach(btn => btn.classList.add('small-btn'));
  output.innerHTML = `<p><em>You have entered </em><strong>PRACTICE MODE</strong><em>! Try out various characters, make your own stories, experiment...</em></p>`;
  message.focus();
  practiceModeBtn.classList.add('hide');
});

{
  //1. ensures both character input fields always display same values
  //2. disables chat buttons if character input field is blank
  userName.addEventListener('input',() => {
    chosenChar.value = userName.value;
  });
  chosenChar.addEventListener('input', () => {
    userName.value = chosenChar.value;
    chatBtns.forEach(btn => {
      if (chosenChar.value) {
        btn.classList.remove('disabled');
        btn.disabled = false;
      }
      else {
        btn.classList.add('disabled');
        btn.disabled = true;
      }
    });
  });
}

function scrollToBottomOfChat(){
  chatWindow.scrollTop = chatWindow.scrollHeight;  //scrolls chatWindow to bottom
  sendMessageBtn.scrollIntoView(false);   //scrolls view port to bottom of sendMessageBtn
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
  scrollToBottomOfChat();
});

message.addEventListener('input', () => {
  socket.emit('typing', userName.value);
});

endChatBtn.addEventListener('click', () => {
  output.innerHTML += `<p><em><strong>You</strong> have left the chat</em></p>`;
  tearDownForm();
  practiceModeBtn.classList.remove('hide');
  buttons.forEach(btn => btn.classList.remove('small-btn'));
  socket.emit('leave room');
});


//LISTEN for events
socket.on('chat start' , peersName => {
  [form, endChatBtn, chatContainer].forEach(element => element.classList.remove('hide'));
  buttons.forEach(btn => btn.classList.add('small-btn'));
  practiceModeBtn.classList.add('hide');
  lookingForSomeone.innerHTML = "";
  output.innerHTML = `<p><em><strong>${peersName || 'Someone'}</strong> has entered. Get the conversation going.</em></p>`;
  feedback.innerHTML = '';
  message.focus();
});

socket.on('chat end', function(data) {
    output.innerHTML += `<p><em><strong>Your peer</strong> has left the chat</em></p>`;
    buttons.forEach(btn => btn.classList.remove('small-btn'));
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
