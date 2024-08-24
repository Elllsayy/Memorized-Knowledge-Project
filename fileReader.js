const Papa = require('papaparse');
const fs = require('fs');

function searchBySuffix(results, suffix, dataName) {
    let matchingData = new Map();

    // Trouver la ligne correspondant à `dataName`
    const targetRow = results.data.find(row => row['DATA'] === dataName);
    if (!targetRow) {
        console.error(`Ligne avec DATA "${dataName}" non trouvée.`);
        return null;
    }

    // Parcourir les colonnes pour trouver celles qui se terminent par le suffixe donné
    results.meta.fields.forEach((columnName) => {
        if (columnName.endsWith(suffix)) {
            matchingData.set(columnName, targetRow[columnName]);
        }
    });

    return matchingData;
}

function setEmotes(filePath) {
    const Emotes = new Map();
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        if (!data) {
            console.error('data is null');
        } else {
            const lines = data.split('\n');
            lines.forEach(line => {
                let [name, id] = line.split('=');
                Emotes.set(id, name); // Correction ici
            });
        }
    } catch (err) {
        console.error('Error reading file:', err);
    }

    return Emotes;
}

function parseImage(filePath) {
    const Images = new Map();
    try{
        const data = fs.readFileSync(filePath, 'utf-8');
        if(!data) {
            console.error('data is null');
        }
        else{
            const lines = data.split('\n');
            lines.forEach(line => {
                const [name, id] = line.split('=');
                Images.set(name, id);
            })
        }
    }
    catch(err){
        console.error('Error for Reading file: ', err);
    }

    return Images;
}
function parseCharactersStats(filePath, callback) {
    let characterName = [];
    const BattleStats = new Map();
    const BattleStatsG = new Map();
    const ElementaryStats = new Map();
    const Status = new Map();
    var Emotes = new Map();
    const Additionnal = new Map();
    var Images = new Map();

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier :', err);
            return;
        }

        Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                if (results.errors.length > 0) {
                    console.error('Erreurs lors du parsing :', results.errors);
                    return;
                }

                results.data.forEach((data, index) => {
                    let name = data['DATA'];
                    
                    if (!name) {
                        console.warn(`Nom manquant à la ligne ${index + 1}`);
                        return;
                    }

                    characterName.push(name);
                    BattleStats.set(name, searchBySuffix(results, '-B', name));
                    BattleStatsG.set(name, searchBySuffix(results, '-G', name));
                    ElementaryStats.set(name, searchBySuffix(results, '-E', name));
                    Status.set(name, searchBySuffix(results, '-S', name));
                    Additionnal.set(name, searchBySuffix(results, '-A', name));
                    Images = parseImage('images.txt');
                    
                });

                Emotes = setEmotes('emotes_id.txt');

                if (characterName.length === 0) {
                    console.error('Aucun personnage n\'a été chargé.');
                }

                // console.log(BattleStats.get('marisa').get('HP-B'));
                
                callback(characterName, BattleStats, BattleStatsG, ElementaryStats, Emotes, Status, Additionnal, Images);
            }
        });
    });
}

module.exports = { parseCharactersStats };
