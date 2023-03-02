const TorrentSearchApi      = require('torrent-search-api');
const { qBittorrentClient } = require('@robertklep/qbittorrent');
const prompt                = require("prompt-sync")({sigint:true}); 

const client = new qBittorrentClient(config.qbt_host, 'admin', config.qbt_password);

const providersList = ['Torrent9', 'ThePirateBay', '1337x'];
e = 0;
providersList.forEach(provider => {
    e++;
    console.log("(" + e + ") / " + provider);
});

let provider = prompt("Choisir un fournisseur : ");
provider = parseInt(provider);

if (provider <= 0 || provider > providersList.length || isNaN(provider)) {
    console.log("Choix impossible !");
    process.exit();
} else {
    TorrentSearchApi.enableProvider(providersList[provider-1]);
}


let query = prompt("Rechercher un(e) Film ou Serie ? : ");
if (query == "") {
    console.log("Choix impossible !");
    process.exit();
}

let nbrQueryPrompt = prompt("Combient de résultat maximum ? (100 max) : ")
let nbrQuery = parseInt(nbrQueryPrompt);

if (nbrQuery > 100) {
    nbrQuery = 100;
} else if (nbrQuery <= 0 || isNaN(nbrQuery)) {
    nbrQuery = 1;
}

TorrentSearchApi.search(query, 'All', nbrQuery)
    .then(torrents => {
        if (torrents.length === 0) {
            console.log("Aucun résultat !");
            process.exit();
        }

        i = 0;
        torrents.forEach(torrent => {
            i++;
            console.log("(" + i + ") / " + torrent.title + " | " + torrent.size + " | " + torrent.seeds + " seeds");
        });
        let torrentChoose = prompt("Veillez choisir un torrent (1, 2, 3...) : ");
        torrentChoose = parseInt(torrentChoose);

        if (torrentChoose <= 0 || torrentChoose > nbrQuery || isNaN(torrentChoose)) {
            console.log("Choix impossible !");
            process.exit();
        } else {
            TorrentSearchApi.getMagnet(torrents[torrentChoose-1])
            .then(magnet => {
                client.torrents.add(magnet);
                console.log(torrents[torrentChoose-1].title + " is now downloading !");
            })    
        }
    })
    .catch(err => {
        console.log(err);
    });
