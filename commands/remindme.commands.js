const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { addReminder } = require('../handle-reminders');
const { User } = require('../model/User');
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
                        .setMinValue(1)
                )
                .addNumberOption(option =>
                    option.setName('duration_units')
                        .setDescription('units of time for your duration')
                        //choice values convert duration value into milliseconds
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
                .setDescription('Schedule a reminder by date within the next year')
                .addNumberOption(option =>
                    option.setName('month')
                        .setDescription('Month to send a reminder in')
                        .setRequired(true)
                        .setChoices([
                            [
                                'January',
                                0
                            ],
                            [
                                'February',
                                1
                            ],
                            [
                                'March',
                                2
                            ],
                            [
                                'April',
                                3
                            ],
                            [
                                'May',
                                4
                            ],
                            [
                                'June',
                                5
                            ],
                            [
                                'July',
                                6
                            ],
                            [
                                'August',
                                7
                            ],
                            [
                                'September',
                                8
                            ],
                            [
                                'October',
                                9
                            ],
                            [
                                'November',
                                10
                            ],
                            [
                                'December',
                                11
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
                        .setDescription('Time to send your reminder. Format is HH:MM AM/PM (24h clock or 12h + AM/PM)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reminder_message')
                        .setDescription('message to be sent as a reminder')
                        .setRequired(true))
        )
    ,
    async execute(interaction) {
        //grab text and subcommand type
        const reminder_text = interaction.options.getString('reminder_message');
        const subcommand = interaction.options.getSubcommand();

        //actual date to set reminder
        let reminder_date;
        //date object to be output to the user, taking timezone into account
        let output_reminder_date;

        //check if user has a timezone setting already
        const discord_id = interaction.user.id;
        let user = await User.findOne({ 'discord_id': discord_id });
        let timezone_offset = 0;
        let timezone_string = '(UTC+00:00)'
        if (!user) {
            console.log('user did not exist in db, no timezone setting found');
        } else {
            timezone_offset = user.timezone_offset;
            timezone_string = user.timezone_string;
        }


        switch (subcommand) {
            case 'time':
                //time from now in milliseconds to trigger reminder
                const duration = interaction.options.getNumber('duration');
                if (duration < 0) {
                    throw new Error('Cannot set a negative duration');
                }
                const reminder_time = interaction.options.getNumber('duration') * interaction.options.getNumber('duration_units');
                reminder_date = new Date(Date.now() + reminder_time);
                break;

            case 'date':
                //input validation
                //validate date based on month, validation set in the discord option asserts that 1<=date<=31

                //javascript date objects count from 0 to 11 for some reason
                const month = interaction.options.getNumber('month');
                const date = interaction.options.getNumber('date');
                //feb
                if (month === 1) {
                    if (date > 28) {
                        throw new Error('February only has 28 days. Please enter a date between 1 and 28 (inclusive)');
                    }
                    //april, june, sept, nov
                } else if (month === 3 || month === 5 || month === 8 || month === 10) {
                    if (date > 30) {
                        throw new Error('The month you picked only has 30 days. Please enter a date between 1 and 30 (inclusive)');
                    }
                }

                //validate time
                let hour;
                let minute;
                const timeOption = interaction.options.getString('time');
                // if (timeOption) {
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
                //arithmetic to correct for AM/PM being specified
                if ((hour > 12) && (AM || PM)) {

                    throw new Error('You cannot enter a 24 hour time (HH > 12 in HH:MM format) and AM/PM. Please only do one or the other.');
                }
                if (PM) {
                    if (hour < 12) {

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
                // console.log('time' + time);
                // console.log('timeoption' + timeOption);
                // console.log('hour' + hour);
                // console.log('minute' + minute);
                // }
                // else {
                //     hour = 0;
                //     minute = 0;
                // }

                //build date object based on given settings
                const now = new Date(Date.now());
                reminder_date = new Date();
                reminder_date.setUTCFullYear(now.getFullYear());
                reminder_date.setUTCMonth(month);
                reminder_date.setUTCDate(date);
                reminder_date.setUTCHours(hour);
                reminder_date.setUTCMinutes(minute);
                reminder_date.setUTCSeconds(0);

                //correct for timezone
                reminder_date = new Date(reminder_date.getTime() - timezone_offset * 60 * 60 * 1000);
                // console.log('getTimezoneOffset()/60 ' + reminder_date.getTimezoneOffset() / 60);
                // console.log('timezone_offset ' + timezone_offset);

                //if date has already passed, set it for next calendar year
                if (now > reminder_date) {
                    reminder_date.setUTCFullYear(now.getUTCFullYear() + 1);
                }
                // console.log('reminder_date' + reminder_date);
                break;
        }

        //reminder_date.getTimezoneOffset() + timezone_offset gives the difference between bot's local time and user's timezone
        //this is the time that needs to be displayed to the user
        output_reminder_date = new Date(reminder_date.getTime() + reminder_date.getTimezoneOffset() * 60000 + timezone_offset * 60 * 60 * 1000);
        // console.log('output reminder date' + output_reminder_date);
        const date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const time_string = output_reminder_date.toLocaleTimeString('en-US');
        const date_string = output_reminder_date.toLocaleDateString('en-US', date_options);
        // const datetime_string = time_string + ' on ' + date_string;


        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Your Reminder')
            .addFields(
                // { name: '\u200B', value: '\u200B' },
                { name: 'Message', value: reminder_text },
            )
            // .setDescription('will be sent to you at the following date and time')
            .addFields(
                { name: 'Time', value: time_string, inline: true },
                { name: 'Date', value: date_string, inline: true },
                { name: 'Timezone', value: timezone_string + '\n(change your timezone with /timezone)' },
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

        await interaction.reply({
            embeds: [exampleEmbed],
            ephemeral: true,
            components: [buttonRow]
        })
            .then(() => {
                //interact only with the same user
                const filter = i => i.user.id === interaction.user.id;

                const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

                let selectedFlag = false;

                collector.on('collect', async i => {
                    if (i.customId === 'confirm_reminder') {
                        selectedFlag = true;
                        await interaction.editReply({ components: [] });
                        await interaction.followUp({ content: 'Reminder set! See you soon.', ephemeral: true });
                        //queue up the reminder in the DB
                        addReminder(interaction.user.id, reminder_date.getTime(), reminder_text, interaction.client);
                    } else if (i.customId === 'cancel_reminder') {
                        selectedFlag = true;
                        await interaction.editReply({ components: [] });
                        await interaction.followUp({ content: 'Reminder cancelled.', ephemeral: true });
                    }
                })

                //on timeout cancel and notify user
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