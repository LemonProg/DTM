const discord = require('discord.js');
const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const api = require('qbittorrent-api-v2');

const config = require('./config');

const intents = new discord.IntentsBitField(3276799)
const bot = new discord.Client({intents});

bot.login(config.token2);

bot.on('ready', async () => {
    api.connect('http://127.0.0.1:8080', 'admin', 'PUT UR PASSWORD')
        .then(qbt => {
                const channel = bot.channels.cache.get('1079799579211468852');
                console.log("En ligne !");
                bot.on(Events.MessageCreate, async interaction => {
                    if (interaction.content === '!download') {
                        interaction.reply('0.0% | 0.0 Mo/s | ∞')
                        .then(async replyId => {
                                msg = await channel.messages.fetch(replyId.id);
            
                                if (msg) {
                                    function editMsg(pour100, speed, time) {
                                        msg.edit(pour100 + " / " + speed + " / " + time);
                                        // console.log(pour100 + " / " + speed + " / " + time);
                                    }
                                    function editTunel() {
                                        qbt.torrents()
                                            .then(torrents => {
                                                const pourcentage = (torrents[0].completed / torrents[0].size) * 100;
                                                const dl = torrents[0].dlspeed / (1024 * 1024);
                                
                                                let speedDL = dl.toFixed(1) + " Mo/s";
                                                let pourcentageFinal = pourcentage.toFixed(1) + "%";
                
                                                const timeLeft =  torrents[0].eta
                                                const hours = Math.floor(timeLeft / 3600);
                                                const minutes = Math.floor(timeLeft / 60);
                                                let timeLeftFinal;

                                                if (hours >= 1) {
                                                    timeLeftFinal = hours + "h " + minutes + "m";
                                                } else {
                                                    timeLeftFinal = minutes + " min";
                                                }
                                                editMsg(pourcentageFinal, speedDL, timeLeftFinal);
                                                
                                                if (torrents[0].state == "pausedDL") {
                                                    clearInterval(x);
                                                }
                                            });
                                    }
                                    const x = setInterval(editTunel, 1000);
                                } else {
                                    console.log("no msg");
                                }

                            })
                    }
                    if (interaction.content === '!resume') {
                        interaction.reply('Download Resumed !')
                        .then(
                            qbt.torrents()
                                .then(torrents => {
                                    const currentHash = torrents[0].hash;
                                    qbt.resumeTorrents(currentHash);

                                    function editMsg(pour100, speed, time) {
                                        msg.edit(pour100 + " / " + speed + " / " + time);
                                        // console.log(pour100 + " / " + speed + " / " + time);
                                    }
                                    function editTunel() {
                                        qbt.torrents()
                                            .then(torrents => {
                                                const pourcentage = (torrents[0].completed / torrents[0].size) * 100;
                                                const dl = torrents[0].dlspeed / (1024 * 1024);
                                
                                                let speedDL = dl.toFixed(1) + " Mo/s";
                                                let pourcentageFinal = pourcentage.toFixed(1) + "%";

                                                const timeLeft =  torrents[0].eta
                                                const hours = Math.floor(timeLeft / 3600);
                                                const minutes = Math.floor(timeLeft / 60);
                                                let timeLeftFinal;

                                                if (hours >= 1) {
                                                    timeLeftFinal = hours + "h " + minutes + "m";
                                                } else {
                                                    timeLeftFinal = minutes + " min";
                                                }
                                                editMsg(pourcentageFinal, speedDL, timeLeftFinal);
                
                                                if (torrents[0].state == "pausedDL") {
                                                    clearInterval(x);
                                                }
                                            });
                                    }
                                    x = setInterval(editTunel, 1000);
                                })
                            )
                    }
                    if (interaction.content === '!pause') {
                        interaction.reply('Download Paused !')
                        .then(
                            qbt.torrents()
                                .then(torrents => {
                                    const currentHash = torrents[0].hash;
                                    qbt.pauseTorrents(currentHash);
                                })
                            )
                    }
                    if (interaction.content === '!delete') {
                        interaction.reply('Download Deleted !')
                        .then(
                            qbt.torrents()
                                .then(torrents => {
                                    const currentHash = torrents[0].hash;
                                    qbt.deleteTorrents(currentHash);
                                })
                            )
                    }
                });
            })
            .catch(err => {
                console.error(err)
            })
});