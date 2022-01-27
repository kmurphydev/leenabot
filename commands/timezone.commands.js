const { SlashCommandBuilder, time } = require('@discordjs/builders');
// const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
// const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { User } = require('../model/User');

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
        let timezone_offset = -600;
        switch (subcommand) {
            //input validation on option strings
            //set timezone_offset
            case 'offset':
                const offsetOption = interaction.options.getString('offset');

                // const UTCRegex = /\b([Uu][Tt][Cc])/;
                const offsetRegex = /(\+?|-)([01]?[0-9]{3})/;

                const offset = offsetRegex.exec(offsetOption);
                if (!offset) {
                    throw new Error('You did not enter a recognized format for offset: examples of valid offsets include -1200, UTC+0830, +0830, UTC-0400, +945, 945')
                }
                let offset_val = parseInt(offset[2]);
                if (offset[1] === '-') offset_val *= -1;
                if (offset_val > 1400 || offset_val < -1200) {
                    throw new Error('You did not enter a valid timezone offset value. Offset must be between -1200 and +1400');
                }
                timezone_offset = offset_val;
                break;
            case 'abbreviation':
                throw new Error('this subcommand has yet to be implemented! sorry');
                break;
        }

        const discord_id = interaction.user.id;

        let user = await User.findOne({ 'discord_id': discord_id });
        if (!user) {
            console.log('user did not exist in db: creating')
            user = new User();
            user.discord_id = discord_id;
        }
        user.timezone_offset = timezone_offset;
        await user.save().then((u) => {
            console.log('saved user successfully')
            console.log(u);
        });

        const abs_offset = Math.abs(timezone_offset);
        let offsetString = `${(timezone_offset > 0) ? '+' : '-'}${(abs_offset < 1000) ? '0' : ''}${abs_offset.toString()}`;
        console.log('offset string: ' + offsetString);

        await interaction.reply(
            {
                content: 'Your timezone has been set to UTC' + offsetString,
                ephemeral: true
            });
        //set timezone_offset for the user
    },
};