const { SlashCommandBuilder } = require('discord.js');
// const { Sequelize } = require('sequelize');
// const { sequelize } = require('../database');
// const Nation = require('./models/nation');

const data = new SlashCommandBuilder()
	.setName('echo')
	.setDescription('Replies with your input!')
	.addStringOption(option =>
		option.setName('input')
			.setDescription('The input to echo back'))
	.addBooleanOption(option =>
		option.setName('ephemeral')
			.setDescription('Whether or not the echo should be ephemeral'));
    
    
    
    // //LIST ALL NATIONS AND USERS
    // if (message.content.startsWith("!listnations")) {
    //     try {
    //         // Find all nations
    //         const nations = await Nation.findAll();
    //         if (nations.length === 0) {
    //             message.reply("There are currently no nations.");
    //         } else {
    //             // Iterate through the nations and create a string with nation name, members, war requests, and current wars
    //             let nationList = "";
    //             for (const nation of nations) {
    //                 nationList += `__**${nation.name}**__\n**Members:** ${nation.members.join(", ") || "No members"}\n**War Requests:** ${nation.war_requests.join(", ") || "No war requests"}\n**Current Wars:** ${nation.current_wars.join(", ") || "No current wars"}\n**Kills:** ${nation.kills || 0}\n**Deaths:** ${nation.deaths || 0}\n**Self Kills:** ${nation.selfkills || 0}\n\n`;
    //             }
    
    //             // Send the nation list to the channel
    //             message.channel.send(nationList);
    //         }
    //     } catch (error) {
    //         console.error("Error listing nations:", error);
    //         message.reply("An error occurred while trying to list the nations.");
    //     }
    // }