import type { Message, PermissionsString } from 'discord.js';

import Args, { type Arg } from './Args';
import type Client from './Client';

export default class Command {
    public alias: string;
    public args: Arg[];
    public category!: string;
    public name: string;
    public permissions: PermissionsString[];

    public run: (client: Client<true>, message: Message, args: Args) => Promise<void>;

    constructor(options: Omit<Command, 'category' | 'getUsages'>) {
        const { alias, args, name, permissions, run } = options;

        this.alias = alias;
        this.args = args;
        this.name = name;
        this.permissions = permissions;
        this.run = run;
    }

    public getUsages(prefix: string) {
        const usages = [`${this.name} ${this.args?.map((a) => {
            return a.required ? `<${a.name}:${a.type}>` : `[${a.name}:${a.type}]`;
        }).join(' ') ?? ''}`];

        return usages.length
            ? `\n**Usages**` +
            `\n${usages
                .map((u) => {
                    return `\`${prefix}${u}\``;
                })
                .join('\n')}` +
            `\n-# \`<required> [optional]\``
            : undefined;
    }
}
