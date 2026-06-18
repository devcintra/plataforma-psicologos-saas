document.addEventListener("DOMContentLoaded", () => {
    inicializarSistemaDeChat();
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

// Variáveis de controle de estado global
let usuarioTipo = "";       // "paciente" ou "psicologo"
let idDestinatario = null;   // ID do outro usuário com quem se está a conversar
let idUsuarioLogado = null;  // ID de quem está com a sessão ativa
let intervaloSync = null;    // Guarda o timer do Polling assíncrono

/**
 * 1. INICIALIZA O CHAT EXTRAINDO OS DADOS DA URL E DO JWT
 */
async function inicializarSistemaDeChat() {
    const params = new URLSearchParams(window.location.search);
    usuarioTipo = params.get("tipo") || "paciente";
    
    // Captura o ID do psicólogo ou paciente alvo passado via query string (Ex: chat.html?tipo=paciente&comId=5)
    idDestinatario = parseInt(params.get("comId") || params.get("id"));

    // Recupera o Token do armazenamento local para autenticação
    const token = localStorage.getItem("token_jwt");
    if (!token) {
        alert("Sessão expirada ou utilizador não autenticado. Retornando ao login.");
        window.location.href = usuarioTipo === "paciente" ? "login_pac.html" : "login_psi.html";
        return;
    }

    // Decodifica a identidade do utilizador logado através das informações salvas
    try {
        const payloadSalvo = usuarioTipo === "paciente" 
            ? JSON.parse(localStorage.getItem("cadastro_pac")) 
            : JSON.parse(localStorage.getItem("cadastroPsicologo"));
            
        idUsuarioLogado = payloadSalvo ? (payloadSalvo.id || payloadSalvo.id_usuario) : null;
        
        // Configura elementos visuais do cabeçalho da conversa
        configurarInterfaceCabeçalho(payloadSalvo);

        // Faz a primeira carga de mensagens
        await carregarEMostrarMensagensAPI();

        // Ativa os escutadores de envio (Botão clique e Tecla Enter)
        document.getElementById("btn-enviar-mensagem").addEventListener("click", capturarEEnviarMensagemAPI);
        document.getElementById("input-mensagem-texto").addEventListener("keyup", (e) => {
            if (e.key === "Enter") capturarEEnviarMensagemAPI();
        });

        // Configura o Polling Automático (Sincroniza novas mensagens a cada 3 segundos)
        intervaloSync = setInterval(carregarEMostrarMensagensAPI, 3000);

    } catch (erro) {
        console.error("Erro ao montar estrutura do chat:", erro);
    }
}

/**
 * 2. CONFIGURA O CABEÇALHO DINAMICAMENTE
 */
function configurarInterfaceCabeçalho(dadosLogado) {
    const nomeInteracao = document.getElementById("interacao-nome");
    if (nomeInteracao) {
        nomeInteracao.textContent = usuarioTipo === "paciente" ? "Seu Psicólogo" : "Paciente em Atendimento";
    }
    
    const txtStatus = document.getElementById("txt-status-conexao");
    if (txtStatus) {
        txtStatus.innerHTML = `<span style="color: green;">●</span> Ligado ao Servidor`;
    }
}

/**
 * 3. CONSOME O ENDPOINT GET /api/mensagens/{usuario1}/{usuario2}
 */
async function carregarEMostrarMensagensAPI() {
    if (!idUsuarioLogado || !idDestinatario) return;

    const token = localStorage.getItem("token_jwt");
    const caixa = document.getElementById("caixa-mensagens-chat");
    if (!caixa) return;

    // Detecta se o utilizador já está no final do scroll para manter a rolagem automática
    const estaNoFinal = (caixa.scrollHeight - caixa.scrollTop <= caixa.clientHeight + 50);

    try {
        // Endpoint documentado: GET /api/mensagens/{usuario1}/{usuario2}
        const resposta = await fetch(`${API_BASE_URL}/mensagens/${idUsuarioLogado}/${idDestinatario}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!resposta.ok) throw new Error("Não foi possível carregar as mensagens.");

        const listaMensagens = await resposta.json();
        caixa.innerHTML = "";

        if (listaMensagens.length === 0) {
            caixa.innerHTML = `<p style="text-align: center; color: var(--sub); padding: 20px; font-size: 13px;">O canal de mensagens está aberto. Digite algo para iniciar a conversa.</p>`;
            return;
        }

        // Renderiza cada balão de mensagem dinamicamente de acordo com o remetente
        listaMensagens.forEach(msg => {
            const row = document.createElement("div");
            row.className = "message-row";

            // Se o id_remetente for igual ao meu ID, o balão vai para a direita ("sent")
            if (msg.id_remetente === idUsuarioLogado) {
                row.classList.add("sent");
            } else {
                row.classList.add("received");
            }

            // Tratamento amigável da hora de envio
            const horaFormatada = msg.created_at 
                ? new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                : "Agora";

            row.innerHTML = `
                <div class="msg-bubble">
                    ${msg.conteudo || msg.texto}
                    <span class="msg-time">${horaFormatada}</span>
                </div>
            `;
            caixa.appendChild(row);
        });

        // Rola automaticamente para a última mensagem se necessário
        if (estaNoFinal) {
            caixa.scrollTop = caixa.scrollHeight;
        }

    } catch (erro) {
        console.warn("Erro na sincronização de mensagens:", erro);
    }
}

/**
 * 4. DISPARA O POST /api/mensagens PARA ENVIAR TEXTOS REALMENTE AO BANCO
 */
async function capturarEEnviarMensagemAPI() {
    const input = document.getElementById("input-mensagem-texto");
    if (!input) return;

    const textoMensagem = input.value.trim();
    if (!textoMensagem) return; // Ignora inputs vazios

    const token = localStorage.getItem("token_jwt");

    // Bloqueia temporariamente o input para evitar duplo clique acidental
    input.disabled = true;

    try {
        // Payload estruturado conforme a especificação do backend
        const payloadMensagem = {
            id_destinatario: idDestinatario,
            conteudo: textoMensagem
        };

        const resposta = await fetch(`${API_BASE_URL}/mensagens`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payloadMensagem)
        });

        if (resposta.ok) {
            input.value = ""; // Limpa a barra de digitação
            await carregarEMostrarMensagensAPI(); // Força atualização imediata da tela
        } else {
            const erroRes = await resposta.json();
            alert(erroRes.erro || "Falha ao entregar mensagem.");
        }
    } catch (erro) {
        console.error("Erro no envio do chat:", erro);
        alert("Erro de ligação com o servidor.");
    } finally {
        input.disabled = false;
        input.focus();
    }
}

// Garante a limpeza do timer ao sair da página para evitar vazamento de memória (Memory Leak)
window.addEventListener("beforeunload", () => {
    if (intervaloSync) clearInterval(intervaloSync);
});