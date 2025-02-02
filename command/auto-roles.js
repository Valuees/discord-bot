require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { QuickDB } = require('quick.db'); 
const db = new QuickDB(); 

const COLORS = {
  SUCCESS: process.env.COLOR_SUCCESS || '#51ff54',
  FAIL: process.env.COLOR_FAIL || '#ff5151',
  WARN: process.env.COLOR_WARN || '#fdff51',
};
const WARN_MESSAGES = {
  TAG_NOT_FOUND: process.env.WARN_TAG_NOT_FOUND || '⚠️ Please tag a user.',
  USER_INVALID: process.env.WARN_USER_INVALID || '⚠️ The specified user is invalid.',
  NOT_NUMBER: process.env.WARN_NOT_NUMBER || '⚠️ Please enter a valid number.',
  TAG_YOURSELF: process.env.WARN_TAG_YOURSELF || '⚠️ Do not tag yourself.',
  TAG_OTHER: process.env.WARN_TAG_OTHER || '⚠️ Do not tag other users.',
  NO_PERMISSION: process.env.ERR_NO_PERMISSION || '❌ You do not have permission to use this command.',
  WAIT_TIME: process.env.ERR_WAIT_TIME || '🕐 Please wait before using this command again.',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('auto-roles')
    .setDescription('Manage automatic roles for new members globally')
    .addStringOption(option =>
      option.setName('status')
        .setDescription('Action to perform (add, delete, list, on, off)')
        .setRequired(true)
        .addChoices(
          { name: 'add', value: 'add' },
          { name: 'delete', value: 'delete' },
          { name: 'list', value: 'list' },
          { name: 'enable', value: 'enable' },
          { name: 'disable', value: 'disable' }
        )
    )
    .addStringOption(option =>
      option.setName('roles')
        .setDescription('Roles to add/delete (mention multiple roles separated by spaces)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const status = interaction.options.getString('status');
    const rolesInput = interaction.options.getString('roles');
    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.FAIL)
        .setTitle('🚫 Permission Denied')
        .setDescription(WARN_MESSAGES.NO_PERMISSION);
      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    let autoRolesData = await db.get('autoRoles') || { enabled: false, roles: [] };
    let roleIds = rolesInput ? rolesInput.match(/\d+/g) || [] : [];

    let embed = new EmbedBuilder().setColor(COLORS.WARN);

    switch (status) {
      case 'add':
        if (roleIds.length === 0) {
          embed.setColor(COLORS.WARN)
               .setTitle('⚠️ Missing Role')
               .setDescription(WARN_MESSAGES.TAG_NOT_FOUND);
          const reply = await interaction.reply({ embeds: [embed], flags: 64 });
          setTimeout(() => reply.delete(), 5000); 
          return;
        }

        let addedRoles = [];
        roleIds.forEach(roleId => {
          if (!autoRolesData.roles.includes(roleId)) {
            autoRolesData.roles.push(roleId);
            addedRoles.push(`<@&${roleId}>`);
          }
        });

        await db.set('autoRoles', autoRolesData);
        embed.setColor(COLORS.SUCCESS)
             .setTitle('✅ Role(s) Added')
             .setDescription(`Added roles: ${addedRoles.join(', ')}`);
        const replyAdd = await interaction.reply({ embeds: [embed], flags: 64 });
        setTimeout(() => replyAdd.delete(), 5000); 
        break;

      case 'delete':
        if (roleIds.length === 0) {
          embed.setColor(COLORS.WARN)
               .setTitle('⚠️ Missing Role')
               .setDescription(WARN_MESSAGES.TAG_NOT_FOUND);
          const replyDelete = await interaction.reply({ embeds: [embed], flags: 64 });
          setTimeout(() => replyDelete.delete(), 5000); 
          return;
        }

        autoRolesData.roles = autoRolesData.roles.filter(roleId => !roleIds.includes(roleId));
        await db.set('autoRoles', autoRolesData);
        embed.setColor(COLORS.FAIL)
             .setTitle('🗑️ Role(s) Removed')
             .setDescription(`Removed roles: ${roleIds.map(id => `<@&${id}>`).join(', ')}`);
        const replyRemove = await interaction.reply({ embeds: [embed], flags: 64 });
        setTimeout(() => replyRemove.delete(), 5000); 
        break;

      case 'list':
        if (!autoRolesData.enabled) {
          embed.setColor(COLORS.WARN)
               .setTitle('⚠️ Auto-Roles Disabled')
               .setDescription('Auto-roles are currently **disabled**. Use `/auto-roles enable` to enable.');
        } else {
          const rolesList = autoRolesData.roles.map(roleId => `<@&${roleId}>`).join(', ') || 'No roles set';
          embed.setColor(COLORS.WARN)
               .setTitle('📋 Auto Roles List')
               .setDescription(`Currently assigned auto-roles:\n${rolesList}`);
        }
        return interaction.reply({ embeds: [embed] });

      case 'enable':
        autoRolesData.enabled = true;
        await db.set('autoRoles', autoRolesData);
        embed.setColor(COLORS.SUCCESS)
             .setTitle('✅ Auto-Roles Enabled')
             .setDescription('Auto-roles have been **enabled**.');
        const replyEnable = await interaction.reply({ embeds: [embed], flags: 64 });
        setTimeout(() => replyEnable.delete(), 5000); 
        break;

      case 'disable':
        autoRolesData.enabled = false;
        await db.set('autoRoles', autoRolesData);
        embed.setColor(COLORS.FAIL)
             .setTitle('❌ Auto-Roles Disabled')
             .setDescription('Auto-roles have been **disabled**.');
        const replyDisable = await interaction.reply({ embeds: [embed], flags: 64 });
        setTimeout(() => replyDisable.delete(), 5000); 
        break;

      default:
        embed.setColor(COLORS.WARN)
             .setTitle('⚠️ Invalid Command')
             .setDescription('Please choose from `add`, `delete`, `list`, `enable`, or `disable`.');
        const replyInvalid = await interaction.reply({ embeds: [embed], flags: 64 });
        setTimeout(() => replyInvalid.delete(), 5000); 
    }
  },
};
