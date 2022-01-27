const { BaseEntity } = require('typeorm');

class User extends BaseEntity {
    id;
    discord_id;
    timezone_offset;
}



module.exports = {
    User: User
}