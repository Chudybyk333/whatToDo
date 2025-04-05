const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Invitation = sequelize.define('Invitation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  senderID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Nazwa tabeli Users
      key: 'id',      // Kolumna, do której się odnosisz
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  receiverID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Nazwa tabeli Users
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  groupID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Groups', // Nazwa tabeli Groups
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    allowNull: false,
    defaultValue: 'pending',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  tableName: 'invitations',
});

module.exports = Invitation;
