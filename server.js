const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const PORT = process.env.PORT || 3000;
const HISTORY_FILE = './history.json';

// --- DATABASE LOGIC (JSON PERSISTENCE) ---
function loadHistory() {
    try {
        if (fs.existsSync(HISTORY_FILE)) {
            return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        }
    } catch (err) { console.error("History load error:", err); }
    return [];
}

function saveHistory(logs) {
    try {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(logs, null, 2));
    } catch (err) { console.error("History save error:", err); }
}

let systemLogs = loadHistory();

// --- STORAGE CONFIGURATION ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './'),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

function getTimestamp() {
    const now = new Date();
    return now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB');
}

// --- HTML SHARED STYLES ---
const commonStyles = `
    :root {
        --accent: #8a2be2;
        --accent-light: #00d4ff;
        --bg: #020203;
        --glass: rgba(255, 255, 255, 0.03);
        --glass-border: rgba(255, 255, 255, 0.07);
        --text: #ffffff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; scroll-behavior: smooth; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; overflow-x: hidden; }
    .bg-glow { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 50% -10%, #1a0b2e 0%, transparent 40%); z-index: -1; }
    nav { padding: 20px 10%; display: flex; justify-content: space-between; align-items: center; backdrop-filter: blur(15px); border-bottom: 1px solid var(--glass-border); position: fixed; top: 0; width: 100%; z-index: 1000; }
    .logo { font-weight: 800; font-size: 1.5rem; text-decoration: none; color: #fff; letter-spacing: -1px; }
    .logo span { color: var(--accent-light); }
    .glass-card { background: var(--glass); border: 1px solid var(--glass-border); border-radius: 25px; padding: 35px; backdrop-filter: blur(10px); }
`;

// --- ROUTE: MAIN PAGE ---
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DriTh | Engineering Portal</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
            <style>
                ${commonStyles}
                header { padding: 160px 10% 60px; text-align: center; }
                header h1 { font-size: 4rem; font-weight: 800; letter-spacing: -2px; }
                header h1 span { color: var(--accent-light); }
                .container { max-width: 1200px; margin: 0 auto; padding: 20px; display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
                .upload-box { border: 2px dashed rgba(255,255,255,0.05); border-radius: 20px; padding: 40px; text-align: center; cursor: pointer; transition: 0.3s; }
                .upload-box:hover { border-color: var(--accent); background: rgba(138, 43, 226, 0.05); }
                .search-group { display: flex; gap: 10px; margin-top: 20px; }
                input { flex: 1; background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); padding: 18px; border-radius: 15px; color: #fff; outline: none; }
                .btn-launch { background: var(--accent); color: #fff; border: none; padding: 0 35px; border-radius: 15px; font-weight: 800; cursor: pointer; text-transform: uppercase; }
                .history-feed { max-height: 500px; overflow-y: auto; }
                .history-item { padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .history-item a { color: var(--accent-light); text-decoration: none; font-weight: 600; font-size: 0.9rem; display: block; }
                .history-item small { font-family: 'JetBrains Mono'; color: #444; font-size: 0.7rem; }
                .asset-row { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 15px; border: 1px solid var(--glass-border); margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="bg-glow"></div>
            <nav><a href="/" class="logo">Dri<span>Th.</span></a></nav>
            <header><h1>Engineering <span>Systems.</span></h1></header>
            <div class="container">
                <div class="main-side">
                    <section class="glass-card" style="margin-bottom: 30px;">
                        <h2 style="font-size:0.7rem; letter-spacing:3px; color:var(--accent-light); margin-bottom:20px;">01 // DEPLOYMENT</h2>
                        <form action="/upload" method="POST" enctype="multipart/form-data" id="upForm">
                            <label class="upload-box">
                                <input type="file" name="myFile" style="display:none" onchange="document.getElementById('upForm').submit()">
                                <p style="font-weight:800;">CLICK TO DEPLOY NEW ASSET</p>
                            </label>
                        </form>
                    </section>
                    <section id="asset-sec" class="glass-card">
                        <h2 style="font-size:0.7rem; letter-spacing:3px; color:var(--accent-light); margin-bottom:20px;">02 // FLIGHTBOARD</h2>
                        <div class="search-group">
                            <input type="text" id="targetInput" placeholder="Enter .zip name or URL...">
                            <button class="btn-launch" onclick="exploreAssets()">Launch</button>
                        </div>
                        <div id="results" style="display:none; margin-top:30px;">
                            <div id="asset-list"></div>
                        </div>
                    </section>
                </div>
                <div class="side-bar">
                    <section id="history-sec" class="glass-card">
                        <h2 style="font-size:0.7rem; letter-spacing:3px; color:var(--accent-light); margin-bottom:20px;">GLOBAL HISTORY</h2>
                        <div class="history-feed">
                            ${systemLogs.map(log => `
                                <div class="history-item">
                                    <a href="${log.url}" target="_blank">${log.label}</a>
                                    <small>${log.time}</small>
                                </div>
                            `).reverse().join('')}
                        </div>
                    </section>
                </div>
            </div>
            <script>
                async function exploreAssets() {
                    const target = document.getElementById('targetInput').value;
                    if(!target) return;
                    await fetch('/log-access?target=' + encodeURIComponent(target));
                    
                    if (target.startsWith('http')) {
                        window.open(target, '_blank');
                        setTimeout(() => location.reload(), 500);
                        return;
                    }

                    if (target.endsWith('.zip')) {
                        window.location.href = '/explorer?file=' + encodeURIComponent(target);
                        return;
                    }

                    const res = await fetch('/explore?path=' + encodeURIComponent(target));
                    const data = await res.json();
                    const list = document.getElementById('asset-list');
                    list.innerHTML = "";
                    data.forEach(file => {
                        list.innerHTML += \`
                            <div class="asset-row">
                                <strong>📦 \${file}</strong>
                                <a href="/\${file.endsWith('.zip') ? 'explorer?file='+file : file}" 
                                   style="color:#000; background:#fff; padding:8px 15px; border-radius:8px; text-decoration:none; font-weight:800; font-size:10px;">
                                   \${file.endsWith('.zip') ? 'SCAN' : 'OPEN'}
                                </a>
                            </div>
                        \`;
                    });
                    document.getElementById('results').style.display='block';
                }
            </script>
        </body>
        </html>
    `);
});

// --- ROUTE: DEEP EXPLORER PAGE ---
app.get('/explorer', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>DriTh | Deep Scan</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
            <style>
                ${commonStyles}
                .container { max-width: 800px; margin: 150px auto; }
                .file-name { font-family: 'JetBrains Mono'; color: var(--accent-light); font-size: 1.5rem; margin: 10px 0 30px; }
                .content-list { background: rgba(0,0,0,0.5); padding: 30px; border-radius: 20px; border-left: 4px solid var(--accent); }
                .file-item { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-family: 'JetBrains Mono'; font-size: 13px; color: #888; }
            </style>
        </head>
        <body>
            <div class="bg-glow"></div>
            <nav><a href="/" class="logo">Dri<span>Th.</span></a></nav>
            <div class="container">
                <div class="glass-card">
                    <h2 style="font-size:0.7rem; letter-spacing:3px; color:var(--accent-light);">ARCHIVE DEEP SCAN</h2>
                    <div id="targetName" class="file-name">Loading...</div>
                    <div id="fileContent" class="content-list">Decrypting archive layers...</div>
                    <a href="/" style="display:inline-block; margin-top:30px; color:#444; text-decoration:none; font-size:0.8rem; font-weight:800;">← BACK TO TERMINAL</a>
                </div>
            </div>
            <script>
                async function initScan() {
                    const params = new URLSearchParams(window.location.search);
                    const file = params.get('file');
                    document.getElementById('targetName').innerText = file || "No file selected";
                    try {
                        const res = await fetch('/' + file);
                        const zip = await JSZip.loadAsync(await res.blob());
                        let html = "";
                        zip.forEach(p => html += '<div class="file-item">> ' + p + '</div>');
                        document.getElementById('fileContent').innerHTML = html || "Archive is empty.";
                    } catch (e) { document.getElementById('fileContent').innerText = "Error accessing asset."; }
                }
                initScan();
            </script>
        </body>
        </html>
    `);
});

// --- API ENDPOINTS ---
app.get('/log-access', (req, res) => {
    const target = req.query.target;
    systemLogs.push({ label: "RELAY: " + target, url: target.startsWith('http') ? target : "#", time: getTimestamp() });
    if (systemLogs.length > 100) systemLogs.shift();
    saveHistory(systemLogs);
    res.sendStatus(200);
});

app.post('/upload', upload.single('myFile'), (req, res) => {
    if (req.file) {
        systemLogs.push({ label: "DEPLOY: " + req.file.originalname, url: "/explorer?file=" + req.file.originalname, time: getTimestamp() });
        saveHistory(systemLogs);
    }
    res.redirect('/');
});

app.get('/explore', (req, res) => {
    fs.readdir(path.join(__dirname), (err, files) => {
        if (err) return res.json([]);
        const t = req.query.path.toLowerCase();
        res.json(files.filter(f => (f.endsWith('.html') || f.endsWith('.zip')) && !['package.json', 'server.js', 'history.json'].includes(f) && (t === '/' || f.toLowerCase().includes(t))));
    });
});

app.listen(PORT, () => console.log("DriTh Engineering Portal Active"));
