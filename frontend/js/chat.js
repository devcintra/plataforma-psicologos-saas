document.addEventListener("DOMContentLoaded", () => {
    inicializarSistemaDeChat();
});

let usuarioTipo = ""; // "paciente" ou "psicologo"
let consultaIdAtiva = null;
let bancoPsicologo = {};

function inicializarSistemaDeChat() {
    // 1. Descobre quem está acessando pelos parâmetros da URL (?tipo=paciente&id=123456)
    const params = new URLSearchParams(window.location.search);
    usuarioTipo = params.get("tipo") || "paciente";
    consultaIdAtiva = parseInt(params.get("id"));

    bancoPsicologo = JSON.parse(localStorage.getItem("cadastroPsicologo")) || {};
    const consultas = bancoPsicologo.consultasAgendadas || [];
    const consultaAtual = consultas.find(c => c.id === consultaIdAtiva);

    if (!consultaAtual) {
        alert("Nenhum canal de chat ativo localizado para esta consulta.");
        window.location.href = "index.html";
        return;
    }

    // 2. Configura a interface baseado em quem está logado
    configurarPerfilInterface(consultaAtual);

    // 3. Renderiza as mensagens salvas iniciais
    carregarEMostrarMensagens();

    // 4. Ativa escuta de cliques para enviar mensagem
    document.getElementById("btn-enviar-mensagem").addEventListener("click", capturarEEnviarMensagem);
    document.getElementById("input-mensagem-texto").addEventListener("keypress", (e) => {
        if (e.key === "Enter") capturarEEnviarMensagem();
    });

    // Botão Voltar Dinâmico
    document.getElementById("btn-voltar-painel").addEventListener("click", () => {
        if (usuarioTipo === "psicologo") {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "dashboard_pac.html";
        }
    });

    // 5. Pooling / Loop de atualização automática (Atualiza a conversa a cada 2 segundos)
    setInterval(carregarEMostrarMensagens, 2000);
}

function configurarPerfilInterface(consulta) {
    const avatarImg = document.getElementById("interacao-avatar");
    const nomeTxt = document.getElementById("interacao-nome");
    const detalheTxt = document.getElementById("interacao-detalhe");

    if (usuarioTipo === "paciente") {
        // Se eu sou o paciente, vejo os dados da psicóloga na lateral
        nomeTxt.textContent = `Psic. ${bancoPsicologo.nome || "Profissional"} ${bancoPsicologo.sobrenome || ""}`;
        detalheTxt.textContent = `Sessão: ${consulta.dia}-feira às ${consulta.hora}`;
        if (bancoPsicologo.foto) avatarImg.src = bancoPsicologo.foto;
    } else {
        // Se eu sou a psicóloga, vejo os dados do paciente na lateral
        nomeTxt.textContent = consulta.paciente;
        detalheTxt.textContent = `Horário agendado: ${consulta.hora}`;
        // Letra inicial como placeholder seguro de avatar
        avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(consulta.paciente)}&background=F1EAFB&color=7A6B90&size=128`;
    }
}

function carregarEMostrarMensagens() {
    const caixa = document.getElementById("caixa-mensagens-chat");
    if (!caixa) return;

    // Busca o histórico global de chats ou cria um se estiver vazio
    let historicoChats = JSON.parse(localStorage.getItem("historico_conversas_psi")) || {};
    
    // Filtra apenas as mensagens desse ID de agendamento específico
    let mensagensDaSessao = historicoChats[consultaIdAtiva] || [];

    // Guarda a posição do scroll atual para não atrapalhar a leitura se o usuário subiu a barra
    const estaNoFinal = caixa.scrollHeight - caixa.scrollTop <= caixa.clientHeight + 40;

    caixa.innerHTML = "";

    if (mensagensDaSessao.length === 0) {
        caixa.innerHTML = `<div style="text-align:center; padding-top:40px; color:#9A8BB0; font-size:13px; font-style:italic;">Nenhuma mensagem trocada ainda. Inicie a conversa abaixo!</div>`;
        return;
    }

    mensagensDaSessao.forEach(msg => {
        const row = document.createElement("div");
        row.className = "msg-row";

        // Define o lado do balão (Se eu enviei, fica na direita 'sent'. Se recebi, na esquerda 'received')
        if (msg.remetente === usuarioTipo) {
            row.classList.add("sent");
        } else {
            row.classList.add("received");
        }

        row.innerHTML = `
            <div class="msg-bubble">
                ${msg.texto}
                <span class="msg-time">${msg.horaEnvio}</span>
            </div>
        `;
        caixa.appendChild(row);
    });

    // Rola para o final automaticamente se o usuário já estava lá embaixo
    if (estaNoFinal) {
        caixa.scrollTop = caixa.scrollHeight;
    }
}

function capturarEEnviarMensagem() {
    const input = document.getElementById("input-mensagem-texto");
    const textoMensagem = input.value.trim();

    if (!textoMensagem) return;

    let historicoChats = JSON.parse(localStorage.getItem("historico_conversas_psi")) || {};
    if (!historicoChats[consultaIdAtiva]) {
        historicoChats[consultaIdAtiva] = [];
    }

    const agora = new Date();
    const horaFormatada = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // Estrutura do payload da mensagem
    const novaMensagem = {
        remetente: usuarioTipo, // "paciente" ou "psicologo"
        texto: textoMensagem,
        horaEnvio: horaFormatada,
        timestamp: Date.now()
    };

    historicoChats[consultaIdAtiva].push(novaMensagem);
    localStorage.setItem("historico_conversas_psi", JSON.stringify(historicoChats));

    input.value = "";
    carregarEMostrarMensagens();
}