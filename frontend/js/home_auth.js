document.addEventListener("DOMContentLoaded", () => {
    verificarSessaoPaciente();
});

function verificarSessaoPaciente() {
    // Busca os dados reais salvos no cadastro ou na validação do login
    const dadosPaciente = JSON.parse(localStorage.getItem("cadastro_pac"));
    
    // Captura os elementos da interface do usuário na Home
    const btnPrincipalBusca = document.getElementById("btn-principal-busca");
    const containerBotoesNav = document.getElementById("container-botoes-nav");
    const menuMeusAgendamentos = document.getElementById("menu-meus-agendamentos");

    // Se o objeto existir no LocalStorage, significa que a sessão está ativa
    if (dadosPaciente && (dadosPaciente.nome || dadosPaciente.email)) {
        
        // 1. Altera o destino do botão principal para pular o login e ir direto à listagem/dashboard
        if (btnPrincipalBusca) {
            btnPrincipalBusca.href = "listagem-psicologos.html"; 
            // Caso sua listagem de psicólogos fique em outro arquivo (ex: busca.html), mude para ela aqui.
        }

        // 2. Ativa o link de "Meus agendamentos" no menu superior, igual ao seu protótipo
        if (menuMeusAgendamentos) {
            menuMeusAgendamentos.style.display = "inline-block";
        }

        // 3. Substitui os botões de "Entrar" por uma saudação personalizada e botão de Sair na Navbar
        if (containerBotoesNav) {
            const primeiroNome = dadosPaciente.nome ? dadosPaciente.nome.split(" ")[0] : "Paciente";
            
            containerBotoesNav.innerHTML = `
                <span style="color: var(--text, #1E1030); font-weight: 700; margin-right: 15px; font-size: 15px;">
                    Olá, ${primeiroNome}!
                </span>
                <a href="#" id="btn-logout-sessao" style="
                    color: #D9534F; 
                    text-decoration: none; 
                    font-weight: 700; 
                    font-size: 14px;
                    border: 1px solid #E4D8F5;
                    padding: 6px 14px;
                    border-radius: 20px;
                    background: #FFF5F5;
                ">Sair</a>
            `;

            // Configura a ação do botão "Sair" para limpar a sessão e restaurar a página home limpa
            document.getElementById("btn-logout-sessao").addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("cadastro_pac"); // Encerra a sessão
                window.location.reload(); // Recarrega a Home no estado padrão deslogado
            });
        }
    }
}