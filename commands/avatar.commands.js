const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('returns discord avatar for yourself or a target user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to display the avatar of')
                .setRequired(false)
        )
    ,
    async execute(interaction) {
        let user = interaction.options.getUser('target');
        if (!user) {
            user = interaction.user;

            await interaction.reply(`Your avatar: <${user.displayAvatarURL({ format: 'png', dynamic: true })}>`);
        } else {

            await interaction.reply(`${user}'s avatar: <${user.displayAvatarURL({ format: 'png', dynamic: true })}>`);
        }
    },
};