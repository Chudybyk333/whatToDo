const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const List = sequelize.define('List', {
  groupID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'groups', key: 'id' }, // Odniesienie do tabeli `groups`
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  userID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'users', key: 'id' }, // Odniesienie do tabeli `users`
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
}, {
  timestamps: false, // Wyłączamy automatyczne znaczniki czasu
  tableName: 'lists', // Nazwa tabeli pośredniczącej
});

module.exports = List;