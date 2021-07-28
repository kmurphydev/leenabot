module.exports = {
  name: "ping",
  description: "Ping!",
  guildOnly: true,
  cooldown: 1,
  execute(message, args) {
    message.channel.send("Pong.");
  },
};
