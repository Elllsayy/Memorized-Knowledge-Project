const Papa = require('papaparse');
const fs = require('fs');

// Fonction pour lire le fichier CSV et retourner une Map avec les personnages
function parseCharactersStats(filePath, callback) {
    let characterName = [];
    const BattleStats = new Map();
    
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

                    let stats = {
                        HP: data['HP-B'] || 'Non défini',
                        MP: data['MP-B'] || 'Non défini',
                    };

                    BattleStats.set(name, stats);
                });

                if (characterName.length === 0) {
                    console.error('Aucun personnage n\'a été chargé.');
                } else {
                    console.log('Personnages chargés :', characterName);
                }

                callback(BattleStats, characterName);
            }
        });
    });
}

module.exports = { parseCharactersStats };