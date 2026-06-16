const Usuario = require('./Usuario');
const Paciente = require('./Paciente');
const Psicologo = require('./Psicologo');
const Especialidade = require('./Especialidade');
const PsicologoEspecialidade = require('./PsicologoEspecialidade');
const Consulta = require('./Consulta');
const Avaliacao = require('./Avaliacao');
const Mensagem = require('./Mensagem');
const Disponibilidade = require('./Disponibilidade');

// Usuario <-> Paciente / Psicologo
Usuario.hasOne(Paciente, { foreignKey: 'id_usuario' });
Paciente.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Usuario.hasOne(Psicologo, { foreignKey: 'id_usuario' });
Psicologo.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Psicologo <-> Especialidade (N:N)
Psicologo.belongsToMany(Especialidade, {
  through: PsicologoEspecialidade,
  foreignKey: 'id_psicologo',
});
Especialidade.belongsToMany(Psicologo, {
  through: PsicologoEspecialidade,
  foreignKey: 'id_especialidade',
});

// Consulta
Psicologo.hasMany(Consulta, { foreignKey: 'id_psicologo' });
Consulta.belongsTo(Psicologo, { foreignKey: 'id_psicologo' });

Paciente.hasMany(Consulta, { foreignKey: 'id_paciente' });
Consulta.belongsTo(Paciente, { foreignKey: 'id_paciente' });

// Avaliacao
Consulta.hasOne(Avaliacao, { foreignKey: 'id_consulta' });
Avaliacao.belongsTo(Consulta, { foreignKey: 'id_consulta' });

// Mensagem
Paciente.hasMany(Mensagem, { foreignKey: 'id_paciente' });
Mensagem.belongsTo(Paciente, { foreignKey: 'id_paciente' });

Psicologo.hasMany(Mensagem, { foreignKey: 'id_psicologo' });
Mensagem.belongsTo(Psicologo, { foreignKey: 'id_psicologo' });

// Disponibilidade
Psicologo.hasMany(Disponibilidade, { foreignKey: 'id_psicologo' });
Disponibilidade.belongsTo(Psicologo, { foreignKey: 'id_psicologo' });

module.exports = {
  Usuario, Paciente, Psicologo, Especialidade,
  PsicologoEspecialidade, Consulta, Avaliacao,
  Mensagem, Disponibilidade,
};
