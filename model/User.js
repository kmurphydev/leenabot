const { BaseEntity } = require('typeorm');

class User extends BaseEntity {
    id;
    discord_id;
    timezone_offset;
    timezone_string;
}



module.exports = {
    User: User
}