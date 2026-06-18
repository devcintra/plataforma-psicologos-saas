document.addEventListener("DOMContentLoaded", () => {
    configurarLogin();
});

/**
 * Descobre automaticamente a URL da API
 * Funciona no Codespaces e localhost
 */
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


function configurarLogin() {

    const formLogin = document.getElementById("formLogin");

    if (!formLogin) return;


    formLogin.addEventListener("submit", async (e) => {

        e.preventDefault();


        const email = document
            .getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const senha = document
            .getElementById("senha")
            .value;


        const botao = formLogin.querySelector("button");

        if (botao) {
            botao.disabled = true;
            botao.textContent = "Entrando...";
        }


        try {

            const resposta = await fetch(
                `${API_BASE_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        senha
                    })
                }
            );


            const resultado = await resposta.json();


            if (!resposta.ok) {
                throw new Error(
                    resultado.erro || "Erro ao realizar login."
                );
            }


            // ===============================
            // Salva dados da sessão
            // ===============================

            localStorage.setItem(
                "token",
                resultado.token
            );

            localStorage.setItem(
                "id_usuario",
                resultado.usuario.id_usuario
            );

            localStorage.setItem(
                "tipo_usuario",
                resultado.usuario.tipo_usuario
            );


            // Salva IDs específicos
            if (resultado.usuario.id_psicologo) {

                localStorage.setItem(
                    "id_psicologo",
                    resultado.usuario.id_psicologo
                );
            }


            if (resultado.usuario.id_paciente) {

                localStorage.setItem(
                    "id_paciente",
                    resultado.usuario.id_paciente
                );
            }


            alert(`Bem-vindo(a), ${resultado.usuario.nome}!`);


            // ===============================
            // Redirecionamento por tipo
            // ===============================

            if (resultado.usuario.tipo_usuario === "psicologo") {

                window.location.href = "dashboard_psi.html";

            } else if (
                resultado.usuario.tipo_usuario === "paciente"
            ) {

                window.location.href = "dashboard_paciente.html";

            } else {

                alert("Tipo de usuário inválido.");

                localStorage.clear();
            }


        } catch (erro) {

            console.error("Erro no login:", erro);

            alert(
                erro.message ||
                "Não foi possível realizar o login."
            );

        } finally {

            if (botao) {
                botao.disabled = false;
                botao.textContent = "Entrar";
            }

        }

    });

}