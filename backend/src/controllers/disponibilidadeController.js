const { Disponibilidade, Psicologo } = require('../models');

// GET /api/disponibilidade/:id_psicologo
const listar = async (req, res) => {
  try {
    const disponibilidades = await Disponibilidade.findAll({
      where: { id_psicologo: req.params.id_psicologo },
      order: [['dia_semana', 'ASC'], ['hora_inicio', 'ASC']],
    });
    res.json(disponibilidades);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar disponibilidade.' });
  }
};

// POST /api/disponibilidade — psicólogo cadastra horários
const criar = async (req, res) => {
  try {
    const { dia_semana, hora_inicio, hora_fim } = req.body;

    const psicologo = await Psicologo.findOne({ where: { id_usuario: req.usuario.id_usuario } });
    if (!psicologo) return res.status(403).json({ erro: 'Apenas psicólogos podem cadastrar disponibilidade.' });

    const disponibilidade = await Disponibilidade.create({
      id_psicologo: psicologo.id_psicologo,
      dia_semana,
      hora_inicio,
      hora_fim,
    });

    res.status(201).json({ mensagem: 'Disponibilidade cadastrada!', disponibilidade });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar disponibilidade.' });
  }
};

// DELETE /api/disponibilidade/:id
const remover = async (req, res) => {
  try {

    const psicologo = await Psicologo.findOne({
      where: {
        id_usuario: req.usuario.id_usuario
      }
    });

    if (!psicologo) {
      return res.status(403).json({
        erro: 'Apenas psicólogos podem remover horários.'
      });
    }


    const disponibilidade = await Disponibilidade.findOne({
      where: {
        id_disponibilidade: req.params.id,
        id_psicologo: psicologo.id_psicologo
      }
    });


    if (!disponibilidade) {
      return res.status(404).json({
        erro: 'Horário não encontrado.'
      });
    }


    await disponibilidade.destroy();


    res.json({
      mensagem: 'Disponibilidade removida com sucesso!'
    });


  } catch (erro) {

    res.status(500).json({
      erro: 'Erro ao remover disponibilidade.'
    });

  }
};

module.exports = { listar, criar, remover };
