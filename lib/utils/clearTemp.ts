import fsExtra from 'fs-extra'
import d from './d'
export default function clearTemp() {
    fsExtra.emptyDirSync(d('../temp/'))
}