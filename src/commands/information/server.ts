import { EmbedBuilder, GuildFeature } from 'discord.js';

import Command from '../../structures/Command';

export default new Command({
    name: 'server',
    alias: 's',
    permissions: [],
    args: [],

    async run(client, message, args) {
        const guild = message.guild!;
        const serverInfo = new EmbedBuilder();

        serverInfo.setTitle('Server Info');
        serverInfo.setThumbnail(guild.iconURL({
            extension: 'png',
            forceStatic: true,
            size: 512
        }));
        serverInfo.setFields([{
            name: 'Name',
            value: `\`${guild.name}\``,
            inline: true
        }, {
            name: 'Identifier',
            value: `\`${guild.id}\``,
            inline: true
        }, {
            name: 'Description',
            value: `\`${guild.description || 'None'}\``,
            inline: true
        }, {
            name: 'Owner',
            value: `${await guild.fetchOwner()}`,
            inline: true
        }, {
            name: 'Features',
            value: `${guild.features
                .map((f) => {
                    const features = Object.fromEntries(
                        Object
                            .entries(GuildFeature)
                            .map(([key, value]) => {
                                return [value, key];
                            })
                    );

                    return features[f] ? `\`${features[f]}\`` : null;
                })
                .filter(Boolean)
                .join(', ')}`,
            inline: true
        }, {
            name: 'Created at:',
            value: `<t:${Math.round(guild.createdTimestamp / 1000)}>`,
            inline: true
        }]);

        client.embeds.push(serverInfo);
    }
});
