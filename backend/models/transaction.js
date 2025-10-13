'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models['UserAccounts'], {
        foreignKey: 'ReceivingUser',
        as: 'UserAccounts'
      })
      this.hasMany(models['ProcurementLog'], {
        foreignKey: 'TransactionId',
        as: 'ProcurementLogs'
      });
    }
  }
  Transaction.init({
    Id: DataTypes.INTEGER,
    ReceivingUser: DataTypes.INTEGER,
    DateReceived: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Transaction',
    timestamps: false
  });
  return Transaction;
};