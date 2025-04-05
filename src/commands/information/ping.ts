import { EmbedBuilder } from 'discord.js';

import Command from '../../structures/Command';

export default new Command({
    name: 'ping',
    alias: 'p',
    permissions: [],
    args: [],

    async run(client, message, args) {
        const pingInfo = new EmbedBuilder();

        pingInfo.setTitle('Ping Info');
        pingInfo.setDescription(
            `**Web Socket:** \`${client.ws.ping} ms\`` +
            `\n**Time Response:** \`${Date.now() - message.createdTimestamp} ms\``
        );

        client.embeds.push(pingInfo);
    }
});
