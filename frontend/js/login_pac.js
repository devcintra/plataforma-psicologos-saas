document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form-login');

    if (!form) return;

    form.addEventListener('submit', (event) => {
        // Impede o recarregamento padrão da página ao enviar o formulário
        event.preventDefault();

        // Captura os dados digitados pelo usuário na tela de login
        const emailDigitado = document.getElementById('email').value.trim();
        const senhaDigitada = document.getElementById('senha').value.trim();

        // 1. Puxa os dados REAIS do LocalStorage que foram salvos no cadastro_pac
        const contaCadastrada = JSON.parse(localStorage.getItem('cadastro_pac'));

        console.log('Tentativa de login real com:', { email: emailDigitado });

        // 2. Valida se existe alguma conta criada no sistema
        if (!contaCadastrada) {
            alert('Nenhum paciente cadastrado neste navegador. Por favor, crie uma conta primeiro.');
            window.location.href = 'cadastro_pac.html';
            return;
        }

        // 3. Compara o e-mail e a senha digitados com os dados guardados no LocalStorage
        // Nota: Como o formulário de cadastro usa a senha obtida de 'senha-pac', 
        // certifique-se de que a senha foi gravada junto com o payload no localStorage.
        const emailValido = contaCadastrada.email && contaCadastrada.email.toLowerCase() === emailDigitado.toLowerCase();
        
        // Se no seu cadastro você salvou a senha dentro do objeto cadastro_pac, a linha abaixo valida perfeitamente.
        // Caso não tenha salvo, ele validará apenas o e-mail existente como credencial de teste real.
        const senhaValida = contaCadastrada.senha ? contaCadastrada.senha === senhaDigitada : true;

        if (emailValido && senhaValida) {
            
            alert(`Bem-vindo de volta, ${contaCadastrada.nome || 'Paciente'}! Redirecionando...`);
            
            // Redireciona para o painel do paciente integrado com o figma que consome esses dados
            window.location.href = 'dashboard_pac.html';
            
        } else {
            // Mensagem de erro caso os dados não batam com o LocalStorage
            alert('Erro de autenticação!\n\nO e-mail ou a senha digitados não correspondem ao paciente cadastrado no sistema.');
        }
    });
});