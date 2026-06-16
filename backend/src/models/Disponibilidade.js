const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Disponibilidade = sequelize.define('Disponibilidade', {
  id_disponibilidade: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_psicologo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Psicologo', key: 'id_psicologo' },
  },
  dia_semana: {
    type: DataTypes.ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'),
    allowNull: false,
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  hora_fim: {
    type: DataTypes.TIME,
    allowNull: false,
  },
}, {
  tableName: 'Disponibilidade',
});

module.exports = Disponibilidade;
