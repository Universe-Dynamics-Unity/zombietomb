function mostrarTienda(ver) { document.getElementById("pantallaTienda").classList.toggle("oculto", !ver); }

function cambiarTab(id, b) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(id).classList.add('active'); b.classList.add('active');
}

function comprarPotenciador(t, p) {
    if (dinero >= p) {
        if(t === 'vida' && hp >= 5) return;
        dinero -= p;
        if (t === 'escudo') tieneEscudo = true;
        if (t === 'iman') tieneIman = true;
        if (t === 'flash') player.speed = 25;
        if (t === 'vida') hp++;
        guardarProgreso();
    }
}

function comprarSkin(c, p) { if (dinero >= p) { dinero -= p; skinColor = c; guardarProgreso(); } }

// === SECCIÓN DE DIAMANTES ===
function canjearDiamantes() { 
    if (dinero >= 1000) { dinero -= 1000; diamantes += 10; guardarProgreso(); } 
    else { alert("Necesitas $1000 monedas"); }
}

function comprarSuperVida() {
    if (diamantes >= 15) { diamantes -= 15; hp = 10; guardarProgreso(); alert("¡Vida aumentada a 10!"); }
    else { alert("Necesitas 15 Diamantes"); }
}

function comprarSkinFantasma() {
    if (diamantes >= 50) { skinColor = "fantasma"; diamantes -= 50; guardarProgreso(); alert("Skin Fantasma: ¡Atraviesas paredes!"); }
    else { alert("Necesitas 50 Diamantes"); }
}

function canjearDinero1() { if (diamantes >= 20) { diamantes -= 20; dinero += 2500; guardarProgreso(); } }
function canjearDinero() { if (puntos >= 100) { puntos -= 100; dinero += 10; guardarProgreso(); } }
function canjearDinero2() { if (puntos >= 150) { puntos -= 150; dinero += 20; guardarProgreso(); } }
