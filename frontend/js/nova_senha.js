document
.getElementById("formNovaSenha")
.addEventListener("submit", function(e){

    e.preventDefault();

    const codigoDigitado =
    document.getElementById("codigo").value;

    const novaSenha =
    document.getElementById("senha").value;

    const codigoSalvo =
    localStorage.getItem(
        "codigoRecuperacao"
    );

    if(codigoDigitado !== codigoSalvo){

        alert("Código inválido");
        return;
    }

    localStorage.setItem(
        "senhaRecuperada",
        novaSenha
    );

    alert(
        "Senha alterada com sucesso!"
    );

    window.location.href =
    "login_pac.html";
});