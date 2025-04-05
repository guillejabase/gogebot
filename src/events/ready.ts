import Event from '../structures/Event';

export default new Event({
    name: 'ready',

    async run(client) {
        await client.application.fetch();

        console.log('Logged in as', `${client.user.username}#${client.user.discriminator}`);
    }
});
