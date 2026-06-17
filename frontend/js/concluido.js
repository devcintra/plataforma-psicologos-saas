document.addEventListener("DOMContentLoaded", () => {
    // 1. Carrega os dados na tela mapeando o LocalStorage
    const dadosAgendamento = carregarDadosFinaisDoAgendamento();

    // 2. Configura os eventos dos botões de calendário se os dados existirem
    if (dadosAgendamento) {
        configurarBotoesCalendario(dadosAgendamento);
    }

    // Botão de redirecionamento para o Dashboard Real do Paciente
    document.getElementById("btn-ir-dashboard").addEventListener("click", () => {
        window.location.href = "dashboard_pac.html"; 
    });
});

function carregarDadosFinaisDoAgendamento() {
    const cadastroSessao = JSON.parse(localStorage.getItem("cadastroPsicologo"));
    const dadosPaciente = JSON.parse(localStorage.getItem("cadastro_pac")) || {};

    if (!cadastroSessao) {
        alert("Nenhum agendamento ativo localizado.");
        window.location.href = "index.html";
        return null;
    }

    const consultas = cadastroSessao.consultasAgendadas || [];
    const ultimaConsulta = consultas[consultas.length - 1] || {};

    // Preenche dados do profissional
    const nomeCompletoPsi = `${cadastroSessao.nome || "Profissional"} ${cadastroSessao.sobrenome || ""}`;
    document.getElementById("concluido-nome-psi").textContent = nomeCompletoPsi;
    document.getElementById("concluido-crp-psi").textContent = `CRP: ${cadastroSessao.crp || "00/00000"}`;
    document.getElementById("btn-nome-psi-curto").textContent = cadastroSessao.nome || "Profissional";
    
    if (cadastroSessao.foto) {
        document.getElementById("concluido-avatar-psi").src = cadastroSessao.foto;
    }

    // Tratamento do dia e hora
    const dia = ultimaConsulta.dia || "segunda";
    const hora = ultimaConsulta.hora || "14:00";
    const diaFormatado = dia.charAt(0).toUpperCase() + dia.slice(1);
    
    document.getElementById("concluido-data-hora").textContent = `${diaFormatado}-feira às ${hora}`;

    // Preço e Método
    const valorNumerico = parseFloat(cadastroSessao.valor) || 0;
    const precoFormatado = valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const metodoPagamento = ultimaConsulta.formaPagamento || "PIX";
    document.getElementById("concluido-preco").innerHTML = `${precoFormatado} <span style="font-size: 13px; font-weight: 400; color: #7A6B90; margin-left: 4px;">Pago via ${metodoPagamento.toLowerCase()}</span>`;

    // Dados do Paciente
    const emailPac = ultimaConsulta.email || dadosPaciente.email || "Não informado";
    const telPac = dadosPaciente.telefone || dadosPaciente.celular || "(11) 92132-4342";
    document.getElementById("concluido-email-pac").textContent = emailPac;
    document.getElementById("concluido-tel-pac").textContent = telPac;
    
    if (ultimaConsulta.paciente) {
        const primeiroNome = ultimaConsulta.paciente.split(" ")[0];
        document.getElementById("nav-paciente-welcome").textContent = `Olá, ${primeiroNome}!`;
    }

    return {
        titulo: `Consulta Psicológica - ${nomeCompletoPsi}`,
        detalhes: `Atendimento online via Google Meet com ${nomeCompletoPsi}.`,
        diaSemanaTexto: dia, 
        horarioTexto: hora   
    };
}

// --- FUNÇÕES DE INTEGRAÇÃO COM OS CALENDÁRIOS ---

function configurarBotoesCalendario(dados) {
    const botoes = document.querySelectorAll(".btn-cal");
    
    botoes.forEach(btn => {
        const texto = btn.textContent.toLowerCase();
        
        if (texto.includes("google")) {
            btn.addEventListener("click", () => abrirGoogleCalendar(dados));
        } else if (texto.includes("ical")) {
            btn.addEventListener("click", () => baixarArquivoICal(dados));
        }
    });
}

/**
 * Calcula a data do próximo dia da semana baseado no ano do projeto (2026)
 */
function obterProximaData(diaSemana, horaStr) {
    const mapeamentoDias = {
        "domingo": 0, "segunda": 1, "terca": 2, "terça": 2,
        "quarta": 3, "quinta": 4, "sexta": 5, "sabado": 6, "sábado": 6
    };

    const diaAlvo = mapeamentoDias[diaSemana.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")] || 1;
    
    // Define a base temporal partindo do momento atual em 2026
    const dataResultado = new Date();
    dataResultado.setFullYear(2026); 
    
    let diasFaltantes = (diaAlvo - dataResultado.getDay() + 7) % 7;
    if (diasFaltantes === 0) diasFaltantes = 7; 

    dataResultado.setDate(dataResultado.getDate() + diasFaltantes);

    const [horas, minutos] = horaStr.split(":").map(Number);
    dataResultado.setHours(horas, minutos, 0, 0);

    return dataResultado;
}

function formatarDataISO(date) {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
}

function abrirGoogleCalendar(dados) {
    const dataInicio = obterProximaData(dados.diaSemanaTexto, dados.horarioTexto);
    const dataFim = new Date(dataInicio.getTime() + 50 * 60 * 1000); // 50 min de sessão

    const dataInicioISO = formatarDataISO(dataInicio);
    const dataFimISO = formatarDataISO(dataFim);

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
                `&text=${encodeURIComponent(dados.titulo)}` +
                `&dates=${dataInicioISO}/${dataFimISO}` +
                `&details=${encodeURIComponent(dados.detalhes)}` +
                `&location=${encodeURIComponent("Online (Google Meet)")}` +
                `&sf=true&output=xml`;

    window.open(url, "_blank");
}

function baixarArquivoICal(dados) {
    const dataInicio = obterProximaData(dados.diaSemanaTexto, dados.horarioTexto);
    const dataFim = new Date(dataInicio.getTime() + 50 * 60 * 1000);

    const dataInicioISO = formatarDataISO(dataInicio);
    const dataFimISO = formatarDataISO(dataFim);
    const dataCriacaoISO = formatarDataISO(new Date());

    const conteudoICal = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//PsiConnect//Agendamentos//PT",
        "BEGIN:VEVENT",
        `UID:${Date.now()}@psiconnect.com`,
        `DTSTAMP:${dataCriacaoISO}`,
        `DTSTART:${dataInicioISO}`,
        `DTEND:${dataFimISO}`,
        `SUMMARY:${dados.titulo}`,
        `DESCRIPTION:${dados.detalhes}`,
        "LOCATION:Online (Google Meet)",
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([conteudoICal], { type: "text/calendar;charset=utf-8;" });
    const link = document.createElement("a");
    
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "consulta-psiconnect.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}