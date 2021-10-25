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
        icon: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        owner: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
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