const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Mensagem = sequelize.define('Mensagem', {
  id_mensagem: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Paciente', key: 'id_paciente' },
  },
  id_psicologo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Psicologo', key: 'id_psicologo' },
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  data_envio: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Mensagem',
});

module.exports = Mensagem;
