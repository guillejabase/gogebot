import Event from '../structures/Event';

export default new Event({
    name: 'ready',

    async run(client) {
        client.application.fetch();

        console.log('Logged in as', `${client.user.username}#${client.user.discriminator}`);
    }
});
