import passport_discord, { Profile } from 'passport-discord'
import passport from 'passport'
const strategy = passport_discord.Strategy

import database from '../../database/database'

export default function loadDiscordPassport(db: database) {
    const { User, Guild } = db.models

    async function loadGuilds(id: string, guilds?: any[]) {
        if(!guilds) return
        for(const guild of guilds) {
            if(guild.permissions == 2147483647) {
                const gCheck = await Guild.findByPk(guild.id)
                if(!gCheck) {
                    await Guild.create({
                        id: guild.id,
                        name: guild.name,
                        icon: guild.icon != null ? 'https://cdn.discordapp.com/icons/' + guild.id + '/' + guild.icon + '.png' : '',
                        owner: guild.owner ? id : null,
                        admins: id
                    })
                } else {
                    const admins = gCheck.dataValues.admins.split(',')
                    await Guild.update({
                        name: guild.name,
                        icon: guild.icon != null ? 'https://cdn.discordapp.com/icons/' + guild.id + '/' + guild.icon + '.png' : '',
                        owner: guild.owner ? id : null,
                        admins: !admins.includes(id) ? admins.push(id).join(',') : admins.join(',')
                    }, {
                        where: {
                            id: guild.id
                        }
                    })
                }
            }
        }
    }

    passport.serializeUser((user: any, done) => {
        done(null, user.dataValues.id)
    })

    passport.deserializeUser(async (id, done) => {
        const u = await User.findByPk(id)
        if(u) done(null, u)
    })

    passport.use(new strategy({
        clientID: process.env.CLIENT_ID!,
        clientSecret: process.env.CLIENT_SECRET!,
        callbackURL: process.env.CLIENT_REDIRECT!,
        scope: ['identify', 'guilds', 'email']!
    }, async (accessToken: string, refreshToken: string, profile: Profile, done) => {
        const uCheck = await User.findByPk(profile.id)
        if(!uCheck) {
            await User.create({
                id: profile.id,
                username: profile.username + "#" + profile.discriminator,
                email: profile.email,
                guilds: profile.guilds!.map(g => g.id).join(","),
            })
            const u = await User.findByPk(profile.id)
            await loadGuilds(profile.id, profile.guilds)
            done(null, u)
        } else {
            await User.update({
                username: profile.username + "#" + profile.discriminator,
                email: profile.email,
                guilds: profile.guilds!.map(g => g.id).join(","),
            }, {
                where: {
                    id: profile.id
                }
            })
            const u = await User.findByPk(profile.id)
            await loadGuilds(profile.id, profile.guilds)
            done(null, u)
        }
    }))
}