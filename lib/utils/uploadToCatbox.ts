import fs from 'fs'
import d from './d'
// tslint:disable-next-line: no-var-requires
const { Catbox } = require('catbox.moe')
const cb = new Catbox(process.env.CATBOX_HASH)
export default async function uploadToCatbox(): Promise<string[]> {
    const files: string[] = []
    const images = fs.readdirSync(d('../temp/'))
    for(let i = 0; i < images.length; i++) {
        const url = await cb.upload(d(`../temp/${images[i]}`))
        files.push(url)
    }
    return files
}