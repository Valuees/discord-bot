const fs = require('fs');
const path = require('path');

module.exports = (client) => {

  client.commands = new Map();
  
  const commandDir = path.join(__dirname, 'command');
  const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));

  console.log('Loading commands:');
  commandFiles.forEach(file => {
    try {
      const command = require(path.join(commandDir, file));
      client.commands.set(command.data.name, command);


      const name = command.data.name.padEnd(20, ' ');
      console.log(`◇ ${name} | pass`);
    } catch (error) {
      const name = file.split('.')[0].padEnd(20, ' ');
      console.error(`◇ ${name} | ${error.message}`);
    }
  });


  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  });

  
  const eventDir = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventDir).filter(file => file.endsWith('.js'));

  console.log('Loading events:');
  eventFiles.forEach(file => {
    const eventName = file.split('.')[0];
    try {
      const event = require(path.join(eventDir, file));
      client.on(eventName, (...args) => event.execute(...args)); 
    
      const name = eventName.padEnd(20, ' ');
      console.log(`◇ ${name} | pass`);
      
    } catch (error) {
      const name = eventName.padEnd(20, ' ');
      console.error(`◇ ${name} | ${error.message}`);
    }
  });
};
