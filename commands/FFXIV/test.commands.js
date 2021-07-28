module.exports = {
    name: "test",
    reqArgs: true,
    description: "Ping!",
    execute(message, args) {
      message.channel.send("Pong.");
    },
  };
  