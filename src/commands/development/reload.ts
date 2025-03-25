import { EmbedBuilder } from 'discord.js';

import Command from '../../structures/Command';

export default new Command({
    name: 'reload',
    alias: 'r',
    args: [],

    run(client, message, args) {
        const embed = new EmbedBuilder();

        try {
            client.loadCommands(client.commandPath!);
            client.loadEvents(client.eventPath!);

            embed.setDescription(':white_check_mark:');
        } catch {
            embed.setDescription(':negative_squared_cross_mark:');
        }

        client.embeds.push(embed);
    }
});
