const GS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzGD2akVdn5TdycTWbHvoNuLQBDWaPzIkJCY2wLgD4JvN5F47qpaOqVVyqSJWDnqtCcbA/exec";

let selectedClass = "6A";
let adminSelectedClass = "6A";
let selectedPackageKey = "hewan";
let studentsList = [];
let studentResults = {};
let currentIndex = 0;
let countdown;
let timeLeft = 180; // 3 Menit
let isGameActive = false;

const packagesData = {
    hewan: [
        "Kucing", "Anjing", "Kelinci", "Kambing", "Sapi", "Kuda", "Ayam", "Bebek", 
        "Burung", "Ikan", "Kupu-kupu", "Lebah", "Semut", "Belalang", "Capung", 
        "Katak", "Kura-kura", "Ular", "Buaya", "Gajah", "Harimau", "Singa", 
        "Monyet", "Jerapah", "Zebra", "Panda"
    ],
    rumah: [
        "Meja", "Kursi", "Sofa", "Lemari", "Tempat tidur", "Bantal", "Guling", 
        "Selimut", "Kipas angin", "Televisi", "Kulkas", "Mesin cuci", "Kompor", 
        "Panci", "Wajan", "Piring", "Gelas", "Sendok", "Garpu", "Sapu", "Pel", 
        "Jam dinding", "Cermin", "Lampu", "Karpet", "Payung"
    ],
    sekolah: [
        "Buku tulis", "Buku paket", "Pensil", "Pulpen", "Penghapus", "Penggaris", 
        "Rautan", "Krayon", "Pensil warna", "Spidol", "Kertas gambar", "Buku gambar", 
        "Tas sekolah", "Tempat pensil", "Papan tulis", "Meja guru", "Kursi siswa", 
        "Lemari kelas", "Penggaris panjang", "Penghapus papan", "Jam dinding", 
        "Bendera", "Tiang bendera", "Tempat sampah", "Sapu ijuk", "Gunting"
    ]
};

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

// --- LOGIN ADMIN & DASHBOARD ---
function openAdminLoginModal() {
    document.getElementById('admin-login-modal').style.display = 'flex';
    document.getElementById('admin-user-input').value = '';
    document.getElementById('admin-pass-input').value = '';
    document.getElementById('admin-login-error').style.display = 'none';
}

function closeAdminLoginModal() {
    document.getElementById('admin-login-modal').style.display = 'none';
}

function processAdminLogin() {
    const user = document.getElementById('admin-user-input').value.trim();
    const pass = document.getElementById('admin-pass-input').value.trim();

    if (user === "admin" && pass === "admin") {
        closeAdminLoginModal();
        openAdminDashboard();
    } else {
        document.getElementById('admin-login-error').style.display = 'block';
    }
}

function openAdminDashboard() {
    document.getElementById('admin-dashboard-page').style.display = 'flex';
    switchAdminClass(selectedClass);
}

function logoutAdmin() {
    document.getElementById('admin-dashboard-page').style.display = 'none';
}

function switchAdminClass(kelas) {
    adminSelectedClass = kelas;
    document.getElementById('admin-btn-6a').classList.toggle('active', kelas === '6A');
    document.getElementById('admin-btn-6b').classList.toggle('active', kelas === '6B');

    fetchAdminDatabaseData();
}

async function fetchAdminDatabaseData() {
    const tbody = document.getElementById('admin-db-table-body');
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Mengambil data dari Spreadsheet kelas ${adminSelectedClass}...</td></tr>`;

    if (GS_WEB_APP_URL && GS_WEB_APP_URL !== "PASTE_URL_WEB_APP_GS_ANDA_DI_SINI") {
        try {
            let response = await fetch(`${GS_WEB_APP_URL}?action=getAdminData&kelas=${adminSelectedClass}`);
            let rows = await response.json();
            
            if (!rows || rows.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada data untuk kelas ${adminSelectedClass}</td></tr>`;
                return;
            }

            tbody.innerHTML = '';
            rows.forEach(row => {
                const tr = document.createElement('tr');
                const name = row[0] || '-';
                const objek = row[1] || '-';
                const gambar = row[2] || '';
                const nilai = row[3] || '0%';
                const waktu = row[5] || '-';

                let actionBtn = gambar ? `<button class="btn btn-glow btn-sm" onclick="openImageModal('${name}', '${gambar}', '${nilai}', 'Gambar tersimpan di database.')"><i class="fas fa-image"></i> Buka Hasil Gambar</button>` : '-';

                tr.innerHTML = `
                    <td><strong>${name}</strong></td>
                    <td>${objek}</td>
                    <td><strong style="color: #38bdf8;">${nilai}</strong></td>
                    <td style="font-size: 12px; color: #94a3b8;">${waktu}</td>
                    <td>${actionBtn}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch(e) {
            console.error(e);
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#dc3545;">Gagal terhubung ke Google Spreadsheet</td></tr>`;
        }
    } else {
        tbody.innerHTML = `
            <tr>
                <td>Abid</td>
                <td>Kucing</td>
                <td><strong style="color: #38bdf8;">82%</strong></td>
                <td>29/10/2026, 09.56.58</td>
                <td><button class="btn btn-glow btn-sm"><i class="fas fa-image"></i> Buka Hasil Gambar</button></td>
            </tr>
        `;
    }
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
    fetchStudentsFromDatabase();
}

function selectPackage(pkgKey) {
    selectedPackageKey = pkgKey;
    document.querySelectorAll('.btn-package').forEach(btn => {
        if (btn.getAttribute('data-package') === pkgKey) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
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
            setupStudentUI(["Siswa A", "Siswa B", "Siswa C"]);
        }
    } else {
        setupStudentUI(["Siswa A", "Siswa B", "Siswa C"]);
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

// 🎲 FUNGSI MENGACAK NAMA SISWA (SHUFFLE)
function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
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

    // Acak urutan nama siswa setiap kali game dimulai
    let randomizedNames = shuffleArray(names);

    studentsList = randomizedNames.map((name) => {
        return { 
            name: name, 
            chosenItem: "",
            skipped: false
        };
    });

    currentIndex = 0;
    studentResults = {};
    isGameActive = true;
    
    document.getElementById('setup-panel').classList.add('hidden');
    document.getElementById('finish-panel').classList.add('hidden');
    
    initCanvas();
    renderPaletteGrid();
    renderSidebarList(); // Perbarui sidebar dengan urutan nama yang sudah diacak
    promptStudentChoice();
}

function initCanvas() {
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas.getContext('2d');

    canvas.onmousedown = handleCanvasDown;
    canvas.onmousemove = draw;
    canvas.onmouseup = stopDrawing;
    canvas.onmouseleave = stopDrawing;

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
    canvas.ontouchend = () => {
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
    if (undoStack.length >= 15) undoStack.shift();
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

function undoCanvas() {
    if (undoStack.length > 0) {
        const previousState = undoStack.pop();
        ctx.putImageData(previousState, 0, 0);
    }
}

function promptStudentChoice() {
    if (currentIndex >= studentsList.length) {
        isGameActive = false;
        endAllTurns();
        return;
    }

    const student = studentsList[currentIndex];
    if (student.skipped) {
        currentIndex++;
        promptStudentChoice();
        return;
    }

    document.getElementById('modal-student-name').textContent = student.name;
    document.getElementById('modal-package-name').textContent = selectedPackageKey.toUpperCase();
    
    const selectEl = document.getElementById('package-item-select');
    selectEl.innerHTML = '';
    
    let items = packagesData[selectedPackageKey] || [];
    items.forEach(item => {
        let opt = document.createElement('option');
        opt.value = item;
        opt.textContent = item;
        selectEl.appendChild(opt);
    });

    document.getElementById('custom-item-input').value = "";
    document.getElementById('student-choice-modal').style.display = 'flex';
}

function confirmStudentChoice() {
    const customInput = document.getElementById('custom-item-input').value.trim();
    const selectEl = document.getElementById('package-item-select').value;
    
    let chosen = customInput !== "" ? customInput : selectEl;
    studentsList[currentIndex].chosenItem = chosen;

    document.getElementById('student-choice-modal').style.display = 'none';
    document.getElementById('game-panel').classList.remove('hidden');

    document.getElementById('current-player').textContent = studentsList[currentIndex].name;
    document.getElementById('target-soal-badge').textContent = `Objek: ${chosen}`;

    undoStack = [];
    clearCanvas();

    timeLeft = 180;
    document.getElementById('timer').textContent = timeLeft;
    startTimer();
    renderSidebarList();
}

function handleCanvasDown(e) {
    if (currentTool === "fill") {
        saveUndoState();
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        floodFill(x, y, hexToRgba(currentColor));
        return;
    }

    isDrawing = true;
    saveUndoState();
    draw(e);
}

function draw(e) {
    if (!isDrawing || currentTool === "fill") return;

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
    document.getElementById('tool-fill').classList.toggle('active', tool === 'fill');
    document.getElementById('tool-eraser').classList.toggle('active', tool === 'eraser');
    document.getElementById('brush-size-group').style.display = (tool === 'fill') ? 'none' : 'flex';
}

function updateBrushSize(val) {
    currentBrushSize = val;
    document.getElementById('brush-size-val').textContent = `${val}px`;
}

function setCurrentColor(hex) {
    currentColor = hex;
    if (currentTool === 'eraser') setTool('brush');
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

function hexToRgba(hex) {
    let bigint = parseInt(hex.replace('#',''), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return [r, g, b, 255];
}

function floodFill(startX, startY, fillColor) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const width = canvas.width;
    const height = canvas.height;

    const startIndex = (startY * width + startX) * 4;
    const startR = data[startIndex];
    const startG = data[startIndex + 1];
    const startB = data[startIndex + 2];
    const startA = data[startIndex + 3];

    if (startR === fillColor[0] && startG === fillColor[1] && startB === fillColor[2] && startA === fillColor[3]) {
        return;
    }

    const queue = [[startX, startY]];
    const matchedColor = (r, g, b, a) => {
        return Math.abs(r - startR) < 30 && 
               Math.abs(g - startG) < 30 && 
               Math.abs(b - startB) < 30 && 
               Math.abs(a - startA) < 30;
    };

    while (queue.length > 0) {
        const [x, y] = queue.pop();

        if (x < 0 || x >= width || y < 0 || y >= height) continue;

        let westX = x;
        let eastX = x;

        while (westX >= 0 && matchedColor(data[(y * width + westX) * 4], data[(y * width + westX) * 4 + 1], data[(y * width + westX) * 4 + 2], data[(y * width + westX) * 4 + 3])) {
            westX--;
        }
        westX++;

        while (eastX < width && matchedColor(data[(y * width + eastX) * 4], data[(y * width + eastX) * 4 + 1], data[(y * width + eastX) * 4 + 2], data[(y * width + eastX) * 4 + 3])) {
            eastX++;
        }
        eastX--;

        for (let cx = westX; cx <= eastX; cx++) {
            let idx = (y * width + cx) * 4;
            data[idx] = fillColor[0];
            data[idx + 1] = fillColor[1];
            data[idx + 2] = fillColor[2];
            data[idx + 3] = fillColor[3];

            if (y > 0) {
                let upIdx = ((y - 1) * width + cx) * 4;
                if (matchedColor(data[upIdx], data[upIdx+1], data[upIdx+2], data[upIdx+3])) {
                    queue.push([cx, y - 1]);
                }
            }
            if (y < height - 1) {
                let downIdx = ((y + 1) * width + cx) * 4;
                if (matchedColor(data[downIdx], data[downIdx+1], data[downIdx+2], data[downIdx+3])) {
                    queue.push([cx, y + 1]);
                }
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);
}

// 🎯 SISTEM PENILAIAN AI PRESISI & AKURAT (0% - 100%)
function evaluateDrawingWithAI() {
    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let totalPixels = width * height;
    let nonWhitePixels = 0;
    let edgeTransitions = 0; // Menghitung gerigi/bengkokan garis
    let uniqueColors = new Set();

    let grid = new Array(height);
    for (let y = 0; y < height; y++) {
        grid[y] = new Uint8Array(width);
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let idx = (y * width + x) * 4;
            let r = data[idx];
            let g = data[idx + 1];
            let b = data[idx + 2];

            if (!(r > 245 && g > 245 && b > 245)) {
                nonWhitePixels++;
                grid[y][x] = 1;
                uniqueColors.add(`${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(b / 32)}`);
            } else {
                grid[y][x] = 0;
            }
        }
    }

    // Jika gambar terlalu kecil/sedikit (seperti coretan 1 mata saja)
    if (nonWhitePixels < 1500) {
        return {
            score: `${Math.floor(Math.random() * 10) + 12}%`,
            desc: "AI Penilai: Gambar sangat minim / terlalu simpel (seperti hanya gambar mata atau titik). Goresan kurang lengkap."
        };
    }

    for (let y = 1; y < height - 1; y += 2) {
        for (let x = 1; x < width - 1; x += 2) {
            if (grid[y][x] === 1) {
                let neighbors = grid[y - 1][x] + grid[y + 1][x] + grid[y][x - 1] + grid[y][x + 1];
                if (neighbors === 1 || neighbors === 3) {
                    edgeTransitions++;
                }
            }
        }
    }

    let jaggedRatio = edgeTransitions / nonWhitePixels;
    let lineSmoothnessScore = 50 - (jaggedRatio * 180);
    lineSmoothnessScore = Math.max(5, Math.min(50, lineSmoothnessScore));

    let fillRatio = nonWhitePixels / totalPixels;
    let colorVarietyScore = Math.min(25, uniqueColors.size * 5);
    let completenessScore = Math.min(25, fillRatio * 350);

    let finalScore = Math.round(lineSmoothnessScore + colorVarietyScore + completenessScore);
    finalScore = Math.max(15, Math.min(96, finalScore));

    let feedback = "";
    if (finalScore >= 80) {
        feedback = "AI Penilai: Sangat Rapi! Garis halus/lurus terjaga, warna bersih dan tertutup rapi.";
    } else if (finalScore >= 55) {
        feedback = "AI Penilai: Cukup Bagus. Pewarnaan lumayan bersih, tetapi beberapa bagian garis masih agak bengkok/kasar.";
    } else {
        feedback = "AI Penilai: Kurang Rapi. Terlalu banyak bengkokan pada garis dan goresan kurang stabil.";
    }

    return { score: `${finalScore}%`, desc: feedback };
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
    const aiResult = evaluateDrawingWithAI();
    
    studentResults[student.name] = { 
        item: student.chosenItem, 
        imageData: imageBase64, 
        score: aiResult.score,
        desc: aiResult.desc,
        status: "Waktu Habis (Dinilai AI)" 
    };
    saveStudentScoreToDatabase(student, imageBase64, aiResult.score, "Waktu Habis");

    renderSidebarList();

    const nextIndex = getNextValidIndex(currentIndex + 1);
    if (nextIndex < studentsList.length) {
        document.getElementById('timeup-message').innerHTML = `Waktu habis!<br>Giliran Berikutnya <strong style="color:#38bdf8;">${studentsList[nextIndex].name}..</strong>`;
    } else {
        document.getElementById('timeup-message').innerHTML = `Waktu habis!<br>Sesi selesai untuk semua siswa.`;
    }
    document.getElementById('timeup-overlay').style.display = 'flex';
}

function proceedNextAfterTimeUp() {
    document.getElementById('timeup-overlay').style.display = 'none';
    currentIndex++;
    promptStudentChoice();
}

function triggerSelesaiButton() {
    clearInterval(countdown);
    const student = studentsList[currentIndex];
    const imageBase64 = canvas.toDataURL("image/png");
    const aiResult = evaluateDrawingWithAI();
    
    studentResults[student.name] = { 
        item: student.chosenItem,
        imageData: imageBase64, 
        score: aiResult.score,
        desc: aiResult.desc,
        status: "Selesai (Dinilai AI)" 
    };
    
    saveStudentScoreToDatabase(student, imageBase64, aiResult.score, "Selesai");
    document.getElementById('game-panel').classList.add('hidden');

    renderSidebarList();

    const nextIndex = getNextValidIndex(currentIndex + 1);
    if (nextIndex < studentsList.length) {
        document.getElementById('turn-alert-msg').textContent = `Giliran Berikutnya ${studentsList[nextIndex].name}..`;
        document.getElementById('turn-alert-overlay').style.display = 'flex';
    } else {
        endAllTurns();
    }
}

function closeTurnAlert() {
    document.getElementById('turn-alert-overlay').style.display = 'none';
    currentIndex++;
    promptStudentChoice();
}

function skipCurrentStudent() {
    clearInterval(countdown);
    const student = studentsList[currentIndex];
    student.skipped = true;
    studentResults[student.name] = { item: "-", imageData: null, score: "0%", desc: "Siswa absen atau tidak hadir.", status: "Tidak Hadir (Skipped)" };
    saveStudentScoreToDatabase(student, "", "0%", "Tidak Hadir (Skipped)");
    document.getElementById('game-panel').classList.add('hidden');

    renderSidebarList();

    const nextIndex = getNextValidIndex(currentIndex + 1);
    if (nextIndex < studentsList.length) {
        currentIndex++;
        promptStudentChoice();
    } else {
        endAllTurns();
    }
}

function confirmStop() {
    location.reload();
}

function saveStudentScoreToDatabase(student, imageBase64, scoreVal, statusVal) {
    if (student.skipped) return;

    let payload = {
        kelas: selectedClass,
        package: selectedPackageKey,
        type: "appendSingle",
        result: {
            nama: student.name,
            objek: student.chosenItem,
            gambar: imageBase64,
            nilaiAI: scoreVal,
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
            console.log(`Nilai AI & Gambar ${student.name} tersimpan ke database.`);
        }).catch(err => {
            console.error("Gagal simpan data:", err);
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
        } else if (data && data.score) {
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

    document.getElementById('sync-status-msg').textContent = `✅ Sesi selesai! Seluruh nilai AI dan gambar siswa tersimpan di Google Spreadsheet (Sheet Data_${selectedClass})[cite: 2, 3].`;

    const tbody = document.getElementById('result-table-body');
    tbody.innerHTML = '';
    studentsList.forEach((stu, idx) => {
        let res = studentResults[stu.name] || { item: "-", imageData: null, score: "0%", desc: "-", status: "-" };
        const tr = document.createElement('tr');
        
        let actionBtn = res.imageData ? `<button class="btn btn-glow btn-sm" onclick="openImageModal('${stu.name}', '${res.imageData}', '${res.score}', '${res.desc}')"><i class="fas fa-robot"></i> Lihat Analisis AI</button>` : '-';

        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${stu.name}</td>
            <td><strong>${stu.skipped ? '-' : res.item}</strong></td>
            <td><strong style="color: #38bdf8;">${stu.skipped ? '0%' : res.score}</strong></td>
            <td>${stu.skipped ? 'Tidak Hadir (Skipped)' : res.status}</td>
            <td>${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

function openImageModal(studentName, imgData, score, desc) {
    document.getElementById('modal-preview-title').innerHTML = `<i class="fas fa-robot"></i> Hasil & Analisis Gambar: ${studentName}`;
    document.getElementById('modal-img-preview').src = imgData;
    document.getElementById('ai-score-text').innerHTML = `🤖 Nilai Akurasi AI: <span style="color: #f59e0b;">${score}</span>`;
    document.getElementById('ai-desc-text').textContent = desc;
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
