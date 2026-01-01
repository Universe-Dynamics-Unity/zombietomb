const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajuste para PC: Ancho (Width) 900 y Alto (Height) 550
const viewWidth = 360, viewHeight = 600;
canvas.width = viewWidth; canvas.height = viewHeight;

// === PERSISTENCIA ===
let puntos = parseInt(localStorage.getItem('zt_puntos')) || 0;
let dinero = parseInt(localStorage.getItem('zt_dinero')) || 0;
let diamantes = parseInt(localStorage.getItem('zt_diamantes')) || 0;
let skinColor = localStorage.getItem('zt_skin') || "#00fff7";
let nivelesCompletados = JSON.parse(localStorage.getItem('zt_niveles')) || []; 

let currentLevelPlaying = 1, hp = 3, loading = false, esDificil = false;
let tieneEscudo = false, tieneIman = false;
let map = [], zombies = [], floatingTexts = [];
let camX = 0, camY = 0, modoActual = "", gridSize = 40;
let rows = 0, cols = 0;

const player = { tileX: 0, tileY: 0, px: 0, py: 0, targetX: 0, targetY: 0, speed: 15, moving: false };

function guardarProgreso() {
    localStorage.setItem('zt_puntos', puntos);
    localStorage.setItem('zt_dinero', dinero);
    localStorage.setItem('zt_diamantes', diamantes);
    localStorage.setItem('zt_skin', skinColor);
    localStorage.setItem('zt_niveles', JSON.stringify(nivelesCompletados));
    actualizarInterfaz();
}

function actualizarInterfaz() {
    document.getElementById("pts").innerText = puntos;
    document.getElementById("monedas").innerText = dinero;
    document.getElementById("diamantes").innerText = diamantes;
    document.getElementById("dineroMenu").innerText = dinero;
    document.getElementById("hp").innerText = hp;
}
