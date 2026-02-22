/**
 * Modul Manajemen Super Admin SIMONI
 * Tanggung Jawab: Operasi CRUD User, Hapus Data Database, dan Ekspor Full Backup.
 */

/**
 * FUNGSI BOOTSTRAP: Jalankan fungsi ini SATU KALI dari Editor Apps Script
 * untuk membuat akun SUPER ADMIN pertama Anda.
 * Akun ini akan secara otomatis diarahkan ke Panel Admin oleh sistem Auth.gs.
 */
function createInitialSuperAdmin() {
  const payload = {
    username: "super_admin_sultra", // Username untuk login
    password: "PasswordSuper123!",  // Silakan ganti dengan sandi yang kuat
    role: "SUPER ADMIN",            // Role krusial untuk akses AdminPanel
    wilayah: "OTORITAS PUSAT SULTRA"
  };
  
  const result = adminCreateUser(payload);
  if (result.success) {
    Logger.log("SUKSES: Akun '" + payload.username + "' berhasil dibuat dengan role " + payload.role);
    Logger.log("Silakan login menggunakan akun ini untuk mengakses Panel Admin.");
  } else {
    Logger.log("GAGAL: " + result.message);
  }
}

/**
 * 1. Ambil Statistik Ringkasan untuk Dashboard Admin
 * Dipanggil oleh AdminPanel.html -> loadAdminSummary()
 */
function getAdminStats() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const userSheet = ss.getSheetByName('USERS');
    const lkdSheet = ss.getSheetByName('DATA_LKD_MASTER');
    const ladSheet = ss.getSheetByName('DATA_LAD_MASTER');
    
    // Pastikan nilai minimal adalah 0, bukan angka negatif jika sheet hanya ada header
    const countRow = (sh) => (sh && sh.getLastRow() > 0) ? sh.getLastRow() - 1 : 0;
    
    return {
      totalUsers: countRow(userSheet),
      totalLKD: countRow(lkdSheet),
      totalLAD: countRow(ladSheet),
      totalReports: countRow(lkdSheet) + countRow(ladSheet),
      logs: getAdminLogsInternal() 
    };
  } catch (e) {
    console.error("Error getAdminStats: " + e.toString());
    return { totalUsers: 0, totalLKD: 0, totalLAD: 0, totalReports: 0, logs: [] };
  }
}

/**
 * 2. Ambil Daftar User untuk Tabel Manajemen User
 * Dipanggil oleh AdminPanel.html -> refreshAdminUserTable()
 */
function getUserManagementList() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('USERS');
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return []; // Hanya header
    
    const list = [];
    // Struktur Kolom USERS berdasarkan Setup.gs: 
    // 0:ID_USER, 1:USERNAME, 2:PASSWORD, 3:ROLE, 4:ID_PROV, 5:ID_KAB, 6:ID_KEC, 7:ID_DESA, 8:STATUS
    for (let i = 1; i < data.length; i++) {
      if (!data[i][1]) continue; // Lewati jika username kosong
      list.push({
        username: data[i][1],
        password: data[i][2],
        role: data[i][3],
        wilayah: data[i][1] // Identitas wilayah admin merujuk pada username
      });
    }
    return list;
  } catch (e) {
    console.error("Error getUserManagementList: " + e.toString());
    return [];
  }
}

/**
 * 3. Tambah User Baru secara Manual
 */
function adminCreateUser(payload) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('USERS');
    if (!sheet) return { success: false, message: "Sheet USERS tidak ditemukan." };
    
    // Cek duplikasi username
    const data = sheet.getDataRange().getValues();
    const exists = data.some(row => row[1] && row[1].toString().toLowerCase() === payload.username.toLowerCase());
    if (exists) return { success: false, message: "Username sudah digunakan." };

    // Simpan ke Spreadsheet (Mengikuti struktur 9 kolom Setup.gs)
    sheet.appendRow([
      Utilities.getUuid(),
      payload.username,
      payload.password,
      payload.role.toUpperCase(), 
      "74", // Kode Provinsi Sultra
      payload.idKab || "",   
      payload.idKec || "",   
      payload.idDesa || "",  
      "AKTIF"
    ]);
    
    logAdminActivity("CREATE", "Menambah user baru: " + payload.username + " (" + payload.role + ")");
    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * 4. Hapus User
 */
function adminDeleteUser(username) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('USERS');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1].toString() === username) {
        sheet.deleteRow(i + 1);
        logAdminActivity("DELETE", "Menghapus user: " + username);
        return { success: true };
      }
    }
    return { success: false, message: "User tidak ditemukan." };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * 5. Hapus Rekaman Data (LKD / LAD) Permanen
 */
function adminDeleteRecord(idEntry, type) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const masterSheetName = type === "LKD" ? "DATA_LKD_MASTER" : "DATA_LAD_MASTER";
    const masterSheet = ss.getSheetByName(masterSheetName);
    const logSheet = ss.getSheetByName('STATUS_LOG');
    
    if (masterSheet) {
      const data = masterSheet.getDataRange().getValues();
      const idx = data.findIndex(r => r[0].toString() === idEntry);
      if (idx > -1) masterSheet.deleteRow(idx + 1);
    }
    
    if (logSheet) {
      const logData = logSheet.getDataRange().getValues();
      const lIdx = logData.findIndex(r => r[0].toString() === idEntry);
      if (lIdx > -1) logSheet.deleteRow(lIdx + 1);
    }
    
    logAdminActivity("DELETE", "Menghapus rekaman database ID: " + idEntry);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * 6. Ekspor Full Backup Master Database ke CSV
 */
function apiGenerateFullBackup() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const lkdSheet = ss.getSheetByName('DATA_LKD_MASTER');
    const ladSheet = ss.getSheetByName('DATA_LAD_MASTER');
    
    let csvContent = "Tipe,ID_Entry,Desa,Kecamatan,Kabupaten,Lembaga,Tanggal\n";
    
    const extract = (sh, type) => {
      if (!sh || sh.getLastRow() < 2) return;
      const data = sh.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      const idx = (hName) => headers.indexOf(hName);
      const nameCol = type === 'LKD' ? idx('NAMA_LEMBAGA') : idx('NAMA_LAD');
      const dateCol = idx('TGL_INPUT');

      rows.forEach(r => {
        const rowDate = r[dateCol] instanceof Date ? Utilities.formatDate(r[dateCol], "GMT+7", "yyyy-MM-dd") : r[dateCol];
        csvContent += `${type},${r[0]},${r[4]},${r[3]},${r[2]},"${r[nameCol]}",${rowDate}\n`;
      });
    };

    extract(lkdSheet, "LKD");
    extract(ladSheet, "LAD");

    const filename = "BACKUP_MASTER_SIMONI_" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd_HHmm") + ".csv";
    return { success: true, csv: csvContent, filename: filename };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * Helper: Simpan Log Aktivitas Admin (Pencatatan Audit Trail)
 */
function logAdminActivity(type, message) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('ADMIN_LOGS');
    if (!sheet) {
      sheet = ss.insertSheet('ADMIN_LOGS');
      sheet.appendRow(['Waktu', 'Tipe', 'Aktivitas']);
    }
    sheet.appendRow([new Date(), type, message]);
  } catch (e) {
    console.error("Gagal mencatat log admin: " + e.toString());
  }
}

/**
 * Helper: Ambil Log Aktivitas untuk UI Admin Panel
 */
function getAdminLogsInternal() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('ADMIN_LOGS');
    if (!sheet || sheet.getLastRow() < 2) return [];
    
    const data = sheet.getDataRange().getValues().slice(1).reverse().slice(0, 10);
    return data.map(r => ({
      time: r[0] instanceof Date ? Utilities.formatDate(r[0], "GMT+7", "HH:mm, dd MMM") : r[0],
      type: r[1],
      message: r[2]
    }));
  } catch (e) {
    return [];
  }
}