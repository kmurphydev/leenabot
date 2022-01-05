const { Client, Intents, Collection } = require("discord.js");
require('reflect-metadata');
const dotenv = require('dotenv');
dotenv.config();
const { token } = process.env;

const { createConnection } = require('typeorm');
const { Reminder } = require('./entity/Reminder.js');

//helper functions
const dirWalk = require("./helper-functions/dir-walk.helper");

//look for all .commands.js files in the ./commands subfolder
const commandFiles = dirWalk("./commands", ".commands.js");
// console.log(`COMMANDS FOUND IN DIRECTORIES:${commandFiles}`);


(async () => {

  //initialize client and give it commands, cooldowns collections
  const client = new Client({
    intents: [Intents.FLAGS.GUILDS]
  });

  client.commands = new Collection();
  //add all command functions from commandFiles to the commands collection
  for (const file of commandFiles) {
    const command = require(file);
    client.commands.set(command.data.name, command);
  }


  //connect to PG db

  await createConnection();

  //set up listeners

  client.once("ready", () => {
    console.log("Ready!");
  });

  //slash command interpreter
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) {
      // console.log('not a command');
      return
    };

    const command = client.commands.get(interaction.commandName);


    if (!command) return;

    try {
      await command.execute(interaction);

    } catch (e) {
      console.error(e);
      await interaction.reply({ content: 'there was an error. could not execute your command' });
    }
  });

  client.login(token);


})()
