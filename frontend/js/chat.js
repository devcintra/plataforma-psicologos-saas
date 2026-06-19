document.addEventListener("DOMContentLoaded", () => {
    inicializarSistemaDeChat();
});

/* ======================================
   DESCOBERTA AUTOMÁTICA DA URL
====================================== */
function descobrirBaseURL() {
    const hostname = window.location.hostname;
    if (hostname.includes("github.dev") || hostname.includes("app.github.dev")) {
        return window.location.origin.replace(/-\d+\./, "-3000.") + "/api";
    }
    return "http://localhost:3000/api";
}

const API_BASE_URL = descobrirBaseURL();

// Variáveis de controle global
let usuarioTipo = "";       // "paciente" ou "psicologo"
let idDestinatario = null;   // ID com quem se está a conversar
let idPerfilLogado = null;  // ID de quem tem a sessão ativa
let intervaloSync = null;    // Timer do Polling

/* ======================================
   1. INICIALIZAR CHAT
====================================== */
async function inicializarSistemaDeChat() {
    const params = new URLSearchParams(window.location.search);
    usuarioTipo = params.get("tipo") || "paciente";
    
    // Captura o ID do alvo via query string
    idDestinatario = parseInt(params.get("comId") || params.get("id"));

    const token = localStorage.getItem("token") || localStorage.getItem("token_jwt");
    if (!token) {
        alert("Sessão expirada ou utilizador não autenticado. Retornando ao login.");
        window.location.href = usuarioTipo === "paciente" ? "login_pac.html" : "login_psi.html";
        return;
    }

    try {
        const resposta = await fetch(`${API_BASE_URL}/auth/perfil`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const dados = await resposta.json();

        // Pega o ID correto baseado no tipo de usuário logado
        if (dados.usuario.tipo_usuario === "paciente") {
            idPerfilLogado = dados.usuario.id_paciente || dados.usuario.id_usuario;
        } else {
            idPerfilLogado = dados.usuario.id_psicologo || dados.usuario.id_usuario;
        }

        configurarInterfaceCabeçalho();

        await carregarEMostrarMensagensAPI();

        document.getElementById("btn-enviar-mensagem")?.addEventListener("click", capturarEEnviarMensagemAPI);
        document.getElementById("input-mensagem-texto")?.addEventListener("keyup", (e) => {
            if (e.key === "Enter") capturarEEnviarMensagemAPI();
        });

        // Polling para sincronizar mensagens a cada 3 segundos
        intervaloSync = setInterval(carregarEMostrarMensagensAPI, 3000);

        const btnVoltar = document.getElementById("btn-voltar-painel");
        if (btnVoltar) {
            btnVoltar.addEventListener("click", () => {
                if (usuarioTipo === "paciente") {
                    window.location.href = "dashboard_pac.html";
                } else {
                    window.location.href = "dashboard_psi.html";
                }
            });
        }
    } catch (erro) {
        console.error("Erro ao montar estrutura do chat:", erro);
    }
}

/* ======================================
   2. CABEÇALHO DA INTERFACE
====================================== */
function configurarInterfaceCabeçalho() {
    const nomeInteracao = document.getElementById("interacao-nome");
    if (nomeInteracao) {
        nomeInteracao.textContent = usuarioTipo === "paciente" ? "Seu Psicólogo" : "Paciente em Atendimento";
    }
    
    const txtStatus = document.getElementById("txt-status-conexao");
    if (txtStatus) {
        txtStatus.innerHTML = `<span style="color: green;">●</span> Ligado ao Servidor`;
    }
}

/* ======================================
   3. BUSCAR MENSAGENS (GET)
====================================== */
async function carregarEMostrarMensagensAPI() {
    if (!idPerfilLogado || !idDestinatario) return;

    const token = localStorage.getItem("token") || localStorage.getItem("token_jwt");
    const caixa = document.getElementById("caixa-mensagens-chat");
    if (!caixa) return;

    const estaNoFinal = (caixa.scrollHeight - caixa.scrollTop <= caixa.clientHeight + 50);

    try {
        let idPsicologo;
        let idPaciente;

        // Estrutura as variáveis para casar com a rota do backend: /:id_psicologo/:id_paciente
        if (usuarioTipo === "paciente") {
            idPaciente = idPerfilLogado;
            idPsicologo = idDestinatario;
        } else {
            idPsicologo = idPerfilLogado;
            idPaciente = idDestinatario;
        }

        const resposta = await fetch(`${API_BASE_URL}/mensagens/${idPsicologo}/${idPaciente}`, {
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

        listaMensagens.forEach(msg => {
            const row = document.createElement("div");
            row.className = "msg-row";

            // O backend agora nos diz exatamente quem é o remetente!
            if (msg.remetente === usuarioTipo) {
                row.classList.add("sent");
            } else {
                row.classList.add("received");
            }

            const horaFormatada = msg.data_envio 
                ? new Date(msg.data_envio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) 
                : "Agora";

            row.innerHTML = `
                <div class="msg-bubble">
                    ${msg.texto}
                    <span class="msg-time">${horaFormatada}</span>
                </div>
            `;
            caixa.appendChild(row);
        });

        if (estaNoFinal) {
            caixa.scrollTop = caixa.scrollHeight;
        }

    } catch (erro) {
        console.warn("Erro na sincronização de mensagens:", erro);
    }
}

/* ======================================
   4. ENVIAR MENSAGEM (POST)
====================================== */
async function capturarEEnviarMensagemAPI() {
    const input = document.getElementById("input-mensagem-texto");
    if (!input) return;

    const textoMensagem = input.value.trim();
    if (!textoMensagem) return;

    const token = localStorage.getItem("token") || localStorage.getItem("token_jwt");
    input.disabled = true;

    try {
        // Envia APENAS o texto e o destinatário. O backend faz o resto!
        const payloadMensagem = {
            id_destinatario: idDestinatario,
            texto: textoMensagem
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
            input.value = ""; 
            await carregarEMostrarMensagensAPI(); 
        } else {
            const erroRes = await resposta.json();
            alert(`Erro: ${erroRes.erro}\n\nDetalhe do Banco: ${erroRes.detalhe}`);
            console.log("Erro completo:", erroRes);
        }
    } catch (erro) {
        console.error("Erro no envio do chat:", erro);
        alert("Erro de ligação com o servidor.");
    } finally {
        input.disabled = false;
        input.focus();
    }
}

// Limpa a sincronização ao sair
window.addEventListener("beforeunload", () => {
    if (intervaloSync) clearInterval(intervaloSync);
});