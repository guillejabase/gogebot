import type { ClientEvents } from 'discord.js';

import type Client from './Client';

export default class Event<K extends keyof ClientEvents> {
    public name: K;

    public run: (client: Client<true>, ...args: ClientEvents[K]) => Promise<void>;

    constructor(options: Event<K>) {
        const { name, run } = options;

        this.name = name;
        this.run = run;
    }
}
