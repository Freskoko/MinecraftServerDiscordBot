// models/nation.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Nation = sequelize.define('Nation', {
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  
  members: {
    type: DataTypes.TEXT,
    get() {
      return this.getDataValue('members') ? JSON.parse(this.getDataValue('members')) : [];
    },
    set(val) {
      this.setDataValue('members', JSON.stringify(val));
    }
  },

  
  war_requests: {
    type: DataTypes.TEXT,
    get() {
      return this.getDataValue('war_requests') ? JSON.parse(this.getDataValue('war_requests')) : [];
    },
    set(val) {
      this.setDataValue('war_requests', JSON.stringify(val));
    }
  },
});

module.exports = Nation;