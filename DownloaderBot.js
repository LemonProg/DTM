const TorrentSearchApi      = require('torrent-search-api');
const { qBittorrentClient } = require('@robertklep/qbittorrent');
const config = require('./config');

// QBittorent Connexion
const client = new qBittorrentClient(config.qbt_host, 'admin', config.qbt_password);

// Discord needed libs
const discord = require('discord.js');
const { Events, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const intents = new discord.IntentsBitField(3276799)
const bot = new discord.Client({intents});

// reference my needed variables to access them everywhere in the code
let providerList = ["Torrent9", "ThePirateBay", "1337x"];
let searchList = [];
let magnets = []
let choosedMagnet;

bot.login(config.token);

bot.on('ready', async () => {
    console.log("Started !");
    bot.on(Events.MessageCreate, async interaction => {
        if (interaction.content === '!provider') {
            const options = [];
            // Creating a select menu for the providers
            providerList.forEach(provider => {
                const option = {
                    label: provider,
                    value: provider,
                };
                    options.push(option);
            });

            const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('select')
                .setPlaceholder('Select the provider')
                .addOptions(options)
            );
    
            await interaction.reply({ components: [row] });
        }
    });

    bot.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isStringSelectMenu()) return;

        // Asking for the user type !searchTorrent
        if (providerList.includes(interaction.values[0])) {
            TorrentSearchApi.enableProvider(interaction.values);
            let currentProvider = TorrentSearchApi.getActiveProviders();
            await interaction.reply(`Now enter **!search torrentName** to search on ${currentProvider[0].name}`);
        } else {
            // When the user select a torrent from the list after the search
            choosedMagnet = magnets[interaction.values[0]];

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`d`)
                        .setLabel('Download !')
                        .setStyle(ButtonStyle.Success),
                );
            const cancel = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`c`)
                        .setLabel('Cancel !')
                        .setStyle(ButtonStyle.Danger),
                );

            await interaction.reply({ 
                components: [row]
            });
            await interaction.channel.send({ 
                components: [cancel]
            });
        }
    });
    bot.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isButton()) return;

        // Confirm button to download or cancel
        if (interaction.customId[0] == "d") {
            client.torrents.add(choosedMagnet);

            await interaction.reply(`Use **!download** to see the infos of *${searchList[magnets.indexOf(choosedMagnet)].label}*`);
        } else {
           await interaction.reply('Torrent Cancelled !');
        }


    });

    bot.on(Events.MessageCreate, async searchQuery => {
        if (searchQuery.content.startsWith('!search')) {
            const isProviderActive = TorrentSearchApi.getActiveProviders()
            if (isProviderActive.length === 0) {
                searchQuery.reply('You have to use **!provider** before using this command');
            } else {
                // Verifing if a search already exist
                if (searchList.length > 1) {
                    // clear the old list of result
                    searchList = [];
                } 
                if (magnets.length > 1) {
                    // clear the old list of magnets for the result
                    magnets = [];
                }

                searchQuery.reply('Searching...')

                // Cutting the '!search torrentName' string to return only 'torrentName'
                query = searchQuery.content.substring(8);

                // Searching torrent on the selected provider
                TorrentSearchApi.search(query, 'All', 10)
                    .then(torrents => {
                        if (torrents.length === 0 || torrents[0].size === "0 B") {
                            searchQuery.reply("No result !");
                        } else {
                            // Creating a select menu to choose the torrent from the search response
                            const searched = new StringSelectMenuBuilder()
                                        .setCustomId('select')
                                        .setPlaceholder('Select your torrent')

                            // for loop to set all of the returned torrents to the select menu options
                            for (let i = 0; i < torrents.length; i++) {
                                TorrentSearchApi.getMagnet(torrents[i])
                                .then(async magnet =>  {
                                    magnets.push(magnet);
                                    searchList.push({ 
                                        label: `${torrents[i].title}`, 
                                        description: `${torrents[i].size} GB | ${torrents[i].seeds} seeds`,
                                        value: `${i}`});

                                    await searched.addOptions(searchList[i]);

                                    if (i === 0) {
                                        // Send the select menu and the number of result to the discord server
                                        const torrentsMenu = new ActionRowBuilder()
                                            .addComponents(searched);
                                    
                                        await searchQuery.reply({content: `${searchList.length} Result !` ,components: [torrentsMenu] });
                                    }
                                    });
                            };
                        }
                    });
                    
            }

        }
    });
});
