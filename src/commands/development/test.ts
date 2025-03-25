import { EmbedBuilder } from 'discord.js';

import Command from '../../structures/Command';

export default new Command({
    name: 'test',
    alias: 't',
    args: [{
        name: 'member',
        type: 'member',
        required: true
    }],

    run(client, message, args) {
        const arg = args.get<'member'>(0);
        const embed = new EmbedBuilder();

        embed.setDescription(`${arg}`);

        client.embeds.push(embed);
    }
});
