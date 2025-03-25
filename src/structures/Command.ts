import type { Message } from 'discord.js';

import Args, { type Arg } from './Args';
import type Client from './Client';

export default class Command {
    public alias: string;
    public args: Arg[];
    public category!: string;
    public name: string;

    public run: (client: Client<true>, message: Message, args: Args) => void;

    constructor(options: Omit<Command, 'category' | 'usages'>) {
        const { alias, args, name, run } = options;

        this.alias = alias;
        this.args = args;
        this.name = name;
        this.run = run;
    }

    public get usages() {
        return [`${this.name} ${this.args?.map((a) => {
            return a.required ? `<${a.name}>` : `[${a.name}]`;
        }).join(' ') ?? ''}`];
    }
}
