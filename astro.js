const { channels, staffRoles, unregisterRoles, welcomeSound, staffSound, tokens } = require("./settings.json");
const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");

tokens.forEach((token, i) => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  const player = createAudioPlayer();

  client.on("ready", async () => {
    let connection;
    const channel = client.channels.cache.get(channels[i]);
    if (channel && channel.isVoiceBased()) {
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      connection.subscribe(player);
    }
  });

  client.on("voiceStateUpdate", async (oldState, newState) => {
    if (
      (oldState.channelId && !newState.channelId) ||
      (oldState.channelId && newState.channelId && oldState.channelId === newState.channelId) ||
      newState.member.user.bot ||
      newState.channelId !== channels[i]
    ) return;

    const hasStaff = newState.channel.members.some((x) => staffRoles.some((r) => x.roles.cache.has(r)));
    const staffSize = newState.channel.members.filter((x) => staffRoles.some((r) => x.roles.cache.has(r))).size;
    const unregisterSize = newState.channel.members.filter((x) => unregisterRoles.some((r) => x.roles.cache.has(r))).size;

    if (!hasStaff && unregisterSize === 1) {
      const resource = createAudioResource(welcomeSound);
      player.play(resource);
    } else if (hasStaff && staffSize === 1 && unregisterSize === 1) {
      const resource = createAudioResource(staffSound);
      player.play(resource);
    }
  });

  client.on("ready", async () => {
    client.user.setPresence({ activities: [{ name: "Astro Was Here ❤️" }], status: "dnd" });
  });

  client.login(token).then(() => console.log(`${client.user.tag} Aktif!`)).catch(() => console.error(`${token} Tokeni aktif edilemedi!`));
});