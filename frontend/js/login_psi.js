/*document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formLogin");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();

        if (!email) {
            alert("E-mail ou CRP é obrigatório.");
            return;
        }

        if (!senha) {
            alert("Senha é obrigatória.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    senha
                })
            });

            // Se a API retornar 200
            if (response.status === 200) {

                const dados = await response.json();

                // Salva o token caso exista
                if (dados.token) {
                    localStorage.setItem("token", dados.token);
                }

                // Redireciona para o dashboard
                window.location.href = "dashboard.html";
                return;
            }

            // Tratamento para outros status
            if (response.status === 401) {
                alert("Usuário ou senha inválidos.");
                return;
            }

            if (response.status === 404) {
                alert("Usuário não encontrado.");
                return;
            }

            alert("Erro ao realizar login.");

        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com o servidor.");
        }
    });
});*/

const form = document.getElementById("formLogin");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!email || !senha) {
        alert("Preencha todos os campos.");
        return;
    }

    // Simulação da resposta da API
    const statusApi = 200;

    if (statusApi === 200) {
        window.location.href = "dashboard.html";
    }
});