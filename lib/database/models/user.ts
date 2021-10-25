import { Sequelize, DataTypes, Model } from "sequelize"

export default function User(sequelize: Sequelize): any {
    class UserModel extends Model {}

    UserModel.init({
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guilds: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "",
        },
    }, {
        sequelize,
        modelName: "User"
    })
    return UserModel
}