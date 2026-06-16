const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Psicologo = sequelize.define('Psicologo', {
  id_psicologo: {
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
  crp: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  valor_consulta: {
    type: DataTypes.DECIMAL(10, 2),
  },
  descricao: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'Psicologo',
});

module.exports = Psicologo;
