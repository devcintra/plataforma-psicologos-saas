const { Psicologo, Usuario, Especialidade, Disponibilidade } = require('../models');

// GET /api/psicologos — lista todos com especialidades
const listar = async (req, res) => {
  try {
    const psicologos = await Psicologo.findAll({
    include: [

    { model: Usuario },

 { model: Especialidade },

 { model: Disponibilidade }

]
    });
    res.json(psicologos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao listar psicólogos.' });
  }
};

// GET /api/psicologos/:id
const buscarPorId = async (req, res) => {
  try {
    const psicologo = await Psicologo.findByPk(req.params.id, {
      include: [
        { model: Usuario, attributes: ['nome', 'email', 'telefone'] },
        { model: Especialidade, through: { attributes: [] } },
        { model: Disponibilidade },
      ],
    });
    if (!psicologo) return res.status(404).json({ erro: 'Psicólogo não encontrado.' });
    res.json(psicologo);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar psicólogo.' });
  }
};

// PUT /api/psicologos/:id — atualiza perfil do psicólogo
const atualizar = async (req, res) => {
  try {
    const { valor_consulta, descricao, especialidades } = req.body;
    const psicologo = await Psicologo.findByPk(req.params.id);
    if (!psicologo) return res.status(404).json({ erro: 'Psicólogo não encontrado.' });

    await psicologo.update({ valor_consulta, descricao });

    // Atualiza especialidades se enviadas
    if (especialidades && Array.isArray(especialidades)) {
      const lista = await Especialidade.findAll({ where: { id_especialidade: especialidades } });
      await psicologo.setEspecialidades(lista);
    }

    res.json({ mensagem: 'Perfil atualizado com sucesso!', psicologo });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar psicólogo.' });
  }
};

module.exports = { listar, buscarPorId, atualizar };
