document.addEventListener("DOMContentLoaded", () => {
    inicializarDashboardReal();
});

function inicializarDashboardReal() {
    const contaPaciente = JSON.parse(localStorage.getItem("cadastro_pac"));
    
    if (!contaPaciente) {
        alert("Nenhum paciente logado encontrado. Redirecionando para a página inicial.");
        window.location.href = "index.html";
        return;
    }

    const nomeCompleto = contaPaciente.nome || contaPaciente.nomeCompleto || "Paciente";
    
    document.getElementById("nav-welcome").textContent = `Olá, ${nomeCompleto}!`;
    document.getElementById("txt-boas-vindas").textContent = `Olá, ${nomeCompleto}!`;

    const dataAtual = new Date();
    document.getElementById("lbl-data-desde").textContent = `${dataAtual.toLocaleDateString('pt-BR')}`;

    processarERenderizarSessoes(nomeCompleto);

    // Lógica do botão "Minhas consultas"
    const btnMinhas = document.getElementById("btn-sidebar-minhas");
    if (btnMinhas) {
        btnMinhas.addEventListener("click", () => {
            const alvoSessao = document.getElementById("wrapper-proxima-consulta");
            if (alvoSessao) {
                alvoSessao.scrollIntoView({ behavior: "smooth", block: "center" });
                
                alvoSessao.style.transition = "all 0.3s ease";
                alvoSessao.style.boxShadow = "0 0 15px rgba(123, 63, 168, 0.4)";
                setTimeout(() => {
                    alvoSessao.style.boxShadow = "none";
                }, 1000);
            }
        });
    }
}

function processarERenderizarSessoes(nomePacienteLogado) {
    const containerProxima = document.getElementById("wrapper-proxima-consulta");
    const containerHistorico = document.getElementById("container-historico-lista");
    const lblTotal = document.getElementById("lbl-total-realizadas");
    const notifAgenda = document.getElementById("notif-agenda");

    let bancoPsicologo = JSON.parse(localStorage.getItem("cadastroPsicologo")) || 
                          JSON.parse(localStorage.getItem("cadastroPoolpsicologo")) || {};

    const consultas = bancoPsicologo.consultasAgendadas || [];
    const minhasConsultas = consultas.filter(c => c.paciente.trim().toLowerCase() === nomePacienteLogado.trim().toLowerCase());

    lblTotal.textContent = minhasConsultas.length;

    if (minhasConsultas.length === 0) {
        containerProxima.innerHTML = `
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-title" style="font-size: 12px;">Sua próxima consulta</div>
                <div class="upcoming-card" style="justify-content: center; color: var(--sub); box-shadow: none;">
                    Você ainda não possui consultas agendadas no sistema.
                </div>
            </div>`;
        containerHistorico.innerHTML = `<div class="empty-msg">Nenhum histórico de sessões anteriores localizado.</div>`;
        return;
    }

    containerProxima.innerHTML = "";
    containerHistorico.innerHTML = "";

    let temProxima = false;
    let totalHistorico = 0;

    minhasConsultas.forEach((sessao) => {
        const diaFormatado = sessao.dia.charAt(0).toUpperCase() + sessao.dia.slice(1);
        const statusAtual = sessao.status || "Agendada";

        if ((statusAtual === "Agendada" || statusAtual === "Reagendada") && !temProxima) {
            temProxima = true;
            containerProxima.innerHTML = `
                <div class="card" style="margin-bottom: 20px; padding:0; border:none; background:transparent; box-shadow:none;">
                    <div class="card-title" style="font-size: 12px; margin-bottom: 8px; text-transform: uppercase; font-weight:700; color:var(--sub);">Sua próxima consulta</div>
                    <div class="upcoming-card">
                        <div style="display: flex; gap: 16px; align-items: center;">
                            <img src="${bancoPsicologo.foto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150'}" class="prof-thumb">
                            <div>
                                <h3 style="font-size: 18px; color: var(--text); font-weight:700;">Psic. ${bancoPsicologo.nome || 'Profissional'} ${bancoPsicologo.sobrenome || ''}</h3>
                                <p style="font-size: 12px; color: var(--sub); font-weight:600; margin-top:2px;">CRP: ${bancoPsicologo.crp || '00/00000'}</p>
                                <p style="font-size: 13px; font-weight: 700; margin-top: 6px; color: #5B2D8E;">📅 ${diaFormatado}-feira às ${sessao.hora}</p>
                                <p style="font-size: 12px; color: #7A6B90; font-weight: 600; margin-top: 2px;">Status: <strong>${statusAtual}</strong></p>
                            </div>
                        </div>
                        <div class="btn-group-right" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 14px;">
                            <a href="chat.html?tipo=paciente&id=${sessao.id}" class="btn-action-fill" style="background: #4B5563; border: 1px solid #4B5563; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">💬 Chat</a>
                            <a href="https://meet.google.com/new" target="_blank" class="btn-action-fill" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center;">🎥 Entrar na Sala</a>
                            <button class="btn-action-outline" onclick="reagendarConsulta(${sessao.id})">🔄 Reagendar</button>
                            <button class="btn-action-outline" style="color: #d9534f; border-color: rgba(217,83,79,0.2);" onclick="cancelarConsulta(${sessao.id})">❌ Cancelar</button>
                        </div>
                    </div>
                </div>
            `;
            if(notifAgenda) {
                notifAgenda.textContent = `Sua consulta com Psic. ${bancoPsicologo.nome || ''} está agendada para ${diaFormatado} às ${sessao.hora}.`;
            }
        } else {
            totalHistorico++;
            const itemHist = document.createElement("div");
            itemHist.className = "consulta-row";
            itemHist.style.cssText = "display: flex; gap: 16px; align-items: flex-start; padding: 16px; background:#fff; border-bottom: 1px solid var(--border);";

            if (sessao.avaliacao) {
                itemHist.innerHTML = `
                    <img src="${bancoPsicologo.foto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150'}" style="width: 50px; height: 50px; border-radius: 8px; object-fit:cover;">
                    <div style="flex-grow: 1;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong style="color: var(--text); font-size:14px;">Psic. ${bancoPsicologo.nome || 'Profissional'}</strong>
                            <span style="font-size:12px; color: var(--amber); font-weight:700;">Sua Avaliação: ⭐ ${sessao.avaliacao.nota}.0</span>
                        </div>
                        <p style="font-size: 12px; color: var(--sub);">${diaFormatado} às ${sessao.hora} (${statusAtual})</p>
                        <p style="font-size: 13px; font-style: italic; color: var(--text); margin-top: 8px; background: var(--bg); padding: 8px; border-radius: 6px;">"${sessao.avaliacao.comentario}"</p>
                    </div>
                `;
            } else {
                // AQUI FOI ADICIONADO O CLIQUE DIRETO (onclick="votarEstrelaReal(...)") EM CADA UMA DELAS
                itemHist.innerHTML = `
                    <img src="${bancoPsicologo.foto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150'}" style="width: 50px; height: 50px; border-radius: 8px; object-fit:cover;">
                    <div style="flex-grow: 1;" id="box-avaliar-${sessao.id}">
                        <strong style="color: var(--text); font-size:14px;">Psic. ${bancoPsicologo.nome || 'Profissional'}</strong>
                        <p style="font-size: 12px; color: var(--sub);">${diaFormatado} às ${sessao.hora} — <span>${statusAtual}</span></p>
                        
                        ${statusAtual !== "Cancelada" ? `
                        <div style="margin-top: 8px; background: #FAF8FD; padding: 12px; border-radius: 8px; border: 1px dashed var(--border); display: flex; flex-direction: column;">
                            <span style="font-size: 11px; font-weight:700; color: var(--sub); display:block;">DEIXE SUA AVALIAÇÃO DE ATENDIMENTO:</span>
                            
                            <div style="display: flex; align-items: center; gap: 10px; margin: 6px 0;">
                                <div class="star-box" data-score="0" id="stars-${sessao.id}">
                                    <span class="interactive-star" data-v="1" onclick="votarEstrelaReal(${sessao.id}, 1)">★</span>
                                    <span class="interactive-star" data-v="2" onclick="votarEstrelaReal(${sessao.id}, 2)">★</span>
                                    <span class="interactive-star" data-v="3" onclick="votarEstrelaReal(${sessao.id}, 3)">★</span>
                                    <span class="interactive-star" data-v="4" onclick="votarEstrelaReal(${sessao.id}, 4)">★</span>
                                    <span class="interactive-star" data-v="5" onclick="votarEstrelaReal(${sessao.id}, 5)">★</span>
                                </div>
                                <span id="lbl-nota-clicada-${sessao.id}" style="font-size: 13px; font-weight: 700; color: #5B2D8E;">(Nenhuma nota selecionada)</span>
                            </div>

                            <textarea class="input-review" id="msg-${sessao.id}" placeholder="Como foi sua experiência com este profissional?..."></textarea>
                            <button class="btn-purple-action" style="padding: 6px 14px; font-size:12px; margin-top:8px; width:auto; border-radius:6px;" onclick="gravarAvaliacaoReal(${sessao.id})">Salvar Avaliação</button>
                        </div>` : ''}
                    </div>
                `;
            }
            containerHistorico.appendChild(itemHist);
        }
    });

    if (!temProxima) {
        containerProxima.innerHTML = `
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-title" style="font-size: 12px;">Sua próxima consulta</div>
                <div class="upcoming-card" style="justify-content: center; color: var(--sub); box-shadow: none;">
                    Nenhuma consulta ativa agendada para os próximos dias.
                </div>
            </div>`;
    }
    if (totalHistorico === 0) {
        containerHistorico.innerHTML = `<div class="empty-msg">As consultas passadas ou alteradas aparecerão listadas aqui abaixo.</div>`;
    }
}

// NOVA FUNÇÃO GLOBAL INFALÍVEL PARA PINTAR AS ESTRELAS E DEFINIR O TEXTO
window.votarEstrelaReal = function(idSessao, notaClicada) {
    const boxEstrelas = document.getElementById(`stars-${idSessao}`);
    const indicadorTexto = document.getElementById(`lbl-nota-clicada-${idSessao}`);
    
    if (!boxEstrelas) return;

    // Salva a nota no atributo interno do container
    boxEstrelas.dataset.score = notaClicada;

    // Atualiza o texto imediatamente
    if (indicadorTexto) {
        indicadorTexto.textContent = `-> Selecionou: ${notaClicada} de 5 estrelas`;
    }

    // Varre as estrelas e força a cor via JavaScript direto no elemento
    const estrelas = boxEstrelas.querySelectorAll(".interactive-star");
    estrelas.forEach(s => {
        const valorEstrela = parseInt(s.dataset.v);
        if (valorEstrela <= notaClicada) {
            s.classList.add("active");
            s.style.color = "#F59E0B"; // Cor dourada fixa
        } else {
            s.classList.remove("active");
            s.style.color = "#D1D5DB"; // Volta para o cinza padrão
        }
    });
};

function cancelarConsulta(idSessao) {
    if (!confirm("Tem certeza que deseja cancelar esta consulta? O horário retornará para a agenda pública do profissional.")) return;

    let chaveOrigem = localStorage.getItem("cadastroPsicologo") ? "cadastroPsicologo" : "cadastroPoolpsicologo";
    let bancoPsicologo = JSON.parse(localStorage.getItem(chaveOrigem)) || {};

    if (bancoPsicologo.consultasAgendadas) {
        const achada = bancoPsicologo.consultasAgendadas.find(c => c.id === idSessao);
        if (achada) {
            achada.status = "Cancelada";
            if (bancoPsicologo.agendaSemanal && bancoPsicologo.agendaSemanal[achada.dia]) {
                if (!bancoPsicologo.agendaSemanal[achada.dia].includes(achada.hora)) {
                    bancoPsicologo.agendaSemanal[achada.dia].push(achada.hora);
                    bancoPsicologo.agendaSemanal[achada.dia].sort();
                }
            }
        }

        localStorage.setItem(chaveOrigem, JSON.stringify(bancoPsicologo));
        alert("Consulta cancelada com sucesso!");
        location.reload();
    }
}

function reagendarConsulta(idSessao) {
    alert("Para reagendar, liberaremos sua vaga atual e você poderá escolher um novo horário disponível na lista de profissionais.");
    
    let chaveOrigem = localStorage.getItem("cadastroPsicologo") ? "cadastroPsicologo" : "cadastroPoolpsicologo";
    let bancoPsicologo = JSON.parse(localStorage.getItem(chaveOrigem)) || {};

    if (bancoPsicologo.consultasAgendadas) {
        const achada = bancoPsicologo.consultasAgendadas.find(c => c.id === idSessao);
        if (achada) {
            achada.status = "Cancelada";
            if (bancoPsicologo.agendaSemanal && bancoPsicologo.agendaSemanal[achada.dia]) {
                bancoPsicologo.agendaSemanal[achada.dia].push(achada.hora);
                bancoPsicologo.agendaSemanal[achada.dia].sort();
            }
        }

        localStorage.setItem(chaveOrigem, JSON.stringify(bancoPsicologo));
        window.location.href = "listagem-psicologos.html";
    }
}

function gravarAvaliacaoReal(idSessao) {
    const boxEstrelas = document.getElementById(`stars-${idSessao}`);
    if (!boxEstrelas || !boxEstrelas.dataset.score || boxEstrelas.dataset.score === "0") {
        alert("Por favor, selecione uma nota clicando nas estrelas antes de salvar.");
        return;
    }

    const nota = parseInt(boxEstrelas.dataset.score);
    const comentario = document.getElementById(`msg-${idSessao}`).value.trim();

    let chaveOrigem = localStorage.getItem("cadastroPsicologo") ? "cadastroPsicologo" : "cadastroPoolpsicologo";
    let bancoPsicologo = JSON.parse(localStorage.getItem(chaveOrigem)) || {};

    if (bancoPsicologo.consultasAgendadas) {
        bancoPsicologo.consultasAgendadas = bancoPsicologo.consultasAgendadas.map(c => {
            if (c.id === idSessao) {
                c.avaliacao = { nota: nota, comentario: comentario || "Ótimo atendimento." };
            }
            return c;
        });

        localStorage.setItem(chaveOrigem, JSON.stringify(bancoPsicologo));
        alert(`Avaliação de ${nota} estrelas gravada com sucesso!`);
        location.reload();
    }
}