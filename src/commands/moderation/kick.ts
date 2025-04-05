import { EmbedBuilder } from 'discord.js';

import Command from '../../structures/Command';

export default new Command({
    name: 'kick',
    alias: 'k',
    permissions: [],
    args: [{
        name: 'member',
        type: 'member',
        required: true
    }],

    async run(client, message, args) {
        const kickInfo = new EmbedBuilder();

        kickInfo.setDescription(`**kick test**`);

        client.embeds.push(kickInfo);
    }
});
