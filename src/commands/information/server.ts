import { EmbedBuilder, GuildFeature, GuildMFALevel, GuildNSFWLevel, GuildPremiumTier } from 'discord.js';

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
            name: 'MFA Level',
            value: `\`${Object
                .keys(GuildMFALevel)
                .find((k) => {
                    return GuildMFALevel[k as keyof typeof GuildMFALevel] == guild.mfaLevel;
                })}\``,
            inline: true
        }, {
            name: 'NSFW Level',
            value: `\`${Object
                .keys(GuildNSFWLevel)
                .find((k) => {
                    return GuildNSFWLevel[k as keyof typeof GuildNSFWLevel] == guild.nsfwLevel;
                })}\``,
            inline: true
        }, {
            name: 'Premium Tier',
            value: `\`${Object
                .keys(GuildPremiumTier)
                .find((k) => {
                    return GuildPremiumTier[k as keyof typeof GuildPremiumTier] == guild.premiumTier;
                })}\``,
            inline: true
        }, {
            name: 'Premium Subscriptions',
            value: `\`${guild.premiumSubscriptionCount || 0}\``,
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
        serverInfo.setImage(guild.bannerURL({
            extension: 'png',
            forceStatic: true,
            size: 1024
        }));

        client.embeds.push(serverInfo);
    }
});
