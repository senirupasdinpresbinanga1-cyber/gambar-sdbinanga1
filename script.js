// Daftar nama siswa Kelas 6A diambil langsung dari data presensi
const studentsList = [
    "ABID AQILAH WAHYUDI", "AINUN HAKIMAH", "AINUN NUR AZIZAH A", "AMELIA AHMAD",
    "ANDI FAISYA SYAHIRA", "ANDI MUHAMMAD FAQIH AIRY H", "CAHYA AINUN", "DZAKY",
    "FARDHAN ZAKI JASMAR", "FEBY KHAIRUNNISA", "KHAIRA NAJWA BAZIMA", "LISNA YANTI",
    "MUH REVAN APRILIAN", "MUH RIFKI AL FAHREZA Z", "MUH. ARIFKI", "MUH. MIFTAHUL YAFI ASIS",
    "MUH. RAFLI", "MUHAMMAD ARAS QURUSYA", "MUHAMMAD SYAWAL", "NAYLA SALSABILLAH",
    "NURUL ADIVA AMRAN", "ST ASSYURAH JUHARBI", "SYAFWAAN SABQI", "YUSUF GIBRAN Y", "ZAM ZAMMY KHAIRIL MALIKI ABHAL"
];

let shuffledStudents = [];
let currentIndex = 0;
let countdown;
let timeLeft = 30; // Waktu menggambar per anak (dalam detik)

// Elemen DOM
const setupPanel = document.getElementById('setup-panel');
const gamePanel = document.getElementById('game-panel');
const finishPanel = document.getElementById('finish-panel');
const startBtn = document.getElementById('start-btn');
const nextTurnBtn = document.getElementById('next-turn-btn');
const restartBtn = document.getElementById('restart-btn');
const currentPlayerEl = document.getElementById('current-player');
const nextPlayerEl = document.getElementById('next-player');
const timerEl = document.getElementById('timer');

// Canvas Setup
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let painting = false;

// Pengaturan alat gambar
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const eraserBtn = document.getElementById('eraser-btn');
const clearBtn = document.getElementById('clear-btn');

let currentColor = '#000000';
let isEraser = false;

startBtn.addEventListener('click', startGame);
nextTurnBtn.addEventListener('click', nextTurn);
restartBtn.addEventListener('click', () => location.reload());

function startGame() {
    // Acak urutan nama siswa (Fisher-Yates Shuffle)
    shuffledStudents = [...studentsList].sort(() => Math.random() - 0.5);
    currentIndex = 0;
    
    setupPanel.classList.add('hidden');
    gamePanel.classList.remove('hidden');
    
    // Bersihkan canvas putih bersih
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    loadTurn();
}

function loadTurn() {
    if (currentIndex >= shuffledStudents.length) {
        endGame();
        return;
    }

    currentPlayerEl.textContent = shuffledStudents[currentIndex];
    nextPlayerEl.textContent = (currentIndex + 1 < shuffledStudents.length) ? shuffledStudents[currentIndex + 1] : "Selesai (Anak Terakhir)";
    
    // Reset Timer (misal 30 detik per anak agar cepat bergantian)
    timeLeft = 30;
    timerEl.textContent = timeLeft;
    clearInterval(countdown);
    
    countdown = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            alert("Waktu habis! Silakan berikan mouse ke teman berikutnya.");
            nextTurn();
        }
    }, 1000);
}

function nextTurn() {
    clearInterval(countdown);
    currentIndex++;
    loadTurn();
}

function endGame() {
    gamePanel.classList.add('hidden');
    finishPanel.classList.remove('hidden');
    
    // Salin hasil ke canvas akhir
    const resultCanvas = document.getElementById('resultCanvas');
    const resCtx = resultCanvas.getContext('2d');
    resCtx.drawImage(canvas, 0, 0);
    
    document.getElementById('download-btn').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'hasil-karya-kelas-6a.png';
        link.href = resultCanvas.toDataURL();
        link.click();
    });
}

// Logika Menggambar dengan Mouse
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishedPosition);
canvas.addEventListener('mousemove', draw);

function startPosition(e) {
    painting = true;
    draw(e);
}

function finishedPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isEraser ? '#ffffff' : colorPicker.value;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    isEraser = false;
});

eraserBtn.addEventListener('click', () => {
    isEraser = !isEraser;
    eraserBtn.style.background = isEraser ? '#e74c3c' : '#95a5a6';
    eraserBtn.textContent = isEraser ? 'Mode Kuas (Aktifkan)' : 'Penghapus';
});

clearBtn.addEventListener('click', () => {
    if (confirm("Yakin ingin menghapus seluruh gambar di kanvas?")) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
});
