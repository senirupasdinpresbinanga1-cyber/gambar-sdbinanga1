// === MASUKKAN URL WEB APP GS ANDA DI SINI ===
const GS_WEB_APP_URL = "PASTE_URL_WEB_APP_GS_ANDA_DI_SINI";

// DATA SISWA KELAS 6A & 6B
const studentsDataByClass = {
    "6A": [
        "ABID AQILAH WAHYUDI", "AHMAD FAREL", "AULIA ZAHRA", "DAFA PRATAMA", "DIAN ANGRAENI"
    ],
    "6B": [
        "ANNISA RAMADANI", "BINTANG SAPUTRA", "CINTA LESTARI", "DIMAS ARYA", "FAHRI ALFARIZI"
    ]
};

// 26 SOAL WARNA TARGET DENGAN KETERANGAN DETAIL LENGKAP
const targetColorPool = [
    { hex: "#8B0000", name: "Merah Tua / Marun" },
    { hex: "#FF4500", name: "Oranye Kemerahan" },
    { hex: "#FFD700", name: "Kuning Keemasan" },
    { hex: "#ADFF2F", name: "Hijaumuda / Hijau Kekuningan" },
    { hex: "#008000", name: "Hijau Murni" },
    { hex: "#00FFFF", name: "Biru Muda / Sian" },
    { hex: "#1E90FF", name: "Biru Cerah" },
    { hex: "#00008B", name: "Biru Tua / Gelap" },
    { hex: "#8A2BE2", name: "Ungu Kebiruan" },
    { hex: "#FF1493", name: "Merah Muda Tua / Pink Pekat" },
    { hex: "#D2B48C", name: "Cokelat Muda / Tan" },
    { hex: "#A0522D", name: "Cokelat Kemerahan" },
    { hex: "#556B2F", name: "Hijau Lumut / Zaitun Tua" },
    { hex: "#2F4F4F", name: "Abu-abu Kehijauan Tua" },
    { hex: "#483D8B", name: "Ungu Kebiruan Gelap" },
    { hex: "#FF8C00", name: "Oranye Tua" },
    { hex: "#9ACD32", name: "Hijau Zaitun Muda" },
    { hex: "#20B2AA", name: "Hijau Laut Cerah" },
    { hex: "#778899", name: "Abu-abu Kebiruan" },
    { hex: "#B0C4DE", name: "Biru Muda Keabuan" },
    { hex: "#DB7093", name: "Merah Muda Keunguan" },
    { hex: "#FF69B4", name: "Merah Muda / Pink Cerah" },
    { hex: "#CD853F", name: "Cokelat Kayu" },
    { hex: "#6B8E23", name: "Hijau Zaitun" },
    { hex: "#4682B4", name: "Biru Baja" },
    { hex: "#9932CC", name: "Ungu Tua / Magenta Keunguan" }
];

// PALET WARNA DASAR PEMBENTUK UNTUK DICAMPUR
const availablePalette = [
    "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", 
    "#FFFF00", "#00FFFF", "#FF00FF", "#FFA500", "#800080", 
    "#008080", "#808080", "#A52A2A", "#FFC0CB", "#4682B4"
];

let selectedClass = "6A";
let studentsList = [];
let studentResults = {};
let currentIndex = 0;
let countdown;
let timeLeft = 120;
let isGameActive = false;

let currentSoalObj = null;
let currentSlots = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];
let historySteps = [];
let historyStepIndex = -1;

const setupPanel = document.getElementById('setup-panel');
const gamePanel = document.getElementById('game-panel');
const finishPanel = document.getElementById('finish-panel');
const startBtn = document.getElementById('start-btn');
const currentPlayerEl = document.getElementById('current-player');
const timerEl = document.getElementById('timer');
const warningOverlay = document.getElementById('warning-overlay');
const timeupOverlay = document.getElementById('timeup-overlay');
const timeupMessage = document.getElementById('timeup-message');
const turnAlertOverlay = document.getElementById('turn-alert-overlay');
const studentListEl = document.getElementById('student-list');
const sidebarCountEl = document.getElementById('sidebar-count');
const sidebarClassLabel = document.getElementById('sidebar-class-label');
const headerClassBadge = document.getElementById('header-class-badge');
const targetColorBox = document.getElementById('target-color-box');
const targetColorName = document.getElementById('target-color-name');
const selectedSlotsContainer = document.getElementById('selected-slots');
const colorPaletteGrid = document.getElementById('color-palette-grid');
const targetSoalBadge = document.getElementById('target-soal-badge');

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

function initClassPreview() {
    const rawNames = studentsDataByClass[selectedClass];
    sidebarCountEl.textContent = rawNames.length;
    sidebarClassLabel.textContent = `Kelas ${selectedClass} - Warna`;
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

initClassPreview();
startBtn.addEventListener('click', startEntireGame);

function startEntireGame() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) { elem.requestFullscreen().catch(()=>{}); }

    const rawNames = studentsDataByClass[selectedClass];
    const shuffledSoal = shuffleArray(targetColorPool);

    studentsList = rawNames.map((name, idx) => {
        let soal = shuffledSoal[idx % shuffledSoal.length];
        return { 
            name: name, 
            targetSoal: soal,
            soalNo: (idx % shuffledSoal.length) + 1,
            skipped: false
        };
    });

    currentIndex = 0;
    studentResults = {};
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
    if (currentStudent.skipped) {
        currentIndex++;
        loadStudentTurn();
        return;
    }

    currentPlayerEl.textContent = currentStudent.name;
    targetSoalBadge.textContent = `Soal ${currentStudent.soalNo} / 26`;
    currentSoalObj = currentStudent.targetSoal;
    
    targetColorBox.style.backgroundColor = currentSoalObj.hex;
    targetColorName.textContent = currentSoalObj.name;

    currentSlots = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];
    renderSlots();
    renderPaletteGrid();
    
    historySteps = [];
    historyStepIndex = -1;
    saveSlotState();

    timeLeft = 120;
    timerEl.textContent = timeLeft;
    startTimer();
    renderSidebarList();
}

function renderSlots() {
    selectedSlotsContainer.innerHTML = '';
    currentSlots.forEach((color, idx) => {
        const slot = document.createElement('div');
        slot.className = 'color-slot';
        slot.style.backgroundColor = color;
        slot.title = `Klik untuk bersihkan slot ${idx+1}`;
        slot.onclick = () => {
            currentSlots[idx] = "#FFFFFF";
            renderSlots();
            saveSlotState();
        };
        selectedSlotsContainer.appendChild(slot);
    });
}

function renderPaletteGrid() {
    colorPaletteGrid.innerHTML = '';
    availablePalette.forEach(color => {
        const item = document.createElement('div');
        item.className = 'palette-item';
        item.style.backgroundColor = color;
        item.onclick = () => applyColorToNextSlot(color);
        colorPaletteGrid.appendChild(item);
    });
}

function applyColorToNextSlot(color) {
    const emptyIndex = currentSlots.findIndex(c => c === "#FFFFFF");
    if (emptyIndex !== -1) {
        currentSlots[emptyIndex] = color;
    } else {
        currentSlots[4] = color;
    }
    renderSlots();
    saveSlotState();
}

function saveSlotState() {
    historyStepIndex++;
    if (historyStepIndex < historySteps.length) {
        historySteps.length = historyStepIndex;
    }
    historySteps.push([...currentSlots]);
}

function undoColor() {
    if (historyStepIndex > 0) {
        historyStepIndex--;
        currentSlots = [...historySteps[historyStepIndex]];
        renderSlots();
    }
}

function redoColor() {
    if (historyStepIndex < historySteps.length - 1) {
        historyStepIndex++;
        currentSlots = [...historySteps[historyStepIndex]];
        renderSlots();
    }
}

function clearSlots() {
    currentSlots = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];
    renderSlots();
    saveSlotState();
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
    const score = calculateColorScore(currentSlots, currentSoalObj.hex);
    
    studentResults[student.name] = { score: score + "%", status: "Waktu Habis" };

    const nextIndex = getNextValidIndex(currentIndex + 1);
    if (nextIndex < studentsList.length) {
        timeupMessage.innerHTML = `Waktu habis!<br>Selanjutnya giliran: <strong style="color:#38bdf8;">${studentsList[nextIndex].name}</strong>`;
    } else {
        timeupMessage.innerHTML = `Waktu habis!<br>Sesi selesai untuk semua siswa.`;
    }
    timeupOverlay.style.display = 'flex';
}

function proceedNextAfterTimeUp() {
    timeupOverlay.style.display = 'none';
    currentIndex++;
    loadStudentTurn();
}

function triggerSelesaiButton() {
    clearInterval(countdown);
    const student = studentsList[currentIndex];
    const score = calculateColorScore(currentSlots, currentSoalObj.hex);
    
    studentResults[student.name] = { score: score + "%", status: "Selesai" };

    const nextIndex = getNextValidIndex(currentIndex + 1);
    if (nextIndex < studentsList.length) {
        document.getElementById('turn-alert-msg').textContent = `Selanjutnya giliran ${studentsList[nextIndex].name}`;
        turnAlertOverlay.style.display = 'flex';
    } else {
        endAllTurns();
    }
}

function closeTurnAlert() {
    turnAlertOverlay.style.display = 'none';
    currentIndex++;
    loadStudentTurn();
}

function skipCurrentStudent() {
    if (confirm("Yakin ingin men-skip siswa ini (tidak hadir)? Nilai tidak akan masuk.")) {
        clearInterval(countdown);
        const student = studentsList[currentIndex];
        student.skipped = true;
        studentResults[student.name] = { score: "0%", status: "Tidak Hadir (Skipped)" };

        const nextIndex = getNextValidIndex(currentIndex + 1);
        if (nextIndex < studentsList.length) {
            currentIndex++;
            loadStudentTurn();
        } else {
            endAllTurns();
        }
    }
}

function getNextValidIndex(idx) {
    while(idx < studentsList.length && studentsList[idx].skipped) {
        idx++;
    }
    return idx;
}

function hexToRgb(hex) {
    let bigint = parseInt(hex.replace('#',''), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return {r, g, b};
}

function calculateColorScore(slots, targetHex) {
    const target = hexToRgb(targetHex);
    let rSum = 0, gSum = 0, bSum = 0, validCount = 0;

    slots.forEach(hex => {
        if(hex !== "#FFFFFF") {
            let rgb = hexToRgb(hex);
            rSum += rgb.r;
            gSum += rgb.g;
            bSum += rgb.b;
            validCount++;
        }
    });

    if(validCount === 0) return 0;

    let avgR = rSum / validCount;
    let avgG = gSum / validCount;
    let avgB = bSum / validCount;

    let distance = Math.sqrt(
        Math.pow(target.r - avgR, 2) +
        Math.pow(target.g - avgG, 2) +
        Math.pow(target.b - avgB, 2)
    );

    let maxDistance = 441.6;
    let score = Math.max(0, Math.round(100 - (distance / maxDistance) * 100));
    return score;
}

function renderSidebarList() {
    studentListEl.innerHTML = '';
    studentsList.forEach((stu, idx) => {
        const li = document.createElement('li');
        li.className = `student-item ${idx === currentIndex && isGameActive ? 'active' : ''}`;
        
        const data = studentResults[stu.name];
        let statusBadge = '<span class="student-status status-pending">Belum</span>';
        if (stu.skipped) {
            statusBadge = '<span class="student-status status-skipped">Absen</span>';
        } else if (data && data.score !== undefined) {
            statusBadge = `<span class="student-status status-done">${data.score}</span>`;
        } else if (idx === currentIndex && isGameActive) {
            statusBadge = '<span class="student-status status-active">Aktif</span>';
        }

        li.innerHTML = `
            <span class="student-name">${idx + 1}. ${stu.name}</span>
            ${statusBadge}
        `;
        studentListEl.appendChild(li);
    });
}

function endAllTurns() {
    gamePanel.classList.add('hidden');
    finishPanel.classList.remove('hidden');
    renderSidebarList();

    let spreadsheetPayload = [];
    studentsList.forEach(stu => {
        let res = studentResults[stu.name] || { score: "0%", status: "Belum" };
        if(!stu.skipped) {
            spreadsheetPayload.push({
                nama: stu.name,
                soalWarna: stu.targetSoal.name,
                nilai: res.score,
                waktu: new Date().toLocaleString('id-ID')
            });
        }
    });

    // Kirim Data Nilai ke Google Apps Script Spreadsheet
    const syncStatusMsg = document.getElementById('sync-status-msg');
    if (GS_WEB_APP_URL && GS_WEB_APP_URL !== "PASTE_URL_WEB_APP_GS_ANDA_DI_SINI") {
        fetch(GS_WEB_APP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(spreadsheetPayload)
        })
        .then(() => {
            syncStatusMsg.textContent = "✅ Data Nilai Berhasil Tersimpan di Google Spreadsheet (Sheet: Data_Nilai)!";
            syncStatusMsg.style.color = "#10b981";
        })
        .catch(err => {
            syncStatusMsg.textContent = "⚠️ Gagal Sinkronisasi ke Spreadsheet: " + err;
            syncStatusMsg.style.color = "#ef4444";
        });
    } else {
        syncStatusMsg.textContent = "⚠️ URL Web App GS belum dikonfigurasi pada script.js!";
        syncStatusMsg.style.color = "#f59e0b";
    }

    // Tampilkan Tabel Rekap di Layar
    const tbody = document.getElementById('result-table-body');
    tbody.innerHTML = '';
    studentsList.forEach((stu, idx) => {
        let res = studentResults[stu.name] || { score: "0%", status: "-" };
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${stu.name}</td>
            <td>${stu.targetSoal.name}</td>
            <td><strong>${stu.skipped ? '0% (Skipped)' : res.score}</strong></td>
            <td>${res.status}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('restart-btn').onclick = () => {
    finishPanel.classList.add('hidden');
    setupPanel.classList.remove('hidden');
    initClassPreview();
};

function confirmStop() {
    if (confirm("Yakin ingin mereset seluruh sesi permainan?")) {
        location.reload();
    }
}
document.getElementById('stop-btn').onclick = confirmStop;

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
