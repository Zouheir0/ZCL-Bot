const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  name: "fixcrates",
  description: "Normalize crate keys to lowercase and show current crate inventory.",
  async execute(message) {
    const user = message.author;
    const key = `${message.guild.id}_${user.id}`;

    // Fetch crate inventory
    const crates = await db.get(`boxes_${key}`) || {};

    // Normalize keys to lowercase
    const fixedCrates = {};
    for (let crate in crates) {
      const lowerKey = crate.toLowerCase();
      fixedCrates[lowerKey] = (fixedCrates[lowerKey] || 0) + crates[crate];
    }

    // Save back the fixed crate structure
    await db.set(`boxes_${key}`, fixedCrates);

    // Show output in chat
    message.channel.send(`Crates normalized for **${user.username}**:\n\`\`\`json\n${JSON.stringify(fixedCrates, null, 2)}\n\`\`\``);
  }
};