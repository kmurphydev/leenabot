const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { addReminder } = require('../handle-reminders');
// const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remindme')
        .setDescription('Initiates a dialogue to send you a reminder via DM')
        .addSubcommand(subcommand =>
            subcommand
                .setName('time')
                .setDescription('Schedule a reminder by time from present')
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
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('date')
                .setDescription('Schedule a reminder by absolute date. Only schedules at most one year in advance')
                .addNumberOption(option =>
                    option.setName('month')
                        .setDescription('Month to send a reminder in')
                        .setRequired(true)
                        .setChoices([
                            [
                                'January',
                                1
                            ],
                            [
                                'February',
                                2
                            ],
                            [
                                'March',
                                3
                            ],
                            [
                                'April',
                                4
                            ],
                            [
                                'May',
                                5
                            ],
                            [
                                'June',
                                6
                            ],
                            [
                                'July',
                                7
                            ],
                            [
                                'August',
                                8
                            ],
                            [
                                'September',
                                9
                            ],
                            [
                                'October',
                                10
                            ],
                            [
                                'November',
                                11
                            ],
                            [
                                'December',
                                12
                            ]
                        ]))
                .addNumberOption(option =>
                    option.setName('date')
                        .setDescription('Date of the month to send your reminder')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(31))
                .addStringOption(option =>
                    option.setName('time')
                        .setDescription('Time of day to send your reminder in HH:MM format (24 hour clock or 12 hour + AM/PM)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reminder_message')
                        .setDescription('message to be sent as a reminder')
                        .setRequired(true))

        )
    ,
    async execute(interaction) {
        const reminder_text = interaction.options.getString('reminder_message');

        const subcommand = interaction.options.getSubcommand();
        let reminder_date;
        switch (subcommand) {
            case 'time':
                const reminder_time = interaction.options.getNumber('duration') * interaction.options.getNumber('duration_units');
                reminder_date = new Date(Date.now() + reminder_time);
                break;

            case 'date':
                //input validation
                //validate date based on month
                const month = interaction.options.getNumber('month') - 1;
                const date = interaction.options.getNumber('date');
                if (month === 2) {
                    if (date > 28) {
                        throw new Error('Feburary only has 28 days. Please enter a date between 1 and 28 (inclusive)');
                    }
                } else if (month === 4 || month === 6 || month === 9 || month === 11) {
                    if (date > 30) {
                        throw new Error('The month you picked only has 30 days. Please enter a date between 1 nad 30 (inclusive)');
                    }
                }

                //validate time
                let hour;
                let minute;
                const timeOption = interaction.options.getString('time');
                if (timeOption) {
                    const timeRegex = /\b([01]?[0-9]|2[0-3]):([0-5][0-9])/;
                    const PMRegex = /([Pp][Mm])\b/;
                    const AMRegex = /([Aa][Mm])\b/;
                    const time = timeRegex.exec(timeOption);
                    const PM = PMRegex.exec(timeOption);
                    const AM = AMRegex.exec(timeOption);

                    if (!time || time === undefined) {
                        throw new Error('You did not enter a valid time. Time should be in the format HH:MM where HH is between 00 and 23, and MM is between 00 and 59. Alternatively, HH:MM am or HH:MM pm (case insensitive) provided HH is not greater than 12.');
                    }
                    hour = parseInt(time[1]);
                    if (PM) {
                        if (hour > 12) {
                            throw new Error('You cannot enter a 24 hour time (HH > 12 in HH:MM format) and AM/PM. Please only do one or the other.');
                        }
                        else if (hour < 12) {

                            hour += 12;
                        }
                    }
                    //they specified AM
                    if (AM) {
                        if (hour === 12) {
                            hour -= 12;
                        }
                    }
                    minute = parseInt(time[2]);
                    console.log('time' + time);
                }
                else {
                    hour = 0;
                    minute = 0;
                }
                console.log('timeoption' + timeOption);
                console.log('hour' + hour);
                console.log('minute' + minute);
                //build date object
                const now = new Date(Date.now());
                reminder_date = new Date();
                reminder_date.setFullYear(now.getFullYear());
                reminder_date.setMonth(month);
                reminder_date.setDate(date);
                reminder_date.setHours(hour);
                reminder_date.setMinutes(minute);
                reminder_date.setSeconds(0);

                if (now > reminder_date) {
                    reminder_date.setFullYear(now.getFullYear() + 1);
                }
                console.log('reminder_date' + reminder_date);
                break;
        }

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