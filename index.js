const { Client, MessageEmbed, Intents, Collection } = require("discord.js");
require('reflect-metadata');
const dotenv = require('dotenv');
dotenv.config();
const { token } = process.env;

const { createConnection } = require('typeorm');
const { handleReminder, injectClient } = require("./handle-reminders.js");

//helper functions
const dirWalk = require("./helper-functions/dir-walk.helper");

//look for all .commands.js files in the ./commands subfolder
const commandFiles = dirWalk("./commands", ".commands.js");
// console.log(`COMMANDS FOUND IN DIRECTORIES:${commandFiles}`);


(async () => {

  const client = new Client({
    intents: [Intents.FLAGS.GUILDS]
  });
  //initialize client and give it commands, cooldowns collections

  client.commands = new Collection();
  //add all command functions from commandFiles to the commands collection
  for (const file of commandFiles) {
    const command = require(file);
    client.commands.set(command.data.name, command);
  }


  //connect to PG db


  await createConnection();

  // const testReminder = new Reminder();
  // testReminder.discord_id = 1234;
  // testReminder.remind_text = 'asdf';


  //set up listeners

  client.once("ready", () => {
    console.log("Ready!");
    // console.log('client in index.js');
    // console.log(client);
    injectClient(client);
    handleReminder();
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
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Reason:')
        .setDescription(e.toString());
      await interaction.reply({
        content: 'There was an error and your command could not be executed.',
        embeds: [embed],
        ephemeral: true
      });
    }
  });

  client.login(token);


})()
