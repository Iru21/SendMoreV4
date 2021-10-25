import { Client } from 'discord.js'

export default async function getUserAvatar(client: Client, id: string): Promise<string> {
    const u = await client.users.fetch(id)
    const a = u?.avatarURL()
    return a ? a : `https://avatars.dicebear.com/api/identicon/${id}.svg`
}