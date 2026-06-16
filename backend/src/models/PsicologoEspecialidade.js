const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PsicologoEspecialidade = sequelize.define('Psicologo_Especialidade', {
  id_psicologo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'Psicologo', key: 'id_psicologo' },
  },
  id_especialidade: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'Especialidade', key: 'id_especialidade' },
  },
}, {
  tableName: 'Psicologo_Especialidade',
});

module.exports = PsicologoEspecialidade;
