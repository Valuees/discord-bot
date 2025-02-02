require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('Manage history logs for user join/leave and voice channel changes.')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Mode to configure (voice, join-leave)')
        .setRequired(true)
        .addChoices(
          { name: 'voice', value: 'voice' },
          { name: 'join-leave', value: 'join-leave' }
        )
    )
    .addStringOption(option =>
      option.setName('status')
        .setDescription('Set the status (enable, disable, list, set)')
        .setRequired(true)
        .addChoices(
          { name: 'enable', value: 'enable' },
          { name: 'disable', value: 'disable' },
          { name: 'list', value: 'list' },
          { name: 'set', value: 'set' }
        )
    )
    .addStringOption(option =>
      option.setName('channel')
        .setDescription('The channel to send logs to (text channel only)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const mode = interaction.options.getString('mode');
    const status = interaction.options.getString('status');
    const channelInput = interaction.options.getString('channel');
    const member = interaction.guild.members.cache.get(interaction.user.id);

    // Check if user has Administrator permissions
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const embed = new EmbedBuilder()
        .setColor('#ff5151')
        .setTitle('🚫 Permission Denied')
        .setDescription('❌ You do not have permission to use this command. You must have Administrator permissions.');
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    let historyData = await db.get('historyLogs') || {};
    let embed = new EmbedBuilder().setColor('#fdff51');


    switch (status) {
      case 'enable':
        if (!historyData[mode].enabled) {
          historyData[mode] = { enabled: true, channel: channelInput || 'None' };
          await db.set('historyLogs', historyData);
          embed.setColor('#51ff54')
            .setTitle('✅ History Logging Enabled')
            .setDescription(`History logging for **${mode}** has been enabled. Logs will be sent to: ${channelInput}`);
        } else {
          embed.setColor('#fdff51')
            .setTitle('⚠️ History Logging Already Enabled')
            .setDescription(`History logging for **${mode}** is already enabled.`);
        }
        break;

      case 'disable':
        if (historyData[mode].enabled) {
          historyData[mode].enabled = false;
          await db.set('historyLogs', historyData);
          embed.setColor('#ff5151')
            .setTitle('❌ History Logging Disabled')
            .setDescription(`History logging for **${mode}** has been disabled.`);
        } else {
          embed.setColor('#fdff51')
            .setTitle('⚠️ History Logging Not Enabled')
            .setDescription(`History logging for **${mode}** is not enabled yet.`);
        }
        break;

      case 'list':
        if (historyData[mode]) {
          const channel = historyData[mode].channel;
          embed.setTitle(`📋 History Logging for ${mode}`)
            .setDescription(`Logs for **${mode}** are sent to: ${channel === 'None' ? 'No channel set' : channel}`);
        } else {
          embed.setColor('#ff5151')
            .setTitle('⚠️ History Logging Not Configured')
            .setDescription(`History logging for **${mode}** has not been configured yet.`);
        }
        break;

      case 'set':
        if (channelInput) {
          const channelId = channelInput.replace(/[<#>]/g, '');
          if (interaction.guild.channels.cache.get(channelId)) {
            historyData[mode] = { ...historyData[mode], channel: channelId };
            await db.set('historyLogs', historyData);
            embed.setColor('#51ff54')
              .setTitle('✅ Channel Set')
              .setDescription(`The channel for **${mode}** history logs has been set to ${channelInput}.`);
          } else {
            embed.setColor('#fdff51')
              .setTitle('⚠️ Invalid Channel')
              .setDescription('❌ The specified channel is invalid or not found.');
          }
        } else {
          embed.setColor('#fdff51')
            .setTitle('⚠️ Missing Channel')
            .setDescription('❌ Please specify a valid text channel.');
        }
        break;
      default:
        embed.setColor('#fdff51')
          .setTitle('⚠️ Invalid Status')
          .setDescription('❌ The status should be one of the following: enable, disable, list, set.');
    }

    await interaction.reply({ embeds: [embed] });
  },
};
