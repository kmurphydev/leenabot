const { SlashCommandBuilder } = require('@discordjs/builders');
// const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
// const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { User } = require('../model/User');
const TIMEZONES = require('../constants/timezones.constants.js');

function getTimezoneText(offset) {
    const sign = (offset < 0) ? '-' : '+';
    const leadingZero = (Math.abs(offset) < 10) ? '0' : '';
    const hours = Math.floor(offset);
    const minutes = ((offset - hours) * 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    return '(UTC' + sign + leadingZero + Math.abs(hours) + ':' + minutes + ')';
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timezone')
        .setDescription('Sets your timezone for me to use with other commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('offset')
                .setDescription('Set timezone by offset from UTC (e.g. UTC+0800, UTC-0430)')
                .addStringOption(option =>
                    option.setName('offset')
                        .setDescription('offset from UTC')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('abbreviation')
                .setDescription('Set timezone by timezone abbreviation, e.g. EST, PST')
                .addStringOption(option =>
                    option.setName('abbreviation')
                        .setDescription('Abbreviation of your timezone')
                        .setRequired(true)
                ))

    ,
    async execute(interaction) {
        console.log('executing timezone commands test callback')
        const subcommand = interaction.options.getSubcommand();

        let timezone;
        let timezone_text;
        switch (subcommand) {
            //input validation on option strings
            //set timezone_offset
            case 'offset':
                const offsetOption = interaction.options.getString('offset');

                // const UTCRegex = /\b([Uu][Tt][Cc])/;
                const offsetRegex = /(\+?|-)([01]?[0-9]{1}):?([0-9]{2})/;

                const offset = offsetRegex.exec(offsetOption);
                if (!offset) {
                    throw new Error('You did not enter a recognized format for offset: examples of valid offsets include -1200, UTC+0830, +0830, UTC-0400, +945, 945')
                }
                // let offset_hours = parseFloat(offset[2]);
                // let offset_minutes = parseFloat(offset[3])/60;
                let offset_val = parseFloat(offset[2]) + parseFloat(offset[3]) / 60;
                if (offset[1] === '-') offset_val *= -1;
                console.log('offset_val:' + offset_val);
                if (offset_val > 14 || offset_val < -12) {
                    throw new Error('You did not enter a valid timezone offset value. Offset must be between -1200 and +1400');
                }
                timezone = TIMEZONES.find(t => (t.offset === offset_val) && !t.isdst);
                if (!timezone) {
                    throw new Error('You did not enter an offset corresponding to a valid timezone');
                }
                timezone_text = getTimezoneText(timezone.offset);
                break;
            case 'abbreviation':
                // throw new Error('this subcommand has yet to be implemented! sorry');
                const abbrevOption = interaction.options.getString('abbreviation');
                // console.log(TIMEZONES);
                timezone = TIMEZONES.find(t => t.abbr.toLowerCase() === abbrevOption.toLowerCase());
                if (!timezone) {
                    throw new Error('You did not enter a valid timezone abbreviation.');
                }
                timezone_text = timezone.text;

                break;
        }

        const discord_id = interaction.user.id;

        let user = await User.findOne({ 'discord_id': discord_id });
        if (!user) {
            console.log('user did not exist in db: creating')
            user = new User();
            user.discord_id = discord_id;
        }
        user.timezone_offset = timezone.offset;
        user.timezone_string = timezone_text;
        await user.save().then((u) => {
            console.log('saved user successfully')
            console.log(u);
        });
        await interaction.reply(
            {
                content: 'Your timezone has been set to ' + timezone_text,
                ephemeral: true
            });
        //set timezone_offset for the user
    },
};
