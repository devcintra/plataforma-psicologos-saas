const { Consulta, Psicologo, Paciente, Usuario, Avaliacao } = require('../models');

// POST /api/consultas — paciente agenda uma consulta
const agendar = async (req, res) => {
  try {
    const { id_psicologo, data_consulta, horario } = req.body;

    // Busca o perfil de paciente pelo id_usuario logado
    const paciente = await Paciente.findOne({ where: { id_usuario: req.usuario.id_usuario } });
    if (!paciente) return res.status(403).json({ erro: 'Apenas pacientes podem agendar consultas.' });

    // Verifica conflito de horário
    const conflito = await Consulta.findOne({
      where: { id_psicologo, data_consulta, horario, status: ['agendada', 'confirmada'] },
    });
    if (conflito) return res.status(400).json({ erro: 'Horário já ocupado.' });

    const consulta = await Consulta.create({
      id_psicologo,
      id_paciente: paciente.id_paciente,
      data_consulta,
      horario,
      status: 'agendada',
    });

    res.status(201).json({ mensagem: 'Consulta agendada com sucesso!', consulta });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao agendar consulta.', detalhe: erro.message });
  }
};

// GET /api/consultas — lista consultas do usuário logado
const listar = async (req, res) => {
  try {
    const { tipo_usuario, id_usuario } = req.usuario;
    let where = {};

    if (tipo_usuario === 'paciente') {
      const paciente = await Paciente.findOne({ where: { id_usuario } });
      where.id_paciente = paciente.id_paciente;
    } else if (tipo_usuario === 'psicologo') {
      const psicologo = await Psicologo.findOne({ where: { id_usuario } });
      where.id_psicologo = psicologo.id_psicologo;
    }

    const consultas = await Consulta.findAll({
      where,
      include: [
        { model: Psicologo, include: [{ model: Usuario, attributes: ['nome'] }] },
        { model: Paciente, include: [{ model: Usuario, attributes: ['nome'] }] },
        { model: Avaliacao },
      ],
      order: [['data_consulta', 'DESC'], ['horario', 'DESC']],
    });

    res.json(consultas);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao listar consultas.' });
  }
};

// PATCH /api/consultas/:id/status — atualiza status
const atualizarStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const statusValidos = ['agendada', 'confirmada', 'concluida', 'cancelada'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: 'Status inválido.' });
    }

    const consulta = await Consulta.findByPk(req.params.id);
    if (!consulta) return res.status(404).json({ erro: 'Consulta não encontrada.' });

    await consulta.update({ status });
    res.json({ mensagem: 'Status atualizado!', consulta });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar status.' });
  }
};

module.exports = { agendar, listar, atualizarStatus };
