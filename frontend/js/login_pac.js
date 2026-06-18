document.addEventListener('DOMContentLoaded', () => {
    configurarFormularioLogin();
});

/**
 * FUNÇÃO AUXILIAR: Descobre dinamicamente a URL da API no Codespaces ou Localhost
 */
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

/**
 * INTEGRAÇÃO REAL COM A API DE LOGIN
 */
function configurarFormularioLogin() {
    const form = document.getElementById('form-login-paciente');

    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento automático da página

        // Captura os dados inseridos pelo utilizador
        const emailDigitado = document.getElementById('email').value.trim();
        const senhaDigitada = document.getElementById('senha').value.trim();

        // Monta o objeto esperado pela API de login da Ana Júlia e do Felipe
        const payloadLogin = {
            email: emailDigitado,
            senha: senhaDigitada
        };

        try {
            // Dispara a requisição POST para o endpoint /auth/login do backend
            const resposta = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payloadLogin)
            });

            const resultado = await resposta.json();

            // Status 200 indica que o login foi aceite e o token gerado com sucesso
            if (resposta.status === 200) {
                
                // Salva o Token JWT retornado e os dados base do utilizador no LocalStorage
                localStorage.setItem('token',resultado.token);
                
                // Guarda um objeto simples do utilizador para usar na Home e na Dashboard (Nome, etc.)
                // Se a sua API retornar o objeto do utilizador dentro de resultado.usuario, guardamos ele.
                // Caso contrário, montamos um objeto base com o e-mail digitado.
                const dadosUsuario = resultado.usuario || { email: emailDigitado, nome: resultado.nome || "Paciente" };
                localStorage.setItem(
    'usuario',
    JSON.stringify(dadosUsuario)
);

localStorage.setItem(
    'cadastro_pac',
    JSON.stringify(dadosUsuario)
);

                alert(`Bem-vindo de volta! Redirecionando para o seu painel...`);
                
                // Redireciona para a Dashboard real do paciente
                window.location.href = 'dashboard_pac.html';

            } else {
                // Exibe mensagens como "Senha incorreta" ou "E-mail não cadastrado" vindas do controller
                alert(`Erro de autenticação:\n\n${resultado.erro || 'E-mail ou senha incorretos.'}`);
            }

        } catch (error) {
            console.error('Erro ao conectar com a API de login:', error);
            alert('Não foi possível comunicar com o servidor. Certifique-se de que o backend está a correr.');
        }
    });
}