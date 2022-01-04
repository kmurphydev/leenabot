const { Client, Intents, Collection } = require("discord.js");
// const { REST } = require("@discordjs/rest");
// const {Routes} = require("discord-api-types");

const dotenv = require('dotenv');
dotenv.config();
const { prefix } = require("./config.json");


const findCommand = require("./helper-functions/find-command.helper");

const { token } = process.env;


// const rest = new REST({ version: '9' }).setToken(token);


//helper functions
const dirWalk = require("./helper-functions/dir-walk.helper");

//look for all .commands.js files in the ./commands subfolder
const commandFiles = dirWalk("./commands", ".commands.js");
// console.log(`COMMANDS FOUND IN DIRECTORIES:${commandFiles}`);

//initialize client and give it commands, cooldowns collections
const client = new Client({
  intents: [Intents.FLAGS.GUILDS]
});

client.commands = new Collection();
client.cooldowns = new Collection();
const { cooldowns } = client;

//add all command functions from commandFiles to the commands collection
for (const file of commandFiles) {
  const command = require(file);
  client.commands.set(command.name, command);

  //initialize a cooldown collection for each command
  cooldowns.set(command.name, new Collection());
}
// console.log(`COMMANDS: ${Array.from(client.commands)}`);

//set up listeners

client.once("ready", () => {
  console.log("Ready!");
});

//command interpreter
client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  //extract base command name and args from message
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  //check to see if the requested command exists or exists as an alias
  const command = findCommand({ commands: client.commands, commandName });

  if (!command) return;

  //check if command can only be used in/outside of DMs
  if (command.guildOnly && message.channel.type === "dm") {
    return message.reply(`I can't do that inside DMs! Sorry!`);
  }
  if (command.dmOnly && message.channel.type !== "dm") {
    return message.reply(`Sorry! Keep that kind of command to the DMs...`);
  }

  if (command.permissions) {
    const authorPerms = message.channel.permissionsFor(message.author);
    if (!authorPerms || !authorPerms.has(command.permissions)) {
      return message.reply(`You don't have permissions to use this command!`);
    }
  }

  //   console.log(`args length:${args.length}`);

  //check for arguments if required
  if (command.reqArgs && !args.length) {
    let reply = "Error: you did not provide any arguments";
    if (command.usage) {
      reply += `\nUse the following format for ${prefix}${command.name}: '${prefix}${command.name} ${command.usage}'`;
    }

    return message.reply(reply);
  }



  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || defaultCooldown) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing ${prefix}${command.name}`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error executing that command...");
  }
});

client.login(token);
