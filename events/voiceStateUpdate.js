const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    let historyData = await db.get('historyLogs') || {};
    let voiceData = historyData['voice'];

    if (voiceData && voiceData.enabled) {
      const channel = newState.guild.channels.cache.get(voiceData.channel);
      if (channel && channel.isTextBased()) {
        if (!oldState.channel && newState.channel) {
          const embed = new EmbedBuilder()
            .setTitle(`🔊 ${newState.member.user.tag}`)
            .setDescription(`↪ ${oldState.member.user.tag} \`joined to ⇨\` **${newState.channel.name}**.`)
            .setColor('#51ff54') 
            .setTimestamp();
          await channel.send({ embeds: [embed] });
        } 
        else if (oldState.channel && !newState.channel) {
          const embed = new EmbedBuilder()
            .setTitle(`❌ ${oldState.member.user.tag}`)
            .setDescription(`↪ ${oldState.member.user.tag} \`left from ⇨\` **${oldState.channel.name}**.`)
            .setColor('#ff5151') 
            .setTimestamp();
          await channel.send({ embeds: [embed] });
        } 
        else if (oldState.channel !== newState.channel) {
          const embed = new EmbedBuilder()
            .setTitle(`🔄 ${oldState.member.user.tag} `)
            .setDescription(`↪ ${oldState.member.user.tag} \`moved from ⇨\` **${oldState.channel.name}** \`to ⇨\` **${newState.channel.name}**.`)
            .setColor('#1e90ff') 
            .setTimestamp();
          await channel.send({ embeds: [embed] });
        }
      }
    }
  },
};
