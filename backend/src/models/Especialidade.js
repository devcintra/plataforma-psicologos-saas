const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Especialidade = sequelize.define('Especialidade', {
  id_especialidade: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'Especialidade',
});

module.exports = Especialidade;
