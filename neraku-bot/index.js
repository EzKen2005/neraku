
const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const distube = new DisTube(client, {
    leaveOnEmpty: true,
    leaveOnStop: true,
    emitNewSongOnly: true,
    plugins: [
        new YtDlpPlugin(),
        new SpotifyPlugin({
            emitEventsAfterFetching: true,
        }),
        new SoundCloudPlugin()
    ]
});

client.on('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

client.on('messageCreate', async message => {
    if (!message.guild || message.author.bot) return;

    const args = message.content.trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === '!play') {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('Join a voice channel first!');
        const query = args.join(' ');
        if (!query) return message.reply('Provide a song name or link!');

        distube.play(voiceChannel, query, {
            textChannel: message.channel,
            member: message.member,
        });
    }

    if (command === '!stop') {
        distube.stop(message);
        message.channel.send('Stopped the music.');
    }

    if (command === '!skip') {
        distube.skip(message);
        message.channel.send('Skipped the song.');
    }
});

distube
    .on('playSong', (queue, song) =>
        queue.textChannel.send(`🎶 Playing: \`${song.name}\` - \`${song.formattedDuration}\``)
    )
    .on('addSong', (queue, song) =>
        queue.textChannel.send(`✅ Added: \`${song.name}\``)
    );

client.login(process.env.TOKEN);
