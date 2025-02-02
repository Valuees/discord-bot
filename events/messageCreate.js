module.exports = {
    name: 'messageCreate',
    execute(message) {
      console.log(`New message received: ${message.content}`);
    },
  };
  