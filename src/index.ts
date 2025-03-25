import { ActivityType } from 'discord.js';

import Client from './structures/Client';

const client = new Client({
    allowedMentions: {
        repliedUser: false
    },
    intents: 53608447,
    prefix: '+',
    presence: {
        activities: [{
            name: '727',
            type: ActivityType.Watching
        }]
    }
});

client.loadCommands('./src/commands');
client.loadEvents('./src/events');
client.login(process.env.TOKEN!);
