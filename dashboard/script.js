// Function to fetch and populate current settings
async function loadSettings(guildId) {
  const res = await fetch(`/api/guild-settings?guildId=${guildId}`);
  const settings = await res.json();

  if (settings) {
    document.getElementById('level-multiplier').value = settings.levelMultiplier;
    document.getElementById('credits-per-message').value = settings.creditsPerMessage;
    document.getElementById('crate-price').value = settings.cratePrice;
    document.getElementById('reward-on-level').value = settings.rewardOnLevel;
  }
}

// Function to save updated settings
async function saveSettings(guildId) {
  const levelMultiplier = parseFloat(document.getElementById('level-multiplier').value);
  const creditsPerMessage = parseInt(document.getElementById('credits-per-message').value);
  const cratePrice = parseInt(document.getElementById('crate-price').value);
  const rewardOnLevel = document.getElementById('reward-on-level').value;

  const res = await fetch('/api/save-settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      guildId,
      levelMultiplier,
      creditsPerMessage,
      cratePrice,
      rewardOnLevel
    })
  });

  const data = await res.json();
  if (data.message) {
    alert('Settings saved!');
  } else {
    alert('Error saving settings');
  }
}

// Assuming `guildId` is available, you can load and save settings
const guildId = 'YOUR_GUILD_ID'; // Replace with actual guild ID
loadSettings(guildId);

// Save settings on button click
document.getElementById('save-settings').addEventListener('click', () => saveSettings(guildId));