const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { addReminder } = require('../handle-reminders');
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
        .addNumberOption(option =>
            option.setName('duration_units')
                .setDescription('units of time for your duration')
                .setChoices([
                    [
                        'minutes',
                        60 * 1000
                    ],
                    [
                        'hours',
                        60 * 60 * 1000
                    ],
                    [
                        'days',
                        24 * 60 * 60 * 1000
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
        const reminder_text = interaction.options.getString('reminder_message');
        const reminder_time = interaction.options.getNumber('duration') * interaction.options.getNumber('duration_units');

        const reminder_date = new Date(Date.now() + reminder_time);
        const date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const time_string = reminder_date.toLocaleTimeString('en-US');
        const date_string = reminder_date.toLocaleDateString('en-US', date_options);
        // const datetime_string = time_string + ' on ' + date_string;


        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(reminder_text)
            .addFields(
                { name: '\u200B', value: '\u200B' },
            )
            .setDescription('will be sent to you at the following date and time')
            .addFields(
                { name: 'Time', value: time_string, inline: true },
                { name: 'Date', value: date_string, inline: true },
            );

        const buttonRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('confirm_reminder')
                    .setLabel('Set Reminder')
                    .setStyle('SUCCESS')
                ,
                new MessageButton()
                    .setCustomId('cancel_reminder')
                    .setLabel('Cancel')
                    .setStyle('DANGER')
            )

        // const message_text = 'your reminder text is ' + reminder_text + '.'
        //     + 'your reminder will be triggered in ' + reminder_time + 'ms,'
        //     + ' at ' + datetime_string + '.'

        interaction.reply({
            // content: message_text,
            embeds: [exampleEmbed],
            ephemeral: true,
            components: [buttonRow]
        })
            .then(() => {
                const filter = i => i.user.id === interaction.user.id;

                const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

                let selectedFlag = false;

                collector.on('collect', async i => {
                    if (i.customId === 'confirm_reminder') {
                        selectedFlag = true;
                        await interaction.editReply({ components: [] });
                        await interaction.followUp({ content: 'Reminder set! See you soon.', ephemeral: true });
                        addReminder(interaction.user.id, reminder_date.getTime(), reminder_text, interaction.client);
                    } else if (i.customId === 'cancel_reminder') {
                        selectedFlag = true;
                        await interaction.editReply({ components: [] });
                        await interaction.followUp({ content: 'Reminder cancelled.', ephemeral: true });
                    }
                })

                collector.on('end', async collected => {
                    if (!selectedFlag) {
                        await interaction.editReply({ components: [] })
                        await interaction.followUp({ content: 'Nothing was selected. Reminder cancelled by timeout', ephemeral: true });
                    }
                })

            })
            ;

    },
};