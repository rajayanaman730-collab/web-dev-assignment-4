const EventEmitter = require('events');

// custom event emitter for app logs
const myEmitter = new EventEmitter();

// listen for user signup
myEmitter.on('userSignup', (data) => {
  console.log(`[Event Log] New user created: ${data.username} (${data.role})`);
});

// listen for user login
myEmitter.on('userLogin', (data) => {
  console.log(`[Event Log] User logged in: ${data.username}`);
});

// note events
myEmitter.on('noteAdded', (data) => {
  console.log(`[Event Log] Note created by ${data.username}: "${data.title}"`);
});

myEmitter.on('noteDeleted', (data) => {
  console.log(`[Event Log] Note ${data.id} deleted by user ${data.userId}`);
});

// chat activity log
myEmitter.on('chatMessage', (data) => {
  console.log(`[Chat Log] [${data.room}] ${data.user}: ${data.text}`);
});

module.exports = myEmitter;
