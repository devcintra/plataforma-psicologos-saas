document.addEventListener("DOMContentLoaded", () => {
    // Executa a busca assim que a página carregar
    carregarPerfilProfissional();
});

/**
 * Função principal que coordena a busca, renderização e ativação de ações
 */
async function carregarPerfilProfissional() {
    try {
        // Obtém os parâmetros da URL de forma resiliente
        const params = new URLSearchParams(window.location.search);
        const psicologoId = params.get("id") || params.get("crp");

        // Busca os dados do profissional correspondente
        const dadosPsicologo = await buscarDadosDoPsicologo(psicologoId);

        if (!dadosPsicologo) {
            exibirErro("Não foi possível carregar as informações deste perfil.");
            return;
        }

        // Injeta os dados dinamicamente no HTML da página
        renderizarDadosNoPerfil(dadosPsicologo);

        // Ativa o ouvinte de clique do botão de agendamento passando o identificador correto
        configurarBotaoAgendamento(psicologoId);

    } catch (error) {
        console.error("Erro ao carregar o perfil:", error);
        exibirErro("Ocorreu uma falha na comunicação com o servidor.");
    }
}

/**
 * Simula a busca de dados (LocalStorage ou fallback estruturado)
 */
async function buscarDadosDoPsicologo(id) {
    const cadastroSessao = JSON.parse(localStorage.getItem("cadastroPsicologo"));
    
    // Verifica se o id/crp bate com o psicólogo cadastrado via formulário
    if (cadastroSessao && (cadastroSessao.crp === id || id === "recem-cadastrado")) {
        return {
            nome: cadastroSessao.nome || "Profissional",
            sobrenome: cadastroSessao.sobrenome || "Cadastrado",
            crp: cadastroSessao.crp || "00/00000",
            valor: parseFloat(cadastroSessao.valor) || 120.00,
            formacao: cadastroSessao.formacao || "Não informada",
            sobre: cadastroSessao.sobre || "Biografia não informada.",
            especialidades: cadastroSessao.especialidades || [],
            disponibilidade: cadastroSessao.disponibilidade || [],
            avaliacao: 5.0,
            votos: 0,
            visualizacoes: 1,
            tempoResposta: "1h",
            foto: cadastroSessao.foto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
        };
    }

    // Mock estável: Aline Kaufman
    if (id === "06/992311") {
        return {
            nome: "Aline", sobrenome: "Kaufman", crp: "06/992311", valor: 95.00,
            formacao: "Especialização em Psicologia Infantil (PUC)",
            sobre: "Atendimento infantil integrado utilizando recursos lúdicos para o desenvolvimento cognitivo saudável.",
            especialidades: ["infantil", "ansiedade"], disponibilidade: ["manha"],
            avaliacao: 4.9, votos: 18, visualizacoes: 42, tempoResposta: "3h",
            foto: "https://images.unsplash.com/photo-1582750433449-64c02ee03f07?q=80&w=150&auto=format&fit=crop"
        };
    }

    // Mock estável: Roberto Almeida Prado
    if (id === "06/321455") {
        return {
            nome: "Roberto", sobrenome: "Almeida Prado", crp: "06/321455", valor: 180.00,
            formacao: "Mestrado em Terapia Familiar - USP",
            sobre: "Focado em resolução de conflitos conjugais e dinâmicas familiares complexas.",
            especialidades: ["casal"], disponibilidade: ["tarde"],
            avaliacao: 4.7, votos: 12, visualizacoes: 28, tempoResposta: "4h",
            foto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop"
        };
    }

    // Perfil Padrão: Diana Silva / Glaucia Martins
    return {
        nome: "Glaucia",
        sobrenome: "Martins",
        crp: "06/123456",
        valor: 120.00,
        formacao: "Psicologia USP",
        sobre: "Olá! Sou Glaucia, psicóloga dedicada a ajudar jovens adultos a lidarem com ansiedade e questões relacionadas ao início da vida profissional.",
        especialidades: ["ansiedade"],
        disponibilidade: ["noite"],
        avaliacao: 5.0,
        votos: 2,
        visualizacoes: 5,
        tempoResposta: "2h",
        foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop"
    };
}

/**
 * CAMADA DE APRESENTAÇÃO (Injeção de conteúdo no DOM)
 */
function renderizarDadosNoPerfil(psi) {
    const nomeCompleto = `${psi.nome} ${psi.sobrenome}`;
    
    const elNome = document.getElementById("psi-nome-completo");
    if (elNome) elNome.textContent = nomeCompleto;
    
    document.title = `PsiConnect - Perfil de ${nomeCompleto}`;
    
    const elCrp = document.getElementById("psi-crp");
    if (elCrp) elCrp.textContent = psi.crp;
    
    const elFoto = document.getElementById("psi-foto");
    if (elFoto && psi.foto) {
        elFoto.src = psi.foto;
        elFoto.alt = `Foto de ${nomeCompleto}`;
    }

    const precoFormatado = psi.valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    const elPreco = document.getElementById("psi-preco");
    if (elPreco) elPreco.textContent = precoFormatado;

    const elAvaliacao = document.getElementById("psi-avaliacao-num");
    if (elAvaliacao) elAvaliacao.textContent = psi.avaliacao.toFixed(1);
    
    const elScore = document.getElementById("dash-score-num");
    if (elScore) elScore.textContent = psi.avaliacao.toFixed(1);
    
    const elVotos = document.getElementById("psi-votos-total");
    if (elVotos) elVotos.textContent = `(${psi.votos} ${psi.votos === 1 ? 'Avaliação' : 'Avaliações'})`;
    
    const elVisitas = document.getElementById("psi-visualizacoes");
    if (elVisitas) elVisitas.innerHTML = `👁️ ${psi.visualizacoes} visualizações essa semana`;
    
    const elResposta = document.getElementById("psi-status-resposta");
    if (elResposta) elResposta.innerHTML = `<span class="status-dot"></span> Responde em ${psi.tempoResposta}`;

    // Montagem dinâmica e limpa do bloco "Sobre mim"
    const sobreBox = document.getElementById("box-sobre-mim");
    if (sobreBox) {
        sobreBox.innerHTML = "<h3>Sobre mim</h3>";
        const paragrafos = psi.sobre.split("\n");
        paragrafos.forEach(pTexto => {
            if (pTexto.trim() !== "") {
                const pElement = document.createElement("p");
                pElement.classList.add("about-text");
                pElement.textContent = pTexto;
                sobreBox.appendChild(pElement);
            }
        });
    }

    const elFormacao = document.getElementById("info-formacao");
    if (elFormacao) elFormacao.textContent = psi.formacao;
}

/**
 * Escuta com segurança o clique do botão "Agendar consulta" da barra lateral
 */
function configurarBotaoAgendamento(id) {
    const btnAgendar = document.getElementById("btn-agendar-perfil");
    if (btnAgendar) {
        btnAgendar.addEventListener("click", () => {
            const idDestino = id || "recem-cadastrado";
            // Redireciona transmitindo o id limpo do profissional selecionado
            window.location.href = `agendamento.html?id=${idDestino}`;
        });
    }
}

/**
 * Exibe tratamento visual estruturado em caso de ausência de dados
 */
function exibirErro(mensagem) {
    const container = document.querySelector(".profile-view-container");
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; color: #7A2D7B; padding: 60px 20px; font-weight: 700; font-size: 18px; font-family: 'Figtree', sans-serif;">
                <p>⚠️ ${mensagem}</p>
                <a href="listagem-psicologos.html" style="color: #7A2D7B; text-decoration: underline; font-size: 14px; display: block; margin-top: 12px;">Voltar para a listagem</a>
            </div>
        `;
    }
}