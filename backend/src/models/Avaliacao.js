const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Avaliacao = sequelize.define('Avaliacao', {
  id_avaliacao: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_consulta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'Consulta', key: 'id_consulta' },
  },
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  comentario: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'Avaliacao',
});

module.exports = Avaliacao;
