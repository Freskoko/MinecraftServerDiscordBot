// database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // This is the local file that will store your data
});

module.exports = { sequelize };