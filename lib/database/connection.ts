import { Sequelize, Model } from 'sequelize'
import load from './load'
import database from './database'

export default class Database {
    public db: database
    constructor() {
        this.db = {}
    }
    async connect(): Promise<database> {
        this.db.connection = new Sequelize(process.env.DATABASE_NAME!, process.env.DATABASE_USERNAME!, process.env.DATABASE_PASSWORD, {
            host: process.env.DATABASE_HOST,
            dialect: 'mysql',
            logging: false
        })
        try {
            await this.db.connection.authenticate()
            this.db = load(this.db.connection)
            console.log("Connected to the database!")
        } catch (err) {
            throw err
        }
        return this.db
    }
}

