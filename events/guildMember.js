const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {

    const historyData = await db.get('historyLogs');
    const joinLeaveData = historyData['join-leave'];

    if (joinLeaveData && joinLeaveData.enabled) {
      const channelId = joinLeaveData.channel;
      const channel = member.guild.channels.cache.get(channelId);

      if (channel && channel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle('👤 User Joined')
          .setDescription(`${member.user.tag} has joined the server.`)
          .setColor('#51ff54')
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      } else {
        console.log('Channel is invalid or not found.');
      }
    }

  },
};

// For member leaving:
module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    let historyData = await db.get('historyLogs') || {};
    let joinLeaveData = historyData['join-leave'];

    console.log('Join Leave Data:', joinLeaveData);  // เพิ่ม debug

    if (joinLeaveData && joinLeaveData.enabled) {
      const channel = member.guild.channels.cache.get(joinLeaveData.channel);

      console.log('Channel:', channel);  // เพิ่ม debug

      if (channel && channel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle('👤 User Left')
          .setDescription(`${member.user.tag} has left the server.`)
          .setColor('#ff5151')
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      } else {
        console.error('Invalid channel or not a text channel.');
      }
    }
  },
};
