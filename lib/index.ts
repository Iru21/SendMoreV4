// tslint:disable-next-line: no-var-requires
require('dotenv').config()

import Database from './database/connection'
import server from './site/server'

(async () => {
    const db = new Database()
    const DatabaseConnection = await db.connect()
    await DatabaseConnection.connection!.sync()
    const WebServer = new server(db.db)
    WebServer.start()
})()