document.addEventListener("DOMContentLoaded", () => {
    carregarDadosNoAgendamento();
    preencherDadosDoPaciente();

    const btnConfirmar = document.getElementById("btn-avancar-agendamento");
    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", finalizarAgendamentoConsulta);
    }
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
 * 1. BUSCA OS DADOS REAIS DO PSICÓLOGO VINDO DA API
 */
async function carregarDadosNoAgendamento() {
    try {
        const params = new URLSearchParams(window.location.search);
        // Captura o ID do psicólogo passado na URL (Ex: agendamento.html?id=3)
        const psicologoId = params.get("id");

        if (!psicologoId) {
            alert("Nenhum psicólogo foi selecionado para o agendamento.");
            window.location.href = "listagem-psicologos.html";
            return;
        }

        // Consome o endpoint correto: GET /api/psicologos/{id}
        const resposta = await fetch(`${API_BASE_URL}/psicologos/${psicologoId}`);
        
        if (!resposta.ok) {
            throw new Error("Erro ao buscar dados do psicólogo na API.");
        }

        const dadosPsicologo = await resposta.json();
        console.log(dadosPsicologo);
        
        // Armazena temporariamente no dataset para uso posterior na finalização
        document.body.dataset.psicologoId = psicologoId;

        // Renderiza as informações na tela
        renderizarInformacoesDoAgendamento(dadosPsicologo);
        
        // Monta os horários disponíveis com base nos dados reais retornados
        montarAgendaDoPsicologo(dadosPsicologo);

    } catch (error) {
        console.error("Erro ao carregar dados de agendamento:", error);
        alert("Não foi possível carregar a agenda do psicólogo.");
    }
}

/**
 * 2. INJETA OS DADOS NO HTML (FOTO, NOME, CRP, VALOR)
 */
function renderizarInformacoesDoAgendamento(psicologo) {

    const nome =
        psicologo.Usuario?.nome ||
        "Psicólogo";

    const crp =
        psicologo.crp ||
        "--";

    const valor =
        parseFloat(
            psicologo.valor_consulta || 0
        );

    const foto =
        "../img/avatar-padrao.jpg";


    const avatar =
        document.getElementById(
            "avatar-psi"
        );

    if (avatar) {

        avatar.src = foto;

    }


    const nomeEl =
        document.getElementById(
            "nome-psi"
        );

    if (nomeEl) {

        nomeEl.textContent =
            nome;

    }


    const crpEl =
        document.getElementById(
            "crp-psi"
        );

    if (crpEl) {

        crpEl.textContent =
            `CRP ${crp}`;

    }


    const valorEl =
        document.getElementById(
            "valor-psi"
        );

    if (valorEl) {

        valorEl.textContent =
            `R$ ${valor
                .toFixed(2)
                .replace(".", ",")}`;

    }


    const total =
        document.getElementById(
            "total-consulta"
        );

    if (total) {

        total.textContent =
            `R$ ${valor
                .toFixed(2)
                .replace(".", ",")}`;

    }

}
/**
 * 3. PROCESSA A AGENDA/DISPONIBILIDADE DO BACKEND E CORRIGE O SELETOR DE HORÁRIOS
 */
function montarAgendaDoPsicologo(psicologo) {

    const diasContainer =
        document.getElementById(
            "container-dias-semana"
        );

    const horariosContainer =
        document.getElementById(
            "container-horarios-reais"
        );

    if (
        !diasContainer ||
        !horariosContainer
    ) return;

    diasContainer.innerHTML = "";

    horariosContainer.innerHTML = "";

    const disponibilidades =
        psicologo.Disponibilidades || [];

    if (!disponibilidades.length) {

        horariosContainer.innerHTML =

        `<span class="no-slots-msg">
            Nenhuma disponibilidade cadastrada.
        </span>`;

        return;
    }

    const dias = [

        ...new Set(

            disponibilidades.map(

                item => item.dia_semana

            )

        )

    ];

    dias.forEach(dia => {

        const botao =
            document.createElement(
                "button"
            );

        botao.className =
            "btn-day-select";

        botao.textContent =
            dia;

        botao.addEventListener(
            "click",

            () => {

                document
                    .querySelectorAll(
                        ".btn-day-select"
                    )

                    .forEach(btn => {

                        btn.classList.remove(
                            "selected"
                        );

                    });

                botao.classList.add(
                    "selected"
                );

                mostrarHorarios(
                    dia,
                    disponibilidades
                );

            }

        );

        diasContainer.appendChild(
            botao
        );

    });

}
function mostrarHorarios(
    dia,
    disponibilidades
) {

    const container =
        document.getElementById(
            "container-horarios-reais"
        );

    container.innerHTML = "";

    const horarios =

        disponibilidades.filter(

            item =>

            item.dia_semana === dia

        );

    horarios.forEach(item => {

        const botao =
            document.createElement(
                "button"
            );

        botao.className =
            "btn-hour";

        botao.textContent =

            item.hora_inicio
                .substring(0,5);

botao.addEventListener("click", () => {

    document
        .querySelectorAll(".btn-hour")
        .forEach(btn => {
            btn.classList.remove("selected");
        });

    botao.classList.add("selected");

    container.dataset.horaSelecionada =
        item.hora_inicio;

    document.getElementById(
        "resumo-horario"
    ).textContent =
        `${dia} - ${item.hora_inicio.substring(0,5)}`;

});

        container.appendChild(
            botao
        );

    });

}
/**
 * 4. BUSCA E EXIBE O NOME DO PACIENTE LOGADO NA NAVBAR
 */
function preencherDadosDoPaciente() {
    // Puxa o token para garantir autenticação
    const token =
    localStorage.getItem("token") ||
    localStorage.getItem("token_jwt");
    if (!token) return;

    // Se você tiver dados básicos guardados no LocalStorage durante o login do paciente:
    const dadosPaciente = JSON.parse(localStorage.getItem("cadastro_pac"));
    if (dadosPaciente) {
        const welcomeNav = document.getElementById("nav-paciente-welcome");
        if (welcomeNav) {
            welcomeNav.textContent = `Olá, ${dadosPaciente.nome || "Paciente"}!`;
        }
    }
}

/**
 * 5. VALIDA A ESCOLHA E AVANÇA PARA A CONFIRMAÇÃO FINAL
 */
function finalizarAgendamentoConsulta() {

    const container =
        document.getElementById(
            "container-horarios-reais"
        );

    const horario =
        container?.dataset.horaSelecionada;

    const psicologoId =
        document.body.dataset.psicologoId;

    const motivo =
        document
            .getElementById(
                "motivo-consulta"
            )
            .value
            .trim();

    if (!horario) {

        alert(
            "Escolha um horário."
        );

        return;
    }

    sessionStorage.setItem(
        "novoAgendamento",

        JSON.stringify({

            id_psicologo:
                psicologoId,

            horario,

            motivo

        })
    );

    window.location.href =
        "confirmacao.html";
}
