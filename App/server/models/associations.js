const User = require('./User');
const Group = require('./Group');
const List = require('./List');
const Invitation = require('./Invitation'); // Nowy model

// Relacje User <-> Group poprzez List
User.belongsToMany(Group, {
  through: List,
  foreignKey: 'userID',
  otherKey: 'groupID',
  as: 'groups',
});

Group.belongsToMany(User, {
  through: List,
  foreignKey: 'groupID',
  otherKey: 'userID',
  as: 'users',
});

// Relacje User <-> Invitation
User.hasMany(Invitation, {
  foreignKey: 'senderID',
  as: 'sentInvitations', // Zaproszenia wysłane przez użytkownika
});

User.hasMany(Invitation, {
  foreignKey: 'receiverID',
  as: 'receivedInvitations', // Zaproszenia otrzymane przez użytkownika
});

// Relacja Group <-> Invitation
Group.hasMany(Invitation, {
  foreignKey: 'groupID',
  as: 'invitations', // Zaproszenia dotyczące grupy
});

// Relacja Invitation <-> User i Group (połączenie)
Invitation.belongsTo(User, {
  foreignKey: 'senderID',
  as: 'sender', // Kto wysłał zaproszenie
});

Invitation.belongsTo(User, {
  foreignKey: 'receiverID',
  as: 'receiver', // Kto otrzymał zaproszenie
});

Invitation.belongsTo(Group, {
  foreignKey: 'groupID',
  as: 'group', // Grupa, do której zaproszenie się odnosi
});

module.exports = { User, Group, List, Invitation };
