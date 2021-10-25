import { Sequelize } from 'sequelize'
import fs from 'fs'
import path from 'path'

const basename = path.basename(__filename)
import Database from './database'

export default function load(sequelize: Sequelize): any {
    const db: Database = {
        models: {}
    }
    fs.readdirSync(path.join(__dirname, "./models"))
        .filter((file) => {
            return (
            file.indexOf('.') !== 0 && file !== basename && (file.slice(-3) === '.ts' || file.slice(-3) === '.js')
        )
    })
    .forEach((file) => {
        const model = require(path.join(__dirname, "./models/" + file)).default(sequelize)
        db.models[model.name] = model
    })
    db.connection = sequelize
    return db
}