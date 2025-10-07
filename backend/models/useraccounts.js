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
      this.hasMany(models['Transaction'])
    }
  }
  UserAccounts.init({
    Id: DataTypes.INTEGER,
    Name: DataTypes.STRING,
    Email: DataTypes.STRING,
    Password: DataTypes.STRING,
    Role: DataTypes.STRING,
    JobTitle: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserAccounts',
  });
  return UserAccounts;
};