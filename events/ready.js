const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  execute(client) {
    if (client.user) {
      console.log(`◇ Logged | ${client.user.tag}!`);
      client.user.setActivity("/ping | 0.0.1", { type: ActivityType.Listening });
    } else {
      console.error("Error: client.user is null or undefined");
    }
  },
};
