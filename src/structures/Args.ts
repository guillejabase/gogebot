import type { Channel, GuildMember, Message, Role, User } from 'discord.js';

interface BaseArg {
    name: string;
    required: boolean;
}
interface BooleanArg extends BaseArg {
    default?: boolean;
    type: 'boolean';
}
interface ChannelArg extends BaseArg {
    default?: boolean;
    type: 'channel';
}
interface MemberArg extends BaseArg {
    default?: boolean;
    type: 'member';
}
interface NumberArg extends BaseArg {
    default?: number;
    float?: boolean;
    range?: {
        maximum?: number;
        minimum: number;
    };
    type: 'number';
}
interface RoleArg extends BaseArg {
    default?: boolean;
    type: 'role';
}
interface StringArg extends BaseArg {
    default?: string;
    length?: {
        maximum?: number;
        minimum?: number;
    };
    multi?: boolean;
    type: 'string';
}
interface UserArg extends BaseArg {
    default?: boolean;
    type: 'user';
}

export type Arg =
    | BooleanArg
    | ChannelArg
    | MemberArg
    | NumberArg
    | RoleArg
    | StringArg
    | UserArg;
export type ArgType<T extends Arg['type']> =
    T extends 'boolean' ? boolean :
    T extends 'channel' ? Channel :
    T extends 'member' ? GuildMember :
    T extends 'number' ? number :
    T extends 'role' ? Role :
    T extends 'string' ? string :
    T extends 'user' ? User :
    undefined;

export default class Args {
    constructor(private message: Message, private schema: Arg[] = [], private values: string[] = []) {
        this.values = this.process(this.schema, values);
    }

    private process(schema: Arg[], values: string[]) {
        if (!schema) {
            return values;
        }

        return schema.reduce((processed, arg, index) => {
            if (arg.type == 'string' && arg.multi) {
                processed.push(values.slice(index).join(' '));
            } else {
                processed.push(values[index] ?? '');
            }

            return processed;
        }, [] as string[]);
    }
    private convert(arg: Arg, value: string) {
        const guild = this.message.guild;

        switch (arg.type) {
            case 'boolean':
                const yes = ['true', 't', 'yes', 'y'];
                const not = ['false', 'f', 'no', 'not', 'n'];

                if (yes.includes(value.toLowerCase())) {
                    return true;
                }
                if (not.includes(value.toLowerCase())) {
                    return false;
                }

                throw new Error(`Expected one of: ${yes.join(', ')}, ${not.join(', ')}`);
            case 'channel':
                if (!value && arg.default) {
                    return this.message.channel;
                }
                if (!guild) {
                    throw new Error(`This command must be run in a guild context.`);
                }

                const channelId = value.replace(/\\<#(\d+)>/, '$1');

                if (/^\d+$/.test(channelId)) {
                    try {
                        return guild.channels.cache.get(channelId)!; //=> Change .get() for .fetch() (async required)
                    } catch {
                        throw new Error(`Could not find channel with such identifier.`);
                    }
                } else {
                    const search = value.toLowerCase();

                    const channel = guild.channels.cache.find((channel) => {
                        return channel.name.toLowerCase().includes(search);
                    });

                    if (channel) {
                        return channel;
                    } else {
                        throw new Error(`Could not found channel with matching name.`);
                    }
                }
            case 'member':
                if (!value && arg.default) {
                    return this.message.member!;
                }

                const memberId = value.replace(/\\<@!?(\d+)>/, '$1');

                if (!guild) {
                    throw new Error(`This command must be run in a guild context.`);
                }
                if (/^\d+$/.test(memberId)) {
                    try {
                        return guild.members.cache.get(memberId)!; //=> Change .get() for .fetch() (async required)
                    } catch {
                        throw new Error(`Could not find member with such identifier.`);
                    }
                } else {
                    const search = value.toLowerCase();

                    const member = guild.members.cache.find((member) => {
                        return member.nickname?.toLowerCase().includes(search)
                            || member.user.globalName?.toLowerCase().includes(search)
                            || member.user.username.toLowerCase().includes(search);
                    });

                    if (member) {
                        return member;
                    } else {
                        throw new Error(`Could not found member with matching name.`);
                    }
                }
            case 'number':
                const number = Number(value);

                if (isNaN(number)) {
                    throw new Error('Invalid number value.');
                }
                if (!arg.float && !Number.isInteger(number)) {
                    throw new Error('Expected an integer but got a decimal.');
                }
                if (arg.range) {
                    const { maximum, minimum } = arg.range;

                    if (maximum && number > maximum) {
                        throw new Error(`Expected a number less than or equal to ${maximum}, but got ${number}.`);
                    }
                    if (minimum && number < minimum) {
                        throw new Error(`Expected a number greater than or equal to ${minimum}, but got ${number}.`);
                    }
                }

                return number;
            case 'role':
                if (!value && arg.default) {
                    return this.message.member!.roles.highest!;
                }

                const roleId = value.replace(/\\<@!?(\d+)>/, '$1');

                if (!guild) {
                    throw new Error(`This command must be run in a guild context.`);
                }
                if (/^\d+$/.test(roleId)) {
                    try {
                        return guild.roles.cache.get(roleId)!; //=> Change .get() for .fetch() (async required)
                    } catch {
                        throw new Error(`Could not find role with such identifier.`);
                    }
                } else {
                    const search = value.toLowerCase();

                    const role = guild.roles.cache.find((role) => {
                        return role.name?.toLowerCase().includes(search);
                    });

                    if (role) {
                        return role;
                    } else {
                        throw new Error(`Could not found role with matching name.`);
                    }
                }
            case 'string':
                if (arg.length) {
                    const { maximum, minimum } = arg.length;

                    if (maximum && value.length > maximum) {
                        throw new Error(`Expected no more than ${maximum} characters, but got ${value.length}.`);
                    }
                    if (minimum && value.length < minimum) {
                        throw new Error(`Expected at least ${minimum} characters, but got ${value.length}.`);
                    }
                }

                return value;
            case 'user':
                if (!value && arg.default) {
                    return this.message.author;
                }

                const userId = value.replace(/<@!?(\d+)>/, '$1');

                if (/^\d+$/.test(userId)) {
                    try {
                        return this.message.client.users.cache.get(userId)!; //=> Change .get() for .fetch() (async required)
                    } catch {
                        throw new Error('Could not find user with such identifier.');
                    }
                } else {
                    if (!guild) {
                        throw new Error('This command must be run in a guild context.');
                    }

                    const search = value.toLowerCase();
                    const member = guild.members.cache.find((m) => {
                        return m.user.globalName?.toLowerCase().includes(search)
                            || m.user.username.toLowerCase().includes(search)
                            || m.nickname?.toLowerCase().includes(search);
                    });

                    if (member) {
                        return member.user;
                    } else {
                        throw new Error(`Could not found user with matching name.`);
                    }
                }
        }
    }

    public get<T extends Arg['type']>(index: number) {
        const arg = this.schema[index];

        if (!arg) {
            throw new Error(
                '**Arguments process error:**' +
                '\n\`Invalid argument index.\`' +
                '\n-# \`Review code.\`'
            );
        }

        const value = this.values[index];

        if (!value && !arg.required && arg.default != undefined) {
            return this.convert(arg, '') as ArgType<T>;
        }
        if (arg.required && !value) {
            throw new Error(`**Missing argument:** \`${arg.name}\``);
        }

        try {
            return (value ? this.convert(arg, value) : undefined) as ArgType<T>;
        } catch (error: any) {
            throw new Error(
                `**Invalid argument:** \`${arg.name}\`` +
                `\n**${error.message}**`
            );
        }
    }
}
