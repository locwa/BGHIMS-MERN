'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProcurementLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models['Particular'])
      this.hasOne(models['Transaction'])
    }
  }
  ProcurementLog.init({
    Id: DataTypes.INTEGER,
    ParticularDescription: DataTypes.INTEGER,
    TransactionId: DataTypes.INTEGER,
    BatchNumber: DataTypes.STRING,
    UnitCost: DataTypes.FLOAT,
    Quantity: DataTypes.INTEGER,
    ExpiryDate: DataTypes.DATE,
    Remarks: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ProcurementLog',
  });
  return ProcurementLog;
};