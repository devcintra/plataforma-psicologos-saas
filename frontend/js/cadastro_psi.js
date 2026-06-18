const crpInput = document.getElementById("crp");
const telefoneInput = document.getElementById("telefone");
const cepInput = document.getElementById("cep");

// Auxiliar para bloquear letras nos campos numéricos (Original)
const apenasNumerosKeydown = (e) => {
    if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) return;
    if (!/[0-9]/.test(e.key)) e.preventDefault();
};

// Máscara CRP: 00/00000 (Original)
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

// Máscara Telefone (Original)
if (telefoneInput) {
    telefoneInput.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        if (valor.length > 0) valor = "(" + valor;
        if (valor.length > 3) valor = valor.substring(0, 3) + ") " + valor.substring(3);
        if (valor.length > 10) valor = valor.substring(0, 10) + "-" + valor.substring(10, 14);
        e.target.value = valor;
    });
    telefoneInput.addEventListener("keydown", apenasNumerosKeydown);
}

// Máscara CEP (Original)
if (cepInput) {
    cepInput.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        if (valor.length > 5) valor = valor.substring(0, 5) + "-" + valor.substring(5, 8);
        e.target.value = valor;
    });
    cepInput.addEventListener("keydown", apenasNumerosKeydown);
}

/**
 * INTEGRAÇÃO COM CODESPACES E FLUXO DE ENVIO PARA A API
 */
document.addEventListener("DOMContentLoaded", () => {
    configurarFluxoCadastroAPI();
});

function descubrirBaseURL() {
    const hostname = window.location.hostname;
    if (hostname.includes("github.dev") || hostname.includes("app.github.dev")) {
        return window.location.origin.replace(/-\d+\./, "-3000.") + "/api";
    }
    return "http://localhost:3000/api";
}

const API_BASE_URL = descubrirBaseURL();

function configurarFluxoCadastroAPI() {
    // ---- PASSO 1 ----
    const formPasso1 = document.getElementById("formPasso1");
    if (formPasso1) {
        formPasso1.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const senha = document.getElementById("senha").value;
            const confSenha = document.getElementById("conf-senha").value;

            if (senha !== confSenha) {
                alert("As senhas digitadas não coincidem. Por favor, verifique.");
                return;
            }

            const dadosPasso1 = {
                crp: document.getElementById("crp").value.trim(),
                telefone: document.getElementById("telefone").value.trim(),
                email: document.getElementById("email").value.trim().toLowerCase(),
                cep: document.getElementById("cep").value.trim(),
                senha: senha
            };
            
            sessionStorage.setItem("cadastro_psi_p1", JSON.stringify(dadosPasso1));
            window.location.href = "cadastro_psi_passo2.html";
        });
    }

    // ---- PASSO 2 ----
    const formPasso2 = document.getElementById("formPasso2");
    if (formPasso2) {
        formPasso2.addEventListener("submit", (e) => {
            e.preventDefault();
            const dadosPasso2 = {
                formacao: document.getElementById("formacao").value.trim(),
                abordagem: document.getElementById("abordagem").value,
                sobre: document.getElementById("sobre").value.trim()
            };
            sessionStorage.setItem("cadastro_psi_p2", JSON.stringify(dadosPasso2));
            window.location.href = "cadastro_psi_passo3.html";
        });
    }

    // ---- PASSO 3 (ENVIO INTEGRADO AO CONTROLLER DO BACKEND) ----
    const btnCadastrarFinal = document.getElementById("btnCadastrar");
    if (btnCadastrarFinal) {
        const formPasso3 = btnCadastrarFinal.closest("form") || document.getElementById("formPasso3");
        
        if (formPasso3) {
            formPasso3.addEventListener("submit", async (e) => {
                e.preventDefault();
                
                btnCadastrarFinal.disabled = true;
                btnCadastrarFinal.textContent = "Processando...";

                try {
                    const p1 = JSON.parse(sessionStorage.getItem("cadastro_psi_p1")) || {};
                    const p2 = JSON.parse(sessionStorage.getItem("cadastro_psi_p2")) || {};
                    
                    // Tratamento do nome dinâmico baseado no e-mail
                    const parteEmail = p1.email ? p1.email.split("@")[0] : "Profissional";
                    const nomeTratado = "Dr(a). " + parteEmail.charAt(0).toUpperCase() + parteEmail.slice(1);

                    // ====================================================================
                    // ALINHAMENTO EXATO COM O SEU CONTROLLER (POST /api/auth/cadastro)
                    // ====================================================================
                    const payloadPsicologo = {
                        nome: nomeTratado,
                        email: p1.email,
                        senha: p1.senha,
                        tipo_usuario: "psicologo", 
                        telefone: p1.telefone,
                        crp: p1.crp,               
                        valor_consulta: 100.00,    
                        descricao: p2.sobre        
                    };

                    const resposta = await fetch(`${API_BASE_URL}/auth/cadastro`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payloadPsicologo)
                    });

                    const resultado = await resposta.json();

                    if (resposta.ok || resposta.status === 201) {
                        alert("Cadastro de Psicólogo realizado com sucesso via API!");
                        
                        // Guarda o token de autenticação caso retornado
                        if (resultado.token) {
                            localStorage.setItem("token_jwt", resultado.token);
                            localStorage.setItem("token", resultado.token);
                        }

                        // ====================================================================
                        // PERSISTÊNCIA COMPATÍVEL COM O SEU DASHBOARD (Prevenção contra nulos)
                        // ====================================================================
                        // Caso a API retorne o objeto completo usamos ele, senão estruturamos o objeto
                        // no formato relacional esperado pelo Sequelize (com o nó 'Usuario')
                        let objetoPerfil = resultado.psicologo || resultado.usuario || resultado.user || null;

                        if (!objetoPerfil || (!objetoPerfil.crp && !objetoPerfil.Usuario)) {
                            objetoPerfil = {
                                crp: p1.crp,
                                descricao: p2.sobre || "Biografia em desenvolvimento.",
                                valor_consulta: 100.00,
                                foto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
                                Usuario: {
                                    nome: nomeTratado,
                                    sobrenome: "",
                                    email: p1.email,
                                    telefone: p1.telefone
                                },
                                Especialidades: [{ nome: p2.abordagem || "Geral" }],
                                agendaSemanal: { "segunda": [], "terca": [], "quarta": [], "quinta": [], "sexta": [], "sabado": [], "domingo": [] }
                            };
                        }

                        // Salva para que o dashboard.js consiga ler no primeiro login sem erros
                        localStorage.setItem("cadastroPsicologo", JSON.stringify(objetoPerfil));

                        // Limpa o estado temporário do fluxo de passos
                        sessionStorage.clear();
                        window.location.href = "login_psi.html";
                    } else {
                        alert(`Erro no cadastro: ${resultado.erro || "Verifique as informações enviadas."}`);
                        btnCadastrarFinal.disabled = false;
                        btnCadastrarFinal.textContent = "Concluir Cadastro";
                    }

                } catch (error) {
                    console.error("Erro no envio:", error);
                    alert("Erro ao conectar à API. Verifique se o servidor está ativo.");
                    btnCadastrarFinal.disabled = false;
                    btnCadastrarFinal.textContent = "Concluir Cadastro";
                }
            });
        }
    }
}