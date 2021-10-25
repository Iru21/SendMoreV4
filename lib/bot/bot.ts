import { Client, Intents, MessageEmbed, TextChannel } from 'discord.js'
import d from '../utils/d';
export default class Bot extends Client {
    constructor() {
        super({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] })
    }
    async start() {
        this.on('ready', () => {
            console.log(`Logged in as ${this.user!.tag}!`);
        });
        await this.login(process.env.BOT_TOKEN)
        // this.user?.setAvatar(d('../site/public/assets/logo.png'))
        // this.user?.setUsername("Send More")
    }
    async send(authorId: string, serverId: string, channelId: string, urls: string[]) {
        const channel = this.guilds.cache.get(serverId)!.channels.cache.get(channelId) as TextChannel
        if(!channel) return
        const images: [ string[],  string[], string[], string[], string[], string[], string[],  string[], string[], string[]] = [[], [], [], [], [], [], [], [], [], []]
        let w = 0
        for(let i = 0; i < urls.length; i++) {
            if(images[w].length == 5) w++
            images[w].push(urls[i])
        }
        const embed = new MessageEmbed()
            .setColor('#FE7491')
            .setTitle('New Batch')
            .addField('From', `<@${authorId}>`, true)
            .addField('# of files', urls.length.toString(), true)
            .addField('At', new Date().toISOString().replace("T", " ").split(".")[0], true)
        channel.send({embeds: [embed]}).catch(() => {/*ignore*/})
        for(let i = 0; i < images.length; i++) {
            if(images[i].length != 0) {
                setTimeout(()=>{
                    channel.send(`${images[i].join(`\n`)}`).catch(() => {/*ignore*/})
                }, 500)
            }
        }
        console.log(` ❯ Successfully sent to #${channel.name}!`)
    }
}