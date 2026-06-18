document.addEventListener("DOMContentLoaded", () => {
    verificarSessaoPaciente();
});

/**
 * NOVA FUNÇÃO: Descobre dinamicamente a URL da API no Codespaces ou Localhost
 */
function obterBaseURL() {
    const urlAtual = window.location.href;

    // Se estiver rodando no GitHub Codespaces
    if (urlAtual.includes("app.github.dev")) {
        // Troca o número da porta atual do front-end para a porta 3000 do backend
        const urlBackend = urlAtual.replace(/-\d+(?=\.app\.github\.dev)/, "-3000");
        const urlOriginal = new URL(urlBackend);
        return `${urlOriginal.origin}/api`;
    }

    // Se estiver rodando localmente na máquina (localhost)
    return "http://localhost:3000/api";
}

const BASE_URL = obterBaseURL();

async function verificarSessaoPaciente() {
    // 1. Buscamos o token de autenticação real e os dados salvos no login
    const token = localStorage.getItem("token_psico_app");
    const dadosPaciente = JSON.parse(localStorage.getItem("dados_usuario")); // Alterado para bater com o padrão de login da API
    
    const btnPrincipalBusca = document.getElementById("btn-principal-busca");
    const containerBotoesNav = document.getElementById("container-botoes-nav");
    const menuMeusAgendamentos = document.getElementById("menu-meus-agendamentos");

    // 2. Se houver um token, tentamos validar com o backend para ver se a sessão está ativa e segura
    if (token && dadosPaciente) {
        try {
            // Opcional: Faz um bate-volta na API para garantir que o token não expirou
            const resposta = await fetch(`${BASE_URL}/usuarios/perfil`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            // Se o token for válido (Status 200), renderiza a tela logada
            if (resposta.status === 200) {
                
                if (btnPrincipalBusca) {
                    btnPrincipalBusca.href = "listagem-psicologos.html"; 
                }

                if (menuMeusAgendamentos) {
                    menuMeusAgendamentos.style.display = "inline-block";
                }

                if (containerBotoesNav) {
                    const primeiroNome = dadosPaciente.nome ? dadosPaciente.nome.split(" ")[0] : "Paciente";
                    
                    containerBotoesNav.innerHTML = `
                        <span style=\"color: var(--text, #1E1030); font-weight: 700; margin-right: 15px; font-size: 15px;\">
                            Olá, ${primeiroNome}!
                        </span>
                        <a href=\"#\" id=\"btn-logout-sessao\" style=\"
                            color: #D9534F; 
                            text-decoration: none; \
                            font-weight: 700; \
                            font-size: 14px;\
                            border: 1px solid #E4D8F5;\
                            padding: 6px 14px;\
                            border-radius: 20px;\
                            background: #FFF5F5;\
                        \">Sair</a>
                    `;

                    // Ação de Logout: Limpa os tokens reais gerados pela API
                    document.getElementById("btn-logout-sessao").addEventListener("click", (e) => {
                        e.preventDefault();
                        localStorage.removeItem("token_psico_app");
                        localStorage.removeItem("dados_usuario");
                        window.location.reload(); // Recarrega a página para voltar ao estado deslogado
                    });
                }
                return; // Encerra a função com sucesso
            }
        } catch (error) {
            console.error("Erro ao validar sessão com a API:", error);
            // Se der erro de rede, mantém o comportamento offline ou desloga por segurança
        }
    }
    
    // Se não tiver token ou o token falhar, garante que os botões de "Entrar" continuem visíveis
    if (menuMeusAgendamentos) menuMeusAgendamentos.style.display = "none";
}