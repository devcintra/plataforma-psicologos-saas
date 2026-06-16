const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Paciente = sequelize.define('Paciente', {
  id_paciente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'Usuario', key: 'id_usuario' },
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
  },
}, {
  tableName: 'Paciente',
});

module.exports = Paciente;
