document.addEventListener("DOMContentLoaded", () => {
    carregarDadosNoAgendamento();
    preencherDadosDoPaciente();

    const btnConfirmar = document.getElementById("btn-avancar-agendamento");
    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", finalizarAgendamentoConsulta);
    }
});

async function carregarDadosNoAgendamento() {
    try {
        const params = new URLSearchParams(window.location.search);
        const psicologoId = params.get("id") || params.get("crp") || "recem-cadastrado";

        const respostaApi = await obtenerProfissionalParaAgendamentoAPI(psicologoId);

        if (respostaApi.status === 200) {
            const dadosPsicologo = respostaApi.data;
            renderizarInformacoesDoAgendamento(dadosPsicologo);
            montarSeletorDeDias(); // Cria a barra estética de dias da semana
        }
    } catch (error) {
        console.error("Erro ao carregar dados de agendamento:", error);
    }
}

function obtenerProfissionalParaAgendamentoAPI(id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const cadastroSessao = JSON.parse(localStorage.getItem("cadastroPsicologo"));
            if (cadastroSessao) {
                resolve({
                    status: 200,
                    data: {
                        nome: `${cadastroSessao.nome || "Profissional"} ${cadastroSessao.sobrenome || ""}`,
                        crp: cadastroSessao.crp || "00/00000",
                        valor: parseFloat(cadastroSessao.valor) || 120.00,
                        foto: cadastroSessao.foto || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150"
                    }
                });
            }
        }, 200);
    });
}

function renderizarInformacoesDoAgendamento(psi) {
    if (document.getElementById("nome-psi")) document.getElementById("nome-psi").textContent = psi.nome;
    if (document.getElementById("crp-psi")) document.getElementById("crp-psi").textContent = `CRP: ${psi.crp}`;
    if (document.getElementById("avatar-psi") && psi.foto) document.getElementById("avatar-psi").src = psi.foto;

    const precoFormatado = psi.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (document.getElementById("valor-psi")) document.getElementById("valor-psi").textContent = precoFormatado;
    if (document.getElementById("total-consulta")) document.getElementById("total-consulta").textContent = precoFormatado;
}

/**
 * Cria os botões para escolha do dia da semana (Segunda a Domingo)
 */
function montarSeletorDeDias() {
    const containerDias = document.getElementById("container-dias-semana");
    if (!containerDias) return;
    containerDias.innerHTML = "";

    const diasChaves = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
    const diasNomes = {
        "segunda": "Segunda", "terca": "Terça", "quarta": "Quarta",
        "quinta": "Quinta", "sexta": "Sexta", "sabado": "Sábado", "domingo": "Domingo"
    };

    diasChaves.forEach(dia => {
        const btnDia = document.createElement("button");
        btnDia.classList.add("btn-day-select");
        btnDia.textContent = diasNomes[dia];
        btnDia.type = "button";

        btnDia.addEventListener("click", () => {
            document.querySelectorAll(".btn-day-select").forEach(b => b.classList.remove("selected"));
            btnDia.classList.add("selected");
            
            // Puxa e mostra os horários cadastrados para este dia específico
            buscarHorariosDoDiaSelecionado(dia);
        });

        containerDias.appendChild(btnDia);
    });
}

/**
 * Puxa dinamicamente os horários salvos no dashboard para o dia clicado
 */
function buscarHorariosDoDiaSelecionado(dia) {
    const containerHorarios = document.getElementById("container-horarios-reais");
    if (!containerHorarios) return;
    containerHorarios.innerHTML = "";

    // Armazena o dia ativo no container
    containerHorarios.dataset.diaSelecionado = dia;
    containerHorarios.dataset.horaSelecionada = ""; // Limpa seleção antiga

    const resumo = document.getElementById("resumo-horario");
    if (resumo) resumo.textContent = "Nenhum horário selecionado";

    const cadastroSessao = JSON.parse(localStorage.getItem("cadastroPsicologo"));
    
    if (!cadastroSessao || !cadastroSessao.agendaSemanal || !cadastroSessao.agendaSemanal[dia] || cadastroSessao.agendaSemanal[dia].length === 0) {
        containerHorarios.innerHTML = `<span class="no-slots-msg">Não há horários disponíveis cadastrados para este dia.</span>`;
        return;
    }

    const horasDisponiveis = cadastroSessao.agendaSemanal[dia];

    horasDisponiveis.forEach(hora => {
        const btnHora = document.createElement("button");
        btnHora.classList.add("btn-hour");
        btnHora.textContent = hora;
        btnHora.type = "button";

        btnHora.addEventListener("click", () => {
            document.querySelectorAll(".btn-hour").forEach(b => b.classList.remove("selected"));
            btnHora.classList.add("selected");
            containerHorarios.dataset.horaSelecionada = hora;
            
            if (resumo) {
                const diaFormatado = dia.charAt(0).toUpperCase() + dia.slice(1);
                resumo.textContent = `${diaFormatado}-feira às ${hora}`;
            }
        });

        containerHorarios.appendChild(btnHora);
    });
}

/**
 * CORRIGIDO: Valida a escolha e passa a responsabilidade para a tela de confirmação
 */
function finalizarAgendamentoConsulta() {
    const containerHorarios = document.getElementById("container-horarios-reais");
    const horaSelecionada = containerHorarios ? containerHorarios.dataset.horaSelecionada : null;
    const diaSelecionado = containerHorarios ? containerHorarios.dataset.diaSelecionado : null;

    if (!horaSelecionada || !diaSelecionado) {
        alert("Por favor, selecione um dia e um horário disponível antes de continuar.");
        return;
    }

    // Avança para o Passo 2 enviando as escolhas de dia/hora por parâmetro URL de forma segura
    window.location.href = `confirmacao.html?dia=${diaSelecionado}&hora=${horaSelecionada}`;
}

function preencherDadosDoPaciente() {
    const dadosPaciente = JSON.parse(localStorage.getItem("cadastro_pac"));
    if (dadosPaciente) {
        const welcomeNav = document.getElementById("nav-paciente-welcome");
        if (welcomeNav && dadosPaciente.nome) {
            welcomeNav.textContent = `Olá, ${dadosPaciente.nome}!`;
        }
    }
}