import fs from 'fs'
import { randomBytes } from 'crypto'
import d from './d'

export default async function saveFilesToTemp(files: string[], exts: string[]) {
    for(let i = 0; i < files.length; i++) {
        fs.writeFile(d(`../temp/${randomBytes(5).toString('hex')}.${exts[i]}`), files[i], "base64", () => {/*ignore*/})
    }
}