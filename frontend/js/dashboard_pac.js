document.addEventListener("DOMContentLoaded", () => {
    inicializarDashboard();
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

async function inicializarDashboard() {

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("token_jwt");

    if (!token) {

    console.error(
      "Token não encontrado."
    );

    console.log(
      localStorage
    );

    alert(
      "Faça login novamente."
    );

    window.location.href =
    "login_pac.html";

    return;
}

    try {
        const resposta = await fetch(`${API_BASE_URL}/auth/perfil`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!resposta.ok) {
            throw new Error("Erro ao buscar perfil");
        }

        const dados = await resposta.json();

        console.log(dados);

        const usuario = dados.usuario.dataValues || dados.usuario;

        preencherPerfil(usuario);

        await carregarConsultas(token);

    } catch (erro) {
        console.error("Erro no dashboard:", erro);
        alert("Erro ao carregar seu painel.");
    }
}

function preencherPerfil(usuario) {
    const navWelcome = document.getElementById("nav-welcome");

    if (navWelcome) {
        navWelcome.textContent = `Olá, ${usuario.nome}!`;
    }

    const txtBoasVindas = document.getElementById("txt-boas-vindas");

    if (txtBoasVindas) {
        txtBoasVindas.textContent = `Olá, ${usuario.nome}!`;
    }
}

async function carregarConsultas(token) {

    try {

        const resposta = await fetch(

            `${API_BASE_URL}/consultas`,

            {

                method: "GET",

                headers: {

                    "Content-Type": "application/json",

                    "Authorization": `Bearer ${token}`
                }

            }

        );

        const consultas =
    await resposta.json();

console.log(consultas);

        if (!resposta.ok) {

            throw new Error(

                consultas.erro ||

                "Erro ao carregar consultas"

            );
        }

        atualizarDashboardConsultas(
            consultas
        );

    }

    catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível carregar suas consultas."
        );
    }
}

function atualizarDashboardConsultas(consultas = []) {

    const lblTotal = document.getElementById("lbl-total-realizadas");
    if (lblTotal) {
        lblTotal.textContent = consultas.length;
    }

   const proximaConsulta =
    document.getElementById(
    "container-proxima-consulta"
    );

    const historico =document.getElementById(
        "container-historico-consultas"
    );

    if (!proximaConsulta || !historico) return;

    proximaConsulta.innerHTML = "";
    historico.innerHTML = "";

    if (consultas.length === 0) {
        proximaConsulta.innerHTML = `<p style="color: var(--sub); margin:0;">Nenhuma consulta agendada.</p>`;
        historico.innerHTML = `<p style="color: var(--sub); margin:0;">Nenhuma consulta realizada.</p>`;
        return;
    }

    // Normaliza status
    const futuras = consultas
        .filter(c =>["agendada","confirmada"].includes((c.status || "").toLowerCase()))
        .sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta));

    const historicoConsultas = consultas
        .sort((a, b) =>
        new Date(b.data_consulta) -
        new Date(a.data_consulta)
    );

    // PRÓXIMA CONSULTA
    if (futuras.length > 0) {

        const consulta = futuras[0];

        const nomePsicologo =
            consulta.Psicologo?.Usuario?.nome ||
            "Psicólogo";

        proximaConsulta.innerHTML = `
    <div class="consulta-row">

        <div>

            <strong>${nomePsicologo}</strong><br>

            📅 ${consulta.data_consulta}<br>

            🕒 ${consulta.horario}

        </div>

        <div style="
            display:flex;
            gap:10px;
            align-items:center;
        ">

            <span style="
                color:green;
                font-weight:600;
            ">

                ● ${consulta.status}

            </span>

            <a
                href="https://meet.google.com"
                target="_blank"
                class="btn-action btn-chat"
            >

                Inicia chamada

            </a>
            <a
    href="chat.html?tipo=paciente&id=${consulta.id_psicologo}"
    class="btn-action btn-chat"
>
    💬 Abrir Chat
</a>

        </div>

    </div>
`;
    } else {
        proximaConsulta.innerHTML = `
            <p style="color: var(--sub); margin:0;">
                Nenhuma consulta futura.
            </p>
        `;
    }

    if (historicoConsultas.length === 0) {

        historico.innerHTML = `<p style="color: var(--sub); margin:0;">Nenhuma consulta encontrada.</p>`;

    return;
}

historicoConsultas.forEach(consulta => {
    const nomePsicologo =
        consulta.Psicologo?.Usuario?.nome ||
        "Psicólogo";
    const div =
        document.createElement("div");

    div.className =
        "consulta-row";
    div.innerHTML = `
        <div>
            <strong>${nomePsicologo}</strong><br>
            📅 ${consulta.data_consulta}<br>
            🕒 ${consulta.horario}
        </div>

        <div>
            <span style="font-weight:600; text-transform:capitalize;">${consulta.status}</span>
        </div>`;
    historico.appendChild(div);
});
}
async function cancelarConsulta(idConsulta){

    const token =
    localStorage.getItem("token") ||
    localStorage.getItem("token_jwt");

    try{

        const resposta = await fetch(

            `${API_BASE_URL}/consultas/${idConsulta}/status`,

            {

                method:"PATCH",

                headers:{

                    "Content-Type":"application/json",

                    "Authorization":`Bearer ${token}`

                },

                body:JSON.stringify({

                    status:"cancelada"

                })

            }

        );

        const dados =
        await resposta.json();
        alert(JSON.stringify(dados));

        if(!resposta.ok){

            throw new Error(

                dados.erro ||

                "Erro ao cancelar"

            );
        }

        alert(
            "Consulta cancelada."
        );

        location.reload();

    }

    catch(erro){

        console.error(erro);

        alert(
            "Erro ao cancelar."
        );

    }

}