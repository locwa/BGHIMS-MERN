'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ItemRequestFulfillment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models['ProcurementLog'], { 
        foreignKey: 'ProcurementId', // ✅ Fixed: was 'AcquisitionId'
        as: 'ProcurementLog' // ✅ Added alias
      })
      this.belongsTo(models['RequestLog'], { 
        foreignKey: 'RequestId', // ✅ Fixed: was 'RequisitionId'
        as: 'Request'
      })
    }
  }
  ItemRequestFulfillment.init({
    id: { // ✅ Changed to lowercase
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    RequestId: DataTypes.INTEGER,
    ProcurementId: DataTypes.INTEGER,
    BatchNumber: DataTypes.STRING,
    Quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ItemRequestFulfillment',
    tableName: 'itemrequestfulfillment', // ✅ Changed to lowercase to match database
    timestamps: false
  });
  return ItemRequestFulfillment;
};