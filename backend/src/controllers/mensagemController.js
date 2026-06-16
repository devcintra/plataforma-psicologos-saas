const { Mensagem, Paciente, Psicologo, Usuario } = require('../models');

// POST /api/mensagens — envia uma mensagem
const enviar = async (req, res) => {
  try {
    const { id_psicologo, id_paciente, texto } = req.body;
    if (!texto) return res.status(400).json({ erro: 'Texto da mensagem é obrigatório.' });

    const mensagem = await Mensagem.create({ id_psicologo, id_paciente, texto });
    res.status(201).json({ mensagem });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao enviar mensagem.' });
  }
};

// GET /api/mensagens/:id_psicologo/:id_paciente — histórico de conversa
const historico = async (req, res) => {
  try {
    const { id_psicologo, id_paciente } = req.params;

    const mensagens = await Mensagem.findAll({
      where: { id_psicologo, id_paciente },
      order: [['data_envio', 'ASC']],
    });

    res.json(mensagens);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar mensagens.' });
  }
};

module.exports = { enviar, historico };
