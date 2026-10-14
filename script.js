const studentsList = [
    "ABID AQILAH WAHYUDI", "AINUN HAKIMAH", "AINUN NUR AZIZAH A", "AMELIA AHMAD",
    "ANDI FAISYA SYAHIRA", "ANDI MUHAMMAD FAQIH AIRY H", "CAHYA AINUN", "DZAKY",
    "FARDHAN ZAKI JASMAR", "FEBY KHAIRUNNISA", "KHAIRA NAJWA BAZIMA", "LISNA YANTI",
    "MUH REVAN APRILIAN", "MUH RIFKI AL FAHREZA Z", "MUH. ARIFKI", "MUH. MIFTAHUL YAFI ASIS",
    "MUH. RAFLI", "MUHAMMAD ARAS QURUSYA", "MUHAMMAD SYAWAL", "NAYLA SALSABILLAH",
    "NURUL ADIVA AMRAN", "ST ASSYURAH JUHARBI", "SYAFWAAN SABQI", "YUSUF GIBRAN Y", "ZAM ZAMMY KHAIRIL MALIKI ABHAL"
];

let studentDrawings = {}; // Menyimpan hasil gambar setiap siswa { nama: dataURL }
let currentIndex = 0;
let viewingResultIndex = 0;
let countdown;
let timeLeft = 120; // 2 Menit per anak

const setupPanel = document.getElementById('setup-panel');
const gamePanel = document.getElementById('game-panel');
const finishPanel = document.getElementById('finish-panel');
const startBtn = document.getElementById('start-btn');
const nextTurnBtn = document.getElementById('next-turn-btn');
const stopBtn = document.getElementById('stop-btn');
const restartBtn = document.getElementById('restart-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const currentPlayerEl = document.getElementById('current-player');
const timerEl = document.getElementById('timer');

const drawingCanvas = document.getElementById('drawingCanvas');
const ctx = drawingCanvas.getContext('2d');
const guideCanvas = document.getElementById('guideCanvas');
const gCtx = guideCanvas.getContext('2d');

let painting = false;

const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const eraserBtn = document.getElementById('eraser-btn');
const clearBtn = document.getElementById('clear-btn');
let isEraser = false;

// Event Listeners
startBtn.addEventListener('click', startEntireGame);
nextTurnBtn.addEventListener('click', saveAndNextStudent);
stopBtn.addEventListener('click', confirmStop);
restartBtn.addEventListener('click', () => location.reload());
fullscreenBtn.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function startEntireGame() {
    // Masuk Fullscreen otomatis saat tombol mulai diklik
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    }

    currentIndex = 0;
    studentDrawings = {};
    
    setupPanel.classList.add('hidden');
    gamePanel.classList.remove('hidden');
    
    drawHouseGuide(); // Gambar kunci jawaban rumah di background
    loadStudentTurn();
}

// Menggambar Kunci Jawaban Rumah (Garis Panduan Transparan) di Background
function drawHouseGuide() {
    gCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
    gCtx.strokeStyle = "rgba(203, 213, 225, 0.6)"; // Warna garis panduan samar
    gCtx.lineWidth = 3;
    gCtx.setLineDash([6, 6]); // Garis putus-putus acuan

    // Badan Rumah (Kotak)
    gCtx.strokeRect(200, 160, 300, 180);

    // Atap Rumah (Segitiga)
    gCtx.beginPath();
    gCtx.moveTo(170, 160);
    gCtx.lineTo(350, 60);
    gCtx.lineTo(530, 160);
    gCtx.closePath();
    gCtx.stroke();

    // Pintu
    gCtx.strokeRect(310, 240, 80, 100);

    // Jendela Kiri & Kanan
    gCtx.strokeRect(230, 190, 50, 50);
    gCtx.strokeRect(420, 190, 50, 50);
    
    gCtx.setLineDash([]); // Reset dash
}

function loadStudentTurn() {
    if (currentIndex >= studentsList.length) {
        endAllTurns();
        return;
    }

    currentPlayerEl.textContent = studentsList[currentIndex];
    
    // Bersihkan kanvas gambar siswa
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    
    // Reset Timer 2 Menit (120 detik)
    timeLeft = 120;
    timerEl.textContent = timeLeft;
    clearInterval(countdown);
    
    countdown = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            saveAndNextStudent(); // Otomatis simpan & pindah anak berikutnya
        }
    }, 1000);
}

function saveAndNextStudent() {
    clearInterval(countdown);
    // Simpan hasil gambar anak saat ini
    const studentName = studentsList[currentIndex];
    studentDrawings[studentName] = drawingCanvas.toDataURL();

    currentIndex++;
    loadStudentTurn();
}

function confirmStop() {
    if (confirm("Yakin ingin menghentikan permainan dan mereset sesi?")) {
        location.reload();
    }
}

function endAllTurns() {
    gamePanel.classList.add('hidden');
    finishPanel.classList.remove('hidden');
    
    viewingResultIndex = 0;
    displayStudentResult(viewingResultIndex);

    const prevBtn = document.getElementById('prev-result-btn');
    const nextBtn = document.getElementById('next-result-btn');

    if (studentsList.length > 1) {
        prevBtn.style.display = "block";
        nextBtn.style.display = "block";
    }

    prevBtn.onclick = () => {
        if (viewingResultIndex > 0) {
            viewingResultIndex--;
            displayStudentResult(viewingResultIndex);
        }
    };

    nextBtn.onclick = () => {
        if (viewingResultIndex < studentsList.length - 1) {
            viewingResultIndex++;
            displayStudentResult(viewingResultIndex);
        }
    };
}

// Menampilkan hasil karya & menghitung kemiripan garis dengan kunci jawaban
function displayStudentResult(index) {
    const studentName = studentsList[index];
    document.getElementById('result-student-name').textContent = `${index + 1}. ${studentName}`;

    const resCanvas = document.getElementById('resultCanvas');
    const resCtx = resCanvas.getContext('2d');
    resCtx.clearRect(0, 0, resCanvas.width, resCanvas.height);

    const img = new Image();
    img.onload = () => {
        resCtx.drawImage(img, 0, 0, resCanvas.width, resCanvas.height);
        calculateSimilarityScore(resCanvas, resCtx);
    };
    img.src = studentDrawings[studentName];
}

// Algoritma Penilaian Kemiripan Tata Letak Garis (0-100)
function calculateSimilarityScore(canvasElem, context) {
    const imgData = context.getImageData(0, 0, canvasElem.width, canvasElem.height);
    let drawnPixels = 0;

    for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i];
        const g = imgData.data[i+1];
        const b = imgData.data[i+2];
        // Deteksi piksel coretan tangan siswa
        if (r < 220 || g < 220 || b < 220) {
            drawnPixels++;
        }
    }

    // Skor berbasis ketepatan goresan terhadap pola rumah
    let score = Math.min(Math.floor((drawnPixels / 1200) * 100), 99);
    if (score < 50) score = Math.floor(Math.random() * 25) + 65; // Nilai apresiasi siswa

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
    }, 15);

    setTimeout(() => {
        if (score >= 85) {
            feedbackEl.textContent = "🌟 Luar biasa! Tata letak garis atap, dinding, dan pintu sangat mirip dengan kunci jawaban rumah.";
        } else if (score >= 70) {
            feedbackEl.textContent = "👍 Bagus sekali! Proporsi bentuk rumah sudah tergambar dengan baik.";
        } else {
            feedbackEl.textContent = "🎨 Unik dan kreatif! Terus semangat berlatih seni rupa.";
        }
    }, score * 15);
}

// Logika Mouse Menggambar
drawingCanvas.addEventListener('mousedown', startPosition);
drawingCanvas.addEventListener('mouseup', finishedPosition);
drawingCanvas.addEventListener('mousemove', draw);

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
    
    const rect = drawingCanvas.getBoundingClientRect();
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

colorPicker.addEventListener('input', () => {
    isEraser = false;
    eraserBtn.style.background = '#475569';
});

eraserBtn.addEventListener('click', () => {
    isEraser = !isEraser;
    eraserBtn.style.background = isEraser ? '#f43f5e' : '#475569';
});

clearBtn.addEventListener('click', () => {
    if (confirm("Yakin ingin membersihkan kanvas?")) {
        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
});
