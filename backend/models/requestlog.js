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
      this.belongsTo(models['UserAccounts'], { 
        foreignKey: 'AccountId',
        as: 'UserAccount' // ✅ Added alias for the route
      })
      this.hasMany(models['ItemRequestFulfillment'], { 
        foreignKey: 'RequestId', // ✅ Fixed: was 'RequisitionId', should be 'RequestId'
        as: 'Items'
      })
    }
  }
  RequestLog.init({
    id: { // ✅ Changed to lowercase to match database
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    AccountId: DataTypes.INTEGER,
    DateAdded: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'RequestLog',
    tableName: 'RequestLog', // ✅ Changed to lowercase to match your database
    timestamps: false
  });
  return RequestLog;
};