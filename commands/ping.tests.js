
const { execute } = require('./ping.commands.js');


test('ping responds with pong', (done) => {
    const testInteraction = {
        reply: (text) => {
            try {
                expect(text).toBe('Pong!');
                done();
            } catch (e) {
                done(e);
            }
        }
    }
    execute(testInteraction);
})