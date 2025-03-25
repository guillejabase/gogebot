import { EmbedBuilder } from 'discord.js';

import Command from '../../structures/Command';

export default new Command({
    name: 'ping',
    alias: 'p',
    args: [],

    run(client, message, args) {
        const embed = new EmbedBuilder();

        embed.setDescription(
            `**Web socket:** \`${client.ws.ping} ms\`` +
            `\n**Time response:** \`${Date.now() - message.createdTimestamp} ms\``
        );

        client.embeds.push(embed);
    }
});
