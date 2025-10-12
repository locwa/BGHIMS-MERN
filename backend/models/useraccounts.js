'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserAccounts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models['RequestLog'])
      this.belongsTo(models['Transaction'])
    }
  }
  UserAccounts.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
    Name: DataTypes.STRING,
    Email: DataTypes.STRING,
    Password: DataTypes.STRING,
    Role: DataTypes.STRING,
    JobTitle: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserAccounts',
    timestamps: false
  });
  return UserAccounts;
};