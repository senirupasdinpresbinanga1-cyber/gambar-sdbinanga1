// DAFTAR 25 SISWA KELAS 6A DENGAN TEMPLATE OBJEK BERBEDA
const studentsList = [
    { name: "ABID AQILAH WAHYUDI", shape: "rumah" },
    { name: "AINUN HAKIMAH", shape: "mobil" },
    { name: "AINUN NUR AZIZAH A", shape: "pohon" },
    { name: "AMELIA AHMAD", shape: "bintang" },
    { name: "ANDI FAISYA SYAHIRA", shape: "kapal" },
    { name: "ANDI MUHAMMAD FAQIH AIRY H", shape: "bunga" },
    { name: "CAHYA AINUN", shape: "cangkir" },
    { name: "DZAKY", shape: "ikan" },
    { name: "FARDHAN ZAKI JASMAR", shape: "rumah" },
    { name: "FEBY KHAIRUNNISA", shape: "mobil" },
    { name: "KHAIRA NAJWA BAZIMA", shape: "pohon" },
    { name: "LISNA YANTI", shape: "bintang" },
    { name: "MUH REVAN APRILIAN", shape: "kapal" },
    { name: "MUH RIFKI AL FAHREZA Z", shape: "bunga" },
    { name: "MUH. ARIFKI", shape: "cangkir" },
    { name: "MUH. MIFTAHUL YAFI ASIS", shape: "ikan" },
    { name: "MUH. RAFLI", shape: "rumah" },
    { name: "MUHAMMAD ARAS QURUSYA", shape: "mobil" },
    { name: "MUHAMMAD SYAWAL", shape: "pohon" },
    { name: "NAYLA SALSABILLAH", shape: "bintang" },
    { name: "NURUL ADIVA AMRAN", shape: "kapal" },
    { name: "ST ASSYURAH JUHARBI", shape: "bunga" },
    { name: "SYAFWAAN SABQI", shape: "cangkir" },
    { name: "YUSUF GIBRAN Y", shape: "ikan" },
    { name: "ZAM ZAMMY KHAIRIL MALIKI ABHAL", shape: "rumah" }
];

let studentData = {};
let currentIndex = 0;
let viewingResultIndex = 0;
let countdown;
let timeLeft = 120;
let isGameActive = false;

// VARIABEL RIWAYAT UNDO / REDO
let historySteps = [];
let historyStepIndex = -1;
let clickStrokeCount = 0; // Menghitung total klik-tahan (mousedown) untuk efisiensi goresan

// ELEMENT REF
const setupPanel = document.getElementById('setup-panel');
const gamePanel = document.getElementById('game-panel');
const finishPanel = document.getElementById('finish-panel');
const startBtn = document.getElementById('start-btn');
const nextTurnBtn = document.getElementById('next-turn-btn');
const stopBtn = document.getElementById('stop-btn');
const restartBtn = document.getElementById('restart-btn');
const currentPlayerEl = document.getElementById('current-player');
const targetBadgeEl = document.getElementById('target-object-badge');
const timerEl = document.getElementById('timer');
const warningOverlay = document.getElementById('warning-overlay');
const studentListEl = document.getElementById('student-list');

const drawingCanvas = document.getElementById('drawingCanvas');
const ctx = drawingCanvas.getContext('2d');
const guideCanvas = document.getElementById('guideCanvas');
const gCtx = guideCanvas.getContext('2d');

let painting = false;
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const eraserBtn = document.getElementById('eraser-btn');
const clearBtn = document.getElementById('clear-btn');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
let isEraser = false;

// INIT
renderSidebarList();

startBtn.addEventListener('click', startEntireGame);
nextTurnBtn.addEventListener('click', saveAndNextStudent);
stopBtn.addEventListener('click', confirmStop);
restartBtn.addEventListener('click', () => location.reload());

undoBtn.addEventListener('click', undoCanvas);
redoBtn.addEventListener('click', redoCanvas);

// SHORTCUT KEYBOARD CTRL+Z & CTRL+Y
document.addEventListener('keydown', (e) => {
    if (!isGameActive) return;
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoCanvas();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redoCanvas();
    }
});

function renderSidebarList() {
    studentListEl.innerHTML = '';
    studentsList.forEach((stu, idx) => {
        const li = document.createElement('li');
        li.className = `student-item ${idx === currentIndex && isGameActive ? 'active' : ''}`;
        
        const data = studentData[stu.name];
        let statusBadge = '<span class="student-status status-pending">Belum</span>';
        if (data && data.score !== undefined) {
            statusBadge = `<span class="student-status status-done">${data.score} pts</span>`;
        } else if (idx === currentIndex && isGameActive) {
            statusBadge = '<span class="student-status status-active">Menggambar</span>';
        }

        li.innerHTML = `
            <span class="student-name">${idx + 1}. ${stu.name}</span>
            ${statusBadge}
        `;

        li.onclick = () => {
            if (!isGameActive && data && data.score !== undefined) {
                viewingResultIndex = idx;
                displayStudentResult(idx);
            }
        };

        studentListEl.appendChild(li);
    });
}

function startEntireGame() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) { elem.requestFullscreen().catch(()=>{}); }

    currentIndex = 0;
    studentData = {};
    isGameActive = true;
    
    setupPanel.classList.add('hidden');
    finishPanel.classList.add('hidden');
    gamePanel.classList.remove('hidden');
    
    loadStudentTurn();
}

function loadStudentTurn() {
    if (currentIndex >= studentsList.length) {
        isGameActive = false;
        endAllTurns();
        return;
    }

    const currentStudent = studentsList[currentIndex];
    currentPlayerEl.textContent = currentStudent.name;
    targetBadgeEl.textContent = `Tugas: Menggambar ${currentStudent.shape.toUpperCase()}`;

    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    drawGuideShape(currentStudent.shape, gCtx, guideCanvas.width, guideCanvas.height);
    
    // Reset Riwayat Canvas untuk Siswa Baru
    historySteps = [];
    historyStepIndex = -1;
    clickStrokeCount = 0;
    saveCanvasState();

    timeLeft = 120;
    timerEl.textContent = timeLeft;
    startTimer();
    renderSidebarList();
}

function drawGuideShape(shape, targetCtx, w, h) {
    targetCtx.clearRect(0, 0, w, h);
    targetCtx.strokeStyle = "rgba(225, 29, 72, 0.7)"; 
    targetCtx.lineWidth = 3;
    targetCtx.setLineDash([6, 6]);

    targetCtx.beginPath();
    if (shape === 'rumah') {
        targetCtx.strokeRect(180, 150, 290, 160);
        targetCtx.moveTo(150, 150); targetCtx.lineTo(325, 60); targetCtx.lineTo(500, 150);
        targetCtx.strokeRect(290, 220, 70, 90);
        targetCtx.strokeRect(210, 180, 50, 50); targetCtx.strokeRect(390, 180, 50, 50);
    } else if (shape === 'mobil') {
        targetCtx.strokeRect(150, 180, 350, 90);
        targetCtx.moveTo(220, 180); targetCtx.lineTo(270, 110); targetCtx.lineTo(380, 110); targetCtx.lineTo(430, 180);
        targetCtx.arc(230, 270, 30, 0, Math.PI * 2);
        targetCtx.moveTo(450, 270); targetCtx.arc(420, 270, 30, 0, Math.PI * 2);
    } else if (shape === 'pohon') {
        targetCtx.strokeRect(300, 200, 50, 120);
        targetCtx.arc(325, 140, 90, 0, Math.PI * 2);
    } else if (shape === 'bintang') {
        let cx = 325, cy = 175, outer = 110, inner = 45;
        for (let i = 0; i < 5; i++) {
            targetCtx.lineTo(cx + Math.cos((18 + i * 72) * Math.PI / 180) * outer, cy - Math.sin((18 + i * 72) * Math.PI / 180) * outer);
            targetCtx.lineTo(cx + Math.cos((54 + i * 72) * Math.PI / 180) * inner, cy - Math.sin((54 + i * 72) * Math.PI / 180) * inner);
        }
        targetCtx.closePath();
    } else if (shape === 'kapal') {
        targetCtx.moveTo(150, 220); targetCtx.lineTo(500, 220); targetCtx.lineTo(430, 290); targetCtx.lineTo(220, 290); targetCtx.closePath();
        targetCtx.moveTo(325, 220); targetCtx.lineTo(325, 70); targetCtx.lineTo(420, 150); targetCtx.lineTo(325, 150);
    } else if (shape === 'bunga') {
        targetCtx.strokeRect(320, 220, 10, 100);
        targetCtx.arc(325, 150, 35, 0, Math.PI * 2);
        for(let a=0; a<360; a+=45) {
            let rx = 325 + Math.cos(a*Math.PI/180)*60;
            let ry = 150 + Math.sin(a*Math.PI/180)*60;
            targetCtx.moveTo(rx, ry); targetCtx.arc(rx, ry, 20, 0, Math.PI*2);
        }
    } else if (shape === 'cangkir') {
        targetCtx.strokeRect(220, 130, 200, 150);
        targetCtx.arc(420, 205, 45, -Math.PI/2, Math.PI/2);
        targetCtx.strokeRect(190, 280, 260, 15);
    } else if (shape === 'ikan') {
        targetCtx.ellipse(325, 175, 130, 75, 0, 0, Math.PI * 2);
        targetCtx.moveTo(455, 175); targetCtx.lineTo(530, 110); targetCtx.lineTo(530, 240); targetCtx.closePath();
        targetCtx.arc(240, 160, 8, 0, Math.PI*2);
    }
    targetCtx.stroke();
    targetCtx.setLineDash([]);
}

function startTimer() {
    clearInterval(countdown);
    countdown = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            saveAndNextStudent();
        }
    }, 1000);
}

function saveAndNextStudent() {
    clearInterval(countdown);
    const student = studentsList[currentIndex];
    
    // Evaluasi Penilaian Bonus (Penutupan Kunci & Efisiensi Goresan)
    const scoreResult = calculateBonusEvaluationScore(drawingCanvas, student.shape, clickStrokeCount);
    
    studentData[student.name] = {
        dataUrl: drawingCanvas.toDataURL(),
        score: scoreResult.totalScore,
        coverage: scoreResult.keyCoverage,
        efficiency: scoreResult.efficiencyScore,
        feedback: scoreResult.feedback
    };

    currentIndex++;
    loadStudentTurn();
}

// SISTEM PENILAIAN BONUS: PENUTUPAN GARIS KUNCI & EFISIENSI KLIK
function calculateBonusEvaluationScore(canvasElem, shape, totalStrokes) {
    const w = canvasElem.width;
    const h = canvasElem.height;

    const keyCanvas = document.createElement('canvas');
    keyCanvas.width = w; keyCanvas.height = h;
    const kCtx = keyCanvas.getContext('2d');
    
    kCtx.strokeStyle = "#000000";
    kCtx.lineWidth = 14; // Toleransi lebar garis penutupan
    drawGuideShape(shape, kCtx, w, h);

    const keyData = kCtx.getImageData(0, 0, w, h).data;
    const userCtx = canvasElem.getContext('2d');
    const userData = userCtx.getImageData(0, 0, w, h).data;

    let keyPixelCount = 0;
    let userPixelCount = 0;
    let matchedPixelCount = 0;
    let offTargetPixelCount = 0;

    for (let i = 0; i < keyData.length; i += 4) {
        const isKey = keyData[i + 3] > 50;
        const isUser = userData[i + 3] > 50;

        if (isKey) keyPixelCount++;
        if (isUser) userPixelCount++;

        if (isKey && isUser) {
            matchedPixelCount++;
        } else if (isUser && !isKey) {
            offTargetPixelCount++;
        }
    }

    if (userPixelCount < 100) {
        return { totalScore: 0, keyCoverage: 0, efficiencyScore: 0, feedback: "❌ Kanvas kosong atau coretan terlalu minim." };
    }

    // 1. Rasio Penutupan Garis Kunci (Semakin banyak bagian garis kunci tertutup, semakin tinggi nilainya)
    const keyCoverageRatio = matchedPixelCount / (keyPixelCount || 1); // 0.0 - 1.0

    // 2. Bonus Efisiensi Goresan (Sedikit klik/tahan mousedown yang terarah = nilai efisiensi tinggi)
    // Asumsi ideal untuk menggambar objek standar adalah 3 hingga 15 kali goresan (klik-tahan).
    let efficiencyRatio = 1.0;
    if (totalStrokes > 20) {
        efficiencyRatio = Math.max(0.4, 1.0 - ((totalStrokes - 20) * 0.02));
    }

    // Penalti jika terlalu banyak melenceng keluar garis kunci
    const precisionPenalty = Math.max(0.5, 1.0 - (offTargetPixelCount / (userPixelCount + 1)));

    // Kalkulasi Skor Akhir Bonus (Skala 0 - 100)
    let baseScore = (keyCoverageRatio * 75) + (efficiencyRatio * 25);
    let finalScore = Math.round(baseScore * precisionPenalty);

    if (finalScore > 99) finalScore = 99;
    if (finalScore < 5) finalScore = 5;

    let keyCoveragePercent = Math.round(keyCoverageRatio * 100);
    let efficiencyPercent = Math.round(efficiencyRatio * 100);

    let feedbackMsg = "";
    if (keyCoveragePercent >= 80 && totalStrokes <= 25) {
        feedbackMsg = "🌟 Luar biasa! Garis kunci tertutup sempurna dan goresan sangat efisien rapi.";
    } else if (keyCoveragePercent >= 50) {
        feedbackMsg = "👍 Bagus! Cukup baik menutup pola, pertahankan ketepatan dan efisiensi garis.";
    } else {
        feedbackMsg = "⚠️ Kurang akurat. Garis putus-putus kunci masih banyak yang belum tertutup rapat.";
    }

    return {
        totalScore: finalScore,
        keyCoverage: keyCoveragePercent,
        efficiencyScore: efficiencyPercent,
        feedback: feedbackMsg
    };
}

// FUNGSI RIWAYAT KANVAS (UNDO & REDO)
function saveCanvasState() {
    historyStepIndex++;
    if (historyStepIndex < historySteps.length) {
        historySteps.length = historyStepIndex;
    }
    historySteps.push(drawingCanvas.toDataURL());
}

function undoCanvas() {
    if (historyStepIndex > 0) {
        historyStepIndex--;
        let img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = historySteps[historyStepIndex];
    }
}

function redoCanvas() {
    if (historyStepIndex < historySteps.length - 1) {
        historyStepIndex++;
        let img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = historySteps[historyStepIndex];
    }
}

function confirmStop() {
    if (confirm("Yakin ingin mereset seluruh sesi permainan?")) {
        location.reload();
    }
}

function endAllTurns() {
    gamePanel.classList.add('hidden');
    finishPanel.classList.remove('hidden');
    
    renderSidebarList();
    displayStudentResult(0);

    document.getElementById('prev-result-btn').onclick = () => {
        if (viewingResultIndex > 0) {
            viewingResultIndex--;
            displayStudentResult(viewingResultIndex);
        }
    };

    document.getElementById('next-result-btn').onclick = () => {
        if (viewingResultIndex < studentsList.length - 1) {
            viewingResultIndex++;
            displayStudentResult(viewingResultIndex);
        }
    };
}

function displayStudentResult(index) {
    const student = studentsList[index];
    const data = studentData[student.name];

    document.getElementById('result-student-name').textContent = `${index + 1}. ${student.name} (${student.shape.toUpperCase()})`;

    const resCanvas = document.getElementById('resultCanvas');
    const resCtx = resCanvas.getContext('2d');
    resCtx.clearRect(0, 0, resCanvas.width, resCanvas.height);

    if (!data) {
        document.getElementById('score-value').textContent = "0";
        document.getElementById('score-feedback').textContent = "Siswa belum menggambar.";
        document.getElementById('key-coverage').textContent = "0%";
        document.getElementById('stroke-efficiency').textContent = "0%";
        return;
    }

    drawGuideShape(student.shape, resCtx, resCanvas.width, resCanvas.height);

    const img = new Image();
    img.onload = () => {
        resCtx.drawImage(img, 0, 0, resCanvas.width, resCanvas.height);
    };
    img.src = data.dataUrl;

    document.getElementById('score-value').textContent = data.score;
    document.getElementById('score-feedback').textContent = data.feedback;
    document.getElementById('key-coverage').textContent = `${data.coverage}%`;
    document.getElementById('stroke-efficiency').textContent = `${data.efficiency}%`;

    const scoreCircle = document.getElementById('score-circle');
    if (data.score >= 80) scoreCircle.style.borderColor = "#10b981";
    else if (data.score >= 55) scoreCircle.style.borderColor = "#f59e0b";
    else scoreCircle.style.borderColor = "#ef4444";
}

// EVENT MENGGAMBAR & MENGHITUNG KETUKAN KLIK KIRI
drawingCanvas.addEventListener('mousedown', startPosition);
drawingCanvas.addEventListener('mouseup', finishedPosition);
drawingCanvas.addEventListener('mousemove', draw);

function startPosition(e) {
    if (e.button !== 0) return; // Hanya klik kiri
    painting = true;
    clickStrokeCount++; // Hitung 1x aksi menekan klik kiri saat membuat garis
    draw(e);
}

function finishedPosition() {
    if (!painting) return;
    painting = false;
    ctx.beginPath();
    saveCanvasState(); // Simpan state riwayat setiap kali selesai 1x garis klik kiri
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

colorPicker.addEventListener('input', () => { isEraser = false; });
eraserBtn.addEventListener('click', () => {
    isEraser = !isEraser;
    eraserBtn.style.background = isEraser ? '#f43f5e' : '#475569';
});
clearBtn.addEventListener('click', () => {
    if (confirm("Bersihkan kanvas?")) {
        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        saveCanvasState();
    }
});

// ANTI CHEAT DETEKTOR
document.addEventListener('fullscreenchange', () => {
    if (isGameActive && !document.fullscreenElement) {
        warningOverlay.style.display = 'flex';
        clearInterval(countdown);
    }
});

function returnToFullscreen() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(()=>{});
    warningOverlay.style.display = 'none';
    startTimer();
}
