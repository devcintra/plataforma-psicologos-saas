const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Consulta = sequelize.define('Consulta', {
  id_consulta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_psicologo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Psicologo', key: 'id_psicologo' },
  },
  id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Paciente', key: 'id_paciente' },
  },
  data_consulta: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  horario: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('agendada', 'confirmada', 'concluida', 'cancelada'),
    defaultValue: 'agendada',
  },
}, {
  tableName: 'Consulta',
});

module.exports = Consulta;
