// === CREDITOS Y MODALES ===
function mostrarCreditos(ver) { document.getElementById("pantallaCreditos").classList.toggle("oculto", !ver); }
function abrirConfirmacion() { document.getElementById("modalAlertaContenedor").classList.remove("oculto"); }
function cerrarConfirmacion() { document.getElementById("modalAlertaContenedor").classList.add("oculto"); }
function borrarTodo() { localStorage.clear(); location.reload(); }

// === NAVEGACIÓN ===
function mostrarSelector(ver) {
    document.getElementById("selectorNiveles").classList.toggle("oculto", !ver);
    if(ver) {
        const container = document.getElementById("timelineList");
        container.innerHTML = "";
        let maxVisible = nivelesCompletados.length + 1;
        for(let i = 1; i <= maxVisible; i++) {
            let div = document.createElement("div");
            let esCompletado = nivelesCompletados.includes(i);
            div.className = "lvl-btn " + (esCompletado ? "completado" : (i === maxVisible ? "actual" : ""));
            div.innerText = i;
            div.onclick = () => { if(esCompletado || i === maxVisible) iniciarJuego('historia', i); };
            container.appendChild(div);
        }
    }
}

function regresarAlMenu() {
    document.getElementById("selectorNiveles").classList.add("oculto");
    document.getElementById("menuPrincipal").classList.remove("oculto");
    map = [];
}