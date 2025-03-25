import { EmbedBuilder } from 'discord.js';

import Command from '../../structures/Command';

export default new Command({
    name: 'user',
    alias: 'u',
    permissions: [],
    args: [{
        name: 'user',
        type: 'user',
        required: false,
        default: true
    }],

    async run(client, message, args) {
        const user = (await args.get<'user'>(0))!;
        const userInfo = new EmbedBuilder();

        userInfo.setThumbnail(user.avatarURL());
        userInfo.setDescription(
            `**Username:** \`${user.username}\`` +
            `\n**Identifier:** \`${user.id}\`` +
            `\n**Type:** \`${user.bot ? 'Bot' : user.system ? 'System' : 'Human'}\`` +
            (user.bot
                ? `\n**Discriminator:** \`${user.discriminator}\``
                : `\n**Global name:** ${user.globalName ? `\`${user.globalName}\`` : 'None'}`) +
            `\n**Created at:** <t:${Math.round(user.createdTimestamp / 1000)}>`
        );
        userInfo.setImage(user.bannerURL() || null);

        client.embeds.push(userInfo);

        const member = message.guild?.members.cache.get(user.id);

        if (member) {
            const memberInfo = new EmbedBuilder();

            memberInfo.setThumbnail(member.avatarURL());
            memberInfo.setDescription(
                `**Nickname:** ${member.nickname ? `\`${member.nickname}\`` : 'None'}` +
                `\n**Boosting:** ${member.premiumSinceTimestamp ? `\`Yes, since:\` <t:${Math.round(member.premiumSinceTimestamp / 1000)}>` : `\`No\``}` +
                `\n**Joined at:** <t:${Math.round(member.joinedTimestamp! / 1000)}>`
            );
            memberInfo.setImage(member.bannerURL());

            client.embeds.push(memberInfo);
        }
    }
});
