require("dotenv").config();
const { Sequelize } = require('sequelize');
const { sequelize } = require('./database');
const Nation = require('./models/nation');

(async () => {
    await sequelize.authenticate();
    await sequelize.sync(); // This will create the tables if they don't exist
})();

const { Client, GatewayIntentBits } = require('discord.js');
const { ChannelType } = require('discord.js');
const { PermissionFlagsBits } = require("discord.js");


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMessageReactions,
    ],
});


//const rest = new REST({ version: '9' }).setToken(process.env['DISCORD_BOT_TOKEN'])

client.on("ready", () => {
    console.log(`${client.user.tag} online!`);
    const guild = client.guilds.cache.get("1034452675070271509");
});
const guild = client.guilds.cache.get("1034452675070271509");



client.on("messageCreate", async (message) => {
    if (message.author.bot) return

    console.log(message.content);

    //PERSON ON PERSON WAR - USE NATION WAR INSTEAD
    if (message.content.startsWith("!warperson")) {
        const name = message.content.split(" ")[1]
        console.log("----------")
        console.log(name)
        console.log("----------")

        if (name) {
            // Fetch user by username
            const user = message.guild.members.cache.find(member => member.user.username === name);
            if (user) {
                console.log(`User found: ${user.user.username}`);

                // Compare user IDs instead of user objects and username strings
                if (user.id === message.author.id) {
                    message.reply("Cannot go to war with yourself!");
                } else {
                    message.reply(`War Request sent to ${name}`);
                }
            } else {
                console.log("User not found");
                message.reply(`User ${name} not found`)
            }
        }
    }

    //NATION WAR
//NATION WAR
if (message.content.startsWith("!startwar")) {
    const target_nation = message.content.split(" ")[1];
    console.log("----------");
    console.log(target_nation);
    console.log("----------");

    if (target_nation) {
        // Fetch nation by name
        const nation = await Nation.findOne({ where: { name: target_nation } });

        if (nation) {
            const username = message.author.username;

            // Find the user's nation
            const userNation = await Nation.findOne({ where: { members: { [Sequelize.Op.contains]: [username] } } });

            if (userNation) {
                if (userNation.name !== target_nation) {
                    console.log(`WAR REQUEST SENT TO ${target_nation}`);

                    // Add userNation's name to the war_requests of target nation and update it in the database
                    const updatedWarRequests = [...nation.war_requests, userNation.name];
                    await nation.update({ war_requests: updatedWarRequests });

                    message.reply(`WAR REQUEST SENT TO ${target_nation}`);
                } else {
                    message.reply(`You cannot challenge your own nation to a war.`);
                }
            } else {
                message.reply(`${username} does not belong to any nation.`);
            }
        } else {
            message.reply(`Cannot find nation ${target_nation}`);
        }
    }
    }

    //TODO
    if (message.content.startsWith("!accept_war")) {
        const nation = message.content.split(" ")[1];
    
        const username = message.author.username;
    
        // Find the user's nation
        const userNation = await Nation.findOne({ where: { members: { [Sequelize.Op.contains]: [username] } } });
    
        if (userNation) {
            // Check if the war_requests contain the challenging nation
            if (userNation.war_requests.includes(nation)) {
                // Accept the war request
    
                // Remove the challenging nation from the war_requests
                const updatedWarRequests = userNation.war_requests.filter(n => n !== nation);
                await userNation.update({ war_requests: updatedWarRequests });
    
                // Send a message to the Discord chat
                message.reply(`You have accepted the war request from ${nation}. Let the battle begin!`);
            } else {
                message.reply(`No war request found from ${nation} in your nation's war_requests.`);
            }
        } else {message.reply(`${username} does not belong to any nation.`);}
    }

    //JOIN NATION FOR INDIVIDUALS
    if (message.content.startsWith("!join_nation")) {
        const name = message.content.split(" ")[1];
        console.log("----------");
        console.log(name);
        console.log("----------");
    
        if (name) {
            try {
                // Find the nation with the given name
                const nation = await Nation.findOne({ where: { name: name } });
                if (nation) {
                    const username = message.author.username;
                    
                    // Check if user is already a member of any nation
                    // const existingNation = await Nation.findOne({ where: { members: { [Sequelize.Op.contains]: [username] } } }); No support for SQL
                    const existingNation = await Nation.findOne({
                        where: Sequelize.literal(`members LIKE '%"${username}"%'`)
                      });

                    if (existingNation) {
                        message.reply(`You are already a member of ${existingNation.name}. Please leave that nation before joining a new one.`);
                    } else {
                        // Add user to the nation's members
                        const updatedMembers = [...nation.members, username];
                        await nation.update({ members: updatedMembers });
                        message.reply(`You have successfully joined ${name}.`);
                    }
                } else {
                    message.reply(`Nation ${name} not found.`);
                }
            } catch (error) {
                console.error("Error joining nation:", error);
                message.reply("An error occurred while trying to join the nation.");
            }
        } else {
            message.reply("Please specify the name of the nation you want to join.");
        }
    }


    //LIST ALL NATIONS AND USERS
    if (message.content.startsWith("!listnations")) {
        try {
            // Find all nations
            const nations = await Nation.findAll();
            if (nations.length === 0) {
                message.reply("There are currently no nations.");
            } else {
                // Iterate through the nations and create a string with nation name and members
                let nationList = "";
                for (const nation of nations) {
                    nationList += `**${nation.name}**:\nMembers: ${nation.members.join(", ") || "No members"}\n\n`;
                }
    
                // Send the nation list to the channel
                message.channel.send(nationList);
            }
        } catch (error) {
            console.error("Error listing nations:", error);
            message.reply("An error occurred while trying to list the nations.");
        }
    }

    //ADD A NATION 
    if (message.content.startsWith("!addnation")) {
        const name = message.content.split(" ")[1];
        console.log("----------");
        console.log(name);
        console.log("----------");
    
        // if (!message.member.hasPermission("ADMINISTRATOR")) return console.log('you do not have permissons for this command.')
    
        if (name) {
            try {
                // Check if a nation with the given name already exists
                const existingNation = await Nation.findOne({ where: { name: name } });
                if (existingNation) {
                    message.reply(`A nation with the name ${name} already exists.`);
                } else {

                    // Create the new nation
                    const newNation = await Nation.create({ name: name, members: [], war_requests: [] });
                    message.reply(`Nation ${newNation.name} has been created.`);
    
                    // Create the role for the nation
                    let nationRole = await message.guild.roles.create({ data: { name: name, mentionable: true } });
                    console.log(`${nationRole.name} has been created.`);
                    // Create the text channel for the nation

                    //--------------------------------

                    // Create the text channel for the nation
                    let channelName = newNation.name;
                    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&");
                    console.log(name)
                    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&");
                    console.log(`Creating channel with name: ${channelName}`); // Log the channel name
                    
                    const guild = client.guilds.cache.get("1034452675070271509");

                    guild.channels.create({
                        name: name,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                           {
                             id: message.author.id,
                             deny: [PermissionFlagsBits.ViewChannel],
                          },
                        ],
                    })

                    //--------------------------------

            }
        } catch (error) {
            console.error("Error adding nation:", error);
            message.reply("An error occurred while trying to add the nation.");
        }
    } else {
        message.reply("Please specify the name of the new nation.");
    }
    
    
        
        //TODO LEAVE NATION{}
}});

client.login(process.env.DISCORD_BOT_TOKEN);
