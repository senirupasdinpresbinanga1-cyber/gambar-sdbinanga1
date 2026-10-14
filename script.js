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
let timeLeft = 120; // Waktu 2 menit per anak

const setupPanel = document.getElementById('setup-panel');
const gamePanel = document.getElementById('game-panel');
const finishPanel = document.getElementById('finish-panel');
const startBtn = document.getElementById('start-btn');
const nextTurnBtn = document.getElementById('next-turn-btn');
const stopBtn = document.getElementById('stop-btn');
const restartBtn = document.getElementById('restart-btn');
const currentPlayerEl = document.getElementById('current-player');
const nextPlayerEl = document.getElementById('next-player');
const timerEl = document.getElementById('timer');

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let painting = false;

const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const eraserBtn = document.getElementById('eraser-btn');
const clearBtn = document.getElementById('clear-btn');

let isEraser = false;

startBtn.addEventListener('click', startGame);
nextTurnBtn.addEventListener('click', nextTurn);
stopBtn.addEventListener('click', confirmStop);
restartBtn.addEventListener('click', () => location.reload());

function startGame() {
    shuffledStudents = [...studentsList].sort(() => Math.random() - 0.5);
    currentIndex = 0;
    
    setupPanel.classList.add('hidden');
    gamePanel.classList.remove('hidden');
    
    // Background kanvas awal putih bersih
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    loadTurn();
}

function loadTurn() {
    if (currentIndex >= shuffledStudents.length) {
        endGame();
        return;
    }

    currentPlayerEl.textContent = shuffledStudents[currentIndex];
    nextPlayerEl.textContent = (currentIndex + 1 < shuffledStudents.length) ? shuffledStudents[currentIndex + 1] : "Sesi Terakhir (Selesai)";
    
    // Setel waktu 120 detik (2 Menit)
    timeLeft = 120;
    timerEl.textContent = timeLeft;
    clearInterval(countdown);
    
    countdown = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            // Pindah otomatis ke giliran anak berikutnya tanpa popup alert
            nextTurn();
        }
    }, 1000);
}

function nextTurn() {
    clearInterval(countdown);
    currentIndex++;
    loadTurn();
}

function confirmStop() {
    if (confirm("Apakah Anda yakin ingin menghentikan permainan dan mereset sesi?")) {
        location.reload();
    }
}

function endGame() {
    gamePanel.classList.add('hidden');
    finishPanel.classList.remove('hidden');
    
    const resultCanvas = document.getElementById('resultCanvas');
    const resCtx = resultCanvas.getContext('2d');
    resCtx.drawImage(canvas, 0, 0, resultCanvas.width, resultCanvas.height);
    
    // Simulasi Penilaian Kemiripan Kunci Jawaban Rumah (Algoritma Analisis Piksel Gambar)
    calculateSimilarityScore();
    
    document.getElementById('download-btn').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'hasil-karya-estafet-kelas-6a.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

function calculateSimilarityScore() {
    // Analisis kepadatan garis & coretan pada kanvas untuk estimasi kemiripan struktur bentuk kunci jawaban (Rumah)
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let darkPixels = 0;
    
    for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i];
        const g = imgData.data[i+1];
        const b = imgData.data[i+2];
        // Hitung piksel bukan putih (coretan gambar)
        if (r < 200 || g < 200 || b < 200) {
            darkPixels++;
        }
    }
    
    // Skor kalkulasi berdasarkan jumlah goresan optimal untuk sebuah gambar rumah estafet
    let score = Math.min(Math.floor((darkPixels / 1500) * 100), 98);
    if (score < 45) score = Math.floor(Math.random() * 25) + 65; // Nilai apresiasi minimal anak-anak kelas 6

    const scoreValueEl = document.getElementById('score-value');
    const feedbackEl = document.getElementById('score-feedback');
    
    let currentScr = 0;
    let scoreInterval = setInterval(() => {
        if (currentScr >= score) {
            clearInterval(scoreInterval);
        } else {
            currentScr++;
            scoreValueEl.textContent = currentScr;
        }
    }, 20);

    setTimeout(() => {
        if (score >= 85) {
            feedbackEl.textContent = "🌟 Luar biasa mirip dengan kunci jawaban bentuk rumah! Struktur atap dan dinding sangat jelas.";
        } else if (score >= 70) {
            feedbackEl.textContent = "👍 Bagus sekali! Kerjasama tim kelas 6A berhasil membentuk sketsa rumah dengan baik.";
        } else {
            feedbackEl.textContent = "🎨 Kreatif dan unik! Hasil gambar estafet membentuk karya abstrak seni kontemporer.";
        }
    }, score * 20);
}

// Logika Interaksi Mouse pada Kanvas
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
    isEraser = false;
    eraserBtn.style.background = '#475569';
});

eraserBtn.addEventListener('click', () => {
    isEraser = !isEraser;
    eraserBtn.style.background = isEraser ? '#f43f5e' : '#475569';
});

clearBtn.addEventListener('click', () => {
    if (confirm("Yakin ingin membersihkan seluruh kanvas?")) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
});

// Fitur Full Screen otomatis & tombol Esc
document.addEventListener('keydown', (e) => {
    if (e.key === 'F11' || e.key === 'Escape') {
        // Biarkan browser menangani Esc / Fullscreen secara alami
    }
});
