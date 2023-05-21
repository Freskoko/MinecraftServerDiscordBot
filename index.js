require("dotenv").config();
const { Sequelize } = require('sequelize');
const { sequelize } = require('./database');
const Nation = require('./models/nation');

(async () => {
    await sequelize.authenticate();
    await sequelize.sync(); // This will create the tables if they don't exist
})();

const { Client, GatewayIntentBits } = require('discord.js');
const { ChannelType, Colors } = require('discord.js');
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


client.on("ready", () => {
    console.log(`${client.user.tag} online!`);
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
});

//TODO ADD LEAVE NATION FUNCTION


client.on("messageCreate", async (message) => {
    if (message.author.bot) return

    console.log(message.content);

    if (message.content.startsWith("!help")){

        message.channel.send("Use !startwar <nation> to send a war request. \n !accept_war <nation> to accept a war request \n !join_nation <nation> to join a nation \n !listnations to see info about all nations")

    }

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
    if (message.content.startsWith("!startwar")) {
    const target_nation = message.content.split(" ")[1];
    console.log("----------");
    console.log(target_nation);
    console.log("----------");

    if (target_nation) {
        // Fetch nation by name
        const nation = await Nation.findOne({ where: { name: target_nation } });
        const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);

        if (nation) {
            const username = message.author.username;

            // Find the user's nation
            const userNation = await Nation.findOne({
                where: Sequelize.literal(`members LIKE '%"${username}"%'`)
              });

            if (userNation) {
                if (userNation.name !== target_nation) {
                    console.log(`WAR REQUEST SENT TO ${target_nation}`);

                    // Add userNation's name to the war_requests of target nation and update it in the database
                    const updatedWarRequests = [...nation.war_requests, userNation.name];
                    await nation.update({ war_requests: updatedWarRequests });


                    message.reply(`WAR REQUEST SENT TO ${target_nation}`);

                    const targetrole = guild.roles.cache.find((role) => role.name === target_nation);

                    const textout = `${targetrole} you have been challenged by ${userNation.name}`;

                    const channelA = message.guild.channels.cache.find((channel) => channel.name === 'announcements');


                    channelA.send(textout);


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
                
                // Add the challenging nation to current wars FOR CURRENT NATION
                const updatedWarCurrently = [...userNation.current_wars, nation];
                await userNation.update({ current_wars: updatedWarCurrently });
    
                const challengeNation = awaitNation.findOne({ where: { name: nation } });

                // Add the challenged nation to current wars FOR CHALLENGING NATION
                const updatedWarCurrently2 = [...challengeNation.current_wars, userNation.name];
                await challengeNation.update({ current_wars: updatedWarCurrently2 });
    
                // Send a message to the Discord chat
                message.reply(`You have accepted the war request from ${nation}. Let the battle begin!`);
            } else {
                message.reply(`No war request found from ${nation} in your nation's war_requests.`);
            }
        } else {
            message.reply(`${username} does not belong to any nation.`);
        }
    }

    //JOIN NATION FOR INDIVIDUALS ---------------

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

                        const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);

                        const nationRole = guild.roles.cache.find(role => role.name === name); //name is given in the command
                            console.log('Nation role:', nationRole); 

                            //Check if role was found before adding it to the user
                            if (nationRole) {
                                await message.member.roles.add(nationRole);
                                message.reply(`You have successfully joined ${name}.`);
                            } else {
                            console.error('Nation role not found');
                            message.reply(`Nation role not found ${name}.`)
                            }

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
                // Iterate through the nations and create a string with nation name, members, war requests, and current wars
                let nationList = "";
                for (const nation of nations) {
                    nationList += `__**${nation.name}**__\n**Members:** ${nation.members.join(", ") || "No members"}\n**War Requests:** ${nation.war_requests.join(", ") || "No war requests"}\n**Current Wars:** ${nation.current_wars.join(", ") || "No current wars"}\n**Kills:** ${nation.kills || 0}\n**Deaths:** ${nation.deaths || 0}\n**Self Kills:** ${nation.selfkills || 0}\n\n`;
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
    
        //TODO
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

                    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
                    console.log(`name : ${name}`)

                    guild.roles.create({
                        
                        name: name,
                        // color: getRandomColor(),
                        color: Colors.Blue,
                        mentionable: true,
                        reason: `we needed a role for ${name}`,
                      })
                        .then(console.log)
                        .catch(console.error);

                    console.log(`${name} has been created.`);

                    // Create the text channel for the nation
                    let channelName = newNation.name;
                    console.log(name)
                    console.log(`Creating channel with name: ${channelName}`); // Log the channel name
                    
                    //ADD GUILDCATEGORY

                    const category = await guild.channels.create({
                        name: `-${name}-`,
                        type: ChannelType.GuildCategory,
                        permissionOverwrites: [
                           {
                             id: message.author.id,
                             deny: [PermissionFlagsBits.ViewChannel],
                          },
                        ],
                    })

                    guild.channels.create({
                        name: `${name} Text`,
                        type: ChannelType.GuildText,
                        parent: category,
                        permissionOverwrites: [
                        
                           {
                             id: message.author.id,
                             deny: [PermissionFlagsBits.ViewChannel],
                          },
                        ],
                    })

                    guild.channels.create({
                        name: `${name} Voice`,
                        type: ChannelType.GuildVoice,
                        parent:category,
                        permissionOverwrites: [
                           {
                             id: message.author.id,
                             deny: [PermissionFlagsBits.ViewChannel],
                          },
                        ],
                    })
                }


        } catch (error) {
            console.error("Error adding nation:", error);
            message.reply("An error occurred while trying to add the nation.");
        }
    } else {
        message.reply("Please specify the name of the new nation.");}

        
}});

client.login(process.env.DISCORD_BOT_TOKEN);

