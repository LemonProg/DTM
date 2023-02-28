const TorrentSearchApi      = require('torrent-search-api');
const { qBittorrentClient } = require('@robertklep/qbittorrent');
const prompt                = require("prompt-sync")({sigint:true}); 

const client = new qBittorrentClient('http://127.0.0.1:8080', 'admin', 'PUT UR PASSWORD');

const providersList = ['Torrent9', 'ThePirateBay', '1337x'];
e = 0;
providersList.forEach(provider => {
    e++;
    console.log("(" + e + ") / " + provider);
});

let provider = prompt("Choose a provider : ");
provider = parseInt(provider);

if (provider <= 0 || provider > providersList.length || isNaN(provider)) {
    console.log("Choix impossible !");
    process.exit();
} else {
    TorrentSearchApi.enableProvider(providersList[provider-1]);
}


let query = prompt("Search for a film or a serie ? : ");
if (query == "") {
    console.log("Choix impossible !");
    process.exit();
}

let nbrQueryPrompt = prompt("How many result up ? (100 max) : ")
let nbrQuery = parseInt(nbrQueryPrompt);

if (nbrQuery > 100) {
    nbrQuery = 100;
} else if (nbrQuery <= 0 || isNaN(nbrQuery)) {
    nbrQuery = 1;
}

TorrentSearchApi.search(query, 'All', nbrQuery)
    .then(torrents => {
        if (torrents.length === 0) {
            console.log("No result !");
            process.exit();
        }

        i = 0;
        torrents.forEach(torrent => {
            i++;
            console.log("(" + i + ") / " + torrent.title + " | " + torrent.size + " | " + torrent.seeds + " seeds");
        });
        let torrentChoose = prompt("Select a torrent (1, 2, 3...) : ");
        torrentChoose = parseInt(torrentChoose);

        if (torrentChoose <= 0 || torrentChoose > nbrQuery || isNaN(torrentChoose)) {
            console.log("Incorrect choose !");
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
