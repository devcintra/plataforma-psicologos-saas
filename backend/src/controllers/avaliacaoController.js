const { Avaliacao, Consulta, Paciente } = require('../models');

// POST /api/avaliacoes — paciente avalia uma consulta concluída
const avaliar = async (req, res) => {
  try {
    const { id_consulta, nota, comentario } = req.body;

    if (!nota || nota < 1 || nota > 5) {
      return res.status(400).json({ erro: 'Nota deve ser entre 1 e 5.' });
    }

    const consulta = await Consulta.findByPk(id_consulta);
    if (!consulta) return res.status(404).json({ erro: 'Consulta não encontrada.' });
    if (consulta.status !== 'concluida') {
      return res.status(400).json({ erro: 'Só é possível avaliar consultas concluídas.' });
    }

    // Verifica se já existe avaliação
    const jaAvaliou = await Avaliacao.findOne({ where: { id_consulta } });
    if (jaAvaliou) return res.status(400).json({ erro: 'Esta consulta já foi avaliada.' });

    // Confirma que o paciente logado é dono da consulta
    const paciente = await Paciente.findOne({ where: { id_usuario: req.usuario.id_usuario } });
    if (consulta.id_paciente !== paciente.id_paciente) {
      return res.status(403).json({ erro: 'Você não pode avaliar esta consulta.' });
    }

    const avaliacao = await Avaliacao.create({ id_consulta, nota, comentario });
    res.status(201).json({ mensagem: 'Avaliação registrada!', avaliacao });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao registrar avaliação.' });
  }
};

// GET /api/avaliacoes/psicologo/:id — avaliações de um psicólogo
const listarPorPsicologo = async (req, res) => {
  try {
    const avaliacoes = await Avaliacao.findAll({
      include: [{
        model: Consulta,
        where: { id_psicologo: req.params.id },
        attributes: ['data_consulta'],
      }],
    });

    const media = avaliacoes.length
      ? (avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length).toFixed(1)
      : null;

    res.json({ media, total: avaliacoes.length, avaliacoes });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar avaliações.' });
  }
};

module.exports = { avaliar, listarPorPsicologo };
