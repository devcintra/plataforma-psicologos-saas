document.addEventListener("DOMContentLoaded", () => {
    const containerLista = document.getElementById("lista-profissionais-container");
    const inputNome = document.getElementById("input-nome");
    const btnBuscar = document.getElementById("btn-buscar");
    
    const selectEspecialidade = document.getElementById("select-especialidade");
    const selectPreco = document.getElementById("select-preco");
    const selectDisponibilidade = document.getElementById("select-disponibilidade");
    const selectOrdenacao = document.getElementById("select-ordenacao");

    // Mock estático de dados contendo as notas simuladas para ordenação
    let dbPsicologos = [
        {
            nome: "Glaucia",
            sobrenome: "Martins",
            crp: "06/123456",
            especialidades: ["ansiedade"],
            disponibilidade: ["noite"],
            valor: 120,
            avaliacao: 5.0,
            votos: 1,
            foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop"
        },
        {
            nome: "Aline",
            sobrenome: "Kaufman",
            crp: "06/992311",
            especialidades: ["infantil", "ansiedade"],
            disponibilidade: ["manha", "tarde"],
            valor: 95,
            avaliacao: 4.9,
            votos: 18,
            foto: "https://images.unsplash.com/photo-1582750433449-64c02ee03f07?q=80&w=150&auto=format&fit=crop"
        },
        {
            nome: "Roberto",
            sobrenome: "Almeida Prado",
            crp: "06/321455",
            especialidades: ["casal"],
            disponibilidade: ["tarde"],
            valor: 180,
            avaliacao: 4.7,
            votos: 12,
            foto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop"
        }
    ];

    // Mescla o psicólogo vindo dinamicamente do localStorage se ele existir
 const cadastroSessao = JSON.parse(localStorage.getItem("cadastroPsicologo"));
    if (cadastroSessao) {
        dbPsicologos.unshift({
            id: "recem-cadastrado", // Identificador para aplicar regras ou tags visuais se desejar
            nome: cadastroSessao.nome || "Profissional",
            sobrenome: cadastroSessao.sobrenome || "Cadastrado",
            crp: cadastroSessao.crp || "00/00000",
            especialidades: cadastroSessao.especialidades || [],
            disponibilidade: cadastroSessao.disponibilidade || [],
            valor: parseFloat(cadastroSessao.valor) || 150, // Puxa o valor dinâmico do formulário
            avaliacao: 5.0,
            votos: 0,
            // PUXA A FOTO CONVERTIDA DO LOCALSTORAGE. Se não existir, usa uma imagem padrão neutra
            foto: cadastroSessao.foto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
        });
    }

    // Função de renderização dos cards horizontais
    function montarListaHTML(lista) {
    containerLista.innerHTML = "";

    if (lista.length === 0) {
        containerLista.innerHTML = `<div class="no-results-msg">Nenhum psicólogo atende aos critérios selecionados.</div>`;
        return;
    }

    lista.forEach((psi, index) => {
        const card = document.createElement("div");
        card.classList.add("card-horizontal-psi");

        const precoFormatado = psi.valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        const textoEspecialidades = psi.especialidades.length > 0 
            ? psi.especialidades.map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(", ")
            : "Atendimento Geral";

        // Adicionamos a classe 'btn-ver-perfil' e guardamos o index ou crp no botão
        card.innerHTML = `
            <div class="card-left-thumb">
                <img src="${psi.foto}" alt="Foto de ${psi.nome}" class="card-avatar-img">
            </div>
            <div class="card-center-content">
                <h2>${psi.nome} ${psi.sobrenome}</h2>
                <p class="crp-info"><strong>CRP:</strong> ${psi.crp}</p>
                
                <span class="badge-status-plataforma">Novo na plataforma</span>
                
                <div class="rating-row">
                    <span class="star-icon">★</span> 
                    <span>${psi.avaliacao.toFixed(1)}</span>
                    <span class="total-reviews">(${psi.votos} ${psi.votos === 1 ? 'Avaliação' : 'Avaliações'})</span>
                </div>

                <div class="inner-details-box">
                    <p><strong>Especialidades:</strong> ${textoEspecialidades}</p>
                    <p><strong>Modalidade:</strong> Online e presencial</p>
                </div>

                <div class="actions-row-buttons">
                    <button class="btn-horizontal-roxo btn-ver-perfil" data-crp="${psi.crp}">Ver perfil</button>
                    <button class="btn-horizontal-outline">Agendar</button>
                </div>
            </div>
            <div class="card-right-pricing">
                <div class="price-value">${precoFormatado}</div>
                <div class="price-subtext">Por sessão</div>
            </div>
        `;

        // Evento de clique para abrir a tela de perfil passando o CRP pela URL
        const btnVerPerfil = card.querySelector(".btn-ver-perfil");
        btnVerPerfil.addEventListener("click", () => {
            window.location.href = `perfil_psicologo.html?crp=${psi.crp}`;
        });

        containerLista.appendChild(card);
    });
}

    // Filtros e ordenação combinados
    function filtrarEOrdenarGeral() {
        const queryNome = inputNome.value.toLowerCase().trim();
        const filtroEsp = selectEspecialidade.value;
        const filtroPreco = selectPreco.value;
        const filtroDisp = selectDisponibilidade.value;
        const tipoOrdenacao = selectOrdenacao.value;

        let filtrados = dbPsicologos.filter(psi => {
            const nomeCompleto = `${psi.nome} ${psi.sobrenome}`.toLowerCase();
            const bateNome = nomeCompleto.includes(queryNome);
            const bateEsp = filtroEsp === "" || psi.especialidades.includes(filtroEsp);
            const bateDisp = filtroDisp === "" || psi.disponibilidade.includes(filtroDisp);

            let batePreco = true;
            if (filtroPreco === "0-100") batePreco = psi.valor <= 100;
            else if (filtroPreco === "101-150") batePreco = psi.valor > 100 && psi.valor <= 150;
            else if (filtroPreco === "151-200") batePreco = psi.valor > 150 && psi.valor <= 200;
            else if (filtroPreco === "201+") batePreco = psi.valor > 200;

            return bateNome && bateEsp && bateDisp && batePreco;
        });

        // Ordenações aplicadas
        if (tipoOrdenacao === "nome") {
            filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
        } else if (tipoOrdenacao === "menor-preco") {
            filtrados.sort((a, b) => a.valor - b.valor);
        } else if (tipoOrdenacao === "avaliacao") {
            filtrados.sort((a, b) => b.avaliacao - a.avaliacao);
        }

        montarListaHTML(filtrados);
    }

    // Escutadores de eventos
    btnBuscar.addEventListener("click", filtrarEOrdenarGeral);
    inputNome.addEventListener("keyup", (e) => { if(e.key === "Enter") filtrarEOrdenarGeral(); });
    
    selectEspecialidade.addEventListener("change", filtrarEOrdenarGeral);
    selectPreco.addEventListener("change", filtrarEOrdenarGeral);
    selectDisponibilidade.addEventListener("change", filtrarEOrdenarGeral);
    selectOrdenacao.addEventListener("change", filtrarEOrdenarGeral);

    // Execução primária
    filtrarEOrdenarGeral();
});