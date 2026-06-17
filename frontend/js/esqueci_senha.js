document
.getElementById("formRecuperar")
.addEventListener("submit", function(e){

    e.preventDefault();

    const email =
    document.getElementById("email").value;

    const codigo =
    Math.floor(
        100000 + Math.random() * 900000
    );

    localStorage.setItem(
        "codigoRecuperacao",
        codigo
    );

    localStorage.setItem(
        "emailRecuperacao",
        email
    );

    alert(
        "Código enviado: " + codigo
    );

    window.location.href =
    "nova_senha.html";
});