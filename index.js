const Discord = require("discord.js");
const { token, prefix } = require("./config.json");

//helper functions
const dirWalk = require("./helper-functions/dir-walk.helper");

const commandFiles = dirWalk("./commands", ".commands.js");
// console.log(`COMMANDS FOUND IN DIRECTORIES:${commandFiles}`);
const client = new Discord.Client();
client.commands = new Discord.Collection();

for (const file of commandFiles) {
  const command = require(file);
  client.commands.set(command.name, command);
}
// console.log(`COMMANDS: ${Array.from(client.commands)}`);

client.once("ready", () => {
  console.log("Ready!");
});

client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

//   console.log(`args length:${args.length}`);
  if(command.reqArgs && !args.length) {
      return message.reply('Error: you did not provide any arguments');
  }

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error executing that command...");
  }
});

client.login(token);
