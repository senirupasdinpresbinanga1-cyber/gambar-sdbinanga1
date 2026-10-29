const GS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzGD2akVdn5TdycTWbHvoNuLQBDWaPzIkJCY2wLgD4JvN5F47qpaOqVVyqSJWDnqtCcbA/exec";

let selectedClass = "6A";
let studentsList = [];
let studentResults = {};
let currentIndex = 0;
let countdown;
let timeLeft = 120; // 2 Menit
let isGameActive = false;

// Canvas Drawing States
let canvas, ctx;
let isDrawing = false;
let currentTool = "brush"; 
let currentColor = "#000000";
let currentBrushSize = 5;
let undoStack = [];

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

function startEntireGame() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) { elem.requestFullscreen().catch(()=>{}); }

    let names = window.rawDatabaseNames || [];
    if(names.length === 0) {
        alert("Daftar siswa kosong atau gagal dimuat dari database!");
        return;
    }

    studentsList = names.map((name, idx) => {
        return { 
            name: name, 
            soalNo: idx + 1,
            skipped: false
        };
    });

    currentIndex = 0;
    studentResults = {};
    isGameActive = true;
    
    document.getElementById('setup-panel').classList.add('hidden');
    document.getElementById('finish-panel').classList.add('hidden');
    document.getElementById('game-panel').classList.remove('hidden');
    
    initCanvas();
    renderPaletteGrid();
    loadStudentTurn();
}

function initCanvas() {
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas.getContext('2d');

    canvas.onmousedown = startDrawing;
    canvas.onmousemove = draw;
    canvas.onmouseup = stopDrawing;
    canvas.onmouseleave = stopDrawing;

    // Touch Support Mobile
    canvas.ontouchstart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousedown", { clientX: touch.clientX, clientY: touch.clientY });
        canvas.dispatchEvent(mouseEvent);
    };
    canvas.ontouchmove = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousemove", { clientX: touch.clientX, clientY: touch.clientY });
        canvas.dispatchEvent(mouseEvent);
    };
    canvas.ontouchend = (e) => {
        const mouseEvent = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(mouseEvent);
    };
}

function clearCanvas() {
    saveUndoState();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function saveUndoState() {
    if (undoStack.length >= 10) undoStack.shift();
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

function undoCanvas() {
    if (undoStack.length > 0) {
        const previousState = undoStack.pop();
        ctx.putImageData(previousState, 0, 0);
    }
}

function startDrawing(e) {
    isDrawing = true;
    saveUndoState();
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = currentBrushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (currentTool === "eraser") {
        ctx.strokeStyle = "#ffffff";
    } else {
        ctx.strokeStyle = currentColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function setTool(tool) {
    currentTool = tool;
    document.getElementById('tool-brush').classList.toggle('active', tool === 'brush');
    document.getElementById('tool-eraser').classList.toggle('active', tool === 'eraser');
}

function updateBrushSize(val) {
    currentBrushSize = val;
    document.getElementById('brush-size-val').textContent = `${val}px`;
}

function setCurrentColor(hex) {
    currentColor = hex;
    setTool('brush');
}

function renderPaletteGrid() {
    const grid = document.getElementById('color-palette-grid');
    grid.innerHTML = '';
    availablePalette.forEach(color => {
        const item = document.createElement('div');
        item.className = 'palette-item';
        item.style.backgroundColor = color;
        item.onclick = () => {
            setCurrentColor(color);
            document.getElementById('color-picker').value = color;
        };
        grid.appendChild(item);
    });
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
    document.getElementById('target-soal-badge').textContent = `Siswa ${currentIndex + 1} / ${studentsList.length}`;
    
    undoStack = [];
    clearCanvas();
    
    // Setel ulang dan jalankan Timer 2 Menit (120 detik)
    timeLeft = 120;
    document.getElementById('timer').textContent = timeLeft;
    startTimer();
    renderSidebarList();
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
    const imageBase64 = canvas.toDataURL("image/png");
    
    studentResults[student.name] = { imageData: imageBase64, status: "Waktu Habis" };
    saveStudentScoreToDatabase(student, imageBase64, "Waktu Habis");

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
    const imageBase64 = canvas.toDataURL("image/png");
    
    studentResults[student.name] = { 
        imageData: imageBase64, 
        status: "Selesai" 
    };
    
    saveStudentScoreToDatabase(student, imageBase64, "Selesai");

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
    studentResults[student.name] = { imageData: null, status: "Tidak Hadir (Skipped)" };
    saveStudentScoreToDatabase(student, "", "Tidak Hadir (Skipped)");

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

function saveStudentScoreToDatabase(student, imageBase64, statusVal) {
    if (student.skipped) return;

    let payload = {
        kelas: selectedClass,
        type: "appendSingle",
        result: {
            nama: student.name,
            gambar: imageBase64,
            status: statusVal,
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
            console.log(`Gambar ${student.name} berhasil tersimpan ke database.`);
        }).catch(err => {
            console.error("Gagal simpan gambar:", err);
        });
    }
}

function getNextValidIndex(idx) {
    while(idx < studentsList.length && studentsList[idx].skipped) {
        idx++;
    }
    return idx;
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
        } else if (data && data.status) {
            statusBadge = `<span class="student-status status-done">${data.status}</span>`;
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

    document.getElementById('sync-status-msg').textContent = `✅ Sesi selesai! Seluruh gambar siswa telah tersimpan di Google Spreadsheet (Sheet Data_${selectedClass})[cite: 2, 3].`;

    const tbody = document.getElementById('result-table-body');
    tbody.innerHTML = '';
    studentsList.forEach((stu, idx) => {
        let res = studentResults[stu.name] || { imageData: null, status: "-" };
        const tr = document.createElement('tr');
        
        let actionBtn = res.imageData ? `<button class="btn btn-glow btn-sm" onclick="openImageModal('${stu.name}', '${res.imageData}')"><i class="fas fa-palette"></i> Lihat Gambar</button>` : '-';

        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${stu.name}</td>
            <td>${stu.skipped ? 'Tidak Hadir (Skipped)' : res.status}</td>
            <td>${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

function openImageModal(studentName, imgData) {
    document.getElementById('modal-title').innerHTML = `<i class="fas fa-palette"></i> Hasil Gambar: ${studentName}`;
    document.getElementById('modal-img-preview').src = imgData;
    document.getElementById('image-modal').style.display = 'flex';
}

function closeImageModal() {
    document.getElementById('image-modal').style.display = 'none';
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
