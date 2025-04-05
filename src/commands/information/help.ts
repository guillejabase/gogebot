import { EmbedBuilder } from 'discord.js';

import Command from '../../structures/Command';

export default new Command({
    name: 'help',
    alias: 'h',
    permissions: [],
    args: [{
        name: 'command',
        type: 'command',
        required: false
    }],

    async run(client, message, args) {
        const command = await args.get<'command'>(0);

        if (!command) {
            const listInfo = new EmbedBuilder();
            const categories = new Map<string, string[]>();

            listInfo.setTitle('Commands List');

            for (const object of client.commands.values()) {
                if (object.category === 'development') {
                    continue;
                }
                if (!categories.has(object.category)) {
                    categories.set(object.category, []);
                }

                categories.get(object.category)!.push(`\`${object.name}\``);
            }

            let list = '';

            for (const [category, names] of categories.entries()) {
                list += `**${client.toCase(category)}**` +
                    `\n${names.join(', ')}\n\n`;
            }

            listInfo.setDescription(list.trim());

            client.embeds.push(listInfo);
        } else {
            const commandInfo = new EmbedBuilder();

            commandInfo.setTitle('Command Info');
            commandInfo.setDescription(
                `**Name:** \`${command.name}\`` +
                `\n**Alias:** \`${command.alias}\``
            );

            client.embeds.push(commandInfo);

            const usages = command.getUsages(client.prefix);

            if (usages) {
                const usagesInfo = new EmbedBuilder();

                usagesInfo.setDescription(usages);

                client.embeds.push(usagesInfo);
            }
        }
    }
});
