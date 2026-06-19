document.addEventListener("DOMContentLoaded", () => {
    verificarSessao();
    configurarNavegacaoAbas();
    configurarLogout();
    configurarNotificacoes();
    carregarDashboard();
});


function descobrirBaseURL() {
    const hostname = window.location.hostname;

    if (
        hostname.includes("github.dev") ||
        hostname.includes("app.github.dev")
    ) {
        return window.location.origin.replace(
            /-\d+\./,
            "-3000."
        ) + "/api";
    }

    return "http://localhost:3000/api";
}


const API_BASE_URL = descobrirBaseURL();


function verificarSessao() {

    const token = localStorage.getItem("token");
    const idPsicologo = localStorage.getItem("id_psicologo");

    if (!token || !idPsicologo) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "login_psi.html";
        return;
    }
}


async function carregarDashboard() {

    const id = localStorage.getItem("id_psicologo");
    const token =
    localStorage.getItem("token_jwt") ||
    localStorage.getItem("token");

    try {

        const resposta = await fetch(
            `${API_BASE_URL}/psicologos/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );


        if (!resposta.ok) {
            throw new Error(
                "Não foi possível carregar o perfil."
            );
        }


        const psicologo = await resposta.json();


        preencherPerfil(psicologo);

        renderizarHorarios(
            psicologo.Disponibilidades || []
        );

        await carregarConsultas();


    } catch (erro) {

        console.error(
            "Erro ao carregar dashboard:",
            erro
        );

        alert(
            "Erro ao carregar seus dados."
        );
    }
}


function preencherPerfil(psicologo) {

    const usuario = psicologo.Usuario || {};


    const nome =
        usuario.nome || "Profissional";


    const especialidade =
        psicologo.Especialidades &&
        psicologo.Especialidades.length > 0
        ? psicologo.Especialidades[0].nome
        : "Não informada";


    const foto =
        psicologo.foto ||
        "htps://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150";


    const avatar =
        document.getElementById("dash-avatar");

    if (avatar) {
        avatar.src = foto;
    }


    const nomeCampo =
        document.getElementById("dash-nome");

    if (nomeCampo) {
        nomeCampo.textContent = nome;
    }


    const boasVindas =
        document.getElementById("nav-welcome");

    if (boasVindas) {
        boasVindas.textContent =
            `Olá, ${nome.split(" ")[0]}`;
    }


    const crp =
        document.getElementById("dash-crp");

    if (crp) {
        crp.textContent =
            `CRP ${psicologo.crp}`;
    }


    const abordagem =
        document.getElementById("dash-abordagem");

    if (abordagem) {
        abordagem.textContent =
            especialidade;
    }


    const containerEspecialidades =
    document.getElementById("spec-tags");

if (containerEspecialidades) {

    containerEspecialidades.innerHTML = "";

    if (
        psicologo.Especialidades &&
        psicologo.Especialidades.length > 0
    ) {

        psicologo.Especialidades.forEach(
            especialidade => {

                containerEspecialidades.innerHTML += `
                    <span class="tag">
                        ${especialidade.nome}
                    </span>
                `;

            }
        );

    } else {

        containerEspecialidades.innerHTML = `
            <span class="tag">
                Não informada
            </span>
        `;

    }
}


    const sobre = document.getElementById("dash-sobre");

        if (sobre) {
            sobre.textContent =
                psicologo.descricao ||
            "Nenhuma descrição cadastrada.";
        }


    const valor = document.getElementById("sidebar-valor");

    if (valor) {
        valor.textContent = `R$ ${Number(
            psicologo.valor_consulta || 0
        ).toFixed(2).replace(".", ",")}`;
    }

}


function configurarNavegacaoAbas() {

    const btnInicio =
        document.getElementById("menu-btn-inicio");

    const btnConsultas =
        document.getElementById("menu-btn-consultas");


    const abaAgenda =
        document.getElementById(
            "aba-gerenciar-agenda"
        );

    const abaConsultas =
        document.getElementById(
            "aba-consultas-recebidas"
        );


    btnInicio.addEventListener("click", () => {

        btnInicio.classList.add("active");
        btnConsultas.classList.remove("active");


        abaAgenda.classList.add("active");
        abaConsultas.classList.remove("active");

    });


    btnConsultas.addEventListener("click", () => {

        btnConsultas.classList.add("active");
        btnInicio.classList.remove("active");


        abaConsultas.classList.add("active");
        abaAgenda.classList.remove("active");

    });

}
// ==========================================
// HORÁRIOS - RENDERIZAÇÃO DA AGENDA
// ==========================================

function renderizarHorarios(disponibilidades) {

    const grid = document.getElementById("week-grid");

    if (!grid) return;

    grid.innerHTML = "";


    const dias = [
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
        "domingo"
    ];


    dias.forEach(dia => {

        const coluna = document.createElement("div");
        coluna.className = "day-col";


        const horariosDoDia = disponibilidades.filter(
            item =>
                item.dia_semana
                    .toLowerCase()
                    .replace("ç", "c")
                    .replace("á", "a")
                    === dia
        );


        let conteudoHoras = "";


        if (horariosDoDia.length === 0) {

            conteudoHoras = `
                <span class="no-hours">
                    Nenhum horário
                </span>
            `;

        } else {


            horariosDoDia.forEach(horario => {

                conteudoHoras += `
                    <div class="hour-tag">
                        ${horario.hora_inicio} às ${horario.hora_fim}

                        <span 
                            class="remove-hour"
                            onclick="removerHorario(${horario.id_disponibilidade})"
                        >
                            &times;
                        </span>

                    </div>
                `;
            });

        }


        const nomeDia = dia
            .replace("terca", "Terça")
            .replace("sabado", "Sábado");


        coluna.innerHTML = `
            <div class="day-name">
                ${nomeDia.charAt(0).toUpperCase() + nomeDia.slice(1)}
            </div>

            <div class="hours-list">
                ${conteudoHoras}
            </div>
        `;


        grid.appendChild(coluna);

    });

}


// ==========================================
// ADICIONAR HORÁRIO
// ==========================================

window.openModal = async function () {


    const dia = prompt(
        "Digite o dia (segunda, terca, quarta, quinta, sexta, sabado ou domingo):"
    );


    if (!dia) return;


    const diaFormatado = dia
        .toLowerCase()
        .trim()
        .replace("ç", "c")
        .replace("á", "a");


    const diasValidos = [
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
        "domingo"
    ];


    if (!diasValidos.includes(diaFormatado)) {

        alert("Dia inválido!");

        return;

    }


    const horaInicio = prompt(
    "Digite o horário inicial (Ex: 08:00):"
    );

    if (!horaInicio) return;


    const horaFim = prompt(
        "Digite o horário final (Ex: 09:00):"
    );

    if (!horaFim) return;


    const token = localStorage.getItem("token");


    try {


        const resposta = await fetch(
            `${API_BASE_URL}/disponibilidade`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    dia_semana: diaFormatado,
                    hora_inicio: horaInicio,
                    hora_fim: horaFim
                })

            }
        );


        const resultado = await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                resultado.erro || "Erro ao cadastrar horário"
            );

        }


        alert("Horário adicionado com sucesso!");


        // recarrega todos os dados do dashboard
        carregarDashboard();


    } catch (erro) {


        console.error(erro);

        alert(
            erro.message || "Erro ao adicionar horário."
        );

    }

};


// ==========================================
// REMOVER HORÁRIO
// ==========================================

window.removerHorario = async function(id) {


    const confirmar = confirm(
        "Deseja remover este horário?"
    );


    if (!confirmar) return;


    const token = localStorage.getItem("token");


    try {


        const resposta = await fetch(
            `${API_BASE_URL}/disponibilidade/${id}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }

            }
        );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao remover horário."
            );

        }


        alert(
            "Horário removido com sucesso!"
        );


        // atualiza a agenda
        carregarDashboard();


    } catch (erro) {


        console.error(erro);

        alert(
            "Não foi possível remover o horário."
        );

    }

};
// ==========================================
// CONSULTAS AGENDADAS
// ==========================================

async function carregarConsultas() {

    const container = document.getElementById(
        "container-consultas-completo"
    );

    if (!container) return;


    const token =
    localStorage.getItem("token_jwt") ||
    localStorage.getItem("token");

    try {


        const resposta = await fetch(
            `${API_BASE_URL}/consultas`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );


        const consultas = await resposta.json();
        console.log("Consultas recebidas:", consultas);


        if (!resposta.ok) {

            throw new Error(
                consultas.erro ||
                "Erro ao buscar consultas"
            );

        }


        container.innerHTML = "";


        // Caso não tenha nenhuma consulta
        if (!consultas.length) {

            container.innerHTML = `
                <div 
                    style="
                        text-align:center;
                        padding:40px;
                        color:var(--plum);
                    "
                >
                    <div 
                        style="
                            font-size:30px;
                            margin-bottom:10px;
                        "
                    >
                        📅
                    </div>

                    <p>
                        Nenhuma consulta agendada até o momento.
                    </p>

                </div>
            `;

            return;

        }


        // Monta os cards das consultas
        consultas.forEach(consulta => {


            const nomePaciente =
                consulta.Paciente?.Usuario?.nome ||
                consulta.Paciente?.nome ||
                "Paciente";


            const data =
                consulta.data_consulta ||
                consulta.data ||
                consulta.dia ||
                "Data não informada";


            const hora =
                consulta.hora ||
                consulta.horario ||
                "--:--";


            const status =
                consulta.status ||
                "Confirmada";


            const idConsulta =
                consulta.id_consulta ||
                consulta.id;


            const card = document.createElement("div");

            card.className = "consulta-card-item";


           card.innerHTML = `

    <div class="c-info">

        <div class="c-paciente">
            ${nomePaciente}
        </div>

        <div class="c-detalhes">

            <span>
                🗓️ ${data}
            </span>

            <span style="margin-left:15px;">
                🕒 ${hora}
            </span>

            <span
                style="
                    margin-left:15px;
                    color:green;
                    font-weight:600;
                "
            >
                ● ${status}
            </span>

        </div>

    </div>

    <div class="c-actions">

        <a
            href="chat.html?tipo=psicologo&id=${consulta.id_paciente}"
            class="btn-action-chat"
        >
            💬 Abrir Chat
        </a>

        <a
            href="https://meet.google.com/"
            target="_blank"
            class="btn-action-meet"
            style="
                margin-left:10px;
            "
        >
            🎥 Google Meet
        </a>

    </div>

`;


            container.appendChild(card);


        });


    } catch (erro) {


        console.error(
            "Erro ao carregar consultas:",
            erro
        );


        container.innerHTML = `

            <div 
                style="
                    text-align:center;
                    padding:25px;
                    color:#888;
                "
            >

                Não foi possível carregar as consultas.

            </div>

        `;


    }

}
function configurarLogout() {

    const btnSair = document.getElementById("btn-sair");

    if (!btnSair) return;

    btnSair.addEventListener("click", () => {

        const confirmar = confirm(
            "Deseja realmente sair da sua conta?"
        );

        if (!confirmar) return;


        // Limpa os dados da sessão
        localStorage.removeItem("token");
        localStorage.removeItem("token_jwt");
        localStorage.removeItem("id_psicologo");
        localStorage.removeItem("usuario");

        // Volta para o login
        window.location.href = "login_psi.html";

    });

}
function configurarNotificacoes() {

    const btn = document.getElementById(
        "btn-notificacoes"
    );

    if (!btn) return;


    btn.addEventListener("click", () => {

        alert(
            "Você não possui notificações no momento."
        );

    });

}