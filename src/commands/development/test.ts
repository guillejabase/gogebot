import { EmbedBuilder } from 'discord.js';

import Command from '../../structures/Command';

export default new Command({
    name: 'test',
    alias: 't',
    permissions: [],
    args: [{
        name: 'a1',
        type: 'boolean',
        required: true
    }],

    async run(client, message, args) {
        const arg = await args.get<'boolean'>(0);
        const embed = new EmbedBuilder();

        embed.setDescription(`${arg}`);

        client.embeds.push(embed);
    }
});
