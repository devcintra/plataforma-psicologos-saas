document.addEventListener("DOMContentLoaded", () => {

    // =================================================================
    // LEITURA DO LOCALSTORAGE (MOCK DA API)
    // =================================================================
    const dadosCadastro = localStorage.getItem("cadastroPsicologo");
    if (!dadosCadastro) return;

    const cadastro = JSON.parse(dadosCadastro);

    if (!cadastro.agendaSemanal) {
        cadastro.agendaSemanal = { "segunda": [], "terca": [], "quarta": [], "quinta": [], "sexta": [], "sabado": [], "domingo": [] };
    }

    // Injeções básicas estruturais
    const avatarImg = document.getElementById("dash-avatar");
    if (avatarImg && cadastro.foto) avatarImg.src = cadastro.foto;

    const dashNomeElement = document.getElementById("dash-nome");
    if (dashNomeElement) dashNomeElement.textContent = `${cadastro.nome || ""} ${cadastro.sobrenome || ""}`.trim();

    const welcomeElement = document.getElementById("nav-welcome");
    if (welcomeElement) welcomeElement.textContent = `Olá, ${cadastro.nome || "Profissional"}`;

    const crpElement = document.getElementById("dash-crp");
    if (crpElement) crpElement.textContent = `CRP ${cadastro.crp || "--/-----"}`;

    const campoAbordagem = document.getElementById("dash-abordagem");
    if (campoAbordagem && cadastro.abordagem) {
        campoAbordagem.textContent = `Abordagem: ${cadastro.abordagem}`;
        campoAbordagem.style.display = "inline-block";
    }

    const sobreElement = document.getElementById("dash-sobre");
    if (sobreElement) sobreElement.textContent = cadastro.sobre || "Apresentação clínica.";

    const specTags = document.getElementById("spec-tags");
    if (specTags && cadastro.especialidades) {
        specTags.innerHTML = cadastro.especialidades.map(e => `<span class="tag">${e}</span>`).join("");
    }

    const valorElement = document.getElementById("sidebar-valor");
    if (valorElement && cadastro.valor) {
        valorElement.textContent = parseFloat(cadastro.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Painéis Superiores Estáticos
    const viewsElement = document.getElementById("stat-views");
    const agElement = document.getElementById("stat-ag");
    if (viewsElement) viewsElement.textContent = "18";

    // =================================================================
    // CONTROLO DE ABAS DO MENU (SISTEMA DE NAVEGAÇÃO)
    // =================================================================
    const menuInicio = document.getElementById("menu-btn-inicio");
    const menuConsultas = document.getElementById("menu-btn-consultas");
    
    const abaAgenda = document.getElementById("aba-gerenciar-agenda");
    const abaConsultas = document.getElementById("aba-consultas-recebidas");

    if (menuInicio && menuConsultas) {
        menuInicio.addEventListener("click", () => {
            menuInicio.classList.add("active");
            menuConsultas.classList.remove("active");
            abaAgenda.classList.add("active");
            abaConsultas.classList.remove("active");
        });

        menuConsultas.addEventListener("click", () => {
            menuConsultas.classList.add("active");
            menuInicio.classList.remove("active");
            abaConsultas.classList.add("active");
            abaAgenda.classList.remove("active");
            
            renderizarAbaConsultasExclusiva();
        });
    }

    // =================================================================
    // RENDERIZAÇÃO DA AGENDA (CONFIGURADOR DE DIAS)
    // =================================================================
    function renderizarHorariosDashboard() {
        const gridContainer = document.getElementById("week-grid");
        if (!gridContainer) return;
        gridContainer.innerHTML = "";

        const diasChaves = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
        const diasNomes = {
            "segunda": "Segunda-feira", "terca": "Terça-feira", "quarta": "Quarta-feira",
            "quinta": "Quinta-feira", "sexta": "Sexta-feira", "sabado": "Sábado", "domingo": "Domingo"
        };

        diasChaves.forEach(dia => {
            const listaHoras = cadastro.agendaSemanal[dia] || [];

            const colunaDia = document.createElement("div");
            colunaDia.style.background = "var(--white)";
            colunaDia.style.border = "1px solid var(--border)";
            colunaDia.style.borderRadius = "var(--radius-sm)";
            colunaDia.style.padding = "14px";
            colunaDia.style.display = "flex";
            colunaDia.style.flexDirection = "column";
            colunaDia.style.gap = "8px";

            colunaDia.innerHTML = `<h4 style="color: #5B2D8E; border-bottom: 2px solid #F0EAF9; padding-bottom: 4px; font-weight:700;">📅 ${diasNomes[dia]}</h4>`;

            if (listaHoras.length === 0) {
                colunaDia.innerHTML += `<span style="font-size: 12px; color: var(--muted); font-style: italic;">Nenhum horário</span>`;
            } else {
                listaHoras.forEach(hora => {
                    const boxHora = document.createElement("div");
                    boxHora.style.display = "flex";
                    boxHora.style.justifyContent = "space-between";
                    boxHora.style.background = "var(--bg)";
                    boxHora.style.padding = "6px 10px";
                    boxHora.style.borderRadius = "4px";
                    boxHora.style.fontSize = "13px";

                    boxHora.innerHTML = `
                        <strong>${hora}</strong>
                        <button onclick="removerHorarioDiaAPI('${dia}', '${hora}')" style="background:none; border:none; color:var(--rose); cursor:pointer; font-size:11px; font-weight:bold;">Excluir</button>
                    `;
                    colunaDia.appendChild(boxHora);
                });
            }
            gridContainer.appendChild(colunaDia);
        });
    }

    // =================================================================
    // RENDERIZAÇÃO DA LISTA EXCLUSIVA DE CONSULTAS AGENDADAS
    // =================================================================
    function renderizarAbaConsultasExclusiva() {
        const containerCompleto = document.getElementById("container-consultas-completo");
        if (!containerCompleto) return;

        const consultas = cadastro.consultasAgendadas || [];

        if (agElement) agElement.textContent = consultas.length.toString();

        if (consultas.length === 0) {
            containerCompleto.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--muted); font-style: italic; background: #fff; border: 1px dashed var(--border); border-radius: 8px;">
                    Nenhum paciente realizou marcações para os seus horários até ao momento.
                </div>
            `;
            return;
        }

        containerCompleto.innerHTML = "";

        consultas.forEach((consulta, index) => {

            const statusAtual = consulta.status || "Agendada";

            let corStatus = "#5B2D8E";
            let fundoStatus = "#F1EAFB";

            if (statusAtual === "Cancelada") {
                corStatus = "#DC2626";
                fundoStatus = "#FEE2E2";
            } else if (statusAtual === "Reagendada") {
                corStatus = "#D97706";
                fundoStatus = "#FEF3C7";
            } else if (statusAtual === "Concluída") {
                corStatus = "#10B981"; // Verde para concluído
                fundoStatus = "#D1FAE5";
            }

            const card = document.createElement("div");

            card.style.background = "var(--white)";
            card.style.border = "1px solid var(--border)";
            card.style.borderLeft = `5px solid ${corStatus}`;
            card.style.borderRadius = "8px";
            card.style.padding = "16px";
            card.style.boxShadow = "var(--shadow)";
            card.style.display = "flex";
            card.style.flexDirection = "column";
            card.style.gap = "8px";

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <div style="font-weight:700; color:var(--text); font-size:15px;">
                            👤 Paciente: ${consulta.paciente}
                        </div>

                        <div style="font-size:12px; color:var(--muted); margin-top:2px;">
                            Agendado em: ${consulta.dataRegistro || "Recente"}
                        </div>
                    </div>

                    <span style="
                        background:var(--plum-ghost);
                        color:var(--plum);
                        font-weight:700;
                        font-size:13px;
                        padding:4px 10px;
                        border-radius:20px;">
                        ⏰ ${consulta.hora}
                    </span>
                </div>

                <div style="
                    background:var(--bg);
                    padding:8px 12px;
                    border-radius:6px;
                    font-size:13px;
                    color:var(--text);">

                    📅 Dia da consulta:
                    <strong style="text-transform: capitalize;">
                        ${consulta.dia}-feira
                    </strong>
                </div>

                <div style="
                    background:${fundoStatus};
                    color:${corStatus};
                    padding:8px 12px;
                    border-radius:6px;
                    font-size:13px;
                    font-weight:700;">

                    Status: ${statusAtual}
                </div>

                <div style="
                    display:flex;
                    justify-content:flex-end;
                    gap:10px;
                    margin-top:6px;
                    flex-wrap:wrap;
                    align-items: center;">

                    ${statusAtual !== "Concluída" && statusAtual !== "Cancelada" ? `
                        <button
                            onclick="concluirConsulta(${index})"
                            style="
                                background:#10B981;
                                color:white;
                                border:none;
                                padding:8px 12px;
                                border-radius:6px;
                                cursor:pointer;
                                font-size:12px;
                                font-weight:600;">
                            ✔️ Concluir
                        </button>

                        <button
                            onclick="reagendarConsulta(${index})"
                            style="
                                background:#F59E0B;
                                color:white;
                                border:none;
                                padding:8px 12px;
                                border-radius:6px;
                                cursor:pointer;
                                font-size:12px;
                                font-weight:600;">
                            🔄 Reagendar
                        </button>

                        <button
                            onclick="cancelarConsulta(${index})"
                            style="
                                background:#DC2626;
                                color:white;
                                border:none;
                                padding:8px 12px;
                                border-radius:6px;
                                cursor:pointer;
                                font-size:12px;
                                font-weight:600;">
                            ❌ Cancelar
                        </button>
                    ` : ''}

                    <a
                        href="chat.html?tipo=psicologo&id=${consulta.id || index}"
                        style="
                            background:#4B5563;
                            color:#fff;
                            text-decoration:none;
                            font-size:12px;
                            font-weight:600;
                            padding:8px 12px;
                            border-radius:6px;
                            display:inline-block;
                            text-align:center;">
                        💬 Chat
                    </a>

                    ${statusAtual !== "Concluída" && statusAtual !== "Cancelada" ? `
                        <a
                            href="https://meet.google.com/dek-fvjo-qyw"
                            target="_blank"
                            style="
                                background:var(--plum);
                                color:#fff;
                                text-decoration:none;
                                font-size:12px;
                                font-weight:600;
                                padding:8px 12px;
                                border-radius:6px;">
                            🎥 Entrar na Sala
                        </a>
                    ` : ''}
                </div>
            `;

            containerCompleto.appendChild(card);
        });
    }

    // ======================================================
    // MARCAR COMO CONCLUÍDO
    // ======================================================
    window.concluirConsulta = function(index) {
        if (!confirm("Deseja marcar esta consulta como Concluída? O paciente poderá avaliá-la no painel dele.")) return;

        cadastro.consultasAgendadas[index].status = "Concluída";

        localStorage.setItem("cadastroPsicologo", JSON.stringify(cadastro));
        renderizarAbaConsultasExclusiva();
        alert("Consulta concluída com sucesso!");
    };

    window.cancelarConsulta = function(index) {
        const confirmar = confirm("Deseja realmente cancelar esta consulta?");
        if (!confirmar) return;

        cadastro.consultasAgendadas[index].status = "Cancelada";

        localStorage.setItem("cadastroPsicologo", JSON.stringify(cadastro));
        renderizarAbaConsultasExclusiva();
        alert("Consulta cancelada com sucesso!");
    };

    window.reagendarConsulta = function(index) {
        const novaData = prompt("Digite a nova data da consulta (DD/MM/AAAA):");
        if (!novaData) return;

        const novoHorario = prompt("Digite o novo horário (HH:MM):");
        if (!novoHorario) return;

        cadastro.consultasAgendadas[index].dataRegistro = novaData;
        cadastro.consultasAgendadas[index].hora = novoHorario;
        cadastro.consultasAgendadas[index].status = "Reagendada";

        localStorage.setItem("cadastroPsicologo", JSON.stringify(cadastro));
        renderizarAbaConsultasExclusiva();
        alert("Consulta reagendada com sucesso!");
    };

    // Inicializa a renderização inicial e contagem de itens
    renderizarHorariosDashboard();
    renderizarAbaConsultasExclusiva();

    // Adicionar horário pelo painel
    window.openModal = function() {
        const diaInput = prompt("Digite o dia desejado (Ex: segunda, terca, quarta, quinta, sexta, sabado ou domingo):");
        if (!diaInput) return;

        const diaFormatado = diaInput.trim().toLowerCase().replace("terça", "terca").replace("sábado", "sabado");
        const validos = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
        
        if (!validos.includes(diaFormatado)) {
            alert("Dia inválido!");
            return;
        }

        const novoHorario = prompt(`Digite o horário para ${diaInput} (Formato HH:MM, ex: 14:00):`);
        if (!novoHorario) return;

        const horaFinal = novoHorario.trim();
        if (!cadastro.agendaSemanal[diaFormatado].includes(horaFinal)) {
            cadastro.agendaSemanal[diaFormatado].push(horaFinal);
            cadastro.agendaSemanal[diaFormatado].sort();

            localStorage.setItem("cadastroPsicologo", JSON.stringify(cadastro));
            renderizarHorariosDashboard();
        }
    };

    // Remover horário disponível manual
    window.removerHorarioDiaAPI = function(dia, hora) {
        if (!confirm(`Remover ${hora} de ${dia}?`)) return;
        cadastro.agendaSemanal[dia] = cadastro.agendaSemanal[dia].filter(h => h !== hora);
        localStorage.setItem("cadastroPsicologo", JSON.stringify(cadastro));
        renderizarHorariosDashboard();
    };
});