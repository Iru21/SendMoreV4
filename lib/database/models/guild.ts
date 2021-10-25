import { Sequelize, DataTypes, Model } from "sequelize"

export default function Guild(sequelize: Sequelize): any {
    class GuildModel extends Model {}

    GuildModel.init({
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        admins: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "",
        }
    }, {
        sequelize,
        modelName: "Guild"
    })
    return GuildModel
}