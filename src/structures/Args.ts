import type { GuildBasedChannel, GuildMember, Message, Role, User } from 'discord.js';

import type Command from './Command';
import type Client from './Client';

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
interface CommandArg extends BaseArg {
    default?: boolean;
    type: 'command';
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
    | CommandArg
    | MemberArg
    | NumberArg
    | RoleArg
    | StringArg
    | UserArg;
export type ArgType<T extends Arg['type']> =
    T extends 'boolean' ? boolean :
    T extends 'channel' ? GuildBasedChannel :
    T extends 'command' ? Command :
    T extends 'member' ? GuildMember :
    T extends 'number' ? number :
    T extends 'role' ? Role :
    T extends 'string' ? string :
    T extends 'user' ? User :
    undefined;

export default class Args {
    constructor(private client: Client<true>, private message: Message, private command: Command, private values: string[] = []) {
        this.values = this.process(this.command.args, values);
    }

    private process(args: Arg[], values: string[]) {
        if (!args) {
            return values;
        }

        return args.reduce((processed, arg, index) => {
            if (arg.type === 'string' && arg.multi) {
                processed.push(values.slice(index).join(' '));
            } else {
                processed.push(values[index] || '');
            }

            return processed;
        }, [] as string[]);
    }
    private async convert(arg: Arg, value?: string) {
        const guild = this.message.guild;
        const member = this.message.member;

        if (!guild || !member) {
            return;
        }

        switch (arg.type) {
            case 'boolean':
                if (!value && arg.default) {
                    value = arg.default.toString();
                }

                const yes = ['true', 't', 'yes', 'y'];
                const not = ['false', 'f', 'no', 'not', 'n'];

                if (yes.includes(value!.toLowerCase())) {
                    return true;
                }
                if (not.includes(value!.toLowerCase())) {
                    return false;
                }

                throw new Error(`Expected one of: ${yes.join(', ')}, ${not.join(', ')}.`);
            case 'channel':
                if (!value && arg.default) {
                    return this.message.channel;
                }

                const channelId = value!.replace(/\\<#(\d+)>/, '$1');

                if (/^\d+$/.test(channelId)) {
                    try {
                        return guild.channels.cache.get(channelId)!
                            || await guild.channels.fetch(channelId);
                    } catch {
                        throw new Error('Could not find channel with such identifier.');
                    }
                } else {
                    const search = value!.toLowerCase();
                    const channel = guild.channels.cache.find((c) => {
                        return c.name.toLowerCase().includes(search);
                    });

                    if (!channel) {
                        throw new Error('Could not found channel with matching name.');
                    }

                    return channel;
                }
            case 'command':
                if (!value && arg.default) {
                    return this.command.name;
                }

                const command = this.client.commands.find((c) => {
                    return [c.alias, c.name].includes(value!);
                });

                if (!command
                    || (command.category === 'development'
                        && member.user.id !== this.client.application.owner?.id)) {
                    throw new Error('Could not found command with such name or alias.');
                }

                return command;
            case 'member':
                if (!value && arg.default) {
                    return this.message.member!;
                }

                const memberId = value!.replace(/\\<@!?(\d+)>/, '$1');

                if (/^\d+$/.test(memberId)) {
                    try {
                        return guild.members.cache.get(memberId)!
                            || await guild.members.fetch(memberId);
                    } catch {
                        throw new Error('Could not find member with such identifier.');
                    }
                } else {
                    const search = value!.toLowerCase();
                    const member = guild.members.cache.find((m) => {
                        return m.nickname?.toLowerCase().includes(search)
                            || m.user.globalName?.toLowerCase().includes(search)
                            || m.user.username.toLowerCase().includes(search);
                    });

                    if (!member) {
                        throw new Error('Could not found member with matching name.');
                    }

                    return member;
                }
            case 'number':
                if (!value && arg.default) {
                    value = arg.default.toString();
                }

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

                const roleId = value!.replace(/\\<@!?(\d+)>/, '$1');

                if (/^\d+$/.test(roleId)) {
                    try {
                        return guild.roles.cache.get(roleId)!
                            || await guild.roles.fetch(roleId);
                    } catch {
                        throw new Error('Could not find role with such identifier.');
                    }
                } else {
                    const search = value!.toLowerCase();
                    const role = guild.roles.cache.find((r) => {
                        return r.name.toLowerCase().includes(search);
                    });

                    if (!role) {
                        throw new Error('Could not found role with matching name.');
                    }

                    return role;
                }
            case 'string':
                if (!value && arg.default) {
                    value = arg.default;
                }
                if (arg.length) {
                    const { maximum, minimum } = arg.length;

                    if (maximum && value!.length > maximum) {
                        throw new Error(`Expected no more than ${maximum} characters, but got ${value!.length}.`);
                    }
                    if (minimum && value!.length < minimum) {
                        throw new Error(`Expected at least ${minimum} characters, but got ${value!.length}.`);
                    }
                }

                return value!;
            case 'user':
                if (!value && arg.default) {
                    return this.message.author;
                }

                const userId = value!.replace(/<@!?(\d+)>/, '$1');

                if (/^\d+$/.test(userId)) {
                    try {
                        return this.client.users.cache.get(userId)!
                            || await this.client.users.fetch(userId);
                    } catch {
                        throw new Error('Could not find user with such identifier.');
                    }
                } else {
                    const search = value!.toLowerCase();
                    const member = guild.members.cache.find((m) => {
                        return m.user.globalName?.toLowerCase().includes(search)
                            || m.user.username.toLowerCase().includes(search)
                            || m.nickname?.toLowerCase().includes(search);
                    });

                    if (!member) {
                        throw new Error('Could not found user with matching global name, username or nickname.');
                    }

                    return member.user;
                }
        }
    }

    public async get<T extends Arg['type']>(index: number) {
        const arg = this.command.args[index];

        if (!arg) {
            throw new Error(
                '**Arguments process error:** \`Invalid argument index.\`' +
                '\n-# \`Review code.\`'
            );
        }

        const value = this.values[index];

        if (!value && !arg.required && arg.default != undefined) {
            const converted = await this.convert(arg);

            return converted as ArgType<T>;
        }
        if (arg.required && !value) {
            throw new Error(`**Missing argument:** \`${arg.name}\``);
        }

        try {
            const converted = value ? await this.convert(arg, value) : undefined;

            return converted as ArgType<T> | undefined;
        } catch (error: any) {
            throw new Error(
                `**Invalid argument:** \`${arg.name}\`` +
                `\n-# \`${error.message}\``
            );
        }
    }
}
