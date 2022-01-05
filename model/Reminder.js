const { BaseEntity } = require('typeorm');

class Reminder extends BaseEntity {
    id;
    discord_id;
    remind_time;
    remind_text;
}



module.exports = {
    Reminder: Reminder
}