const crpInput = document.getElementById("crp");
const telefoneInput = document.getElementById("telefone");
const cepInput = document.getElementById("cep");

// Auxiliar para bloquear letras nos campos numéricos
const apenasNumerosKeydown = (e) => {
    if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) return;
    if (!/[0-9]/.test(e.key)) e.preventDefault();
};

// Máscara CRP: 00/00000
if (crpInput) {
    crpInput.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        if (valor.length > 2) {
            valor = valor.substring(0, 2) + "/" + valor.substring(2, 7);
        }
        e.target.value = valor;
    });
    crpInput.addEventListener("keydown", apenasNumerosKeydown);
}

// Máscara Telefone: (00) 00000-0000 ou (00) 0000-0000
if (telefoneInput) {
    telefoneInput.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        if (valor.length > 0) {
            valor = "(" + valor;
        }
        if (valor.length > 3) {
            valor = valor.substring(0, 3) + ") " + valor.substring(3);
        }
        if (valor.length > 9) {
            valor = valor.substring(0, 10) + "-" + valor.substring(10, 14);
        } else if (valor.length > 7) {
            valor = valor.substring(0, 9) + "-" + valor.substring(9);
        }
        e.target.value = valor;
    });
    telefoneInput.addEventListener("keydown", apenasNumerosKeydown);
}

// Máscara CEP: 00000-000
if (cepInput) {
    cepInput.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        if (valor.length > 5) {
            valor = valor.substring(0, 5) + "-" + valor.substring(5, 8);
        }
        e.target.value = valor;
    });
    cepInput.addEventListener("keydown", apenasNumerosKeydown);
}


// ==========================================
// FLUXO DO FORMULÁRIO DE CADASTRO (PASSOS)
// ==========================================

// PASSO 1: Informações Básicas
const formPasso1 = document.getElementById("formPasso1");

if (formPasso1) {
    formPasso1.addEventListener("submit", (e) => {
        e.preventDefault();

        // Extrai apenas os números para validação rígida
        const crpLimpo = document.getElementById("crp").value.replace(/\D/g, '');
        const telefoneLimpo = document.getElementById("telefone").value.replace(/\D/g, '');
        const cepLimpo = document.getElementById("cep").value.replace(/\D/g, '');
        
        const senha = document.getElementById("senha").value;
        const confSenha = document.getElementById("conf-senha").value;

        // Validações de tamanho mínimo/exato
        if (crpLimpo.length !== 7) {
            alert("O CRP deve conter exatamente 7 números.");
            document.getElementById("crp").focus();
            return;
        }

        if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
            alert("O telefone deve conter o DDD mais 8 ou 9 dígitos.");
            document.getElementById("telefone").focus();
            return;
        }

        if (cepLimpo.length !== 8) {
            alert("O CEP deve conter exatamente 8 números.");
            document.getElementById("cep").focus();
            return;
        }

        if (senha.length < 6) {
            alert("A senha deve ter no mínimo 6 caracteres.");
            document.getElementById("senha").focus();
            return;
        }

        if (senha !== confSenha) {
            alert("As senhas não coincidem.");
            document.getElementById("conf-senha").focus();
            return;
        }

        // Salva os dados estruturados temporariamente no LocalStorage
        const dadosBasicos = {
            nome: document.getElementById("nome").value,
            sobrenome: document.getElementById("sobrenome").value,
            crp: document.getElementById("crp").value, 
            telefone: telefoneLimpo,
            cep: cepLimpo,
            email: document.getElementById("email").value,
            senha: senha
        };

        localStorage.setItem("cadastroPsicologo", JSON.stringify(dadosBasicos));
        window.location.href = "cadastro_psi_passo2.html";
    });
}

// PASSO 2: Formação e Abordagem
const formPasso2 = document.getElementById("formPasso2");

if (formPasso2) {
    formPasso2.addEventListener("submit", (e) => {
        e.preventDefault();

        const cadastro = JSON.parse(localStorage.getItem("cadastroPsicologo"));

        if (!cadastro) {
            alert("Sessão expirada. Volte ao Passo 1.");
            window.location.href = "cadastro_psi.html";
            return;
        }

        cadastro.formacao = document.getElementById("formacao").value;
        cadastro.sobre = document.getElementById("sobre").value;
        cadastro.abordagem = document.getElementById("abordagem").value;

        localStorage.setItem("cadastroPsicologo", JSON.stringify(cadastro));
        window.location.href = "cadastro_psi_passo3.html";
    });
}

// PASSO 3: Simulação de Envio bem-sucedido (MOCK 200 OK)
const formPasso3 = document.getElementById("formPasso3");

if (formPasso3) {
    formPasso3.addEventListener("submit", (e) => {
        e.preventDefault();

        const cadastro = JSON.parse(localStorage.getItem("cadastroPsicologo"));
        if (!cadastro) {
            alert("Sessão expirada. Por favor, reinicie o cadastro do passo 1.");
            window.location.href = "cadastro_psi.html";
            return;
        }

        // Coleta as escolhas estruturadas do Passo 3
        cadastro.especialidades = [
            ...document.querySelectorAll('input[name="especialidade"]:checked')
        ].map(item => item.value);

        // Mapeia dinamicamente os valores de turno marcados ('manha', 'tarde', 'noite')
        cadastro.disponibilidade = [
            ...document.querySelectorAll('input[name="disponibilidade"]:checked')
        ].map(item => item.value);

        // Garante que o valor numérico seja tratado corretamente
        const valorRaw = document.getElementById("valor").value;
        cadastro.valor = parseFloat(valorRaw) || 0;

        const fotoInput = document.getElementById("foto-input");
        const fotoArquivo = fotoInput ? fotoInput.files[0] : null;

        const btn = document.getElementById("btnCadastrar");
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Processando requisição de rede...";
        }

        // Função interna simulando o recebimento síncrono da resposta 200 OK do servidor
        const finalizarFluxoComSucessoAPI = () => {
            // Envolvemos em um Timeout idêntico para simular latência real de rede externa
            setTimeout(() => {
                try {
                    // Armazena o payload final no banco de dados local simulado
                    localStorage.setItem("cadastroPsicologo", JSON.stringify(cadastro));
                    
                    console.log("[POST /api/psicologo/register - Response 200 OK]", cadastro);
                    alert("Simulação API: Cadastro Concluído com sucesso (Status 200 OK)!");
                    
                    window.location.href = "dashboard.html";
                } catch (erroMemoria) {
                    console.error("Erro crítico de estouro do LocalStorage:", erroMemoria);
                    alert("A imagem selecionada excedeu o limite de memória do navegador. Tente usar uma foto de perfil mais leve.");
                    if (btn) {
                        btn.disabled = false;
                        btn.textContent = "Concluir Cadastro";
                    }
                }
            }, 1500); // Latência padrão estável de 1.5s
        };

        // Se houver foto, realiza o tratamento de compressão gráfica em Canvas antes do envio da API
        if (fotoArquivo) {
            if (btn) btn.textContent = "Comprimindo imagem de perfil...";
            
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.src = event.target.result;
                
                img.onload = function () {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    
                    // ALTERADO: Redução para dimensões máximas perfeitas para avatar (120x120px)
                    const MAX_WIDTH = 120;
                    const MAX_HEIGHT = 120;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // ALTERADO: Qualidade de compressão reduzida para 0.4 (40%) para gerar uma string levíssima
                    cadastro.foto = canvas.toDataURL("image/jpeg", 0.4);
                    
                    finalizarFluxoComSucessoAPI();
                };
            };
            reader.readAsDataURL(fotoArquivo);
        } else {
            // Caso não envie foto, define um avatar padrão de placeholder médico
            cadastro.foto = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop";
            finalizarFluxoComSucessoAPI();
        }
    });
}