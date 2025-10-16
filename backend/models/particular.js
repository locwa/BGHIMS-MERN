'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Particular extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models['ProcurementLog'], {
        foreignKey: 'ParticularDescription',
        as: 'ProcurementLogs'
      });
    }
  }
  Particular.init({
    Id: DataTypes.INTEGER,
    Name: DataTypes.STRING,
    Unit: DataTypes.STRING,
    Category: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Particular',
    timestamps: false
  });
  return Particular;
};