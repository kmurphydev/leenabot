const fs = require('fs');

//helper function to search command by name or alias
const findCommand = require('../helper-functions/find-command.helper');

//helper function to crawl root/commands directory for .commands.js files
const dirWalk = require('../helper-functions/dir-walk.helper');
const {prefix} = require('../config.json');

module.exports = {
    name: 'reload',
    description: 'Reloads a command',
    reqArgs: true,
    execute(message, args) {
        const commandName = args[0].toLowerCase();
        const {commands} = message.client;

        //look for command matching commandName
        const command = findCommand({commands, commandName});

        if(!command) {
            return message.reply(`There is no command or alias ${prefix}${commandName}`);
        }

        //find file with name matching the command name
        const commandFile = dirWalk("./commands", ".commands.js", true)
        .find((fileName)=>{
            return fileName.endsWith(`${command.name}.commands.js`);
        });
        
        if(commandFile) {
            console.log(`found commandfile for ${command.name}: ${commandFile} attempting reload...`);
        }

        //get new path relative to the root/commands subfolder (cuts out ./commands from the string)
        const relPath = `./${commandFile.substr(10,commandFile.length-10)}`

        //delete existing require cache before re-requiring
        delete require.cache[require.resolve(relPath)];
        try {
            const newCommand = require(relPath);
            commands.set(newCommand.name, newCommand);
            return message.reply(`Command ${prefix}${newCommand.name} was reloaded successfully!`);
        } catch (error) {
            console.error(error);
            return message.reply(`There was an error when reloading ${prefix}${command.name}\n ${error.message}`);
        }
    },
}