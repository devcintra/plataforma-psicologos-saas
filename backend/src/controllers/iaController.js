const { Psicologo, Especialidade, Usuario } = require('../models');
const { Op } = require('sequelize');

// Função definitiva ajustada estritamente para os padrões da API v1 estável
async function chamarGemini(relatoPaciente) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // 🌍 Atualizado para o modelo moderno e universal gemini-2.5-flash na rota estável v1
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const instrucaoSistema = "Você é um assistente de triagem para uma plataforma de psicologia chamada PsiConnect. Seu papel é ler o relato do paciente, ser extremamente acolhedor, breve (máximo 3 frases) e responder estritamente em formato JSON com duas chaves: 'analise' (uma mensagem acolhedora para o paciente) e 'categoria' (que DEVE ser obrigatoriamente apenas uma destas opções: 'Ansiedade', 'Depressão', 'Burnout / Estresse' ou 'Outros'). Não adicione blocos de markdown com crases, envie apenas o texto cru do JSON.";

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: instrucaoSistema }]
                },
                {
                    role: "model",
                    parts: [{ text: "Entendido. Vou analisar os relatos e responder estritamente no formato JSON solicitado com as chaves 'analise' e 'categoria'." }]
                },
                {
                    role: "user",
                    parts: [{ text: `Relato do paciente para triagem: "${relatoPaciente}"` }]
                }
            ]
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || "Erro na comunicação com o Gemini.");
    }

    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("O Gemini não retornou nenhuma resposta válida.");
    }

    let textoJson = data.candidates[0].content.parts[0].text;
    
    // Limpeza por garantia
    textoJson = textoJson.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    return JSON.parse(textoJson);
}
exports.realizarTriagem = async (req, res) => {
    try {
        const { relato } = req.body;

        if (!relato) {
            return res.status(400).json({ erro: "O relato é obrigatório." });
        }

        // 1. Envia o relato para o Google Gemini
        const resultadoIa = await chamarGemini(relato);
        
        const mensagemAcolhedora = resultadoIa.analise;
        const especialidadeIdentificada = resultadoIa.categoria;

        // 2. Busca os psicólogos no Banco de Dados com base no que o Gemini decidiu
        let filtroEspecialidade = {};
        if (especialidadeIdentificada && especialidadeIdentificada !== 'Outros') {
            filtroEspecialidade = {
                nome: { [Op.like]: `%${especialidadeIdentificada}%` }
            };
        }

       const psicologos = await Psicologo.findAll({
    include: [
        {
            model: Usuario,
            attributes: ['nome', 'email']
        },
        {
            model: Especialidade,
            as: 'Especialidades', // 🛠️ Mudado para "E" maiúsculo para bater com o seu Model!
            where: Object.keys(filtroEspecialidade).length > 0 ? filtroEspecialidade : undefined,
            through: { attributes: [] }
        }
    ],
    limit: 3
});

        // 3. Retorna a resposta limpa para o seu Frontend
        return res.status(200).json({
            mensagem: mensagemAcolhedora,
            psicologos: psicologos
        });

    } catch (error) {
        console.error("Erro na triagem com Gemini:", error);
        return res.status(500).json({ erro: "Erro interno ao processar a triagem com Gemini." });
    }
};