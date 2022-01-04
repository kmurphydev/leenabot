const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const dotenv = require('dotenv');
dotenv.config();
const { token, guildId, clientId } = process.env;

const dirWalk = require("./helper-functions/dir-walk.helper");


const commandFiles = dirWalk("./commands", ".commands.js");

const commands = [];

for (const file of commandFiles) {
    const command = require(file);
    commands.push(command.data.toJSON());
}


const rest = new REST({ version: '9' }).setToken(token);


rest.put(Routes.applicationGuildCommands(clientId, guildId),
    {
        body: commands,
    })
    .then(() => {
        console.log('registered application commands');
    })
    .catch((e) => {
        console.log('error');
        console.log(e);
        console.error('could not register application commands');
    })