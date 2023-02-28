const TorrentSearchApi      = require('torrent-search-api');
const { qBittorrentClient } = require('@robertklep/qbittorrent');

const client = new qBittorrentClient('http://127.0.0.1:8080', 'admin', 'PUT UR PASSWORD');

const discord = require('discord.js');
const { Events, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('./config');
const intents = new discord.IntentsBitField(3276799)
const bot = new discord.Client({intents});

let providerList = ["Torrent9", "ThePirateBay", "1337x"];
let magnets = [];

bot.login(config.token);

bot.on('ready', async () => {
    console.log("Started !");
    bot.on(Events.MessageCreate, async interaction => {
        if (interaction.content === '!provider') {
            const options = [];
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

        if (providerList.includes(interaction.values[0])) {
            TorrentSearchApi.enableProvider(interaction.values);
            await interaction.reply('Now enter **!search torrentName** to search For a Film or a Serie');
        } else {
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

        if (interaction.customId[0] == "d") {
            client.torrents.add(magnets[0]);
    
            interaction.reply("Downloading...");
            await interaction.channel.send("Use **!download** to see the infos");
        } else {
           await interaction.reply('Download Cancelled !');
        }


    });

    TorrentSearchApi.enableProvider("ThePirateBay");

    bot.on(Events.MessageCreate, async searchQuery => {
        if (searchQuery.content.startsWith('!search')) {
            const isProviderActive = TorrentSearchApi.getActiveProviders()
            if (isProviderActive.length === 0) {
                searchQuery.reply('You have to use **!provider** before using this command');
            } else {
                searchQuery.reply('Searching...')
                                                                                                                                                                                                                                                                                                                                                                                             
                query = searchQuery.content.substring(8);

                TorrentSearchApi.search(query, 'All', 5)
                    .then(torrents => {
                        if (torrents.length === 0 || torrents[0].size === "0 B") {
                            searchQuery.reply("No result !");
                        } else {
                            let first = torrents[0];
                            TorrentSearchApi.getMagnet(first)
                            .then(async magnet =>  {
                                magnets = [magnet];
                                const searched = new ActionRowBuilder()
                                        .addComponents(
                                            new StringSelectMenuBuilder()
                                                .setCustomId('select')
                                                .setPlaceholder('Select your torrent')
                                                .addOptions({
                                                    label: `${first.title}`,
                                                    description: `Size: ${first.size} | Seeds: ${first.seeds}`,
                                                    value: `0`,
                                                })
                                        );

                                    await searchQuery.reply({ components: [searched] });
                            });
                        }
                    });
                    
            }

        }
    });
});