const { prefix } = require("../config.json");
const findCommand = require("../helper-functions/find-command.helper");

module.exports = {
  name: "help",
  description: "List all of my commands or info about a specific command",
  aliases: ["commands"],
  cooldown: 5,
  execute(message, args) {
    const data = [];
    const commands = message.client.message_commands;

    if (!args.length) {
      data.push(`Here's a list of all my commands:`);
      data.push(
        commands.map((command) => `${prefix}${command.name}`).join(", ")
      );
      data.push(
        `\nYou can use '${prefix}help [command name]' to get info on a specific command!`
      );

      return message.author
        .send(data, { split: true })
        .then(() => {
          if (message.channel.type === "dm") return;
          message.reply(
            `Check your DMs! I sent you a list of all my commands.`
          );
        })
        .catch((error) => {
          console.error(
            `Could not send help DM to ${message.author.tag}.\n`,
            error
          );
          message.reply(
            `I couldn't DM you! Do you have DMs disabled perchance?`
          );
        });
    }

    const name = args[0].toLowerCase();

    const command = findCommand({ commands, commandName: name });
    if (!command) {
      return message.reply(`that's not a valid command`);
    }

    data.push(`**Name:** ${command.name}`);
    if (command.aliases)
      data.push(`**Aliases:** ${command.aliases.join(", ")}`);
    if (command.description)
      data.push(`**Description:** ${command.description}`);
    if (command.usage)
      data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
    if (command.permissions)
      data.push(`**Required Permissions:** ${command.permissions}`);

    data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

    message.channel.send(data, { split: true });
  },
};
