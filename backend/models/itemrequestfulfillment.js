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
    }
  }
  ItemRequestFulfillment.init({
    Id: DataTypes.INTEGER,
    RequestId: DataTypes.INTEGER,
    ProcurementId: DataTypes.INTEGER,
    BatchNumber: DataTypes.STRING,
    Quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ItemRequestFulfillment',
  });
  return ItemRequestFulfillment;
};