# DTM
Discord-Torrents-Manager (DTM) is a vanilla javascript project to download and manage torrents from a discord server

Dependencies : 
- Discord JS API to communicate throught the discord server
- Torrent-search API to search torrents on severals providers
- qBittorent API to download the torrents

Use this command to install all dependencies
```bash
  npm install
```

Some issues :
- You can manage only one torrent (the last one that was imported), for the moment but i'll fix that !

# Setup
To run this project you have to create a config file:
```bash
  config.js
```
Now edit it with your favorite text editor and write :
```bash
  module.exports = {
    token: "put ur discord bot token",
    qbt_host: "127.0.0.1 (change it if needed)",
    qbt_password: "put ur qBittorent password"
}
```
Then, you just have to run :
```bash
  node DownloaderBot.js
  node ManagerBot.js
```

# CLI Version
You can run the downloader CLI version with :
```bash
  node DownloaderShell.js
```
It's exactly the same thing but it doesn't support the discord bot part

# Providers Custom
You can modify the providers list, torrent-api-search nativly includes :

- TorrentLeech: (need cookie authentification to work)
- IpTorrents: (need credentials and cookie authentification to work)
- Torrent9
- Torrentz2
- 1337x
- ThePirateBay
- YggTorrent (need credentials and cookie authentification to work)
- KickassTorrents
- Rarbg
- TorrentProject
- Yts
- Limetorrents
- Eztv

You just have to edit "*DownloaderBot.js*" : 
```bash
  let providerList = ["Torrent9", "ThePirateBay", "1337x", "ADD THEM LIKES THAT"]
```
If you need to add a specific provider that not inculded in the lib, go read the "*torrent-search-api*" npm package
