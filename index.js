require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, flatten } = require('discord.js');
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
let BattleStatsG = new Map();
let ElementaryStats = new Map();
let Emotes = new Map();
let Status = new Map();
let Additionnal = new Map();
let Images = new Map();

// Charger les personnages depuis le fichier CSV
parseCharactersStats('ch_stats.csv', (names, stats, statsG, Affinities, emotes, status, additionnal, images) => {
    characterName = names;
    BattleStats = stats;
    BattleStatsG = statsG;
    ElementaryStats = Affinities;
    Emotes = emotes;
    Status = status;
    Additionnal = additionnal;
    Images = images
    console.log(Images);
    console.log('Personnages chargés');
    console.log('stats chargés');
    console.log('statsG chargés');
});

client.once("ready", () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

client.login(process.env.TOKEN);

function getKeyByValue(map, value) {
    return Array.from(map).find(([key, val]) => val === value)?.[0];
}

function drawCharacterStats(name){
    resultString = '';
    let fValue = '';
    BattleStats.get(name).forEach((key, value) => {
        fValue = value.replace("-B", "");
        resultString += `**${fValue}**: ${key}\n`;
    });
    
    return resultString;
}

function drawCharacterGrowth(name) {
    resultString = '';
    BattleStatsG.get(name).forEach((key, value) => {
        resultString += `${key}\n`;
    });

    return resultString;
}

function drawCharacterAffinities(name) {
    let resultString = '';
    ElementaryStats.get(name).forEach((key, value) => {
        value = value.replace("-E", "");
        console.log('Processing value:', value); // Debug: affichage de la valeur
        let emoteName = Emotes.get(value); // Utiliser l'ID comme clé
        if (emoteName !== undefined) {
            let emoteID = value; // L'ID de l'émoji
            let emote = `<:${emoteName}:${emoteID}>`; // Format correct pour Discord
            console.log('Formatted emote:', emote); // Debug: affichage du format final
            resultString += `${emote}: ${key}\n`;
        } else {
            console.error('Emote non trouvé pour:', value);
            resultString += `${value}: ${key}\n`; // Indicateur visuel d'erreur
        }
    });
    return resultString;
}

function drawStatus(name) {
    let resultString = '';
    Status.get(name).forEach((value, key) => {
        key = key.replace("-S", "");
        resultString += `${key}: ${value}\n`;
    });

    return resultString;
}

function drawAdditionnal(name) {
    resultString = '';
    Additionnal.get(name).forEach((key, value) => {
        value = value.replace("-A", "");
        resultString += `${value}: ${key}\n`;
    });
    return resultString;
}
client.on('messageCreate', message => {
    if (message.author.bot) return;

    // Vérifiez si le message commence par "!"
    if (message.content.startsWith('!')) {
        const prefix = "!";
        const cmd = message.content.trim().split(/ +/g);
        const args = cmd[0].slice(prefix.length).toLowerCase();

        if (characterName.includes(args)) {
            const embed = new EmbedBuilder()
                .setTitle(`Statistiques de ${args}`)
                .setColor('#0099ff')
                .setThumbnail(Images.get(args))
                .addFields(
                    { name: 'BattleStats', value: drawCharacterStats(args), inline: true },
                    { name: 'Growth', value: drawCharacterGrowth(args), inline: true},
                    {name: ' ', value: '                                                                                           ', inline: true},
                    { name: 'Affinities', value: drawCharacterAffinities(args), inline: true},
                    { name: 'Status Resistances', value: drawStatus(args), inline: true},
                    { name: 'Additionnal', value: drawAdditionnal(args), inline: false}
                )

            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send(`Personnage "${args}" non trouvé.`);
        }
    }
});
