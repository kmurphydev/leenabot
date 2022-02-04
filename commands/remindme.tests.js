const { MessageEmbed } = require('discord.js');
const { execute } = require('./remindme.commands.js');


const testUserOptions = [
    {
        discord_id: 0,
        timezone_offset: 0,
        timezone_string: '(UTC+00:00)'
    },
    {
        discord_id: 1,
        timezone_offset: -3,
        timezone_string: '(UTC-03:00)'
    }
];

const DURATION_UNITS = {
    MINUTES: 60 * 1000,
    HOURS: 60 * 60 * 1000,
    DAYS: 24 * 60 * 60 * 1000
};

const date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

jest.mock('../model/User', () => {

    class User {
        id;
        discord_id;
        timezone_offset;
        timezone_string;
        constructor(options) {
            this.id = 1234;
            if (options && options.discord_id) {
                this.discord_id = options.discord_id;
            } else {
                this.discord_id = 0;
            }
            if (options && options.timezone_offset) {
                this.timezone_offset = options.timezone_offset;
            } else {
                this.timezone_offset = 0;
            }
            if (options && options.timezone_string) {
                this.timezone_string = options.timezone_string;
            } else {
                this.timezone_string = '(UTC+00:00)';
            }
        }
        static async findOne(options) {
            console.log('options');
            console.log(options);
            const userOptions = testUserOptions.find(u => u.discord_id === options.discord_id);
            if (!userOptions) return undefined;
            console.log('found user')
            const newUser = new User(userOptions);
            console.log(newUser);
            return newUser;
        };
        async save() {
            return this;
        }
    }

    return { User: User };
});




jest.mock('../handle-reminders', () => {

    return { addReminder: async () => { return true } }
});

describe('time subcommand', () => {
    const generateTestInteraction = (duration, durationUnits, reminder_message, discord_id, replyEmbedOptions) => {

        const testInteraction = {
            options: {
                getSubcommand: () => 'time',
                getNumber: (n) => {
                    if (n === 'duration') {
                        return duration;
                    } else if (n === 'duration_units') {
                        return durationUnits;
                    }
                },
                getString: (s) => {
                    if (s === 'reminder_message') {
                        return reminder_message;
                    }
                }
            },
            channel: {
                createMessageComponentCollector: () => { return { on: () => { return true } } }
            },
            user: {
                id: discord_id
            },
            reply: async (obj) => {
                // try {

                //for the time being we do not care about time_string (fields[1].value)
                const { reminder_text, date_string, timezone_string } = replyEmbedOptions;
                const { fields } = obj.embeds[0]
                // console.log('obj.embeds fields');
                // console.log(fields);
                // expect(obj.embeds).toBe([testEmbed]);
                // console.log(fields);
                // console.log(reminder_text);
                expect(fields.length).toBe(4);
                expect(fields[0].value).toEqual(reminder_text);
                expect(fields[2].value).toEqual(date_string);
                expect(fields[3].value).toEqual(timezone_string + '\n(change your timezone with /timezone)');
                expect(obj.ephemeral).toBe(true);
                // done();
                // } catch (e) {
                //     done(e);
                // }
            }
        }

        return testInteraction;
    };

    const testUser0 = testUserOptions[0];
    let now = new Date(Date.now());
    test('UTC+0 timezone: testUser0', async () => {

        const date1 = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + testUser0.timezone_offset * 60 * 60 * 1000);
        date1.setMinutes(date1.getMinutes() + 1);
        // console.log('now ' + now);
        // console.log('date1 ' + date1);
        await execute(generateTestInteraction(
            1,
            DURATION_UNITS.MINUTES,
            'bing chilling',
            testUser0.discord_id,
            {
                reminder_text: 'bing chilling',
                date_string: date1.toLocaleDateString('en-US', date_options),
                timezone_string: testUser0.timezone_string
            }
        ));
        await expect(execute(generateTestInteraction(
            -1,
            DURATION_UNITS.MINUTES,
            'bing chilling',
            testUser0.discord_id,
            {
                reminder_text: 'bing chilling',
                date_string: date1.toLocaleDateString('en-US', date_options),
                timezone_string: testUser0.timezone_string
            }
        ))).rejects.toThrow('Cannot set a negative duration');
    })
    test('UTC-3: testUser1', async () => {

        const testUser1 = testUserOptions[1];
        const date2 = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + testUser1.timezone_offset * 60 * 60 * 1000);
        date2.setHours(date2.getHours() + 1);
        await execute(generateTestInteraction(
            1,
            DURATION_UNITS.HOURS,
            'bababa',
            testUser1.discord_id,
            {
                reminder_text: 'bababa',
                date_string: date2.toLocaleDateString('en-US', date_options),
                timezone_string: testUser1.timezone_string
            }
        ))
    })
})
describe('date subcommand', () => {
    const generateTestInteraction = (month, date, time, reminder_message, discord_id, replyEmbedOptions) => {

        const testInteraction = {
            options: {
                getSubcommand: () => 'date',
                getNumber: (n) => {
                    if (n === 'month') {
                        return month;
                    } else if (n === 'date') {
                        return date;
                    }
                },
                getString: (s) => {
                    if (s === 'reminder_message') {
                        return reminder_message;
                    } else if (s === 'time') {
                        return time;
                    }
                }
            },
            channel: {
                createMessageComponentCollector: () => { return { on: () => { return true } } }
            },
            user: {
                id: discord_id
            },
            reply: async (obj) => {
                // try {

                const { reminder_text, time_string, date_string, timezone_string } = replyEmbedOptions;
                const { fields } = obj.embeds[0]
                // console.log('obj.embeds fields');
                // console.log(fields);
                // expect(obj.embeds).toBe([testEmbed]);
                // console.log(fields);
                // console.log(reminder_text);
                expect(fields.length).toBe(4);
                expect(fields[0].value).toEqual(reminder_text);
                expect(fields[1].value).toEqual(time_string);
                expect(fields[2].value).toEqual(date_string);
                expect(fields[3].value).toEqual(timezone_string + '\n(change your timezone with /timezone)');
                expect(obj.ephemeral).toBe(true);
                // done();
                // } catch (e) {
                //     done(e);
                // }
            }
        }

        return testInteraction;
    };

    const testUser0 = testUserOptions[0];
    let testDate = new Date(Date.now() + 540000);

    const date1 = new Date(testDate.getTime() + testDate.getTimezoneOffset() * 60000 + testUser0.timezone_offset * 60 * 60 * 1000);
    date1.setSeconds(0);
    // console.log('now ' + now);
    // console.log('date1 ' + date1);

    test('UTC+0, testUser0', async () => {

        await execute(generateTestInteraction(
            date1.getMonth(),
            date1.getDate(),
            date1.toLocaleTimeString('en-US'),
            'bing chilling',
            testUser0.discord_id,
            {
                reminder_text: 'bing chilling',
                time_string: date1.toLocaleTimeString('en-US'),
                date_string: date1.toLocaleDateString('en-US', date_options),
                timezone_string: testUser0.timezone_string
            }
        ));
    })
    test('test no user in DB, should still work', async () => {

        await execute(generateTestInteraction(
            date1.getMonth(),
            date1.getDate(),
            date1.toLocaleTimeString('en-US'),
            'bing chilling',
            -1,
            {
                reminder_text: 'bing chilling',
                time_string: date1.toLocaleTimeString('en-US'),
                date_string: date1.toLocaleDateString('en-US', date_options),
                timezone_string: testUser0.timezone_string
            }
        ));
    })

    const testUser1 = testUserOptions[1];
    const date2 = new Date(testDate.getTime() + testDate.getTimezoneOffset() * 60000 + testUser1.timezone_offset * 60 * 60 * 1000);
    date2.setSeconds(0);
    test('testUser1, UTC-3', async () => {

        await execute(generateTestInteraction(
            date2.getMonth(),
            date2.getDate(),
            date2.toLocaleTimeString('en-US'),
            'bing chilling',
            testUser1.discord_id,
            {
                reminder_text: 'bing chilling',
                time_string: date2.toLocaleTimeString('en-US'),
                date_string: date2.toLocaleDateString('en-US', date_options),
                timezone_string: testUser1.timezone_string
            }
        ))
    })

    test('February with date past 28 should throw', async () => {
        const date3 = new Date(testDate.getTime() + testDate.getTimezoneOffset() * 60000 + testUser1.timezone_offset * 60 * 60 * 1000);
        date3.setMonth(1);
        date3.setDate(29);
        await expect(execute(generateTestInteraction(
            1,
            29,
            date3.toLocaleTimeString('en-US'),
            'bing chilling',
            testUser1.discord_id,
            {
                reminder_text: 'bing chilling',
                time_string: date3.toLocaleTimeString('en-US'),
                date_string: date3.toLocaleDateString('en-US', date_options),
                timezone_string: testUser1.timezone_string
            }
        ))).rejects.toThrow('February only has 28 days. Please enter a date between 1 and 28 (inclusive)');

    })

    test('April with date past 30 should throw', async () => {
        const date4 = new Date(testDate.getTime() + testDate.getTimezoneOffset() * 60000 + testUser1.timezone_offset * 60 * 60 * 1000);
        date4.setMonth(3);
        date4.setDate(31);
        await expect(execute(generateTestInteraction(
            3,
            31,
            date4.toLocaleTimeString('en-US'),
            'bing chilling',
            testUser1.discord_id,
            {
                reminder_text: 'bing chilling',
                time_string: date4.toLocaleTimeString('en-US'),
                date_string: date4.toLocaleDateString('en-US', date_options),
                timezone_string: testUser1.timezone_string
            }
        ))).rejects.toThrow('The month you picked only has 30 days. Please enter a date between 1 and 30 (inclusive)');

    })
    test('Invalid time format should throw', async () => {

        await expect(execute(generateTestInteraction(
            date2.getMonth(),
            date2.getDate(),
            '1104',
            'bing chilling',
            testUser1.discord_id,
            {
                reminder_text: 'bing chilling',
                time_string: '1104',
                date_string: date2.toLocaleDateString('en-US', date_options),
                timezone_string: testUser1.timezone_string
            }
        ))).rejects.toThrow('You did not enter a valid time. Time should be in the format HH:MM where HH is between 00 and 23, and MM is between 00 and 59. Alternatively, HH:MM am or HH:MM pm (case insensitive) provided HH is not greater than 12.');


    })

    test('24h time format + pm should throw', async () => {

        await expect(execute(generateTestInteraction(
            date2.getMonth(),
            date2.getDate(),
            '13:04PM',
            'bing chilling',
            testUser1.discord_id,
            {
                reminder_text: 'bing chilling',
                time_string: '13:04PM',
                date_string: date2.toLocaleDateString('en-US', date_options),
                timezone_string: testUser1.timezone_string
            }
        ))).rejects.toThrow('You cannot enter a 24 hour time (HH > 12 in HH:MM format) and AM/PM. Please only do one or the other.');


    })
    test('24h time format + am should throw', async () => {

        await expect(execute(generateTestInteraction(
            date2.getMonth(),
            date2.getDate(),
            '13:04aM',
            'bing chilling',
            testUser1.discord_id,
            {
                reminder_text: 'bing chilling',
                time_string: '13:04aM',
                date_string: date2.toLocaleDateString('en-US', date_options),
                timezone_string: testUser1.timezone_string
            }
        ))).rejects.toThrow('You cannot enter a 24 hour time (HH > 12 in HH:MM format) and AM/PM. Please only do one or the other.');


    })

    test('negative sign in time should not matter', async () => {

        await execute(generateTestInteraction(
            date2.getMonth(),
            date2.getDate(),
            '-11:04pm',
            'bing chilling',
            testUser1.discord_id,
            {
                reminder_text: 'bing chilling',
                time_string: '11:04:00 PM',
                date_string: date2.toLocaleDateString('en-US', date_options),
                timezone_string: testUser1.timezone_string
            }
        ))
    })

    test('AM when hour = 12 should return hour of 0', async () => {

        const date6 = new Date(testDate.getTime() + testDate.getTimezoneOffset() * 60000 + testUser1.timezone_offset * 60 * 60 * 1000);
        date6.setHours(24);

        await execute(generateTestInteraction(
            date6.getMonth(),
            date6.getDate(),
            '12:00AM',
            'bing chilling',
            testUser1.discord_id,
            {
                reminder_text: 'bing chilling',
                time_string: '12:00:00 AM',
                date_string: date6.toLocaleDateString('en-US', date_options),
                timezone_string: testUser1.timezone_string
            }
        ))
    })

    test('setting a month that has already passed should the next occurring date (add a year)', async () => {

        const date5 = new Date(testDate.getTime() + testDate.getTimezoneOffset() * 60000 + testUser1.timezone_offset * 60 * 60 * 1000);
        if (date5.getDate() === 1 && date5.getMonth() === 0) {
            //do nothing
        } else {
            if (date5.getDate() > 1) {
                date5.setDate(date5.getDate() - 1);
            } else {
                date5.setMonth(date5.getMonth() - 1);
            }
            date5.setFullYear(date5.getFullYear() + 1);
            date5.setSeconds(0);
        }
        await execute(generateTestInteraction(
            date5.getMonth(),
            date5.getDate(),
            date5.toLocaleTimeString('en-US'),
            'bing chilling',
            testUser1.discord_id,
            {
                reminder_text: 'bing chilling',
                time_string: date5.toLocaleTimeString('en-US'),
                date_string: date5.toLocaleDateString('en-US', date_options),
                timezone_string: testUser1.timezone_string
            }
        ))
    })
})
