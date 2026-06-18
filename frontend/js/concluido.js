document.addEventListener("DOMContentLoaded", () => {

    const dados = carregarDadosFinais();

    if (!dados) return;

    configurarCalendarios(dados);

    const btnDashboard =
        document.getElementById(
            "btn-ir-dashboard"
        );

    if (btnDashboard) {

        btnDashboard.addEventListener(
            "click",

            () => {

                sessionStorage.removeItem(
                    "ultimo_agendamento_sucesso"
                );

                window.location.href =
                    "dashboard_pac.html";

            }

        );

    }

});

function carregarDadosFinais() {

    const dados = JSON.parse(

        sessionStorage.getItem(
            "ultimo_agendamento_sucesso"
        )

    );

    if (!dados) {

        alert(
            "Nenhum agendamento encontrado."
        );

        window.location.href =
            "dashboard_paciente.html";

        return null;

    }

    const nomePsi =
        dados.nomePsi || "Psicólogo";

    const data =
        dados.data || "";

    const hora =
        dados.hora || "";

    const nomeEl =
        document.getElementById(
            "concluido-nome-psi"
        );

    if (nomeEl) {

        nomeEl.textContent =
            nomePsi;

    }

    const horarioEl =
        document.getElementById(
            "concluido-data-hora"
        );

    if (horarioEl) {

        horarioEl.textContent =

            `${data} às ${hora}`;

    }

    const nomeCurto =
        document.getElementById(
            "btn-nome-psi-curto"
        );

    if (nomeCurto) {

        nomeCurto.textContent =
            nomePsi;

    }

    return {

        titulo:

            `Consulta com ${nomePsi}`,

        dataConsulta:

            data,

        horarioTexto:

            hora.substring(0, 5),

        detalhes:

            "Consulta online PsiConnect"

    };

}

function configurarCalendarios(
    dados
) {

    const google =

        document.querySelector(
            ".btn-agenda.google"
        );

    const apple =

        document.querySelector(
            ".btn-agenda.apple"
        );

    if (google) {

        google.addEventListener(

            "click",

            () => {

                abrirGoogleCalendar(
                    dados
                );

            }

        );

    }

    if (apple) {

        apple.addEventListener(

            "click",

            () => {

                baixarArquivoICal(
                    dados
                );

            }

        );

    }

}

function obterDataConsulta(
    data,
    horario
) {

    const dataHora =

        new Date(
            `${data}T${horario}`
        );

    return dataHora;

}

function formatarISO(
    data
) {

    return data

        .toISOString()

        .replace(
            /-|:|\.\d\d\d/g,
            ""
        );

}

function abrirGoogleCalendar(
    dados
) {

    const inicio =

        obterDataConsulta(

            dados.dataConsulta,

            dados.horarioTexto

        );

    const fim =

        new Date(

            inicio.getTime()

            +

            50 * 60 * 1000

        );

    const url =

        `https://calendar.google.com/calendar/render?action=TEMPLATE`

        +

        `&text=${encodeURIComponent(dados.titulo)}`

        +

        `&dates=${formatarISO(inicio)}/${formatarISO(fim)}`

        +

        `&details=${encodeURIComponent(dados.detalhes)}`

        +

        `&location=${encodeURIComponent("Online (Google Meet)")}`;

    window.open(
        url,
        "_blank"
    );

}

function baixarArquivoICal(
    dados
) {

    const inicio =

        obterDataConsulta(

            dados.dataConsulta,

            dados.horarioTexto

        );

    const fim =

        new Date(

            inicio.getTime()

            +

            50 * 60 * 1000

        );

    const conteudo = [

        "BEGIN:VCALENDAR",

        "VERSION:2.0",

        "PRODID:-//PsiConnect//PT",

        "BEGIN:VEVENT",

        `UID:${Date.now()}@psiconnect.com`,

        `DTSTAMP:${formatarISO(new Date())}`,

        `DTSTART:${formatarISO(inicio)}`,

        `DTEND:${formatarISO(fim)}`,

        `SUMMARY:${dados.titulo}`,

        `DESCRIPTION:${dados.detalhes}`,

        "LOCATION:Online (Google Meet)",

        "END:VEVENT",

        "END:VCALENDAR"

    ].join("\r\n");

    const blob =

        new Blob(

            [conteudo],

            {

                type:

                    "text/calendar;charset=utf-8"

            }

        );

    const a =

        document.createElement(
            "a"
        );

    a.href =

        URL.createObjectURL(
            blob
        );

    a.download =

        "consulta_psiconnect.ics";

    document.body.appendChild(
        a
    );

    a.click();

    document.body.removeChild(
        a
    );

}