require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, CDN } = require('discord.js');
const { parseCharactersStats } = require('./fileReader.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let characterName = [];
let BattleStats = new Map();

// Charger les personnages depuis le fichier CSV
parseCharactersStats('ch_stats.csv', (BattleStats, characterName) => {
    if(BattleStats === 0) console.log('BattleStats is null');
    if(characterName === 0) console.log('characterName is null');
});

client.once("ready", () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

client.login(process.env.TOKEN);

client.on('messageCreate', message => {
    if (message.author.bot) return;

    // Vérifiez si le message commence par "!"
    if (message.content.startsWith('!')) {
        const prefix = "!";
        const cmd = message.content.trim().split(/ +/g);
        const args = cmd[0].slice(prefix.length).toLowerCase();

        if (characterName.includes(args)) {

            // Construire un embed pour une présentation élégante
            const embed = new EmbedBuilder()
                .setTitle(`Statistiques de ${args}`)
                .addFields(
                    { name: '  ', value: BattleStats.get(args) || 'undefined', inline: false}
                )
                .setColor('#0099ff');

            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send(`Personnage "${args}" non trouvé.`);
        }
    }
});