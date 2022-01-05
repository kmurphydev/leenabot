const { SlashCommandBuilder } = require('@discordjs/builders');
// const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remindme')
        .setDescription('Initiates a dialogue to send you a reminder via DM')
        .addNumberOption(option =>
            option.setName('duration')
                .setDescription('how long to wait until you are reminded')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('duration_units')
                .setDescription('units of time for your duration')
                .setChoices([
                    [
                        'minutes',
                        'minutes'
                    ],
                    [
                        'hours',
                        'hours'
                    ]
                ])
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reminder_message')
                .setDescription('message to be sent as a reminder')
                .setRequired(true))
    ,
    async execute(interaction) {
        interaction.reply('placeholder smile :))');

        //prompt for reminder message

        //prompt for reminder timeOut

        //show an embed with reminder details and ask to confirm

    },
};