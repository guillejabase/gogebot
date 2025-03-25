import { EmbedBuilder } from 'discord.js';
import Args from '../structures/Args';
import Event from '../structures/Event';

export default new Event({
    name: 'messageCreate',

    run(client, message) {
        if (message.author.bot || !message.content.startsWith(client.prefix)) {
            return;
        }

        const [name, ...args] = message.content
            .slice(client.prefix.length)
            .split(/ +/g);
        const command = client.commands.find((c) => {
            return [c.alias, c.name].includes(name!);
        });

        if (!command) {
            return;
        }

        client.embeds = [];

        if (command.category === 'development' && message.author.id !== client.application.owner?.id) {
            return;
        }

        try {
            command.run(client, message, new Args(message, command.args, args));
        } catch (error: any) {
            const embed1 = new EmbedBuilder().setDescription(error.message);
            const embed2 = new EmbedBuilder().setDescription(
                `\n**Usages:**` +
                `\n${command.usages
                    .map((u) => `\`${client.prefix}${u}\``)
                    .join('\n')}` +
                `\n-# \`<required> [optional]\``
            );

            client.embeds.push(embed1, embed2);
        }

        message.reply({
            embeds: client.embeds
        });
    }
});
