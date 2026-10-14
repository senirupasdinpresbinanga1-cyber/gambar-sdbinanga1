const studentsDataByClass = {
    "6A": [
        "ABID AQILAH WAHYUDI", "AINUN HAKIMAH", "AINUN NUR AZIZAH A", "AMELIA AHMAD",
        "ANDI FAISYA SYAHIRA", "ANDI MUHAMMAD FAQIH AIRY H", "CAHYA AINUN", "DZAKY",
        "FARDHAN ZAKI JASMAR", "FEBY KHAIRUNNISA", "KHAIRA NAJWA BAZIMA", "LISNA YANTI",
        "MUH REVAN APRILIAN", "MUH RIFKI AL FAHREZA Z", "MUH. ARIFKI", "MUH. MIFTAHUL YAFI ASIS",
        "MUH. RAFLI", "MUHAMMAD ARAS QURUSYA", "MUHAMMAD SYAWAL", "NAYLA SALSABILLAH",
        "NURUL ADIVA AMRAN", "ST ASSYURAH JUHARBI", "SYAFWAAN SABQI", "YUSUF GIBRAN Y", "ZAM ZAMMY KHAIRIL MALIKI ABHAL"
    ],
    "6B": [
        "AIRIN RAHMI ANDINIANINDYA", "JINAN RISQIANNISA RAMADANI", "ANNISA SALSABILA", "ASYKAR ALFATIH",
        "CAHAYA AURA NAZHIF", "DEWA AYU RESTTI GAURI", "DIAN AFIKA", "FACHRU RAFAY",
        "FITRAH RAMADHAN ABDILLA", "JANUAR MUSA P", "KHARMAWAN", "M HILAL FIQRI AUTHAR R",
        "MIRZA SIDDIQIYAH RUSADY", "MUH FARIS GHAIZAN", "MUH MUHAIMIN FAIZAL. M", "MUH NAUFAL HAFIDZ",
        "MUH. AL HAFIDZ NASWAR", "MUH. AL QADRI", "MUH. MIRZA UKAIL", "MUHAMMAD ALGHAZHALY",
        "MUHAMMAD NUR", "SITI ALMIRAH UTARI", "MAHYA SANJAYA", "DZAKIYYA AZALIYYA", "AZIDAN DHIYAULHAQ"
    ]
};

const packageShapes = {
    "sekolah": ["pulpen", "buku", "tas", "pensil", "penggaris", "penghapus", "kotak_pensil", "gunting", "jangka", "buku_gambar"],
    "dapur": ["gelas", "piring", "sendok", "kompor", "pisau", "wajan", "mangkuk", "garpu", "botol", "panci"],
    "pemandangan": ["pohon", "gunung", "rumah", "rumput", "matahari", "awan", "bunga", "sungai", "burung", "batu"]
};

let selectedClass = "6A";
let selectedPackage = "sekolah";
let studentsList = [];
let studentData = {};
let currentIndex = 0;
let viewingResultIndex = 0;
let countdown;
let timeLeft = 120;
let isGameActive = false;

let historySteps = [];
let historyStepIndex = -1;
let clickStrokeCount = 0;

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
const timeupOverlay = document.getElementById('timeup-overlay');
const timeupMessage = document.getElementById('timeup-message');
const studentListEl = document.getElementById('student-list');
const sidebarCountEl = document.getElementById('sidebar-count');
const sidebarClassLabel = document.getElementById('sidebar-class-label');
const headerClassBadge = document.getElementById('header-class-badge');

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

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function selectClass(className) {
    selectedClass = className;
    document.querySelectorAll('.btn-class').forEach(btn => {
        if (btn.getAttribute('data-class') === className) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    initClassPreview();
}

function selectPackage(pkgName) {
    selectedPackage = pkgName;
    document.querySelectorAll('.btn-package').forEach(btn => {
        if (btn.getAttribute('data-package') === pkgName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function initClassPreview() {
    const rawNames = studentsDataByClass[selectedClass];
    sidebarCountEl.textContent = rawNames.length;
    sidebarClassLabel.textContent = `Kelas ${selectedClass} - Seni Rupa`;
    headerClassBadge.textContent = `Kelas ${selectedClass}`;

    studentListEl.innerHTML = '';
    rawNames.forEach((name, idx) => {
        const li = document.createElement('li');
        li.className = `student-item`;
        li.innerHTML = `
            <span class="student-name">${idx + 1}. ${name}</span>
            <span class="student-status status-pending">Siap</span>
        `;
        studentListEl.appendChild(li);
    });
}

function initRandomSession() {
    const rawNames = studentsDataByClass[selectedClass];
    const shuffledNames = shuffleArray(rawNames);
    const availableShapes = packageShapes[selectedPackage];

    studentsList = shuffledNames.map((name) => {
        const randomShape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
        return { name: name, shape: randomShape };
    });
}

initClassPreview();

startBtn.addEventListener('click', startEntireGame);
nextTurnBtn.addEventListener('click', saveAndNextStudent);
stopBtn.addEventListener('click', confirmStop);
restartBtn.addEventListener('click', () => {
    finishPanel.classList.add('hidden');
    setupPanel.classList.remove('hidden');
    initClassPreview();
});

undoBtn.addEventListener('click', undoCanvas);
redoBtn.addEventListener('click', redoCanvas);

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

    initRandomSession();

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
    targetBadgeEl.textContent = `Tugas Estetik: ${currentStudent.shape.toUpperCase().replace('_', ' ')}`;

    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    drawGuideShape(currentStudent.shape, gCtx, guideCanvas.width, guideCanvas.height);
    
    historySteps = [];
    historyStepIndex = -1;
    clickStrokeCount = 0;
    saveCanvasState();

    timeLeft = 120;
    timerEl.textContent = timeLeft;
    startTimer();
    renderSidebarList();
}

// 30 FUNGSI PANDUAN GAMBAR GAYA KONTUR BUKU TERBUKA (BERSIH, MELENGKUNG ESTETIK)
function drawGuideShape(shape, targetCtx, w, h) {
    targetCtx.clearRect(0, 0, w, h);
    targetCtx.strokeStyle = "rgba(225, 29, 72, 0.75)"; 
    targetCtx.lineWidth = 3;
    targetCtx.setLineDash([6, 6]);
    targetCtx.beginPath();

    // 1. SEKOLAH
    if (shape === 'pulpen') {
        targetCtx.moveTo(330, 80); targetCtx.quadraticCurveTo(360, 50, 390, 80); targetCtx.lineTo(375, 320); targetCtx.quadraticCurveTo(360, 340, 345, 320); targetCtx.closePath();
        targetCtx.moveTo(345, 120); targetCtx.quadraticCurveTo(360, 115, 375, 120);
    } else if (shape === 'buku') {
        targetCtx.moveTo(170, 260); targetCtx.quadraticCurveTo(260, 150, 350, 230); targetCtx.quadraticCurveTo(460, 150, 550, 260); targetCtx.quadraticCurveTo(460, 300, 350, 280); targetCtx.quadraticCurveTo(260, 300, 170, 260); targetCtx.closePath();
        targetCtx.moveTo(350, 230); targetCtx.lineTo(350, 280);
    } else if (shape === 'tas') {
        targetCtx.moveTo(250, 190); targetCtx.quadraticCurveTo(360, 160, 470, 190); targetCtx.quadraticCurveTo(490, 260, 480, 340); targetCtx.quadraticCurveTo(360, 350, 240, 340); targetCtx.quadraticCurveTo(230, 260, 250, 190); targetCtx.closePath();
        targetCtx.arc(360, 190, 45, Math.PI, 0);
    } else if (shape === 'pensil') {
        targetCtx.moveTo(330, 70); targetCtx.quadraticCurveTo(360, 50, 390, 70); targetCtx.lineTo(380, 330); targetCtx.quadraticCurveTo(360, 350, 340, 330); targetCtx.closePath();
        targetCtx.moveTo(330, 70); targetCtx.lineTo(360, 25); targetCtx.lineTo(390, 70);
    } else if (shape === 'penggaris') {
        targetCtx.moveTo(190, 220); targetCtx.quadraticCurveTo(360, 190, 530, 220); targetCtx.quadraticCurveTo(535, 260, 520, 270); targetCtx.quadraticCurveTo(360, 240, 200, 270); targetCtx.quadraticCurveTo(185, 260, 190, 220); targetCtx.closePath();
    } else if (shape === 'penghapus') {
        targetCtx.moveTo(260, 210); targetCtx.quadraticCurveTo(360, 180, 460, 210); targetCtx.quadraticCurveTo(470, 260, 450, 280); targetCtx.quadraticCurveTo(360, 290, 270, 280); targetCtx.quadraticCurveTo(250, 260, 260, 210); targetCtx.closePath();
    } else if (shape === 'kotak_pensil') {
        targetCtx.moveTo(200, 190); targetCtx.quadraticCurveTo(360, 160, 520, 190); targetCtx.quadraticCurveTo(530, 260, 510, 290); targetCtx.quadraticCurveTo(360, 310, 210, 290); targetCtx.quadraticCurveTo(190, 260, 200, 190); targetCtx.closePath();
    } else if (shape === 'gunting') {
        targetCtx.arc(280, 290, 35, 0, Math.PI*2);
        targetCtx.arc(440, 290, 35, 0, Math.PI*2);
        targetCtx.moveTo(305, 270); targetCtx.quadraticCurveTo(360, 180, 415, 270);
    } else if (shape === 'jangka') {
        targetCtx.moveTo(360, 70); targetCtx.quadraticCurveTo(320, 210, 270, 350); targetCtx.quadraticCurveTo(310, 360, 330, 350); targetCtx.quadraticCurveTo(350, 240, 360, 110); targetCtx.closePath();
    } else if (shape === 'buku_gambar') {
        targetCtx.moveTo(190, 140); targetCtx.quadraticCurveTo(360, 100, 530, 140); targetCtx.quadraticCurveTo(540, 240, 530, 340); targetCtx.quadraticCurveTo(360, 370, 190, 340); targetCtx.quadraticCurveTo(180, 240, 190, 140); targetCtx.closePath();

    // 2. DAPUR
    } else if (shape === 'gelas') {
        targetCtx.moveTo(270, 140); targetCtx.quadraticCurveTo(360, 120, 450, 140); targetCtx.quadraticCurveTo(440, 240, 420, 330); targetCtx.quadraticCurveTo(360, 350, 300, 330); targetCtx.quadraticCurveTo(280, 240, 270, 140); targetCtx.closePath();
        targetCtx.arc(435, 235, 30, -Math.PI/2, Math.PI/2);
    } else if (shape === 'piring') {
        targetCtx.ellipse(360, 210, 170, 75, 0, 0, Math.PI*2);
        targetCtx.ellipse(360, 210, 110, 45, 0, 0, Math.PI*2);
    } else if (shape === 'sendok') {
        targetCtx.ellipse(360, 130, 45, 65, 0, 0, Math.PI*2);
        targetCtx.moveTo(345, 190); targetCtx.quadraticCurveTo(360, 260, 350, 340); targetCtx.quadraticCurveTo(370, 340, 375, 190); targetCtx.closePath();
    } else if (shape === 'kompor') {
        targetCtx.moveTo(200, 200); targetCtx.quadraticCurveTo(360, 180, 520, 200); targetCtx.quadraticCurveTo(540, 270, 530, 330); targetCtx.quadraticCurveTo(360, 350, 190, 330); targetCtx.quadraticCurveTo(180, 270, 200, 200); targetCtx.closePath();
    } else if (shape === 'pisau') {
        targetCtx.moveTo(340, 220); targetCtx.quadraticCurveTo(360, 210, 380, 220); targetCtx.lineTo(375, 340); targetCtx.quadraticCurveTo(360, 350, 345, 340); targetCtx.closePath();
        targetCtx.moveTo(340, 220); targetCtx.lineTo(340, 100); targetCtx.quadraticCurveTo(440, 160, 500, 220); targetCtx.closePath();
    } else if (shape === 'wajan') {
        targetCtx.ellipse(360, 200, 140, 60, 0, 0, Math.PI*2);
        targetCtx.moveTo(225, 200); targetCtx.quadraticCurveTo(360, 310, 495, 200); targetCtx.quadraticCurveTo(540, 190, 600, 160);
    } else if (shape === 'mangkuk') {
        targetCtx.ellipse(360, 170, 130, 50, 0, 0, Math.PI*2);
        targetCtx.moveTo(230, 170); targetCtx.quadraticCurveTo(360, 330, 490, 170); targetCtx.quadraticCurveTo(460, 320, 360, 320); targetCtx.quadraticCurveTo(260, 320, 230, 170); targetCtx.closePath();
    } else if (shape === 'garpu') {
        targetCtx.moveTo(345, 200); targetCtx.quadraticCurveTo(360, 190, 375, 200); targetCtx.lineTo(370, 340); targetCtx.quadraticCurveTo(360, 350, 350, 340); targetCtx.closePath();
        targetCtx.moveTo(345, 200); targetCtx.lineTo(340, 100);
        targetCtx.moveTo(360, 200); targetCtx.lineTo(360, 100);
    } else if (shape === 'botol') {
        targetCtx.strokeRect(330, 80, 60, 45);
        targetCtx.moveTo(330, 125); targetCtx.quadraticCurveTo(280, 160, 270, 240); targetCtx.quadraticCurveTo(270, 340, 360, 340); targetCtx.quadraticCurveTo(450, 340, 450, 240); targetCtx.quadraticCurveTo(440, 160, 390, 125); targetCtx.closePath();
    } else if (shape === 'panci') {
        targetCtx.moveTo(230, 180); targetCtx.quadraticCurveTo(360, 160, 490, 180); targetCtx.quadraticCurveTo(480, 260, 470, 340); targetCtx.quadraticCurveTo(360, 360, 250, 340); targetCtx.quadraticCurveTo(240, 260, 230, 180); targetCtx.closePath();
        targetCtx.ellipse(360, 180, 130, 30, 0, 0, Math.PI*2);

    // 3. PEMANDANGAN
    } else if (shape === 'pohon') {
        targetCtx.moveTo(335, 230); targetCtx.quadraticCurveTo(350, 300, 325, 370); targetCtx.quadraticCurveTo(360, 380, 395, 370); targetCtx.quadraticCurveTo(370, 300, 385, 230); targetCtx.closePath();
        targetCtx.arc(360, 150, 95, 0, Math.PI*2);
    } else if (shape === 'gunung') {
        targetCtx.moveTo(120, 360); targetCtx.quadraticCurveTo(360, 100, 360, 100); targetCtx.quadraticCurveTo(360, 100, 600, 360); targetCtx.closePath();
        targetCtx.moveTo(240, 360); targetCtx.quadraticCurveTo(480, 160, 650, 360);
    } else if (shape === 'rumah') {
        targetCtx.moveTo(210, 200); targetCtx.quadraticCurveTo(360, 130, 510, 200); targetCtx.quadraticCurveTo(530, 280, 510, 360); targetCtx.quadraticCurveTo(360, 380, 210, 360); targetCtx.quadraticCurveTo(190, 280, 210, 200); targetCtx.closePath();
        targetCtx.moveTo(210, 200); targetCtx.lineTo(360, 100); targetCtx.lineTo(510, 200);
    } else if (shape === 'rumput') {
        for(let i=160; i<560; i+=35) {
            targetCtx.moveTo(i, 360); targetCtx.quadraticCurveTo(i+10, 280, i+25, 360);
        }
    } else if (shape === 'matahari') {
        targetCtx.arc(360, 180, 65, 0, Math.PI * 2);
        for(let a=0; a<360; a+=45) {
            let rx = 360 + Math.cos(a*Math.PI/180)*95;
            let ry = 180 + Math.sin(a*Math.PI/180)*95;
            targetCtx.moveTo(360 + Math.cos(a*Math.PI/180)*65, 180 + Math.sin(a*Math.PI/180)*65);
            targetCtx.lineTo(rx, ry);
        }
    } else if (shape === 'awan') {
        targetCtx.arc(310, 200, 45, 0, Math.PI*2);
        targetCtx.arc(370, 170, 60, 0, Math.PI*2);
        targetCtx.arc(430, 200, 45, 0, Math.PI*2);
    } else if (shape === 'bunga') {
        targetCtx.moveTo(355, 200); targetCtx.quadraticCurveTo(365, 280, 370, 360); targetCtx.quadraticCurveTo(360, 370, 350, 360); targetCtx.closePath();
        targetCtx.arc(360, 160, 40, 0, Math.PI * 2);
    } else if (shape === 'sungai') {
        targetCtx.moveTo(300, 120); targetCtx.bezierCurveTo(480, 200, 220, 280, 400, 380);
    } else if (shape === 'burung') {
        targetCtx.moveTo(280, 200); targetCtx.quadraticCurveTo(320, 150, 360, 200); targetCtx.quadraticCurveTo(400, 150, 440, 200);
    } else if (shape === 'batu') {
        targetCtx.moveTo(220, 360); targetCtx.quadraticCurveTo(270, 250, 360, 300); targetCtx.quadraticCurveTo(450, 250, 520, 360); targetCtx.closePath();
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
            handleTimeUp();
        }
    }, 1000);
}

function handleTimeUp() {
    const student = studentsList[currentIndex];
    
    const scoreResult = calculateBonusEvaluationScore(drawingCanvas, student.shape, clickStrokeCount);
    studentData[student.name] = {
        dataUrl: drawingCanvas.toDataURL(),
        score: scoreResult.totalScore,
        coverage: scoreResult.keyCoverage,
        efficiency: scoreResult.efficiencyScore,
        feedback: scoreResult.feedback
    };

    const nextIndex = currentIndex + 1;
    if (nextIndex < studentsList.length) {
        timeupMessage.innerHTML = `Waktu habis!<br>Selanjutnya: <strong style="color:#38bdf8;">${studentsList[nextIndex].name}</strong>`;
    } else {
        timeupMessage.innerHTML = `Waktu habis!<br>Sesi menggambar selesai untuk semua siswa.`;
    }
    timeupOverlay.style.display = 'flex';
}

function proceedNextAfterTimeUp() {
    timeupOverlay.style.display = 'none';
    currentIndex++;
    loadStudentTurn();
}

function saveAndNextStudent() {
    clearInterval(countdown);
    const student = studentsList[currentIndex];
    
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

function calculateBonusEvaluationScore(canvasElem, shape, totalStrokes) {
    const w = canvasElem.width;
    const h = canvasElem.height;

    const keyCanvas = document.createElement('canvas');
    keyCanvas.width = w; keyCanvas.height = h;
    const kCtx = keyCanvas.getContext('2d');
    
    kCtx.strokeStyle = "#000000";
    kCtx.lineWidth = 14;
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

    const keyCoverageRatio = matchedPixelCount / (keyPixelCount || 1);
    let efficiencyRatio = 1.0;
    if (totalStrokes > 20) {
        efficiencyRatio = Math.max(0.4, 1.0 - ((totalStrokes - 20) * 0.02));
    }

    const precisionPenalty = Math.max(0.5, 1.0 - (offTargetPixelCount / (userPixelCount + 1)));

    let baseScore = (keyCoverageRatio * 75) + (efficiencyRatio * 25);
    let finalScore = Math.round(baseScore * precisionPenalty);

    if (finalScore > 99) finalScore = 99;
    if (finalScore < 5) finalScore = 5;

    let keyCoveragePercent = Math.round(keyCoverageRatio * 100);
    let efficiencyPercent = Math.round(efficiencyRatio * 100);

    let feedbackMsg = "";
    if (keyCoveragePercent >= 80 && totalStrokes <= 25) {
        feedbackMsg = "🌟 Luar biasa! Garis kontur estetik tertutup sempurna dan goresan sangat rapi.";
    } else if (keyCoveragePercent >= 50) {
        feedbackMsg = "👍 Bagus! Cukup baik menutup pola kontur, pertahankan ketepatan dan efisiensi garis.";
    } else {
        feedbackMsg = "⚠️ Kurang akurat. Garis panduan kontur masih banyak yang belum tertutup rapat.";
    }

    return {
        totalScore: finalScore,
        keyCoverage: keyCoveragePercent,
        efficiencyScore: efficiencyPercent,
        feedback: feedbackMsg
    };
}

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

    document.getElementById('result-student-name').textContent = `Hasil Gambaran: ${student.name} (${student.shape.toUpperCase().replace('_', ' ')})`;

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

drawingCanvas.addEventListener('mousedown', startPosition);
drawingCanvas.addEventListener('mouseup', finishedPosition);
drawingCanvas.addEventListener('mousemove', draw);

function startPosition(e) {
    if (e.button !== 0) return;
    painting = true;
    clickStrokeCount++;
    draw(e);
}

function finishedPosition() {
    if (!painting) return;
    painting = false;
    ctx.beginPath();
    saveCanvasState();
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
