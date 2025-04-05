import { EmbedBuilder } from 'discord.js';

import Command from '../../structures/Command';

export default new Command({
    name: 'reload',
    alias: 'r',
    permissions: [],
    args: [],

    async run(client, message, args) {
        const reloadInfo = new EmbedBuilder();

        client.embeds.push(reloadInfo);
    }
});
