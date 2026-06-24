document.addEventListener("DOMContentLoaded", () => {
    inicializarMascaras();
    configurarFormularioCadastro();
});


function obterBaseURL() {
    const urlAtual = window.location.href;
    if (urlAtual.includes("app.github.dev")) {
        const urlBackend = urlAtual.replace(/-\d+(?=\.app\.github\.dev)/, "-3000");
        const urlOriginal = new URL(urlBackend);
        return `${urlOriginal.origin}/api`;
    }
    return "http://localhost:3000/api";
}

const BASE_URL = obterBaseURL();


function inicializarMascaras() {
    const inputCpf = document.getElementById("cpf-pac");
    const inputCelular = document.getElementById("celular-pac");
    const inputCep = document.getElementById("cep-pac");

    if (inputCpf) {
        inputCpf.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = value;
        });
    }

    if (inputCelular) {
        inputCelular.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
            value = value.replace(/(\d)(\d{4})$/, "$1-$2");
            e.target.value = value;
        });
    }

    if (inputCep) {
        inputCep.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 8) value = value.slice(0, 8);
            value = value.replace(/^(\d{5})(\d)/, "$1-$2");
            e.target.value = value;
        });
    }
}

function configurarFormularioCadastro() {
    const formulario = document.getElementById("form-cadastro-paciente");
    
    if (formulario) {
        formulario.addEventListener("submit", async (e) => {
            e.preventDefault(); // Impede o recarregamento da página

            // Captura dos elementos do HTML
            const nomeInput = document.getElementById("nome-pac");
            const emailInput = document.getElementById("email-pac");
            const senhaInput = document.getElementById("senha-pac");
            const cpfInput = document.getElementById("cpf-pac");
            const celularInput = document.getElementById("celular-pac");
            const cepInput = document.getElementById("cep-pac");

            // Validação estrita de campos obrigatórios antes de enviar à API
            if (!nomeInput?.value.trim() || !emailInput?.value.trim() || !senhaInput?.value.trim() || !cpfInput?.value.trim()) {
                alert("Por favor, preencha todos os campos obrigatórios sinalizados com asterisco (*).");
                return;
            }

            // Captura as preferências do formulário (Checkbox e Select)
            const periodosSelecionados = Array.from(document.querySelectorAll('input[name="horario"]:checked')).map(el => el.value);
            const precoMaximo = document.getElementById("preco-pac")?.value || "";

            const payloadPaciente = {
                nome: nomeInput.value.trim(),
                email: emailInput.value.trim(),
                senha: senhaInput.value.trim(),
                tipo_usuario: "paciente" 
            };

            try {
                // Dispara a requisição para o endpoint de cadastro da dupla
                const resposta = await fetch(`${BASE_URL}/auth/cadastro`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payloadPaciente)
                });

                const resultado = await resposta.json();

                if (resposta.status === 201) {
                    alert("Conta de paciente criada com sucesso!");
                    
                    localStorage.setItem("cadastro_pac_detalhes", JSON.stringify({
                        cpf: cpfInput.value,
                        celular: celularInput?.value,
                        cep: cepInput?.value,
                        preferencias: { periodos: periodosSelecionados, faixaPreco: precoMaximo }
                    }));

                    // Redireciona para o login de paciente
                    window.location.href = "login_pac.html";
                } else {
                    // Exibe o erro exato retornado pelo backend (Ex: "E-mail já cadastrado.")
                    alert(`Erro no cadastro: ${resultado.erro || "Verifique os dados enviados."}`);
                }

            } catch (error) {
                console.error("Erro ao conectar com a API:", error);
                alert("Não foi possível estabelecer conexão com o servidor. Verifique se o backend está rodando no terminal.");
            }
        });
    }
}