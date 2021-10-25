import { Sequelize, Model } from "sequelize";

export default interface Database {
    connection?: Sequelize,
    models?: any
}