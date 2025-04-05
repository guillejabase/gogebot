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

        userInfo.setTitle('User Info');
        userInfo.setThumbnail(user.avatarURL({
            extension: 'png',
            forceStatic: true,
            size: 512
        }));
        userInfo.setFields({
            name: 'Username',
            value: `\`${user.username}\``,
            inline: true
        }, {
            name: 'Identifier',
            value: `\`${user.id}\``,
            inline: true
        }, {
            name: 'Type',
            value: `\`${user.bot ? 'Bot' : user.system ? 'System' : 'Human'}\``,
            inline: true
        }, {
            name: 'Global name',
            value: `\`${user.globalName || '`None`'}\``,
            inline: true
        }, {
            name: 'Discriminator',
            value: `\`${user.discriminator != '0' ? `#${user.discriminator}` : 'None'}\``,
            inline: true
        }, {
            name: 'Flags',
            value: `\`${user.flags?.toArray().length ? user.flags.toArray().join('\`, \`') : 'None'}\``,
            inline: true
        }, {
            name: 'Created at',
            value: `<t:${Math.round(user.createdTimestamp / 1000)}>`,
            inline: true
        });
        userInfo.setImage(user.bannerURL({
            extension: 'png',
            forceStatic: true,
            size: 1024
        }) || null);

        client.embeds.push(userInfo);

        const member = message.guild?.members.cache.get(user.id);

        if (member) {
            const memberInfo = new EmbedBuilder();

            memberInfo.setTitle('Member Info');
            memberInfo.setThumbnail(member.avatarURL({ extension: 'png', forceStatic: true, size: 512 }));
            memberInfo.setFields({
                name: 'Nickname',
                value: `\`${member.nickname || 'None'}\``,
                inline: true
            }, {
                name: 'Booster',
                value: `${member.premiumSinceTimestamp ? `\`Yes, since\` <t:${Math.round(member.premiumSinceTimestamp / 1000)}>` : '`No`'}`,
                inline: true
            }, {
                name: 'Joined at',
                value: `${member.joinedTimestamp ? `<t:${Math.round(member.joinedTimestamp / 1000)}>` : '`Discord integrated`'}`,
                inline: true
            });
            memberInfo.setImage(member.bannerURL({
                extension: 'png',
                forceStatic: true,
                size: 1024
            }));

            client.embeds.push(memberInfo);

            const presenceInfo = new EmbedBuilder();

            if (member.presence) {
                enum Status {
                    dnd = 'DoNotDisturb',
                    idle = 'Idle',
                    invisible = 'Invisible',
                    offline = 'Offline',
                    online = 'Online'
                }

                const type = {
                    0: 'Playing',
                    1: 'Streaming',
                    2: 'Listening',
                    3: 'Watching',
                    4: 'Custom',
                    5: 'Competing'
                } as const;
                const activities = member.presence.activities.filter((a) => type[a.type] !== 'Custom');
                const custom = member.presence.activities.find((a) => type[a.type] === 'Custom');

                presenceInfo.setTitle('Presence Info');
                presenceInfo.setDescription(
                    `**Status:** \`${Status[member.presence.status] || 'Offline'}\`` +
                    `\n**Custom status:** ${custom ? `${custom.emoji ? `${custom.emoji} ` : ''}${custom.state ? `\`${custom.state}\`` : ''}` : '`None`'}`
                );

                let count = 1;

                for (const activity of activities) {
                    presenceInfo.addFields({
                        name: `${count}- ${type[activity.type]} ${activity.name}`,
                        value:
                            `**State:** \`${activity.state || 'None'}\`` +
                            `\n**Details:** \`${activity.details || 'None'}\``,
                        inline: true
                    });

                    count++;
                }

                client.embeds.push(presenceInfo);
            }
        }
    }
});
