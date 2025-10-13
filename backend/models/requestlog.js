'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RequestLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models['UserAccounts'], { foreignKey: 'AccountId' })
      this.hasMany(models['ItemRequestFulfillment'], { foreignKey: 'RequisitionId' })
    }
  }
  RequestLog.init({
    Id: DataTypes.INTEGER,
    AccountId: DataTypes.INTEGER,
    DateAdded: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'RequestLog',
    timestamps: false
  });
  return RequestLog;
};