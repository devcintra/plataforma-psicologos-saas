document.addEventListener("DOMContentLoaded", () => {

    carregarResumo();
    preencherPaciente();
    configurarPagamento();

    const btnVoltar = document.getElementById(
        "btn-voltar-passo1"
    );

    if (btnVoltar) {

        btnVoltar.addEventListener(
            "click",

            () => {

                window.history.back();

            }

        );

    }

    const btnFinalizar = document.getElementById(
        "btn-finalizar-tudo"
    );

    if (btnFinalizar) {

        btnFinalizar.addEventListener(
            "click",

            confirmarConsulta

        );

    }

});

function descobrirBaseURL() {

    const hostname =
        window.location.hostname;

    if (

        hostname.includes(
            "github.dev"
        )

    ) {

        return window.location.origin.replace(

            /-\d+\./,

            "-3000."

        ) + "/api";

    }

    return "http://localhost:3000/api";

}

const API_BASE_URL =
    descobrirBaseURL();

function carregarResumo() {

    const dados = JSON.parse(

        sessionStorage.getItem(
            "novoAgendamento"
        )

    );

    if (!dados) {

        alert(
            "Agendamento não encontrado."
        );

        window.location.href =
            "agendamento.html";

        return;

    }

    document.body.dataset.psicologoId =
        dados.id_psicologo;

    document.body.dataset.horario =
        dados.horario;

    const resumo =

        document.getElementById(
            "resumo-horario"
        );

    if (resumo) {

        resumo.textContent =
            dados.horario;

    }

    carregarPsicologo(
        dados.id_psicologo
    );

}

async function carregarPsicologo(id) {

    try {

        const resposta = await fetch(

            `${API_BASE_URL}/psicologos/${id}`

        );

        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar psicólogo."
            );

        }

        const psi =
            await resposta.json();

        const nome =

            psi.Usuario?.nome ||

            "Psicólogo";

        const valor =

            parseFloat(

                psi.valor_consulta || 0

            );

        document.getElementById(
            "nome-psi"
        ).textContent = nome;

        document.getElementById(
            "crp-psi"
        ).textContent =

            `CRP ${psi.crp || "--"}`;

        document.getElementById(
            "valor-psi"
        ).textContent =

            `R$ ${valor
                .toFixed(2)
                .replace(".", ",")}`;

        document.getElementById(
            "total-consulta"
        ).textContent =

            `R$ ${valor
                .toFixed(2)
                .replace(".", ",")}`;

    }

    catch (erro) {

        console.error(erro);

    }

}

function preencherPaciente() {

    const usuario = JSON.parse(

        localStorage.getItem(
            "usuario"
        )

    );

    if (!usuario) return;

    const nome =

        document.getElementById(
            "rev-nome"
        );

    const email =

        document.getElementById(
            "rev-email"
        );

    if (nome) {

        nome.value =
            usuario.nome || "";

    }

    if (email) {

        email.value =
            usuario.email || "";

    }

}

function configurarPagamento() {

    const botoes =

        document.querySelectorAll(
            ".btn-opcao-pagamento"
        );

    botoes.forEach(botao => {

        botao.addEventListener(

            "click",

            () => {

                botoes.forEach(b => {

                    b.classList.remove(
                        "selected"
                    );

                });

                botao.classList.add(
                    "selected"
                );

            }

        );

    });

}

async function confirmarConsulta() {

    try {

        const token =

            localStorage.getItem(
                "token"
            )

            ||

            localStorage.getItem(
                "token_jwt"
            );

        if (!token) {

            alert(
                "Faça login novamente."
            );

            return;

        }

        const idPsicologo =

            document.body.dataset.psicologoId;

        const horario =

            document.body.dataset.horario;

        if (

            !idPsicologo ||

            !horario

        ) {

            alert(
                "Dados do agendamento inválidos."
            );

            return;

        }

        const hoje =

            new Date();

        const dataConsulta =

            hoje.toISOString()
                .split("T")[0];

        const resposta = await fetch(

            `${API_BASE_URL}/consultas`,

            {

                method: "POST",

                headers: {

                    "Content-Type":

                        "application/json",

                    Authorization:

                        `Bearer ${token}`

                },

                body: JSON.stringify({

                    id_psicologo:

                        parseInt(
                            idPsicologo
                        ),

                    data_consulta:

                        dataConsulta,

                    horario:

                        horario

                })

            }

        );

        const resultado =

            await resposta.json();

        if (!resposta.ok) {

            throw new Error(

                resultado.erro ||

                "Erro ao agendar consulta."

            );

        }

        const nomePsi =

            document.getElementById(
                "nome-psi"
            ).textContent;

        sessionStorage.setItem(

            "ultimo_agendamento_sucesso",

            JSON.stringify({

                nomePsi,

                data: dataConsulta,

                hora: horario,

                consulta:

                    resultado.consulta

            })

        );

        sessionStorage.removeItem(
            "novoAgendamento"
        );

        window.location.href =
            "concluido.html";

    }

    catch (erro) {

        console.error(erro);

        alert(

            erro.message ||

            "Erro ao finalizar consulta."

        );

    }

}