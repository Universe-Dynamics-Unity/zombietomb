// === CLASES DE ENTIDADES ===
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
                while (map[ny + d.y]?.[nx + d.x] === 0 || map[ny + d.y]?.[nx + d.x] === 8) { nx += d.x; ny += d.y; }
                this.tileX = nx; this.tileY = ny; this.targetX = nx * gridSize; this.targetY = ny * gridSize;
            }
        }
        if (Math.abs(this.px - player.px) < 25 && Math.abs(this.py - player.py) < 25) {
            if (tieneEscudo) { 
                tieneEscudo = false; 
                zombies = zombies.filter(z => z !== this); 
            } else { damagePlayer(); }
        }
    }
    draw() { ctx.fillStyle = "#ff0044"; ctx.fillRect(this.px + 8, this.py + 8, 24, 24); }
}

// === FUNCIONES DE NÚCLEO ===
async function cargarArchivoJSON(nombre, num) {
    loading = true;
    try {
        const res = await fetch(`niveles/${nombre}.json`);
        const data = await res.json();
        map = data.mapa; rows = map.length; cols = map[0].length;
        gridSize = data.config.gridSize || 40;
        esDificil = data.dificultad === "hard";
        zombies = data.zombies ? data.zombies.map(z => new Zombie(z.x, z.y)) : [];
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
        hp = 3; 
        map = []; 
        document.getElementById("menuPrincipal").classList.remove("oculto"); 
    } else { iniciarJuego(modoActual, currentLevelPlaying); }
}

function loop() {
    if (!loading && map.length > 0 && hp > 0) {
        let finalColor = skinColor === 'arcoiris' ? `hsl(${(Date.now()/10)%360},100%,50%)` : (skinColor === 'fantasma' ? "rgba(255,255,255,0.5)" : skinColor);

        if (player.moving) {
            const dx = player.targetX - player.px, dy = player.targetY - player.py;
            player.px += Math.sign(dx) * Math.min(Math.abs(dx), player.speed);
            player.py += Math.sign(dy) * Math.min(Math.abs(dy), player.speed);
            let curX = Math.floor((player.px + gridSize/2) / gridSize), curY = Math.floor((player.py + gridSize/2) / gridSize);
            if (map[curY]?.[curX] === 0) { puntos += 1; map[curY][curX] = 8; guardarProgreso(); }
            if (dx === 0 && dy === 0) {
                player.moving = false;
                if (map[player.tileY][player.tileX] === 2) {
                    if (modoActual === 'historia') { 
                        if(!nivelesCompletados.includes(currentLevelPlaying)) nivelesCompletados.push(currentLevelPlaying); 
                        guardarProgreso(); alert("¡Nivel Superado!"); mostrarSelector(true); 
                    } else { alert("Fin Arcade"); regresarAlMenu(); }
                }
            }
        }

        zombies.forEach(z => z.update());
        ctx.clearRect(0,0,canvas.width,canvas.height);
        camX = player.px - viewWidth/2 + gridSize/2; camY = player.py - viewHeight/2 + gridSize/2;
        ctx.save(); ctx.translate(-camX, -camY);
        
        for (let y=0; y<rows; y++) for (let x=0; x<cols; x++) {
            let t = map[y][x];
            if (t === 1) { ctx.fillStyle = "#111"; ctx.strokeStyle = "#00fff7"; ctx.fillRect(x*gridSize,y*gridSize,gridSize,gridSize); ctx.strokeRect(x*gridSize,y*gridSize,gridSize,gridSize); }
            if (t === 0) { ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(x*gridSize+gridSize/2, y*gridSize+gridSize/2, 3, 0, Math.PI*2); ctx.fill(); }
            if (t === 2) { ctx.fillStyle = "yellow"; ctx.fillRect(x*gridSize+5, y*gridSize+5, gridSize-10, gridSize-10); }
        }
        
        ctx.fillStyle = finalColor; ctx.fillRect(player.px+10, player.py+10, 20, 20);
        zombies.forEach(z => z.draw());
        ctx.restore();
    }
    requestAnimationFrame(loop);
}

function intentarMover(dir) {
    if (player.moving || loading || map.length === 0) return;
    let dx = 0, dy = 0;
    if (dir === "up") dy = -1; if (dir === "down") dy = 1;
    if (dir === "left") dx = -1; if (dir === "right") dx = 1;

    let nx = player.tileX, ny = player.tileY;
    const choca = (tx, ty) => map[ty]?.[tx] === 1;

    if (skinColor === "fantasma") {
        if (choca(nx + dx, ny + dy)) {
            if (!choca(nx + dx*2, ny + dy*2) && map[ny + dy*2]) { nx += dx*2; ny += dy*2; }
        } else { while (!choca(nx + dx, ny + dy)) { nx += dx; ny += dy; if(!map[ny+dy]) break; } }
    } else { while (!choca(nx + dx, ny + dy)) { nx += dx; ny += dy; if(!map[ny+dy]) break; } }

    if (nx !== player.tileX || ny !== player.tileY) { 
        player.tileX = nx; player.tileY = ny; 
        player.targetX = nx*gridSize; player.targetY = ny*gridSize; 
        player.moving = true; 
    }
}

// CONTROLES
window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") intentarMover("up"); if (e.key === "ArrowDown") intentarMover("down");
    if (e.key === "ArrowLeft") intentarMover("left"); if (e.key === "ArrowRight") intentarMover("right");
});

let touchStartX = 0, touchStartY = 0;
canvas.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }, { passive: false });
canvas.addEventListener("touchend", e => {
    let dx = e.changedTouches[0].clientX - touchStartX, dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) { if (dx > 30) intentarMover("right"); else if (dx < -30) intentarMover("left"); }
    else { if (dy > 30) intentarMover("down"); else if (dy < -30) intentarMover("up"); }
}, { passive: false });

actualizarInterfaz();
loop();