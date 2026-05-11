const express = require('express');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

let savedLink = ""; 
let history = []; 

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Car Project | Enterprise Portal</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
            <style>
                :root {
                    --bg: #050508;
                    --primary: #8a2be2;
                    --secondary: #00d4ff;
                    --card-bg: #0f101a;
                    --text: #ffffff;
                }

                * { scroll-behavior: smooth; box-sizing: border-box; }
                body { margin: 0; padding: 0; background-color: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; line-height: 1.6; overflow-x: hidden; }

                /* --- NAVIGATION --- */
                nav {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 20px 8%; background: rgba(5, 5, 8, 0.9);
                    backdrop-filter: blur(15px); position: fixed; top: 0; width: 100%;
                    z-index: 1000; border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .logo { font-weight: 800; font-size: 1.5rem; color: #fff; text-decoration: none; }
                .logo span { color: var(--primary); }
                .nav-links { display: flex; gap: 30px; list-style: none; margin: 0; padding: 0; }
                .nav-links a { color: #888; text-decoration: none; font-size: 14px; font-weight: 500; transition: 0.3s; }
                .nav-links a:hover { color: var(--secondary); }

                /* --- HERO SECTION --- */
                header {
                    text-align: center; padding: 160px 20px 100px;
                    background: radial-gradient(circle at center, rgba(138, 43, 226, 0.15) 0%, transparent 70%);
                }
                h1 { font-size: 3.5rem; margin: 0; letter-spacing: -2px; }
                h1 span { color: var(--secondary); }

                /* --- MAIN CONTENT --- */
                .container { max-width: 1100px; margin: 0 auto; padding: 40px 20px; }
                .grid-main { display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; margin-bottom: 80px; }
                
                .card {
                    background: var(--card-bg); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 24px; padding: 40px; position: relative;
                }

                /* SCP Form */
                .input-box {
                    background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
                    padding: 10px; border-radius: 12px; display: flex; gap: 10px; margin-top: 20px;
                }
                input { background: none; border: none; color: white; flex: 1; outline: none; padding: 10px; font-size: 16px; }
                .save-btn { background: #fff; color: #000; border: none; padding: 10px 25px; border-radius: 8px; font-weight: 700; cursor: pointer; }

                /* --- COMPACT FLIGHTBOARD BUTTON --- */
                .flight-card { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                
                .flight-btn {
                    width: 200px; height: 60px;
                    background: transparent; border: 2px solid var(--primary);
                    border-radius: 12px; color: white; font-size: 14px;
                    font-weight: 700; text-transform: uppercase; letter-spacing: 2px;
                    cursor: pointer; transition: 0.4s; margin-top: 15px;
                }
                .flight-btn:hover { background: var(--primary); box-shadow: 0 0 30px rgba(138, 43, 226, 0.4); transform: translateY(-2px); }

                /* --- SECTIONS --- */
                section { padding: 100px 0; border-top: 1px solid rgba(255,255,255,0.05); }
                .section-title { font-size: 2rem; margin-bottom: 40px; color: var(--secondary); font-weight: 800; }

                /* Features */
                .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                .f-item { background: rgba(255,255,255,0.02); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }

                /* Project Status Bar */
                .progress-container { background: #1a1a2e; height: 10px; border-radius: 5px; margin: 20px 0; overflow: hidden; }
                .progress-bar { width: 75%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); }

                /* History */
                .history-list { list-style: none; padding: 0; margin: 0; }
                .history-item { 
                    padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); 
                    display: flex; justify-content: space-between; font-size: 14px;
                }
                .history-item span { color: #555; font-family: monospace; }

                footer { text-align: center; padding: 50px; color: #444; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.05); }

            </style>
        </head>
        <body>

            <nav>
                <a href="#" class="logo">Dri<span>Th.</span></a>
                <ul class="nav-links">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#project">Project</a></li>
                    <li><a href="#history">History</a></li>
                </ul>
                <div style="font-size: 10px; color: var(--primary); font-weight: bold; letter-spacing: 1px;">● SYSTEM ONLINE</div>
            </nav>

            <header id="home">
                <h1>Innovating Tomorrow. <br><span>Building Today.</span></h1>
                <p style="color: #666; max-width: 600px; margin: 20px auto; font-size: 1.1rem;">Manage your car design assets and launch your development environment with precision control.</p>
            </header>

            <div class="container">
                <div class="grid-main">
                    <div class="card">
                        <h2 style="margin:0; font-size:1.5rem;">System Control Panel</h2>
                        <p style="color: #666; font-size:14px; margin-bottom: 20px;">Define target path for the Flightboard module.</p>
                        <form action="/save" method="POST">
                            <div class="input-box">
                                <input type="text" name="projectUrl" value="${savedLink}" placeholder="URL or filename (e.g. mycar.html)">
                                <button type="submit" class="save-btn">SAVE</button>
                            </div>
                        </form>
                    </div>

                    <div class="card flight-card">
                        <h2 style="margin:0; font-size:1.2rem;">Execution</h2>
                        <button class="flight-btn" onclick="launch()">Flightboard</button>
                        <div style="margin-top: 15px; font-size: 12px; color: ${savedLink ? 'var(--secondary)' : '#ff3300'}">
                            STATUS: ${savedLink ? 'READY' : 'OFFLINE'}
                        </div>
                    </div>
                </div>

                <section id="features">
                    <h2 class="section-title">Core Features</h2>
                    <div class="features-grid">
                        <div class="f-item">
                            <h3 style="color: var(--secondary)">Instant Sync</h3>
                            <p style="color: #888">Connect your SCP input to the Flightboard relay in real-time.</p>
                        </div>
                        <div class="f-item">
                            <h3 style="color: var(--primary)">Hybrid Support</h3>
                            <p style="color: #888">Open both web URLs and local .html assets flawlessly.</p>
                        </div>
                        <div class="f-item">
                            <h3 style="color: #fff">Smart Redirect</h3>
                            <p style="color: #888">Automatic protocol detection for non-http entries.</p>
                        </div>
                    </div>
                </section>

                <section id="project">
                    <h2 class="section-title">Project: Neon Drifter v1</h2>
                    <div class="card" style="background: rgba(0,212,255,0.01)">
                        <div style="display: flex; justify-content: space-between; font-weight: bold;">
                            <span>Design Completion</span>
                            <span style="color: var(--secondary)">75%</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar"></div>
                        </div>
                        <p style="color: #666; font-size: 14px;">Current Stage: Aerodynamics & Shaders Optimization.</p>
                    </div>
                </section>

                <section id="history">
                    <h2 class="section-title">Session History</h2>
                    <div class="card" style="padding: 20px;">
                        <ul class="history-list">
                            ${history.length > 0 ? history.map(item => `
                                <li class="history-item">
                                    ${item.url} <span style="color: #444;">${item.time}</span>
                                </li>
                            `).join('') : '<li class="history-item">No records found.</li>'}
                        </ul>
                    </div>
                </section>
            </div>

            <footer>
                &copy; 2026 Car Project OS. Professional Assets Management System.
            </footer>

            <script>
                function launch() {
                    let link = "${savedLink}";
                    if (!link) return alert("System Error: No target link found!");
                    
                    if (!link.startsWith('http') && !link.startsWith('www')) {
                        link = window.location.origin + '/' + link;
                    } else if (link.startsWith('www')) {
                        link = 'https://' + link;
                    }
                    window.open(link, '_blank');
                }
            </script>
        </body>
        </html>
    `);
});

app.post('/save', (req, res) => {
    const url = req.body.projectUrl;
    if (url) {
        savedLink = url;
        const time = new Date().toLocaleTimeString();
        history.unshift({ url, time });
        if (history.length > 5) history.pop();
    }
    res.redirect('/');
});

app.listen(port, () => console.log("Enterprise Portal live at http://localhost:3000"));