require('dotenv').config();

const { parseStatsFile, parseEmote, parseImage } = require('./fileReader.js');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let characters = new Map();
let Emotes = new Map();
let EmotesRes = new Map();
let Images = new Map();

client.once("ready", async () => {
    console.log("Connecté en tant que ", client.user.tag);
    characters = await parseStatsFile('ch_stats.txt');
    console.log("Données des personnages chargées.");
    Emotes = await parseEmote('emotes_id.txt');
    console.log('Les émotes ont été chargées.');
    EmotesRes = await parseEmote('emotes_id_res.txt');
    console.log('les emotes de resistances sont chargées');
    Images = await parseImage('images_path.txt');
    console.log('les images sont chargées.');
    
});

client.login(process.env.TOKEN);

function formatStats(map) {
    if (map.size === 0) return 'Aucune donnée disponible';

    let statsString = '';
    map.forEach((value, key) => {
        statsString += `**${key}**: ${value}\n`;
    });

    return statsString;
}

function FormatWithEmotes(elementalMap) {
    if (!elementalMap || elementalMap.size === 0) return 'Aucune donnée disponible';

    let resultString = '';

    elementalMap.forEach((value, key) => {
        const emoteData = Emotes.get(key.trim());
        if (emoteData) {
            resultString += `<:${emoteData.abb}:${emoteData.id}>:${value}\n`;
        } else {
            resultString += `**${key}**: ${value}\n`; // Fallback if no emote found
        }
    });

    return resultString;
}

function FormatWithEmoteRes(resMap) {
    if(!resMap || resMap.size === 0) return 'Aucune donnée disponible';

    let resultString = '';
    resMap.forEach((value, key) => {
        const emoteData = EmotesRes.get(key.trim());
        if(emoteData) {
            resultString += `<:${emoteData.abb}:${emoteData.id}>:${value}\n`;
        } else{
            resultString += `**${key}**: ${value}\n`;
        }

    });

    return resultString;

}
client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content.startsWith('!')) {
        const searchPronoun = message.content.slice(1).toLowerCase();

        if (characters.size === 0) {
            message.channel.send("Les données des personnages ne sont pas encore chargées.");
            return;
        }

        const character = Array.from(characters.values()).find(value => value.pronoun.toLowerCase() === searchPronoun);

        if (character) {

            const imagePath = Images.get(character.pronoun);

            const embed = new EmbedBuilder()
                .setTitle(character.lastName)
                .setThumbnail(imagePath)
                
                .setFields(
                    { name: 'Battle Stats', value: formatStats(character.battleStats), inline: true },
                    { name: 'Growth', value: formatStats(character.Growth), inline: true },
                    { name: ' ', value: '                                                              '},
                    { name: 'Resistances', value: FormatWithEmoteRes(character.resistance), inline: true },
                    { name: 'Affinities', value: FormatWithEmotes(character.Elemental), inline: true },
                    { name: ' ', value: '                                                              '},
                    { name: 'Additionals', value: formatStats(character.Additional), inline: false }
                )
                .setColor('#0099ff')
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send("Le personnage ne peut pas être trouvé ou n'existe pas.");
        }
    }
});