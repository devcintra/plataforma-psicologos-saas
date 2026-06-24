const { Mensagem, Paciente, Psicologo, Usuario } = require('../models');

// POST /api/mensagens — envia uma mensagem
const enviar = async (req, res) => {
    try {
        const { id_destinatario, texto } = req.body;
        const usuarioLogado = req.usuario;

        if (!texto) {
            return res.status(400).json({ erro: "Texto da mensagem é obrigatório." });
        }

        let id_psicologo = null;
        let id_paciente = null;

        // Se quem envia é PACIENTE
        if (usuarioLogado.tipo_usuario === "paciente") {
            
            // Busca o ID real do paciente atrelado a este usuário
            const paciente = await Paciente.findOne({ where: { id_usuario: usuarioLogado.id_usuario } });
            if (!paciente) return res.status(404).json({ erro: "Perfil de paciente não encontrado." });

            id_paciente = paciente.id_paciente;
            id_psicologo = id_destinatario;

        // Se quem envia é PSICÓLOGO
        } else if (usuarioLogado.tipo_usuario === "psicologo") {
            
            // Busca o ID real do psicólogo atrelado a este usuário
            const psicologo = await Psicologo.findOne({ where: { id_usuario: usuarioLogado.id_usuario } });
            if (!psicologo) return res.status(404).json({ erro: "Perfil de psicólogo não encontrado." });

            id_psicologo = psicologo.id_psicologo;
            id_paciente = id_destinatario;

        } else {
            return res.status(403).json({ erro: "Tipo de usuário não permitido para chat." });
        }

        const mensagem = await Mensagem.create({
            id_psicologo,
            id_paciente,
            texto,
            remetente: usuarioLogado.tipo_usuario 
        });

        res.status(201).json({ mensagem });

    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao enviar mensagem.",
            detalhe: erro.message
        });
    }
};

// GET /api/mensagens/:id_psicologo/:id_paciente — histórico de conversa
const historico = async (req, res) => {
    try {
        const { id_psicologo, id_paciente } = req.params;

        const mensagens = await Mensagem.findAll({
            where: { 
                id_psicologo, 
                id_paciente 
            },
            order: [['data_envio', 'ASC']],
        });

        res.json(mensagens);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar mensagens.' });
    }
};

module.exports = { enviar, historico };