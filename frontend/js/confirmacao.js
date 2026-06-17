document.addEventListener("DOMContentLoaded", () => {
    recuperarDadosPassoAnterior();
    configurarSelecaoPagamento();

    // Evento de Voltar
    document.getElementById("btn-voltar-passo1").addEventListener("click", () => {
        window.history.back();
    });

    // Evento de Conclusão Final
    document.getElementById("btn-finalizar-tudo").addEventListener("click", efetuarPagamentoEAgendar);
});

let dadosAgendamentoProvisorio = {};

function recuperarDadosPassoAnterior() {
    // Busca os dados do psicólogo e do paciente
    const cadastroSessao = JSON.parse(localStorage.getItem("cadastroPsicologo"));
    const dadosPaciente = JSON.parse(localStorage.getItem("cadastro_pac")) || {};
    
    // Recupera a intenção temporária guardada no passo 1 do agendamento
    // Se o seu fluxo anterior não salvou essas chaves em variáveis globais, resgatamos os placeholders seguros
    const params = new URLSearchParams(window.location.search);
    const dia = params.get("dia") || "segunda";
    const hora = params.get("hora") || "14:00";

    dadosAgendamentoProvisorio = { dia, hora };

    if (!cadastroSessao) {
        alert("Dados do profissional não localizados. Retornando.");
        window.location.href = "index.html";
        return;
    }

    // 1. Preenche Cabeçalho do Profissional (Alinhamento Horizontal)
    document.getElementById("nome-psi").textContent = `${cadastroSessao.nome || "Profissional"} ${cadastroSessao.sobrenome || ""}`;
    document.getElementById("crp-psi").textContent = `CRP: ${cadastroSessao.crp || "00/00000"}`;
    if (cadastroSessao.foto) {
        document.getElementById("avatar-psi").src = cadastroSessao.foto;
    }

    const valorNumerico = parseFloat(cadastroSessao.valor) || 0;
    const precoFormatado = valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById("valor-psi").textContent = precoFormatado;
    document.getElementById("total-consulta").textContent = precoFormatado;

    // 2. Preenche Resumo de Data/Hora
    const diaFormatado = dia.charAt(0).toUpperCase() + dia.slice(1);
    document.getElementById("resumo-horario").textContent = `${diaFormatado}-feira às ${hora}`;

    // 3. Auto-preenche Inputs do Paciente para Revisão rápida
    document.getElementById("rev-nome").value = dadosPaciente.nome || dadosPaciente.nomeCompleto || "";
    document.getElementById("rev-email").value = dadosPaciente.email || "";
    document.getElementById("rev-cpf").value = dadosPaciente.cpf || "";
    document.getElementById("rev-telefone").value = dadosPaciente.telefone || dadosPaciente.celular || "";
    
    if (dadosPaciente.nome) {
        document.getElementById("nav-paciente-welcome").textContent = `Olá, ${dadosPaciente.nome}!`;
    }
}

function configurarSelecaoPagamento() {
    const botoes = document.querySelectorAll(".btn-opcao-pagamento");
    const container = document.getElementById("grupo-pagamento");
    
    // Define padrão inicial no dataset
    container.dataset.metodoSelecionado = "pix";

    botoes.forEach(btn => {
        btn.addEventListener("click", () => {
            botoes.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            container.dataset.metodoSelecionado = btn.dataset.tipo;
        });
    });
}

function efetuarPagamentoEAgendar() {
    const cadastroSessao = JSON.parse(localStorage.getItem("cadastroPsicologo"));
    const metodo = document.getElementById("grupo-pagamento").dataset.metodoSelecionado;
    
    // Captura valores finais caso o usuário tenha editado na hora do pagamento
    const nomeFinal = document.getElementById("rev-nome").value.trim();
    const emailFinal = document.getElementById("rev-email").value.trim();

    if (!nomeFinal || !emailFinal) {
        alert("Por favor, preencha seu nome e e-mail para confirmação da reserva.");
        return;
    }

    if (!cadastroSessao) return;

    // Remove o horário escolhido das opções livres públicas
    const dia = dadosAgendamentoProvisorio.dia;
    const hora = dadosAgendamentoProvisorio.hora;
    if (cadastroSessao.agendaSemanal && cadastroSessao.agendaSemanal[dia]) {
        cadastroSessao.agendaSemanal[dia] = cadastroSessao.agendaSemanal[dia].filter(h => h !== hora);
    }

    // Inicializa repositório de consultas do dashboard caso esteja limpo
    if (!cadastroSessao.consultasAgendadas) {
        cadastroSessao.consultasAgendadas = [];
    }

    // Envia o payload completo formatado para aparecer na aba "Próximas Consultas" do Profissional
    cadastroSessao.consultasAgendadas.push({
        id: Date.now(),
        paciente: nomeFinal,
        email: emailFinal,
        dia: dia,
        hora: hora,
        formaPagamento: metodo.toUpperCase(),
        dataRegistro: new Date().toLocaleDateString('pt-BR')
    });

    // Salva permanentemente as modificações unificadas
    localStorage.setItem("cadastroPsicologo", JSON.stringify(cadastroSessao));

    alert(`Pagamento processado via ${metodo.toUpperCase()}! Agendamento concluído com sucesso. O profissional receberá a notificação no painel.`);
    
    // Envia o usuário para uma tela final de sucesso ou retorna à home
    window.location.href = "concluido.html";    
}