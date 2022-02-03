const { execute } = require('./timezone.commands.js');

jest.mock('../model/User', () => {

    class User {
        id;
        discord_id;
        timezone_offset;
        timezone_string;
        constructor() {
            this.id = 1234;
        }
        static async findOne(options) {
            if (options.discord_id === 0) {

                const newUser = new User();
                for (const key in options) {
                    if (Object.hasOwnProperty.call(options, key)) {
                        newUser[key] = options[key];
                    }
                }
                return newUser;
            }
            else return undefined;
        };
        async save() {
            return this;
        }
    }

    return { User: User };
});

test('offset subcommand', async () => {
    const generateTestInteraction = (offsetOption, discord_id, replyContent) => {

        const testInteraction = {
            options: {
                getSubcommand: () => 'offset',
                getString: (s) => {
                    if (s === 'offset') {
                        return offsetOption
                    }
                }
            },
            user: {
                id: discord_id
            },
            reply: async (obj) => {
                // try {
                // console.log(obj);
                expect(obj.content).toEqual(replyContent);
                expect(obj.ephemeral).toEqual(true);
                // done();
                // } catch (e) {
                // done(e);
                // }
            }
        }

        return testInteraction;
    };


    const interaction1 = generateTestInteraction(
        'UTC-1000',
        0,
        'Your timezone has been set to (UTC-10:00)'
    )
    await execute(interaction1);

    const interaction2 = generateTestInteraction(
        'babu frik',
        0,
        'asdf'
    );
    await expect(execute(interaction2)).rejects.toThrow(
        'You did not enter a recognized format for offset: examples of valid offsets include -1200, UTC+0830, +0830, UTC-0400, +945, 945'
    );

    const interaction3 = generateTestInteraction(
        '-1500',
        0,
        'asdf'
    );
    await expect(execute(interaction3)).rejects.toThrow(
        'You did not enter a valid timezone offset value. Offset must be between -1200 and +1400'
    )
    const interaction4 = generateTestInteraction(
        '-15:00',
        0,
        'asdf'
    );
    await expect(execute(interaction4)).rejects.toThrow(
        'You did not enter a valid timezone offset value. Offset must be between -1200 and +1400'
    )
    const interaction5 = generateTestInteraction(
        'utC-15:00',
        0,
        'asdf'
    );
    await expect(execute(interaction5)).rejects.toThrow(
        'You did not enter a valid timezone offset value. Offset must be between -1200 and +1400'
    )
    const interaction6 = generateTestInteraction(
        '-10:01',
        0,
        'asdf'
    );
    await expect(execute(interaction6)).rejects.toThrow(
        'You did not enter an offset corresponding to a valid timezone'
    )
    const interaction7 = generateTestInteraction(
        'UTC+3:00',
        0,
        'Your timezone has been set to (UTC+03:00)'
    );
    await execute(interaction7);
    const interaction8 = generateTestInteraction(
        'UTC+3:00',
        1,
        'Your timezone has been set to (UTC+03:00)'
    );
    await execute(interaction8);

})
test('abbreviation command', async () => {
    const generateTestInteraction = (abbrevOption, discord_id, replyContent) => {

        const testInteraction = {
            options: {
                getSubcommand: () => 'abbreviation',
                getString: (s) => {
                    if (s === 'abbreviation') {
                        return abbrevOption
                    }
                }
            },
            user: {
                id: discord_id
            },
            reply: async (obj) => {
                // try {
                // console.log(obj);
                expect(obj.content).toEqual(replyContent);
                expect(obj.ephemeral).toEqual(true);
                //     done()
                // } catch (e) {
                //     done(e)
                // }
            }
        }

        return testInteraction;
    };



    const interaction1 = generateTestInteraction(
        'babu frik',
        0,
        'asdf'
    );
    expect(execute(interaction1)).rejects.toThrow(
        'You did not enter a valid timezone abbreviation'
    );


    await execute(generateTestInteraction(
        'est',
        0,
        'Your timezone has been set to (UTC-05:00) Eastern Time (US & Canada)'
    ));
    await execute(generateTestInteraction(
        'eST',
        0,
        'Your timezone has been set to (UTC-05:00) Eastern Time (US & Canada)'
    ));
    await expect(execute(generateTestInteraction(
        'eST1',
        0,
        'Your timezone has been set to (UTC-05:00) Eastern Time (US & Canada)'
    ))).rejects.toThrow('You did not enter a valid timezone abbreviation');
    await execute(generateTestInteraction(
        'EDT',
        0,
        'Your timezone has been set to (UTC-04:00) Eastern Daylight Time (US & Canada)'
    ));
    await execute(generateTestInteraction(
        'SPST',
        1,
        'Your timezone has been set to (UTC-05:00) Bogota, Lima, Quito'
    ));




})