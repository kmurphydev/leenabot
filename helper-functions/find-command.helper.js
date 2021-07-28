/**
 * args passed as object
 * @param {Discord.Collection} commands - Collection of commands to be searched through
 * @param {string} commandName - name of the command you are looking for
 * @returns command - command with name property or an alias matching commandName
 */
module.exports = ({ commands, commandName }) => {
  return (
    commands.get(commandName) ||
    commands.find(
      (command) => command.aliases && command.aliases.includes(commandName)
    )
  );
};
