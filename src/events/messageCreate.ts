import { EmbedBuilder } from 'discord.js';
import Args from '../structures/Args';
import Event from '../structures/Event';

export default new Event({
    name: 'messageCreate',

    async run(client, message) {
        if (message.author.bot
            || !message.content.startsWith(client.prefix)
            || !message.guild
            || !message.member) {
            return;
        }

        const [name, ...values] = message.content
            .slice(client.prefix.length)
            .split(/ +/g);
        const command = client.commands.find((c) => {
            return [c.alias, c.name].includes(name!);
        });

        if (!command) {
            return;
        }

        client.embeds = [];

        if (command.category === 'development'
            && message.author.id !== client.application.owner?.id) {
            return;
        }
        if (command.permissions.length) {
            const errorInfo = new EmbedBuilder();
            const permissions = message.member.permissions;

            if (!permissions.has('Administrator')) {
                const missing = command.permissions.filter((p) => {
                    return !permissions.has(p);
                });

                if (missing.length) {
                    errorInfo.setDescription(
                        `**You do not have the required permissions:**` +
                        `\n${missing
                            .map((p) => {
                                return `\`${p}\``;
                            })
                            .join(', ')}`
                    );

                    client.embeds.push(errorInfo);
                }
            }
        }
        if (!client.embeds.length) try {
            const args = new Args(client, message, command, values);

            await command.run(client, message, args);
        } catch (error: any) {
            const errorInfo = new EmbedBuilder();
            const usagesInfo = new EmbedBuilder();

            errorInfo.setDescription(error.message);
            usagesInfo.setDescription(command.getUsages(client.prefix)!);

            client.embeds.push(errorInfo, usagesInfo);
        }

        message.reply({
            embeds: client.embeds
        });
    }
});
