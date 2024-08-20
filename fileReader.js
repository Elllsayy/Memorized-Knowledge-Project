const { group } = require("console");
const Papa = require('papaparse');
const fs = require("fs").promises;

fs.readFile('ch_stats.csv', 'utf8', (err, data) => {
    if(err) {
        console.error('Erreur lors de la lecture du fichier :', err);
        return;
    }

    Papa.parse(data, {
        
    });


});