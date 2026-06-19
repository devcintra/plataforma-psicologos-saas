window.onerror = function(mensagem, fonte, linha, coluna, erro) {
    alert("ERRO ENCONTRADO: " + mensagem + "\nNa linha: " + linha);
    return true; 
};
// Função para descobrir a URL correta do backend (funciona no Codespaces e Local)
function obterUrlBackend() {
    const hostname = window.location.hostname;
    
    // Verifica se estamos rodando dentro do GitHub Codespaces
    if (hostname.includes('github.dev')) {
        // Pega a URL atual (ex: projeto-5500.app.github.dev) e troca a porta para a 3000
        const backendHostname = hostname.replace(/-\d+\.app\.github\.dev/, '-3000.app.github.dev');
        return `https://${backendHostname}/api`;
    }
    
    // Se não estiver no Codespaces, usa o padrão local
    return 'http://localhost:3000/api';
}

// Configuração da sua API usando a função inteligente
const API_BASE_URL = obterUrlBackend();
// Capturando elementos da tela
const chatArea = document.getElementById('chatArea');
const inputRelato = document.getElementById('inputRelato');
const btnEnviar = document.getElementById('btnEnviar');

// Adiciona evento de clique no botão e tecla "Enter" no campo de texto
btnEnviar.addEventListener('click', processarEnvio);
inputRelato.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') processarEnvio();
});

async function processarEnvio() {
    alert("O botão foi clicado e a função começou!");
    const texto = inputRelato.value.trim();
    if (!texto) return;

    // 1. Limpa o input e exibe a mensagem do usuário
    inputRelato.value = '';
    adicionarMensagem(texto, 'usuario');

    // 2. Exibe o "indicador de digitação" da IA
    const idCarregando = adicionarMensagem('Analisando seu relato...', 'ia', true);

    try {
        // Pega o token do paciente logado
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Você precisa estar logado para usar o assistente.");
            return;
        }

        // 3. Envia o texto para a nossa rota no backend
        const resposta = await fetch(`${API_BASE_URL}/triagem-ia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ relato: texto })
        });

        const dados = await resposta.json();

        // 4. Remove a mensagem de "Analisando..."
        removerMensagem(idCarregando);

        if (!resposta.ok) {
            adicionarMensagem(dados.erro || "Desculpe, ocorreu um erro ao processar seu relato.", 'ia');
            return;
        }

        // 5. Exibe a mensagem acolhedora da IA
        adicionarMensagem(dados.mensagem, 'ia');

        // 6. Se a IA encontrou psicólogos compatíveis, exibe os cards
        if (dados.psicologos && dados.psicologos.length > 0) {
            renderizarPsicologos(dados.psicologos);
        } else {
            adicionarMensagem("No momento, não encontrei profissionais exatos para as áreas identificadas, mas convido você a explorar nossa lista completa de psicólogos.", 'ia');
        }

    } catch (erro) {
        removerMensagem(idCarregando);
        adicionarMensagem("Erro de conexão com o servidor.", 'ia');
        console.error(erro);
    }
}

// ─── FUNÇÕES DE INTERFACE ──────────────────────────────────────────────

function adicionarMensagem(texto, remetente, isCarregando = false) {
    const div = document.createElement('div');
    div.classList.add('mensagem', remetente);
    div.textContent = texto;
    
    // Gera um ID único se for a mensagem de "Carregando" para podermos apagar depois
    const idUnico = 'msg-' + Date.now();
    if (isCarregando) div.id = idUnico;

    chatArea.appendChild(div);
    
    // Rola o chat para o final
    chatArea.scrollTop = chatArea.scrollHeight;

    return idUnico;
}

function removerMensagem(id) {
    const msg = document.getElementById(id);
    if (msg) msg.remove();
}

function renderizarPsicologos(listaPsicologos) {
    // Cria um container para colocar todos os cards lado a lado
    const containerCards = document.createElement('div');
    containerCards.classList.add('cards-container');

    listaPsicologos.forEach(psi => {
        const card = document.createElement('div');
        card.classList.add('card-psicologo');

        // Pega o nome do psicólogo que veio da tabela Usuario
        const nomePsi = psi.Usuario ? psi.Usuario.nome : "Psicólogo";

        // Cria as tags de especialidades que o banco retornou
        let tagsHtml = '';
        if (psi.especialidades) {
            psi.especialidades.forEach(esp => {
                tagsHtml += `<span class="tag-especialidade">${esp.nome}</span> `;
            });
        }

        card.innerHTML = `
            <h4>${nomePsi}</h4>
            <div>${tagsHtml}</div>
            <button style="margin-top: 10px; width: 100%; font-size: 14px;" onclick="window.location.href='perfil-psicologo.html?id=${psi.id_psicologo}'">Ver Perfil</button>
        `;
        containerCards.appendChild(card);
    });

    chatArea.appendChild(containerCards);
    chatArea.scrollTop = chatArea.scrollHeight;
}