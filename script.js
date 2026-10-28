const GS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzGD2akVdn5TdycTWbHvoNuLQBDWaPzIkJCY2wLgD4JvN5F47qpaOqVVyqSJWDnqtCcbA/exec";

let selectedClass = "6A";
let studentsList = [];
let studentResults = {};
let currentIndex = 0;
let countdown;
let timeLeft = 120;
let isGameActive = false;

let currentSoalObj = null;
let currentSlots = [null, null, null, null, null];
let selectedSlotIndex = 0;

const targetColorPool = [
    { hex: "#8B0000", name: "Merah Tua / Marun" },
    { hex: "#FF4500", name: "Oranye Kemerahan" },
    { hex: "#FFD700", name: "Kuning Keemasan" },
    { hex: "#ADFF2F", name: "Hijau Kekuningan" },
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

const availablePalette = [
    "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", 
    "#FFFF00", "#00FFFF", "#FF00FF", "#FFA500", "#800080", 
    "#008080", "#808080", "#A52A2A", "#FFC0CB", "#4682B4",
    "#D2B48C", "#8B0000", "#556B2F", "#483D8B", "#FF1493",
    "#FF4500", "#FFD700", "#ADFF2F", "#008000", "#00008B",
    "#8A2BE2", "#A0522D", "#2F4F4F", "#FF8C00", "#9ACD32",
    "#20B2AA", "#778899", "#B0C4DE", "#DB7093", "#CD853F",
    "#6B8E23", "#9932CC"
];

function selectClass(className) {
    selectedClass = className;
    document.querySelectorAll('.btn-class').forEach(btn => {
        if (btn.getAttribute('data-class') === className) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    fetchStudentsFromDatabase();
}

async function fetchStudentsFromDatabase() {
    const sidebarClassLabel = document.getElementById('sidebar-class-label');
    const headerClassBadge = document.getElementById('header-class-badge');

    headerClassBadge.textContent = `Kelas ${selectedClass}`;
    sidebarClassLabel.textContent = `Kelas ${selectedClass} (Database)`;

    if (GS_WEB_APP_URL && GS_WEB_APP_URL !== "PASTE_URL_WEB_APP_GS_ANDA_DI_SINI") {
        try {
            let response = await fetch(`${GS_WEB_APP_URL}?action=getStudents&kelas=${selectedClass}`);
            let names = await response.json();
            setupStudentUI(names);
        } catch (e) {
            console.error("Gagal ambil dari database:", e);
            setupStudentUI(["SISWA 1", "SISWA 2"]);
        }
    } else {
        setupStudentUI(["SISWA CONTOH 1", "SISWA CONTOH 2"]);
    }
}

function setupStudentUI(rawNames) {
    const sidebarCountEl = document.getElementById('sidebar-count');
    const studentListEl = document.getElementById('student-list');

    sidebarCountEl.textContent = rawNames.length;
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

    window.rawDatabaseNames = rawNames;
}

fetchStudentsFromDatabase();

document.getElementById('start-btn').addEventListener('click', startEntireGame);

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function startEntireGame() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) { elem.requestFullscreen().catch(()=>{}); }

    let names = window.rawDatabaseNames || [];
    if(names.length === 0) {
        alert("Daftar siswa kosong atau gagal dimuat dari database!");
        return;
    }

    const shuffledSoal = shuffleArray(targetColorPool);

    studentsList = names.map((name, idx) => {
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
    
    document.getElementById('setup-panel').classList.add('hidden');
    document.getElementById('finish-panel').classList.add('hidden');
    document.getElementById('game-panel').classList.remove('hidden');
    
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

    document.getElementById('current-player').textContent = currentStudent.name;
    document.getElementById('target-soal-badge').textContent = `Soal ${currentStudent.soalNo} / 26`;
    currentSoalObj = currentStudent.targetSoal;
    
    document.getElementById('target-color-box').style.backgroundColor = currentSoalObj.hex;
    document.getElementById('target-color-name').textContent = currentSoalObj.name;

    currentSlots = [null, null, null, null, null];
    selectedSlotIndex = 0;
    renderSlots();
    renderPaletteGrid();
    updateMixedResultBox();

    timeLeft = 120;
    document.getElementById('timer').textContent = timeLeft;
    startTimer();
    renderSidebarList();
}

function renderSlots() {
    const container = document.getElementById('selected-slots');
    container.innerHTML = '';
    currentSlots.forEach((color, idx) => {
        const slot = document.createElement('div');
        slot.className = 'color-slot';
        if (idx === selectedSlotIndex) {
            slot.classList.add('active-slot');
        }
        if (color) {
            slot.style.backgroundColor = color;
        } else {
            slot.style.backgroundColor = '#FFFFFF';
        }
        slot.title = `Kolom ${idx+1} (Klik untuk memilih)`;
        slot.onclick = () => {
            selectedSlotIndex = idx;
            renderSlots();
        };
        container.appendChild(slot);
    });
}

function renderPaletteGrid() {
    const grid = document.getElementById('color-palette-grid');
    grid.innerHTML = '';
    availablePalette.forEach(color => {
        const item = document.createElement('div');
        item.className = 'palette-item';
        item.style.backgroundColor = color;
        item.onclick = () => applyColorToSelectedSlot(color);
        grid.appendChild(item);
    });
}

function applyColorToSelectedSlot(color) {
    currentSlots[selectedSlotIndex] = color;
    renderSlots();
    updateMixedResultBox();
    
    if (selectedSlotIndex < 4) {
        selectedSlotIndex++;
        renderSlots();
    }
}

function clearSlots() {
    currentSlots = [null, null, null, null, null];
    selectedSlotIndex = 0;
    renderSlots();
    updateMixedResultBox();
}

function calculateMixedColor(slots) {
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    slots.forEach(hex => {
        if (hex !== null) {
            let rgb = hexToRgb(hex);
            rSum += rgb.r;
            gSum += rgb.g;
            bSum += rgb.b;
            count++;
        }
    });

    if (count === 0) return "#FFFFFF";

    let avgR = Math.round(rSum / count);
    let avgG = Math.round(gSum / count);
    let avgB = Math.round(bSum / count);

    return `rgb(${avgR}, ${avgG}, ${avgB})`;
}

function updateMixedResultBox() {
    const resultBox = document.getElementById('mixed-result-box');
    let mixedRgbStyle = calculateMixedColor(currentSlots);
    resultBox.style.backgroundColor = mixedRgbStyle;
}

function startTimer() {
    clearInterval(countdown);
    countdown = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
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
    saveStudentScoreToDatabase(student, score + "%", "Waktu Habis");

    const nextIndex = getNextValidIndex(currentIndex + 1);
    if (nextIndex < studentsList.length) {
        document.getElementById('timeup-message').innerHTML = `Waktu habis!<br>Selanjutnya giliran: <strong style="color:#38bdf8;">${studentsList[nextIndex].name}</strong>`;
    } else {
        document.getElementById('timeup-message').innerHTML = `Waktu habis!<br>Sesi selesai untuk semua siswa.`;
    }
    document.getElementById('timeup-overlay').style.display = 'flex';
}

function proceedNextAfterTimeUp() {
    document.getElementById('timeup-overlay').style.display = 'none';
    currentIndex++;
    loadStudentTurn();
}

function triggerSelesaiButton() {
    clearInterval(countdown);
    const student = studentsList[currentIndex];
    const score = calculateColorScore(currentSlots, currentSoalObj.hex);
    
    studentResults[student.name] = { score: score + "%", status: "Selesai" };
    saveStudentScoreToDatabase(student, score + "%", "Selesai");

    const nextIndex = getNextValidIndex(currentIndex + 1);
    if (nextIndex < studentsList.length) {
        document.getElementById('turn-alert-msg').textContent = `Selanjutnya giliran ${studentsList[nextIndex].name}`;
        document.getElementById('turn-alert-overlay').style.display = 'flex';
    } else {
        endAllTurns();
    }
}

function closeTurnAlert() {
    document.getElementById('turn-alert-overlay').style.display = 'none';
    currentIndex++;
    loadStudentTurn();
}

function skipCurrentStudent() {
    clearInterval(countdown);
    const student = studentsList[currentIndex];
    student.skipped = true;
    studentResults[student.name] = { score: "0%", status: "Tidak Hadir (Skipped)" };
    saveStudentScoreToDatabase(student, "0%", "Tidak Hadir (Skipped)");

    const nextIndex = getNextValidIndex(currentIndex + 1);
    if (nextIndex < studentsList.length) {
        currentIndex++;
        loadStudentTurn();
    } else {
        endAllTurns();
    }
}

function confirmStop() {
    location.reload();
}

function saveStudentScoreToDatabase(student, scoreVal, statusVal) {
    if (student.skipped) return;

    let payload = {
        kelas: selectedClass,
        type: "appendSingle",
        result: {
            nama: student.name,
            soalWarna: student.targetSoal.name,
            nilai: scoreVal,
            waktu: new Date().toLocaleString('id-ID')
        }
    };

    if (GS_WEB_APP_URL && GS_WEB_APP_URL !== "PASTE_URL_WEB_APP_GS_ANDA_DI_SINI") {
        fetch(GS_WEB_APP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).then(() => {
            console.log(`Nilai ${student.name} berhasil diperbarui di database.`);
        }).catch(err => {
            console.error("Gagal kirim nilai:", err);
        });
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

// SISTEM PENILAIAN 100% AKURAT & WAJIB 5 KOLOM TERISI PENUH
function calculateColorScore(slots, targetHex) {
    // Cek apakah ada kolom yang kosong (null). Jika ada 1 saja yang kosong, langsung return 0%
    let validCount = 0;
    slots.forEach(hex => {
        if (hex !== null) validCount++;
    });

    if (validCount < 5) {
        return 0; // Wajib terisi 5 kolom penuh, jika tidak maka 0%
    }

    const target = hexToRgb(targetHex);
    let rSum = 0, gSum = 0, bSum = 0;

    slots.forEach(hex => {
        let rgb = hexToRgb(hex);
        rSum += rgb.r;
        gSum += rgb.g;
        bSum += rgb.b;
    });

    let avgR = rSum / 5;
    let avgG = gSum / 5;
    let avgB = bSum / 5;

    // Hitung jarak Euclidean 3D warna
    let distance = Math.sqrt(
        Math.pow(target.r - avgR, 2) +
        Math.pow(target.g - avgG, 2) +
        Math.pow(target.b - avgB, 2)
    );

    let maxDistance = 441.6; // Akar dari (255^2 + 255^2 + 255^2)
    
    // Perhitungan diperketat drastis dengan pangkat 3.5 agar yang melenceng jauh (seperti hitam vs oranye) mutlak jadi 0%
    let accuracyRatio = Math.max(0, 1 - Math.pow(distance / maxDistance, 3.5));
    
    let finalScore = Math.round(accuracyRatio * 100);
    return Math.min(100, Math.max(0, finalScore));
}

function renderSidebarList() {
    const studentListEl = document.getElementById('student-list');
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
    document.getElementById('game-panel').classList.add('hidden');
    document.getElementById('finish-panel').classList.remove('hidden');
    renderSidebarList();

    document.getElementById('sync-status-msg').textContent = `✅ Sesi selesai! Seluruh nilai siswa telah diperbarui secara real-time di Google Spreadsheet (Sheet Data_${selectedClass}).`;

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
    document.getElementById('finish-panel').classList.add('hidden');
    document.getElementById('setup-panel').classList.remove('hidden');
    fetchStudentsFromDatabase();
};

document.addEventListener('fullscreenchange', () => {
    if (isGameActive && !document.fullscreenElement) {
        document.getElementById('warning-overlay').style.display = 'flex';
        clearInterval(countdown);
    }
});

function returnToFullscreen() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(()=>{});
    document.getElementById('warning-overlay').style.display = 'none';
    startTimer();
}
