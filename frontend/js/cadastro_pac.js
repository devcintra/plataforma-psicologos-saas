document.addEventListener("DOMContentLoaded", () => {
    inicializarMascaras();
    configurarFormularioCadastro();
});

/**
 * 1. APLICAÇÃO DE MÁSCARAS EM TEMPO REAL NOS CAMPOS DO SEU HTML
 */
function inicializarMascaras() {
    const inputCpf = document.getElementById("cpf-pac");
    const inputCelular = document.getElementById("celular-pac");
    const inputCep = document.getElementById("cep-pac");

    // Máscara de CPF: 000.000.000-00
    if (inputCpf) {
        inputCpf.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
            if (value.length > 11) value = value.slice(0, 11); // Trava em 11 dígitos
            
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            
            e.target.value = value;
        });
    }

    // Máscara de Celular: (00) 00000-0000
    if (inputCelular) {
        inputCelular.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11); // Trava em 11 dígitos (DDD + 9 dígitos)
            
            value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
            value = value.replace(/(\d{5})(\d)/, "$1-$2");
            
            e.target.value = value;
        });
    }

    // Máscara de CEP: 00000-000
    if (inputCep) {
        inputCep.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 8) value = value.slice(0, 8); // Trava em 8 dígitos
            
            value = value.replace(/^(\d{5})(\d)/, "$1-$2");
            
            e.target.value = value;
        });
    }
}

/**
 * 2. CAPTURA DOS DADOS, VALIDAÇÃO E PERSISTÊNCIA REAL NO LOCALSTORAGE
 */
function configurarFormularioCadastro() {
    // Captura o formulário presente na sua página (.form-login)
    const form = document.querySelector(".form-login");
    if (!form) return;

    // Garante que o botão principal envie o formulário nativamente e limpa chamadas inline antigas
    const btnCriarConta = document.querySelector(".btn-primary");
    if (btnCriarConta) {
        btnCriarConta.type = "submit";
        btnCriarConta.removeAttribute("onclick");
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault(); // Evita que a página recarregue antes de salvarmos os dados

        // Elementos reais extraídos do seu cadastro_pac.html
        const nomeInput = document.getElementById("nome-pac");
        const emailInput = document.getElementById("email-pac");
        const senhaInput = document.getElementById("senha-pac");
        const celularInput = document.getElementById("celular-pac");
        const cpfInput = document.getElementById("cpf-pac");
        const cepInput = document.getElementById("cep-pac");

        // Captura dados adicionais de preferências do seu formulário
        const periodoSelecionado = document.querySelector('input[name="horario"]:checked')?.value || "Não informado";
        const precoMaximo = document.getElementById("preco-pac")?.value || "Qualquer valor";

        // Validação estrita de campos obrigatórios marcados com "*" no seu HTML
        if (!nomeInput?.value.trim() || !emailInput?.value.trim() || !senhaInput?.value.trim() || !cpfInput?.value.trim()) {
            alert("Por favor, preencha todos os campos obrigatórios sinalizados com asterisco (*).");
            return;
        }

        // Criação do objeto real guardando a SENHA de forma limpa para o sistema de login consultar
        const payloadPaciente = {
            nome: nomeInput.value.trim(),
            email: emailInput.value.trim(),
            senha: senhaInput.value.trim(), // ATUALIZADO: Agora salva a senha real!
            celular: celularInput ? celularInput.value.trim() : "",
            cpf: cpfInput.value.trim(),
            cep: cepInput ? cepInput.value.trim() : "",
            preferencias: {
                periodo: periodoSelecionado,
                faixaPreco: precoMaximo
            },
            dataCadastro: new Date().toLocaleDateString('pt-BR')
        };

        // Salva os dados unificados na chave correta do LocalStorage
        localStorage.setItem("cadastro_pac", JSON.stringify(payloadPaciente));

        alert("Conta de paciente criada com sucesso! Redirecionando para a tela de Login...");

        // Redireciona para a sua página de login do paciente para testar a autenticação
        window.location.href = "login_pac.html";
    });
}