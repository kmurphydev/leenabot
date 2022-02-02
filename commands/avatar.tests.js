
const { execute } = require('./avatar.commands.js');

test('when there is no user argument, responds with the avatar of the user who initiated the interaction', (done) => {
    const testInteraction = {
        options: {
            getUser: (text) => {
                return undefined;
            }
        },

        user: {
            displayAvatarURL: (options) => {
                return 'useravatar.png'
            }
        },

        reply: (text) => {
            try {
                expect(text).toBe('Your avatar: <useravatar.png>');
                done();
            } catch (e) {
                done(e);
            }
        }
    };

    execute(testInteraction);
})

test('when there is a user argument, responds with the avatar of the listed user', (done) => {
    const testUser = {
        displayAvatarURL: (options) => {
            return 'useravatar.png'
        },
        toString: () => {
            return 'test user'
        }
    };
    const testInteraction = {
        options: {
            getUser: (text) => {
                if (text === 'target') {
                    return testUser;
                } else {
                    return undefined;
                }
            }
        },

        reply: (text) => {
            try {
                expect(text).toBe(`test user's avatar: <useravatar.png>`);
                done();
            } catch (e) {
                done(e);
            }
        }
    };

    execute(testInteraction);
})