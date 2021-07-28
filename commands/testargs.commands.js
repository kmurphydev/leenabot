module.exports = {
  name: "testargs",
  description: "",
  execute: (message, args) => {
    if (!args.length) return message.channel.send("please pass arguments");

    return message.channel.send(`Your arguments were: ${args}`);
  },
};
