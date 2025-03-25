import { Client as Discord, type ClientOptions, Collection, type EmbedBuilder } from 'discord.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';

import type Command from './Command';

export default class Client<R extends boolean> extends Discord<R> {
    public commands = new Collection<string, Command>();
    public commandPath?: string;
    public embeds: EmbedBuilder[] = [];
    public eventPath?: string;
    public prefix: string;

    constructor(options: ClientOptions & { prefix: string; }) {
        super(options);

        this.prefix = options.prefix;
    }

    private clearCache(path: string) {
        const resolved = require.resolve(path);

        if (require.cache[resolved]) {
            delete require.cache[resolved];
        }
    }

    public async loadCommands(path: string) {
        this.commands.clear();

        const directories = readdirSync(path);

        for (const directory of directories) {
            const files = readdirSync(`${path}/${directory}`);

            for (const file of files) {
                this.commandPath = resolve(`${path}/${directory}/${file}`);

                this.clearCache(this.commandPath);

                const module = await import(this.commandPath);
                const command = module.default;

                command.category = directory;

                this.commands.set(command.name, command);
            }
        }
    }
    public async loadEvents(path: string) {
        this.removeAllListeners();

        const files = readdirSync(path);

        for (const file of files) {
            this.eventPath = resolve(`${path}/${file}`);

            this.clearCache(this.eventPath);

            const module = await import(this.eventPath);
            const event = module.default;

            this.on(event.name, (...args) => event.run(this as Client<true>, ...args));
        }
    }
}
