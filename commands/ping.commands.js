// module.exports = {
//   name: "ping",
//   description: "Ping!",
//   guildOnly: true,
//   cooldown: 1,
//   execute(message, args) {
//     message.channel.send("Pong!");
//   },
// };

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ping! replies with pong.')
  ,
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};