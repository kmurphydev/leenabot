const { EntitySchema } = require('typeorm');
const { User } = require('../model/User');

module.exports = new EntitySchema({
    name: 'User',
    target: User,
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        discord_id: {
            type: 'bigint',
        },
        timezone_offset: {
            type: 'int'
        },
        timezone_string: {
            type: 'text',
            default: '(UTC+0:00)'
        }
    }
})
