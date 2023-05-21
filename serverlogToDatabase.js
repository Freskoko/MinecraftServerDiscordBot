const fs = require('fs');
const readline = require('readline');
const { Nation } = require('./models/nation');

const processLogFile = async (filePath) => {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
});

for await (const line of rl) {
  // Example line: "player1 killed player2"
  // Adjust this pattern based on your Minecraft server log format
  const killMatch = line.match(/(\w+) killed (\w+)/);

  if (killMatch) {
    const killer = killMatch[1];
    const victim = killMatch[2];
  
    // Find killer's nation
    const killerNation = await Nation.findOne({
      where: Sequelize.literal(`members LIKE '%"${killer}"%'`),
    });
  
    // Find victim's nation
    const victimNation = await Nation.findOne({
      where: Sequelize.literal(`members LIKE '%"${victim}"%'`),
    });
  
    // Check if the killer and victim belong to the same nation
    if (killerNation && victimNation && killerNation.id === victimNation.id) {
      console.log(`${killer} and ${victim} are in the same nation.`);
      await killerNation.increment("selfkills");

    } else {
      // Update killer's nation kills count
      if (killerNation) {
        await killerNation.increment('kills');
      }
  
      // Update victim's nation deaths count
      if (victimNation) {
        await victimNation.increment('deaths');}
    }
    
    }}};

const logFilePath = './serverlog/log';
processLogFile(logFilePath);

