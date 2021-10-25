import express, { Request, Response } from 'express'
import passport from 'passport'

export default class MainRouter {
    public router: express.Router
    constructor() {
        this.router = express.Router()
        this.router.get('/', passport.authenticate('discord'))

        this.router.get('/redirect', passport.authenticate('discord', { failureRedirect: '/', successRedirect: '/app' }), (err: Error, req: Request, res: Response) => {
            if(err.name == "TokenError") {
                res.redirect('/auth/forbidden')
            }
        })

        this.router.get('/logout', (req: Request, res: Response) => {
            if(req.user) {
                req.logOut()
                res.redirect('/')
            } else {
                res.redirect('/')
            }
        })
    }
}
