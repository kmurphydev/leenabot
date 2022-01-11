// const { client } = require('./index');
const { Reminder } = require('./model/Reminder');
const { MessageEmbed } = require('discord.js');
var client;
var timeoutId;
var soonestReminder;

exports.addReminder = async function (discord_id, remind_time, remind_text) {

    // const now = Date.now();

    const newReminder = new Reminder();
    newReminder.discord_id = discord_id;
    newReminder.remind_time = remind_time;
    newReminder.remind_text = remind_text;
    await newReminder.save();

    //if there is no timeout running currently
    //or if the new reminder is sooner than the current timeout
    //then clear old timeout and set new one

    await handleReminder();


}

exports.injectClient = function (injectedClient) {
    console.log('injecting client')
    client = injectedClient;
    // console.log(client);
}

const handleReminder = async function () {
    //get new soonest reminder and set timeout
    //find soonest
    // console.log('client');
    // console.log(this.client);
    if (timeoutId) {
        console.log('clearing previous timeout');
        clearTimeout(timeoutId);
    }
    soonestReminder = await Reminder.findOne({
        order: {
            remind_time: 'ASC',
            id: 'DESC'
        }
    });
    if (soonestReminder) {
        console.log('found reminder: queueing')
        console.log(soonestReminder);
    } else {
        console.log('no reminders in queue');
    }

    if (!soonestReminder) return;
    timeoutId = setTimeout(async () => {
        //dm user
        const user = await client.users.fetch(soonestReminder.discord_id);
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(soonestReminder.remind_text)
            .setDescription('(this reminder was requested by you using /remindme)');
        await user.send({
            embeds: [embed]
        });
        // console.log(soonestReminder.discord_id);
        await soonestReminder.remove();
        console.log('removing soonestReminder')
        console.log(soonestReminder);

        await handleReminder();

    }, soonestReminder.remind_time - Date.now());
}

module.exports.handleReminder = handleReminder;