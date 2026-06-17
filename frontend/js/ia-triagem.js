document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("chat-input");
    const btnSend = document.getElementById("btn-send");
    const container = document.getElementById("chat-messages");


    // Eventos
    btnSend.addEventListener("click", enviarMensagem);

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            enviarMensagem();
        }
    });


    async function enviarMensagem() {

        const texto = input.value.trim();

        if (!texto) return;


        // Exibe mensagem do paciente
        adicionarMensagem(texto, "user");

        // Limpa o campo
        input.value = "";


        // Mostra indicador de digitação
        const digitando = adicionarMensagem(
            "Assistente IA está analisando seu relato...",
            "bot"
        );


        try {

            // Chama o backend que conversa com a OpenAI
            const resposta = await chamarIA(texto);


            // Remove o "digitando"
            digitando.remove();


            // Exibe resposta da IA
            adicionarMensagem(
                resposta,
                "bot"
            );


        } catch (erro) {

            console.error("Erro IA:", erro);


            digitando.remove();


            adicionarMensagem(
                "Desculpe, não consegui processar sua mensagem agora. Tente novamente em alguns instantes.",
                "bot"
            );
        }
    }



    // Comunicação com o backend
    async function chamarIA(mensagem) {

        const resposta = await fetch(
            "http://localhost:3000/api/ia/triagem",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    mensagem: mensagem
                })
            }
        );


        if (!resposta.ok) {
            throw new Error("Erro na resposta do servidor");
        }


        const dados = await resposta.json();


        return dados.resposta;
    }



    // Cria mensagens no chat
    function adicionarMensagem(texto, tipo) {

        const div = document.createElement("div");

        div.className = `msg ${tipo}`;

        div.textContent = texto;


        container.appendChild(div);


        // Scroll automático
        container.scrollTop = container.scrollHeight;


        return div;
    }

});