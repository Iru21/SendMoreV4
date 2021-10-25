import express from 'express'
import passport from 'passport'
import session from 'express-session'
import cors from "cors"
import logger from "morgan"
// tslint:disable-next-line: no-var-requires
const CookieStore = require('connect-mysql')(session)
const CookieStoreOptions = {
    config: {
        user: process.env.DATABASE_USERNAME,
        host: process.env.DATABASE_HOST,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    }
}

import AuthRouter from './routes/authrouter'
import MainRouter from './routes/mainrouter'
import database from '../database/database'

import path from 'path'

const log = console.log

export default class Server {
    public PORT: number
    public app: express.Express
    constructor(db: database) {
        this.app = express()
        this.PORT = Number(process.env.PORT) || 3000

        // tslint:disable-next-line: no-var-requires
        require('./strategies/discord').default(db)

        this.configureAuth()
        this.configureView()
        this.configureRoutes(db)
    }
    start() {
        this.app.listen(this.PORT, () => {
            log(`Now listening on port http://127.0.0.1:${this.PORT}!`)
        })
    }

    private configureAuth() {
        this.app.use(session({
            secret: process.env.SESSION_SECRET!,
            cookie: {
                maxAge: 60000 * 60 * 24,
                expires: new Date((new Date()).getTime() + 60000 * 60 * 24)
            },
            saveUninitialized: false,
            resave: false,
            name: 'discord.oauth2',
            store: new CookieStore(CookieStoreOptions)
        }))

        this.app.use(passport.initialize())
        this.app.use(passport.session())
    }

    private configureRoutes(db: database) {
        const main = new MainRouter(db)
        const auth = new AuthRouter()

        this.app.use(cors({origin: "*", optionsSuccessStatus: 200}))
        this.app.use(logger('dev'))

        this.app.use(express.json({ limit: "600mb" }))
        this.app.use(express.urlencoded({ extended: true }))

        this.app.use(main.router)
        this.app.use('/auth', auth.router)
    }

    private configureView() {
        this.app.set("view engine", "ejs")
        this.app.set("views", path.join(__dirname, "views"))
        this.app.use(express.static(__dirname + '/public'));
    }
}