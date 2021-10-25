import express, { NextFunction, Request, Response } from 'express'
import Bot from '../../bot/bot'
import getUserAvatar from '../../bot/functions/getUserAvatar'
import database from '../../database/database'
import { Op } from 'sequelize'
import { TextChannel } from 'discord.js'
import saveFilesToTemp from '../../utils/saveFIlesToTemp'
import uploadToCatbox from '../../utils/uploadToCatbox'
import clearTemp from '../../utils/clearTemp'

export default class MainRouter {
    public router: express.Router
    private client: Bot
    private db: database
    constructor(db: database) {
        this.db = db
        this.client = new Bot()
        this.router = express.Router()
        this.init()
    }

    async init() {
        await this.client.start()

        this.registerRoutes()
    }

    private registerRoutes() {
        this.router.get('/app', this.isAuthed, async (req: Request, res: Response) => {
            const u = (req.user as any).dataValues
            const a = await getUserAvatar(this.client, u.id)
            const guilds = await this.getGuilds(u.id)
            return res.render('app', {
                auth: true,
                id: u.id,
                username: u.username,
                email: u.email,
                guilds,
                avatar: a,
            })
        })

        this.router.get('/app/:serverId', this.isAuthed, async (req: Request, res: Response) => {
            const serverId = req.params.serverId
            if(!serverId) return res.redirect('/')
            else {
                const u = (req.user as any).dataValues
                const a = await getUserAvatar(this.client, u.id)
                const [channels, server] = await this.getChannels(serverId)
                if(channels === null || server === null) {
                    return res.redirect('https://discord.com/api/oauth2/authorize?client_id=891759834268074065&permissions=0&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Fauth%2Fredirect&scope=bot')
                }
                return res.render('channelselect', {
                    auth: true,
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    channels,
                    server,
                    avatar: a,
                })
            }
        })

        this.router.get('/app/:serverId/:channelId', this.isAuthed, async (req: Request, res: Response) => {
            const serverId = req.params.serverId
            const channelId = req.params.channelId
            if(!serverId || !channelId) return res.redirect('/')
            else {
                const u = (req.user as any).dataValues
                const a = await getUserAvatar(this.client, u.id)
                const [channels, server] = await this.getChannels(serverId)
                if(channels === null || server === null) {
                    return res.redirect('https://discord.com/api/oauth2/authorize?client_id=891759834268074065&permissions=0&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Fauth%2Fredirect&scope=bot')
                }
                const channel = channels.filter((c: TextChannel) => c.id === channelId)[0]
                return res.render('fileselect', {
                    auth: true,
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    channel,
                    server,
                    avatar: a,
                })
            }
        })

        this.router.post('/app/:serverId/:channelId/send', this.isAuthed, async (req: Request, res: Response) => {
            const serverId = req.params.serverId
            const channelId = req.params.channelId
            if(!serverId || !channelId) return res.redirect('/')
            const files = req.body.files
            const exts = req.body.exts
            if(!files || !exts) return res.status(401)
            console.log(` ❯ Recieved ${files.length} files! Working...`)
            await saveFilesToTemp(files, exts)
            const urls = await uploadToCatbox()
            clearTemp()
            await this.client.send((req.user as any).id, serverId, channelId, urls)
            return res.status(200).send()
        })

        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            if(req.user) return res.redirect('/app')
            else {
                return res.render('home', {
                    auth: false
                })
            }
        })
    }

    private async getGuilds(admin: string): Promise<any> {
        const { Guild } = this.db.models
        const found: any = await Guild.findAll({
            where: {
                admins: {
                    [Op.like]: `%${admin}%`
                }
            }
        })
        const r = []
        for(let i = 0; i < found.length; i++) {
            r.push(found[i].dataValues)
        }
        return r
    }

    private async getChannels(server: string): Promise<any> {
        try {
            const g = await this.client.guilds.fetch(server)
            let c: any = (await g.channels.cache)
            c = c.filter((ch: any) => ch.type == 'GUILD_TEXT')
            c = c.map((ch: any) => ch)
            for(let i = 0; i < c.length; i++) {
                c[i].guild = {}
                c[i].topic = null
            }
            return [c, {id: g.id, name: g.name, icon: g.icon != null ? 'https://cdn.discordapp.com/icons/' + g.id + '/' + g.icon + '.png' : `https://avatars.dicebear.com/api/identicon/${g.id}.svg`}]
        } catch(err) {
            return [null, null]
        }
    }

    private async getChannelName(server: string, channel: string): Promise<string | null> {
        try {
            const g = await this.client.guilds.fetch(server)
            return (await g.channels.fetch(channel) as TextChannel).name
        } catch(err) {
            return null
        }
    }


    private isAuthed(req: Request, res: Response, next: NextFunction) {
        if(req.user) next()
        else res.redirect('/auth')
    }
}