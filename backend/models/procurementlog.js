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
      this.belongsTo(models['Particular'], {
        foreignKey: 'ParticularDescription',
        as: 'Particular'
      });

      this.belongsTo(models['Transaction'], {
        foreignKey: 'TransactionId',
        as: 'Transaction'
      });
    }
  }
  ProcurementLog.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id'
    },
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
    tableName: 'ProcurementLog',
    timestamps: false
  });
  return ProcurementLog;
};