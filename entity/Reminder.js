const { BaseEntity } = require('typeorm');

module.exports = new BaseEntity({
    name: 'Reminder',
    tableName: 'reminders',
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
