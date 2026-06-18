document.addEventListener("DOMContentLoaded", () => {
    // Executa a busca assim que a página carregar
    carregarPerfilProfissional();
});

/**
 * DESCOBERTA AUTOMÁTICA DA URL (Suporte a Codespaces e Localhost)
 */
function descobrirBaseURL() {
    const hostname = window.location.hostname;
    if (hostname.includes("github.dev") || hostname.includes("app.github.dev")) {
        return window.location.origin.replace(/-\d+\./, "-3000.") + "/api";
    }
    return "http://localhost:3000/api";
}

const API_BASE_URL = descobrirBaseURL();

/**
 * 1. COORDENA A BUSCA DE DADOS DIRETAMENTE NA API REST
 */
async function carregarPerfilProfissional() {
    try {
        // Obtém o ID do psicólogo passado por parâmetro na URL (?id=X)
        const params = new URLSearchParams(window.location.search);
        const psicologoId = params.get("id");

        if (!psicologoId) {
            exibirErro("Nenhum identificador de profissional foi fornecido na URL.");
            return;
        }

        // Endpoint documentado: GET /api/psicologos/{id}
        const resposta = await fetch(`${API_BASE_URL}/psicologos/${psicologoId}`);

        if (!resposta.ok) {
            if (resposta.status === 404) {
                exibirErro("O psicólogo solicitado não foi encontrado no banco de dados.");
            } else {
                exibirErro("Erro ao carregar as informações do perfil do servidor.");
            }
            return;
        }

        const dadosPsicologo = await resposta.json();

renderizarPerfil(dadosPsicologo);
        // Ativa o ouvinte de clique do botão de agendamento passando o ID real do banco
        configurarBotaoAgendamento(psicologoId);

    } catch (error) {
        console.error("Erro ao carregar o perfil:", error);
        exibirErro("Ocorreu uma falha na comunicação com o servidor. Certifique-se de que o backend está ativo.");
    }
}
function configurarBotaoAgendamento(id) {

    const botao = document.getElementById("btn-agendar-perfil");

    if (!botao) return;

    botao.addEventListener("click", () => {

        window.location.href = `agendamento.html?id=${id}`;

    });

}
/**
 * 2. MAPEIA E INJETA OS DADOS NO DOM DEFENDENDO CONTRA VALORES NULOS
 */
function renderizarPerfil(psi) {

    const nomeExibir =
        psi.Usuario?.nome || "Psicólogo";

    const crpExibir =
        psi.crp || "--";

    const especialidades =
        psi.Especialidades?.length
            ? psi.Especialidades
                  .map(e => e.nome)
                  .join(", ")
            : "Psicologia Clínica";

    const sobreExibir =
        psi.descricao || "Sem biografia cadastrada.";

    const valorConsulta =
        parseFloat(psi.valor_consulta || 0);

    document.getElementById("psi-nome-completo").textContent =
        nomeExibir;

    document.getElementById("psi-crp").textContent = crpExibir;

    document.getElementById("psi-preco").textContent = valorConsulta > 0? `R$ ${valorConsulta.toFixed(2).replace(".", ",")}`: "Sob consulta";
    document.getElementById("box-sobre-mim").innerHTML = `<h3>Sobre mim</h3> <p class="about-text">${sobreExibir}</p> `;
}
/**
 * 4. INTERFACE GRÁFICA AMIGÁVEL PARA ERROS
 */
function exibirErro(mensagem) {
    const container = document.querySelector(".profile-view-container");
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; color: #7A2D7B; padding: 60px 20px; font-weight: 700; font-size: 18px; font-family: 'Figtree', sans-serif;">
                <p>⚠️ Opa! Algo correu mal.</p>
                <p style="font-size: 14px; color: #5C4E70; font-weight: 400; margin-top: 10px;">${mensagem}</p>
                <a href="listagem-psicologos.html" style="display: inline-block; margin-top: 20px; font-size: 14px; color: #7A3FA8; text-decoration: none; border-bottom: 1px solid #7A3FA8;">Voltar para a listagem</a>
            </div>`;
    }
}