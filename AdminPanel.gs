<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        :root {
            --admin-navy: #0f172a;
            --admin-accent: #3b82f6;
        }

        body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            background-color: #f1f5f9; 
            margin: 0; 
            overflow: hidden;
        }

        .sidebar-admin { background-color: var(--admin-navy); }
        
        .nav-link-admin {
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            color: #94a3b8;
            font-size: 13px;
            font-weight: 600;
            border-radius: 12px;
            margin: 4px 16px;
            width: calc(100% - 32px);
            text-align: left;
            border: none;
            background: transparent;
            cursor: pointer;
        }

        .nav-link-admin:hover, .nav-link-admin.active {
            background: rgba(59, 130, 246, 0.1);
            color: white;
        }

        .nav-link-admin.active {
            background: var(--admin-accent);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .glass-card-admin {
            background: white;
            border: 1px solid rgba(226, 232, 240, 0.8);
            border-radius: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .table-admin th {
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.05em;
            color: #64748b;
            padding: 16px;
            border-bottom: 2px solid #f1f5f9;
        }

        .table-admin td {
            padding: 16px;
            font-size: 13px;
            border-bottom: 1px solid #f8fafc;
        }

        .btn-action-admin {
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            transition: all 0.2s;
        }

        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body class="flex">

    <!-- SIDEBAR ADMIN -->
    <aside class="sidebar-admin w-72 h-screen flex flex-col z-50">
        <div class="h-28 flex items-center px-10 shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">S</div>
                <div>
                    <span class="text-white text-lg font-black block leading-tight">SUPER ADMIN</span>
                    <span class="text-blue-400 text-[9px] font-bold uppercase tracking-widest">Pusat Kendali SIMONI</span>
                </div>
            </div>
        </div>

        <nav class="flex-1 mt-4 overflow-y-auto">
            <p class="px-10 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Utama</p>
            <button onclick="switchAdminTab('stats')" class="nav-link-admin active" id="btn-stats">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
                Ringkasan Sistem
            </button>

            <div class="my-6 border-t border-white/5 mx-6"></div>
            <p class="px-10 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kontrol Database</p>
            
            <button onclick="switchAdminTab('users')" class="nav-link-admin" id="btn-users">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                Kelola Pengguna
            </button>
            <button onclick="switchAdminTab('database')" class="nav-link-admin" id="btn-database">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>
                Database Master
            </button>
            <button onclick="switchAdminTab('logs')" class="nav-link-admin" id="btn-logs">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Log Aktivitas
            </button>

            <div class="my-6 border-t border-white/5 mx-6"></div>
            <p class="px-10 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Alat Ekspor</p>
            <button onclick="downloadBackupCSV()" class="nav-link-admin text-emerald-400 hover:text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Ekspor Database (.csv)
            </button>
        </nav>

        <div class="p-8 border-t border-white/5">
            <button onclick="handleLogoutSPA()" class="w-full py-3 bg-white/5 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-white/5">Keluar Sesi</button>
        </div>
    </aside>

    <!-- MAIN ADMIN CONTENT -->
    <main class="flex-1 h-screen overflow-y-auto bg-[#f1f5f9]">
        <header class="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-40">
            <div>
                <h1 class="text-xl font-black text-slate-900 tracking-tight" id="admin-active-title">Ringkasan Sistem</h1>
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status Keamanan: <span class="text-emerald-500">Enkripsi SHA-256 Aktif</span></p>
            </div>
            <div class="flex items-center gap-6">
                <div class="text-right">
                    <p class="text-[10px] font-black text-slate-400 uppercase">Administrator</p>
                    <p class="text-sm font-bold text-slate-900" id="admin-user-display">Super Admin</p>
                </div>
                <div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 uppercase">
                   <span id="admin-initials">SA</span>
                </div>
            </div>
        </header>

        <div class="p-12 max-w-7xl mx-auto">
            
            <!-- TAB: RINGKASAN (STATS) -->
            <div id="admin-tab-stats" class="admin-tab-content animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div class="glass-card-admin p-6 border-l-4 border-blue-500">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pengguna</p>
                        <h2 class="text-3xl font-black text-slate-900 mt-2" id="adm-stat-users">0</h2>
                    </div>
                    <div class="glass-card-admin p-6 border-l-4 border-emerald-500">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Laporan</p>
                        <h2 class="text-3xl font-black text-slate-900 mt-2" id="adm-stat-reports">0</h2>
                    </div>
                    <div class="glass-card-admin p-6 border-l-4 border-amber-500">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit LKD</p>
                        <h2 class="text-3xl font-black text-slate-900 mt-2" id="adm-stat-lkd">0</h2>
                    </div>
                    <div class="glass-card-admin p-6 border-l-4 border-rose-500">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit LAD</p>
                        <h2 class="text-3xl font-black text-slate-900 mt-2" id="adm-stat-lad">0</h2>
                    </div>
                </div>

                <div class="glass-card-admin p-8">
                    <h3 class="font-black text-slate-900 uppercase text-xs mb-6 tracking-widest">Status Terkini</h3>
                    <div class="p-6 bg-blue-50 border border-blue-100 rounded-2xl text-xs font-semibold text-blue-900 leading-relaxed">
                        Panel ini terhubung langsung ke Master Spreadsheet. Pastikan setiap tindakan administratif (terutama penghapusan data) dilakukan dengan hati-hati. Gunakan menu <b>Log Aktivitas</b> untuk audit riwayat.
                    </div>
                </div>
            </div>

            <!-- TAB: KELOLA PENGGUNA -->
            <div id="admin-tab-users" class="admin-tab-content hidden animate-fade-in">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="text-lg font-black text-slate-900">Manajemen Akses Wilayah</h3>
                    <button onclick="openAddUserDialog()" class="bg-blue-600 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">+ Buat Akun Baru</button>
                </div>
                
                <div class="glass-card-admin overflow-hidden">
                    <table class="w-full table-admin">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Wilayah</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th class="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="admin-user-table-body">
                            <tr><td colspan="5" class="py-10 text-center animate-pulse text-slate-400 font-bold uppercase italic tracking-widest">Menghubungkan ke tabel USERS...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TAB: DATABASE MASTER -->
            <div id="admin-tab-database" class="admin-tab-content hidden animate-fade-in">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h3 class="text-lg font-black text-slate-900">Kendali Database Master</h3>
                        <p class="text-xs text-slate-500 font-medium">Hapus rekaman data fakta untuk pembersihan database.</p>
                    </div>
                    <select id="adm-db-filter" onchange="refreshAdminDBTable()" class="bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer">
                        <option value="ALL">Semua Kategori</option>
                        <option value="LKD">LKD Saja</option>
                        <option value="LAD">LAD Saja</option>
                    </select>
                </div>

                <div class="glass-card-admin overflow-hidden">
                    <table class="w-full table-admin">
                        <thead>
                            <tr>
                                <th>ID Transaksi</th>
                                <th>Lembaga</th>
                                <th>Wilayah</th>
                                <th class="text-center">Kategori</th>
                                <th class="text-right">Kontrol</th>
                            </tr>
                        </thead>
                        <tbody id="admin-db-table-body">
                            <tr><td colspan="5" class="py-10 text-center animate-pulse text-slate-400 font-bold uppercase italic tracking-widest">Sinkronisasi database master...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TAB: LOG AKTIVITAS -->
            <div id="admin-tab-logs" class="admin-tab-content hidden animate-fade-in">
                <div class="mb-8">
                    <h3 class="text-lg font-black text-slate-900">Audit Trail (Log Aktivitas)</h3>
                    <p class="text-xs text-slate-500 font-medium italic">Rekaman digital untuk setiap tindakan yang dilakukan oleh Super Admin.</p>
                </div>
                <div class="glass-card-admin p-8 space-y-4" id="admin-logs-list">
                    <div class="py-10 text-center text-xs font-bold text-slate-400 uppercase italic">Memuat riwayat audit...</div>
                </div>
            </div>

        </div>
    </main>

    <!-- LOADING OVERLAY -->
    <div id="admin-loading-overlay" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center z-[2000] hidden">
        <div class="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p class="text-white font-black text-xs uppercase tracking-[0.3em] mt-8" id="admin-loading-text">Memproses Perintah...</p>
    </div>

    <script>
        /**
         * EVENT LISTENER SPA (view-admin-active)
         * Dipicu saat kontainer utama (App.html) menampilkan halaman ini.
         */
        window.addEventListener('view-admin-active', () => {
            console.log("Panel Admin Aktif");
            initAdminPanel();
        });

        // Inisialisasi awal saat halaman dimuat
        function initAdminPanel() {
            if (window.initialUser) {
                document.getElementById('admin-user-display').innerText = window.initialUser.username || "Super Admin";
                document.getElementById('admin-initials').innerText = (window.initialUser.username || "SA").substring(0,2).toUpperCase();
            }
            switchAdminTab('stats');
        }

        /**
         * NAVIGASI TAB ADMIN
         */
        function switchAdminTab(tabId) {
            // Update UI Sidebar
            document.querySelectorAll('.nav-link-admin').forEach(link => link.classList.remove('active'));
            const btn = document.getElementById('btn-' + tabId);
            if(btn) btn.classList.add('active');
            
            // Update UI Konten
            document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.add('hidden'));
            const targetTab = document.getElementById('admin-tab-' + tabId);
            if(targetTab) targetTab.classList.remove('hidden');
            
            // Update Judul Header
            const titles = { 
                'stats': 'Ringkasan Sistem', 
                'users': 'Manajemen Pengguna', 
                'database': 'Database Master', 
                'logs': 'Audit Log Aktivitas' 
            };
            document.getElementById('admin-active-title').innerText = titles[tabId] || 'Admin';
            
            // Pemuatan data sesuai konteks
            if(tabId === 'stats') loadAdminSummary();
            if(tabId === 'users') refreshAdminUserTable();
            if(tabId === 'database') refreshAdminDBTable();
            if(tabId === 'logs') loadAdminLogs();
        }

        /**
         * FUNGSI PENGAMBILAN DATA (SERVER-SIDE CALLS)
         */
        function loadAdminSummary() {
            if (typeof google === 'undefined') return;
            google.script.run.withSuccessHandler(res => {
                if (res) {
                    document.getElementById('adm-stat-users').innerText = res.totalUsers || '0';
                    document.getElementById('adm-stat-reports').innerText = res.totalReports || '0';
                    document.getElementById('adm-stat-lkd').innerText = res.totalLKD || '0';
                    document.getElementById('adm-stat-lad').innerText = res.totalLAD || '0';
                }
            }).getAdminStats();
        }

        function refreshAdminUserTable() {
            const tbody = document.getElementById('admin-user-table-body');
            if (typeof google === 'undefined') return;
            google.script.run.withSuccessHandler(res => {
                if (res && res.length > 0) {
                    tbody.innerHTML = res.map(u => `
                        <tr class="hover:bg-slate-50 transition-colors animate-fade-in">
                            <td class="font-black text-blue-600">${u.username}</td>
                            <td class="font-bold text-slate-700">${u.wilayah || 'Pusat'}</td>
                            <td><span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-wider">${u.role}</span></td>
                            <td><div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span class="text-[10px] font-bold text-slate-400">AKTIF</span></div></td>
                            <td class="text-right">
                                <button class="btn-action-admin bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white" onclick="deleteUserAccount('${u.username}')">Hapus</button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    tbody.innerHTML = '<tr><td colspan="5" class="py-10 text-center text-slate-400 font-bold uppercase italic tracking-widest">Tidak ada user terdaftar di database.</td></tr>';
                }
            }).getUserManagementList();
        }

        function refreshAdminDBTable() {
            const filter = document.getElementById('adm-db-filter').value;
            const tbody = document.getElementById('admin-db-table-body');
            if (typeof google === 'undefined') return;
            google.script.run.withSuccessHandler(res => {
                if (res && res.success) {
                    const data = filter === 'ALL' ? res.list : res.list.filter(x => x.kat === filter);
                    if (data.length > 0) {
                        tbody.innerHTML = data.map(r => `
                            <tr class="hover:bg-slate-50 transition-colors animate-fade-in">
                                <td class="text-slate-400 font-mono text-[10px]">${r.id}</td>
                                <td class="font-black text-slate-800 uppercase text-xs truncate max-w-[200px]">${r.nama}</td>
                                <td class="text-[11px] font-bold text-slate-500 uppercase">${r.des} (${r.kab})</td>
                                <td class="text-center"><span class="px-3 py-1 bg-slate-100 text-[9px] font-black rounded-lg uppercase tracking-wider">${r.kat}</span></td>
                                <td class="text-right">
                                    <button class="btn-action-admin bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white" onclick="deleteMasterRecord('${r.id}', '${r.kat}')">Hapus</button>
                                </td>
                            </tr>
                        `).join('');
                    } else {
                        tbody.innerHTML = '<tr><td colspan="5" class="py-10 text-center text-slate-400 font-bold uppercase italic tracking-widest">Database master kosong.</td></tr>';
                    }
                }
            }).getDashboardData();
        }

        function loadAdminLogs() {
            const container = document.getElementById('admin-logs-list');
            if (typeof google === 'undefined') return;
            google.script.run.withSuccessHandler(res => {
                if (res && res.logs && res.logs.length > 0) {
                    container.innerHTML = res.logs.map(log => `
                        <div class="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 animate-fade-in">
                            <div class="w-10 h-10 ${log.type === 'DELETE' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'} rounded-xl flex items-center justify-center font-bold text-xs uppercase">${log.type.charAt(0)}</div>
                            <div class="flex-1">
                                <p class="text-sm font-bold text-slate-900">${log.message}</p>
                                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${log.time}</p>
                            </div>
                        </div>
                    `).join('');
                } else {
                    container.innerHTML = `<div class="py-10 text-center text-slate-400 font-bold uppercase italic tracking-widest">Belum ada riwayat audit log.</div>`;
                }
            }).getAdminStats();
        }

        /**
         * FUNGSI TINDAKAN (ACTIONS)
         */
        function deleteUserAccount(username) {
            if (confirm(`Peringatan: Anda akan menghapus akun '${username}'. Tindakan ini permanen. Lanjutkan?`)) {
                toggleAdminLoading(true, "Menghapus akun...");
                google.script.run.withSuccessHandler(res => {
                    toggleAdminLoading(false);
                    if (res.success) { refreshAdminUserTable(); }
                }).adminDeleteUser(username);
            }
        }

        function deleteMasterRecord(id, type) {
            if (confirm(`Konfirmasi: Hapus rekaman '${id}' secara permanen dari database master?`)) {
                toggleAdminLoading(true, "Sinkronisasi database...");
                google.script.run.withSuccessHandler(res => {
                    toggleAdminLoading(false);
                    if (res.success) { refreshAdminDBTable(); }
                }).adminDeleteRecord(id, type);
            }
        }

        function openAddUserDialog() {
            const user = prompt("Masukkan Username Baru:");
            if (!user) return;
            const pass = prompt("Masukkan Kata Sandi:");
            if (!pass) return;
            const roleInput = prompt("Role (SUPER ADMIN / PROVINSI / KABUPATEN / KECAMATAN / DESA):");
            const role = roleInput ? roleInput.toUpperCase() : "DESA";

            if (user && pass) {
                toggleAdminLoading(true, "Menyimpan user...");
                google.script.run.withSuccessHandler(res => {
                    toggleAdminLoading(false);
                    if (res.success) { refreshAdminUserTable(); }
                    else { alert("Gagal: " + res.message); }
                }).adminCreateUser({ username: user, password: pass, role: role });
            }
        }

        function downloadBackupCSV() {
            toggleAdminLoading(true, "Mengekstrak database master ke CSV...");
            google.script.run.withSuccessHandler(res => {
                toggleAdminLoading(false);
                if (res && res.success) {
                    const blob = new Blob([res.csv], { type: 'text/csv' });
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = res.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }).apiGenerateFullBackup();
        }

        /**
         * UTILITY UI
         */
        function toggleAdminLoading(show, text = "") {
            const overlay = document.getElementById('admin-loading-overlay');
            const label = document.getElementById('admin-loading-text');
            if (text) label.innerText = text;
            if (show) overlay.classList.remove('hidden');
            else overlay.classList.add('hidden');
        }

        function handleLogoutSPA() {
            if (window.parent && typeof window.parent.handleLogoutSPA === 'function') {
                window.parent.handleLogoutSPA();
            } else {
                google.script.run.withSuccessHandler(() => { location.reload(); }).logoutUser();
            }
        }
    </script>
</body>
</html>