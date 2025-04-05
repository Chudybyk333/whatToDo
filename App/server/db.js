const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mkuckowi', 'mkuckowi', '48vfQ5Tv6uSJTGA4', {
  host: 'mysql.agh.edu.pl',
  dialect: 'mysql',
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Połączono z bazą danych MySQL za pomocą Sequelize.');
  } catch (error) {
    console.error('Błąd połączenia z bazą danych:', error);
  }
})();

// Synchronizacja modeli z bazą danych
sequelize.sync({ force: false }).then(() => {
  console.log('Database synchronized');
}).catch(console.error);


module.exports = sequelize;