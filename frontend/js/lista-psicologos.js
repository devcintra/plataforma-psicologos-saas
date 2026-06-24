document.addEventListener("DOMContentLoaded", () => {
    configurarFiltros();
    carregarPsicologos();
});

   //DESCOBRIR URL DA API

function descobrirBaseURL() {

    const host = window.location.hostname;

    if (
        host.includes("github.dev")||host.includes("app.github.dev")
    ) {

        const backendHost = host.replace(/-\d+\./,"-3000.");
        return `${window.location.protocol}//${backendHost}/api`;
    }
    return "http://localhost:3000/api";
}

const API_BASE_URL = descobrirBaseURL();


let listaCompleta = [];

   
//BUSCAR PSICÓLOGOS

async function carregarPsicologos() {

    const container = document.getElementById(
        "lista-profissionais-container"
    );

    try {
        container.innerHTML = `<p style="padding:20px;text-align:center;">Carregando profissionais...</p>`;
        const resposta = await fetch(`${API_BASE_URL}/psicologos`
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro ||"Erro ao carregar psicólogos");
        }
        listaCompleta = dados;
        aplicarFiltros();
    }

    catch (erro) {
        console.error("Erro:",erro);
        container.innerHTML = `<p style="padding:20px;color:red;text-align:center;">Não foi possível carregar os psicólogos.</p>`;
    }
}

function configurarFiltros() {

    document.getElementById("btn-buscar")?.addEventListener("click", aplicarFiltros);

    document.getElementById("input-nome")?.addEventListener("keyup",e => {
                if ( e.key === "Enter") {
                    aplicarFiltros();
                }
            }
        );
    [
        "select-especialidade",
        "select-preco",
        "select-ordenacao"
    ]

    .forEach(id => {document.getElementById(id)?.addEventListener("change",aplicarFiltros);
    });
}


/*APLICAR FILTROS */

function aplicarFiltros() {

    const nome = document.getElementById("input-nome")?.value.toLowerCase().trim()|| "";
    const especialidade = document.getElementById("select-especialidade")?.value.toLowerCase()|| "";
    const preco = document.getElementById("select-preco")?.value|| "";
    const ordenacao = document.getElementById("select-ordenacao")?.value|| "nome";

    let resultado =listaCompleta.filter(psi => {
            const nomePsi =(psi.Usuario?.nome ||"").toLowerCase();
            const especialidades = psi.Especialidades
                ?psi.Especialidades.map(esp => esp.nome).join(" ").toLowerCase():"";
            const valor = parseFloat(psi.valor_consulta || 0 );
            const bateNome = nome === "" || nomePsi.includes(nome); 
            const bateEspecialidade = especialidade === "" || especialidades.includes(especialidade);

            let batePreco = true;
            if (preco === "0-100") {
                batePreco =valor <= 100;
            }

            else if (preco === "101-150") {
                batePreco =valor > 100 && valor <= 150;
            }

            else if (preco === "151-200") {
                batePreco = valor > 150 && valor <= 200;
            }
            else if (preco === "201+") {
                batePreco = valor > 200;
            }

            return (bateNome && bateEspecialidade && batePreco);
        });


    if (ordenacao === "nome") {
        resultado.sort((a,b) =>(a.Usuario?.nome ||"").localeCompare(b.Usuario?.nome ||"") );
    }
    if (
        ordenacao === "menor-preco"
    ) {

        resultado.sort((a,b) =>
            parseFloat(a.valor_consulta ||0)-parseFloat(b.valor_consulta ||0)
        );
    }
    renderizar(resultado);

}

function obterFotoPsicologo() {
    return "../img/avatar-padrao.png";
}

function renderizar(lista) {
    const container = document.getElementById("lista-profissionais-container");

    if (!container) {
        return;
    }

    container.className = "professionals-list-section";

    if (lista.length === 0) {
        container.innerHTML = 
        `<p style="padding:40px;text-align:center;">
                Nenhum psicólogo encontrado.
            </p>`;
        return;
    }
    container.innerHTML = "";
    lista.forEach(psi => {
        const nome = psi.Usuario?.nome||"Psicólogo";
        const especialidades = psi.Especialidades?.length?psi.Especialidades.map(e => e.nome).join(", "):"Sem especialidades";
        const descricao = psi.descricao||"Sem descrição.";
        const valor = parseFloat( psi.valor_consulta || 0);
        const crp = psi.crp ||"--";
        const foto = obterFotoPsicologo();
        const card = document.createElement("div");

        card.className =
            "card-horizontal-psi";
        card.innerHTML = `
            <div class="card-left-thumb">
                <imgsrc="${foto}"class="card-avatar-img"alt="${nome}">
            </div>


            <div class="card-center-content">
                <h2>${nome}</h2>
                <p class="crp-info"> CRP: ${crp}</p>
                <span class="badge-status-plataforma">Psicólogo disponível</span>
                <div class="inner-details-box">
                    <p><strong>Especialidades:</strong>${especialidades}</p>
                    <p><strong>Descrição:</strong>${descricao}</p>
                </div>

                <div class="actions-row-buttons">
                    <button class="btn-horizontal-roxo" onclick="window.location.href='perfil-psicologo.html?id=${psi.id_psicologo}'">Ver perfil</button>
                    <button class="btn-horizontal-outline" onclick="window.location.href='agendamento.html?id=${psi.id_psicologo}'">Agendar</button>
                </div>
            </div>

            <div class="card-right-pricing">
                <div class="price-value">R$${valor.toFixed(2).replace(".", ",")}
                </div>
                <div class="price-subtext">Por sessão</div>
            </div>`;

        container.appendChild(card);
    });

}