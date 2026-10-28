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

// 26 Warna untuk Kelas 6A (Merah sampai Zaitun sesuai daftar urutan Anda)
const targetColorPool6A = [
    { hex: "#FF0000", name: "Merah" },
    { hex: "#FFC0CB", name: "Merah muda" },
    { hex: "#800000", name: "Merah marun" },
    { hex: "#FFA500", name: "Jingga" },
    { hex: "#FFFF00", name: "Kuning" },
    { hex: "#FFD700", name: "Kuning emas" },
    { hex: "#008000", name: "Hijau" },
    { hex: "#98FB98", name: "Hijau muda" },
    { hex: "#006400", name: "Hijau tua" },
    { hex: "#008080", name: "Toska" },
    { hex: "#0000FF", name: "Biru" },
    { hex: "#ADD8E6", name: "Biru muda" },
    { hex: "#00008B", name: "Biru tua" },
    { hex: "#00BFFF", name: "Biru laut" },
    { hex: "#800080", name: "Ungu" },
    { hex: "#E6E6FA", name: "Lavender" },
    { hex: "#EE82EE", name: "Violet" },
    { hex: "#A52A2A", name: "Cokelat" },
    { hex: "#D2B48C", name: "Cokelat muda" },
    { hex: "#FFFDD0", name: "Krem" },
    { hex: "#F5F5DC", name: "Beige" },
    { hex: "#FF00FF", name: "Magenta" },
    { hex: "#FA8072", name: "Salem" },
    { hex: "#4B0082", name: "Nila" },
    { hex: "#FFDAB9", name: "Peach" },
    { hex: "#808000", name: "Zaitun" }
];

// 25 Warna untuk Kelas 6B (Merah sampai Peach - tanpa Zaitun)
const targetColorPool6B = [
    { hex: "#FF0000", name: "Merah" },
    { hex: "#FFC0CB", name: "Merah muda" },
    { hex: "#800000", name: "Merah marun" },
    { hex: "#FFA500", name: "Jingga" },
    { hex: "#FFFF00", name: "Kuning" },
    { hex: "#FFD700", name: "Kuning emas" },
    { hex: "#008000", name: "Hijau" },
    { hex: "#98FB98", name: "Hijau muda" },
    { hex: "#006400", name: "Hijau tua" },
    { hex: "#008080", name: "Toska" },
    { hex: "#0000FF", name: "Biru" },
    { hex: "#ADD8E6", name: "Biru muda" },
    { hex: "#00008B", name: "Biru tua" },
    { hex: "#00BFFF", name: "Biru laut" },
    { hex: "#800080", name: "Ungu" },
    { hex: "#E6E6FA", name: "Lavender" },
    { hex: "#EE82EE", name: "Violet" },
    { hex: "#A52A2A", name: "Cokelat" },
    { hex: "#D2B48C", name: "Cokelat muda" },
    { hex: "#FFFDD0", name: "Krem" },
    { hex: "#F5F5DC", name: "Beige" },
    { hex: "#FF00FF", name: "Magenta" },
    { hex: "#FA8072", name: "Salem" },
    { hex: "#4B0082", name: "Nila" },
    { hex: "#FFDAB9", name: "Peach" }
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

    // Tentukan pool warna berdasarkan kelas yang dipilih (6A = 26 warna, 6B = 25 warna)
    let activeColorPool = (selectedClass === "6A") ? targetColorPool6A : targetColorPool6B;
    const shuffledSoal = shuffleArray(activeColorPool);
    const totalSoalCount = activeColorPool.length;

    studentsList = names.map((name, idx) => {
        let soal = shuffledSoal[idx % shuffledSoal.length];
        return { 
            name: name, 
            targetSoal: soal,
            soalNo: (idx % shuffledSoal.length) + 1,
            maxSoal: totalSoalCount,
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
    document.getElementById('target-soal-badge').textContent = `Soal ${currentStudent.soalNo} / ${currentStudent.maxSoal}`;
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
            slot.classList.remove('transparent-bg');
        } else {
            slot.style.backgroundColor = '';
            slot.classList.add('transparent-bg');
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

    if (count === 0) return null;

    let avgR = Math.round(rSum / count);
    let avgG = Math.round(gSum / count);
    let avgB = Math.round(bSum / count);

    return `rgb(${avgR}, ${avgG}, ${avgB})`;
}

function updateMixedResultBox() {
    const resultBox = document.getElementById('mixed-result-box');
    let mixedRgbStyle = calculateMixedColor(currentSlots);
    if (mixedRgbStyle) {
        resultBox.style.backgroundColor = mixedRgbStyle;
        resultBox.classList.remove('transparent-bg');
    } else {
        resultBox.style.backgroundColor = '';
        resultBox.classList.add('transparent-bg');
    }
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

function calculateColorScore(slots, targetHex) {
    let validCount = 0;
    slots.forEach(hex => {
        if (hex !== null) validCount++;
    });

    if (validCount < 5) {
        return 0; 
    }

    const target = hexToRgb(targetHex);
    let rSum = 0, gSum = 0, bSum = 0;

    slots.forEach(hex => {
        let rgb = hexToRgb(hex);
        rSum += rgb.r;
        gSum += rgb.g;
        bSum += rgb.b;
    });

    let avgR = Math.round(rSum / 5);
    let avgG = Math.round(gSum / 5);
    let avgB = Math.round(bSum / 5);

    let targetMax = Math.max(target.r, target.g, target.b);
    let avgMax = Math.max(avgR, avgG, avgB);

    let targetDominant = target.r === targetMax ? 'R' : (target.g === targetMax ? 'G' : 'B');
    let avgDominant = avgR === avgMax ? 'R' : (avgG === avgMax ? 'G' : 'B');

    let baseMultiplier = 1.0;
    if (targetDominant !== avgDominant) {
        baseMultiplier = 0.25; 
    }

    let distance = Math.sqrt(
        Math.pow(target.r - avgR, 2) +
        Math.pow(target.g - avgG, 2) +
        Math.pow(target.b - avgB, 2)
    );

    let maxDistance = 441.6;
    let accuracyRatio = Math.max(0, 1 - Math.pow(distance / maxDistance, 2.0));

    let finalScore = Math.round(accuracyRatio * baseMultiplier * 100);
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
