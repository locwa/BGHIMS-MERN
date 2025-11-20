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
        as: 'Particular' // ✅ Already correct
      });

      this.belongsTo(models['Transaction'], {
        foreignKey: 'TransactionId',
        as: 'Transaction' // ✅ Already correct
      });
      
      this.hasMany(models['ItemRequestFulfillment'], { 
        foreignKey: 'ProcurementId', // ✅ Fixed: was 'AcquisitionId'
        as: 'Fulfillments'
      })
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
    Remarks: DataTypes.STRING,
    Year: DataTypes.INTEGER,
    Quarter: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ProcurementLog',
    tableName: 'ProcurementLog', // ✅ Changed to lowercase to match database
    timestamps: false
  });
  return ProcurementLog;
};