// Make connection
const socket = io();

// Query DOM
const suggestBtn = document.getElementById('suggestBtn');
      message = document.getElementById('message'),
      handle = document.getElementById('handle'),
      form = document.getElementById('chatForm'),
      output = document.getElementById('output'),
      feedback = document.getElementById('feedback');

suggestBtn.addEventListener('click', suggestNewCharacter);

function suggestNewCharacter(){
  let randomChar;
  do {
    const characterList = ['Dragon slayer', 'Viking Warrior','Leader of a Warrior Army','Laughing Jack', 'Elf with a scowl', 'Wizard with a scarred cheek', 'Beggar with Super Powered Charm', 'Vampire Hunter', 'Alien Warlord', 'Alien with a Green Tail', 'Pirate Captain', 'Sorcerer with a maniacal laugh', 'Maniac Magician', 'Hypnotist Master', 'Defender of the Righteous', 'Job Applicant', 'Warrior Kingdom Rebel'];
    const randomChoice = Math.floor(Math.random() * characterList.length);
    randomChar = characterList[randomChoice];
  } while (randomChar === handle.value); // ensures pressing button twice can't give same character as before
  handle.value = randomChar;
}

//Emit events
form.addEventListener('submit', (e) => {
  socket.emit('chat', {
    message: message.value,
    handle: handle.value
  });
  message.value = '';
  e.preventDefault();
});

message.addEventListener('keypress', () => {
  socket.emit('typing', handle.value);
});

//Listen for events
socket.on('chat', msg => {
  feedback.innerHTML = '';
  output.innerHTML += '<p><strong>' + msg.handle + ':</strong>' + msg.message + '</p>';
});

socket.on('typing', userHandle => {
  feedback.innerHTML = "<p><em>" + userHandle + ' is typing a message...</em></p>';
});
