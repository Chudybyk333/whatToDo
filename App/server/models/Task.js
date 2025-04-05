const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Group = require('./Group');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  notes: { type: DataTypes.TEXT },
  deadline: { type: DataTypes.DATE },
  status: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: false,
  tableName: 'tasks', // Określenie nazwy tabeli
});

Task.belongsTo(Group, { foreignKey: 'groupID' });

module.exports = Task;