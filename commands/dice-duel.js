const db = require('quick.db');

module.exports = {
  name: 'dice-duel',
  description: 'Duel another user in a dice roll game',
  async execute(message, args) {
    const opponent = message.mentions.users.first();
    if (!opponent) {
      return message.reply('Please mention another user to duel.');
    }

    const betAmount = parseFloat(args[1]);
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply('Please provide a valid bet amount.');
    }

    const userBalance = db.get(`balance_${message.author.id}`);
    const opponentBalance = db.get(`balance_${opponent.id}`);

    if (userBalance < betAmount || opponentBalance < betAmount) {
      return message.reply('One or both players do not have enough credits to place this bet.');
    }

    const userRoll = Math.floor(Math.random() * 6) + 1;
    const opponentRoll = Math.floor(Math.random() * 6) + 1;

    let winner;
    let winnerAmount;

    if (userRoll > opponentRoll) {
      winner = message.author;
      winnerAmount = betAmount * 2;
    } else if (userRoll < opponentRoll) {
      winner = opponent;
      winnerAmount = betAmount * 2;
    } else {
      return message.reply(`It's a tie! Both players rolled a **${userRoll}**.`);
    }

    db.set(`balance_${message.author.id}`, userBalance - betAmount);
    db.set(`balance_${opponent.id}`, opponentBalance - betAmount);
    db.set(`balance_${winner.id}`, db.get(`balance_${winner.id}`) + winnerAmount);

    return message.reply(`${winner.tag} wins! They rolled **${winner === message.author ? userRoll : opponentRoll}** and won **${winnerAmount.toFixed(2)}** credits.`);
  }
};