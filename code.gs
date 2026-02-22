/**
 * SISTEM MONITORING LEMBAGA KEMASYARAKATAN DESA & LEMBAGA ADAT DESA (SIMONI LKD-LAD)
 * PEMERINTAH PROVINSI SULAWESI TENGGARA
 * Modul: Router Utama & API Backend (Code.gs)
 */

/**
 * 1. ROUTER UTAMA (doGet)
 */
function doGet(e) {
  const page = e.parameter.page || 'index';
  const template = HtmlService.createTemplateFromFile('App');
  template.initialPage = page;
  
  return template.evaluate()
    .setTitle('SIMONI SULTRA - Monitoring Digital')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Helper untuk menyertakan file HTML (CSS/JS) ke dalam template
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 2. MANAJEMEN SESI & LOGIN
 * Fungsi ini dipanggil oleh Index.html.
 * Memastikan data user diteruskan kembali ke frontend untuk disimpan di window.initialUser.
 */
function loginUser(username, password) {
  // authenticateUser didefinisikan di Auth.gs
  const result = authenticateUser(username, password);
  
  if (result.success) {
    // Kami menggunakan PropertiesService sebagai cadangan, 
    // namun SPA utamanya mengandalkan data yang dikembalikan ke frontend.
    try {
      const userProperties = PropertiesService.getUserProperties();
      userProperties.setProperty('USER_SESSION', JSON.stringify(result.user));
    } catch (e) {
      console.warn("Gagal menyimpan properti sesi: " + e.toString());
    }
  }
  return result;
}

function logoutUser() {
  try {
    PropertiesService.getUserProperties().deleteProperty('USER_SESSION');
  } catch (e) {}
  return { success: true };
}

function getCurrentUser() {
  try {
    const session = PropertiesService.getUserProperties().getProperty('USER_SESSION');
    return session ? JSON.parse(session) : null;
  } catch (e) {
    return null;
  }
}

/**
 * 3. FUNGSI DASHBOARD & MONITORING UTAMA
 */

function getDashboardData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const lkdSheet = ss.getSheetByName('DATA_LKD_MASTER');
    const ladSheet = ss.getSheetByName('DATA_LAD_MASTER');
    const logSheet = ss.getSheetByName('STATUS_LOG');
    
    const logMap = new Map();
    if (logSheet) {
      const logData = logSheet.getDataRange().getValues();
      logData.slice(1).forEach(row => {
        if (row[0]) logMap.set(row[0].toString().toUpperCase(), { skor: row[1], status: row[2] });
      });
    }

    let combined = [];

    // Ambil Data LKD
    if (lkdSheet) {
      const data = lkdSheet.getDataRange().getValues();
      const headers = data[0];
      data.slice(1).forEach(r => {
        if (r[0]) {
          const idStr = r[0].toString().toUpperCase();
          const log = logMap.get(idStr) || { skor: 0, status: "TIDAK AKTIF" };
          combined.push({
            id: r[0],
            nama: r[headers.indexOf('NAMA_LEMBAGA')], 
            kab: r[headers.indexOf('KABUPATEN')],
            kec: r[headers.indexOf('KECAMATAN')],
            des: r[headers.indexOf('DESA')],
            kat: 'LKD',
            sub: r[headers.indexOf('JENIS_LKD')],
            perdes: r[headers.indexOf('PERDES_ADA')], 
            skor: log.skor,
            status: log.status,
            tgl: r[headers.indexOf('TGL_INPUT')] instanceof Date ? 
                 Utilities.formatDate(r[headers.indexOf('TGL_INPUT')], "GMT+7", "dd/MM/yyyy") : "-"
          });
        }
      });
    }

    // Ambil Data LAD
    if (ladSheet) {
      const data = ladSheet.getDataRange().getValues();
      const headers = data[0];
      data.slice(1).forEach(r => {
        if (r[0]) {
          const idStr = r[0].toString().toUpperCase();
          const log = logMap.get(idStr) || { skor: 0, status: "TIDAK AKTIF" };
          combined.push({
            id: r[0],
            nama: r[headers.indexOf('NAMA_LAD')], 
            kab: r[headers.indexOf('KABUPATEN')],
            kec: r[headers.indexOf('KECAMATAN')],
            des: r[headers.indexOf('DESA')],
            kat: 'LAD',
            sub: 'Adat',
            skor: log.skor,
            status: log.status,
            tgl: r[headers.indexOf('TGL_INPUT')] instanceof Date ? 
                 Utilities.formatDate(r[headers.indexOf('TGL_INPUT')], "GMT+7", "dd/MM/yyyy") : "-"
          });
        }
      });
    }

    return { success: true, list: combined.reverse() };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * 4. FUNGSI PENARIKAN DATA (FORM INPUT)
 */
function getVillageSubmissionsStatus() {
  try {
    const user = getCurrentUser();
    if (!user || !user.idDesa) return { success: false, message: "Sesi tidak valid" };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const idDesaStr = user.idDesa.toString();
    const submissions = {};

    const logMap = new Map();
    const logSheet = ss.getSheetByName('STATUS_LOG');
    if (logSheet) {
      logSheet.getDataRange().getValues().slice(1).forEach(row => {
        if (row[0]) logMap.set(row[0].toString().toUpperCase(), { skor: row[1], status: row[2] });
      });
    }

    const processSheet = (sheetName, subKey) => {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      data.slice(1).forEach(r => {
        if (r[headers.indexOf('ID_DESA')].toString() === idDesaStr) {
          const idEntry = r[0];
          const entryObj = {};
          headers.forEach((h, i) => entryObj[h] = r[i]);
          
          const log = logMap.get(idEntry.toString().toUpperCase()) || { skor: 0, status: "TIDAK AKTIF" };
          entryObj.skor = log.skor;
          entryObj.status = log.status;

          const key = (subKey === 'DYNAMIC') ? r[headers.indexOf('JENIS_LKD')] : subKey;
          submissions[key] = entryObj;
        }
      });
    };

    processSheet('DATA_LKD_MASTER', 'DYNAMIC');
    processSheet('DATA_LAD_MASTER', 'LAD');

    return { success: true, data: submissions };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * 5. PENGELOLAAN DATA (SAVE/UPDATE)
 */
function processDataEntry(formObject) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const isLkd = formObject.TIPE_ENTRY === 'LKD';
    const sheetName = isLkd ? 'DATA_LKD_MASTER' : 'DATA_LAD_MASTER';
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) return { success: false, message: "Sheet tidak ditemukan." };

    const headers = sheet.getDataRange().getValues()[0];
    const idEntry = formObject.ID_ENTRY || (isLkd ? "LKD" : "LAD") + "_" + formObject.ID_DESA + "_" + (formObject.JENIS_LKD || "ADAT").replace(/\s+/g, '_');
    
    const existingData = sheet.getDataRange().getValues();
    const rowIdx = existingData.findIndex(r => r[0].toString() === idEntry.toString());
    
    const newRow = new Array(headers.length).fill("");
    headers.forEach((h, i) => {
      if (h === 'ID_ENTRY') newRow[i] = idEntry;
      else if (h === 'TGL_INPUT') newRow[i] = new Date();
      else if (formObject[h] !== undefined) newRow[i] = formObject[h];
    });

    if (rowIdx > -1) {
      sheet.getRange(rowIdx + 1, 1, 1, newRow.length).setValues([newRow]);
    } else {
      sheet.appendRow(newRow);
    }
    
    // Hitung skor otomatis menggunakan modul Calc.gs
    let scoring = { score: 0, status: "TIDAK AKTIF" };
    if (typeof calculateAndSaveScore === 'function') {
      scoring = calculateAndSaveScore(idEntry, formObject.TIPE_ENTRY);
    }
    
    return { success: true, score: scoring.score, status: scoring.status };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * 6. MODUL WRAPPER (Visual.gs & AdminManagement.gs)
 */
function getRegionalAggregateData(user) {
  // getRegionalAggregateDataInternal harus ada di Visual.gs
  return getRegionalAggregateDataInternal(user || getCurrentUser());
}

function getKabupatenList(user) {
  // getKabupatenListInternal harus ada di Visual.gs
  return getKabupatenListInternal(user || getCurrentUser());
}

function getAdminStats() {
  // getAdminStats didefinisikan di AdminManagement.gs
  return typeof getAdminStatsInternal === 'function' ? getAdminStatsInternal() : getAdminStats();
}

function getUserManagementList() {
  return typeof getUserManagementListInternal === 'function' ? getUserManagementListInternal() : getUserManagementList();
}

/**
 * 7. EKSPOR & PDF
 */
function apiGeneratePdf(id) {
  return generatePdfLaporan(id);
}

function apiGetFullRekapCSV(type, user) {
  return apiGetFullRekapCSVInternal(type, user || getCurrentUser());
}

function apiGenerateTablePdf(data, filter) {
  // Fungsi ini memanggil generator tabel PDF di Export.gs
  return typeof generateTablePdf === 'function' ? generateTablePdf(data, filter) : {success: false, message: "Fungsi tidak tersedia"};
}