class Zombie {
    constructor(x, y) {
        this.tileX = x; this.tileY = y; this.px = x * gridSize; this.py = y * gridSize;
        this.targetX = this.px; this.targetY = this.py; this.speed = 3.5; this.wait = 30;
    }
    update() {
        const dx = this.targetX - this.px; const dy = this.targetY - this.py;
        if (dx || dy) {
            this.px += Math.sign(dx) * Math.min(Math.abs(dx), this.speed);
            this.py += Math.sign(dy) * Math.min(Math.abs(dy), this.speed);
        } else {
            this.wait--;
            if (this.wait <= 0) {
                this.wait = 35;
                const d = [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}][Math.floor(Math.random()*4)];
                let nx = this.tileX, ny = this.tileY;
                while (map[ny + d.y]?.[nx + d.x] === 0 || map[ny + d.y]?.[nx + d.x] === 4) { nx += d.x; ny += d.y; }
                this.tileX = nx; this.tileY = ny; this.targetX = nx * gridSize; this.targetY = ny * gridSize;
            }
        }
        if (Math.abs(this.px - player.px) < 25 && Math.abs(this.py - player.py) < 25) {
            if (tieneEscudo) { tieneEscudo = false; zombies = zombies.filter(z => z !== this); floatingTexts.push({x:player.px, y:player.py, text:"ESCUDO ROTO", life:100}); }
            else { damagePlayer(); }
        }
    }
    draw() { ctx.fillStyle = "#ff0044"; ctx.fillRect(this.px + 8, this.py + 8, 24, 24); }
}

async function cargarArchivoJSON(nombre, num) {
    loading = true;
    try {
        const res = await fetch(`niveles/${nombre}.json`);
        const data = await res.json();
        map = data.mapa; rows = map.length; cols = map[0].length;
        gridSize = data.config.gridSize || 40;
        esDificil = data.dificultad === "hard";
        zombies = data.zombies ? data.zombies.map(z => new Zombie(z.x, z.y)) : [];
        if(modoActual === 'historia' && nivelesCompletados.includes(num)) {
            for(let y=0; y<rows; y++) for(let x=0; x<cols; x++) if(map[y][x] === 0) map[y][x] = 4;
        }
        for (let y=0; y<rows; y++) for (let x=0; x<cols; x++) {
            if (map[y][x] === 3) {
                player.tileX = x; player.tileY = y; player.px = x*gridSize; player.py = y*gridSize;
                player.targetX = player.px; player.targetY = player.py; map[y][x] = 0;
            }
        }
        document.getElementById("lvlDisplay").innerText = num || "A";
        loading = false;
    } catch (e) { loading = false; regresarAlMenu(); }
}

function iniciarJuego(modo, num) {
    modoActual = modo; currentLevelPlaying = num;
    document.querySelectorAll('.screen').forEach(s => s.classList.add("oculto"));
    cargarArchivoJSON(modo === 'arcade' ? 'arcade' : 'nivel' + num, num);
}

function damagePlayer() {
    hp--; actualizarInterfaz();
    if (hp <= 0) { 
        alert("GAME OVER"); 
        hp = 3; map = [];
        document.getElementById("menuPrincipal").classList.remove("oculto");
    } else { iniciarJuego(modoActual, currentLevelPlaying); }
}

function loop() {
    if (!loading && map.length > 0 && hp > 0) {
        let finalColor = skinColor;
        if(skinColor === 'arcoiris') { const hue = (Date.now() / 10) % 360; finalColor = `hsl(${hue}, 100%, 50%)`; }
        if(skinColor === 'fantasma') { finalColor = "rgba(255, 255, 255, 0.5)"; }

        if (player.moving) {
            const dx = player.targetX - player.px, dy = player.targetY - player.py;
            player.px += Math.sign(dx) * Math.min(Math.abs(dx), player.speed);
            player.py += Math.sign(dy) * Math.min(Math.abs(dy), player.speed);
            let curX = Math.floor((player.px + gridSize/2) / gridSize), curY = Math.floor((player.py + gridSize/2) / gridSize);
            if (tieneIman) {
                for(let iy=-1; iy<=1; iy++) for(let ix=-1; ix<=1; ix++) {
                    if (map[curY+iy]?.[curX+ix] === 0) { puntos += 1; map[curY+iy][curX+ix] = 4; guardarProgreso(); }
                }
             } else if (map[curY]?.[curX] === 0) { puntos += 1; map[curY][curX] = 4; guardarProgreso(); }
            if (dx === 0 && dy === 0) {
                player.moving = false;
                if (map[player.tileY][player.tileX] === 2) {
                    if (modoActual === 'historia') {
                        if(!nivelesCompletados.includes(currentLevelPlaying)) nivelesCompletados.push(currentLevelPlaying);
                        guardarProgreso(); alert("Nivel Superado!"); mostrarSelector(true);
                    } else { alert("Fin Arcade"); regresarAlMenu(); }
                }
            }
        }
        zombies.forEach(z => z.update());
        ctx.clearRect(0,0,canvas.width,canvas.height);
        camX = player.px - viewWidth/2 + gridSize/2; camY = player.py - viewHeight/2 + gridSize/2;
        ctx.save(); ctx.translate(-camX, -camY);
        for (let y=0; y<rows; y++) for (let x=0; x<cols; x++) {
            if (map[y][x] === 1) { ctx.fillStyle = "#111"; ctx.strokeStyle = "#00fff7"; ctx.fillRect(x*gridSize,y*gridSize,gridSize,gridSize); ctx.strokeRect(x*gridSize,y*gridSize,gridSize,gridSize); }
            if (map[y][x] === 0) { ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(x*gridSize+gridSize/2, y*gridSize+gridSize/2, 3, 0, Math.PI*2); ctx.fill(); }
            if (map[y][x] === 2) { ctx.fillStyle = "yellow"; ctx.fillRect(x*gridSize+5, y*gridSize+5, gridSize-10, gridSize-10); }
        }
        if (tieneEscudo) { ctx.save(); ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(player.px + gridSize/2, player.py + gridSize/2, 25, 0, Math.PI*2); ctx.stroke(); ctx.restore(); }
        ctx.fillStyle = finalColor; ctx.fillRect(player.px+10, player.py+10, 20, 20);
        zombies.forEach(z => z.draw());
        floatingTexts.forEach((t, i) => {
            ctx.fillStyle = `rgba(255,255,255,${t.life/100})`;
            ctx.fillText(t.text, t.x - 20, t.y - (100 - t.life));
            t.life--; if (t.life <= 0) floatingTexts.splice(i, 1);
        });
        ctx.restore();
        if (esDificil) { ctx.font = "30px Arial"; ctx.fillText("💀", 20, 50 + Math.sin(Date.now()/200)*5); }
    }
    requestAnimationFrame(loop);
}

// --- VARIABLES PARA EL CONTROL HIBRIDO ---
let touchStartX = 0;
let touchStartY = 0;

// Función que procesa la dirección del movimiento
function procesarDireccion(dir) {
    if (player.moving || loading || map.length === 0) return;
    
    let dx = 0, dy = 0;
    if (dir === "UP") dy = -1;
    if (dir === "DOWN") dy = 1;
    if (dir === "LEFT") dx = -1;
    if (dir === "RIGHT") dx = 1;

    if (dx || dy) {
        let nx = player.tileX, ny = player.tileY;
        // Lógica de movimiento continuo (estilo Tomb of the Mask)
        while (map[ny + dy]?.[nx + dx] === 0 || map[ny + dy]?.[nx + dx] === 4 || map[ny + dy]?.[nx + dx] === 2) {
            nx += dx;
            ny += dy;
            // Si llega a la meta o algo especial, se detiene
            if (map[ny][nx] === 2) break; 
        }
        
        if (nx !== player.tileX || ny !== player.tileY) {
            player.tileX = nx;
            player.tileY = ny;
            player.targetX = nx * gridSize;
            player.targetY = ny * gridSize;
            player.moving = true;
        }
    }
}

// --- DETECCIÓN DE TECLADO (PC) ---
window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") procesarDireccion("UP");
    if (e.key === "ArrowDown") procesarDireccion("DOWN");
    if (e.key === "ArrowLeft") procesarDireccion("LEFT");
    if (e.key === "ArrowRight") procesarDireccion("RIGHT");
});

// --- DETECCIÓN DE MOUSE Y TOUCH (PC, Tablet, Celular) ---
const handleStart = (x, y) => { touchStartX = x; touchStartY = y; };

const handleEnd = (x, y) => {
    let diffX = x - touchStartX;
    let diffY = y - touchStartY;
    
    // Umbral mínimo para que no se mueva con un simple clic (sensibilidad)
    if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
            procesarDireccion(diffX > 0 ? "RIGHT" : "LEFT");
        } else {
            procesarDireccion(diffY > 0 ? "DOWN" : "UP");
        }
    }
};

// Eventos de Mouse
canvas.addEventListener("mousedown", e => handleStart(e.clientX, e.clientY));
canvas.addEventListener("mouseup", e => handleEnd(e.clientX, e.clientY));

// Eventos de Touch (Celular/Tablet)
canvas.addEventListener("touchstart", e => handleStart(e.touches[0].clientX, e.touches[0].clientY));
canvas.addEventListener("touchend", e => handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY));
loop();