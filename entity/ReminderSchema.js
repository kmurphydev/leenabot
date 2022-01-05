const { EntitySchema } = require('typeorm');
const { Reminder } = require('../model/Reminder');

module.exports = new EntitySchema({
    name: 'Reminder',
    // tableName: 'reminders',
    target: Reminder,
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        discord_id: {
            type: 'bigint',
        },
        remind_time: {
            type: 'bigint',
        },
        remind_text: {
            type: 'text'
        }
    }
})
