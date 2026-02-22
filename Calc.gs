/**
 * SIMONI SULTRA - Advanced Scoring Engine (V2.0)
 * Sinkron dengan FormInput.html & DATA_MASTER
 */

function calculateAndSaveScore(idEntry, type) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = type === 'LKD' ? 'DATA_LKD_MASTER' : 'DATA_LAD_MASTER';
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) return { score: 0, status: "SHEET TIDAK DITEMUKAN" };
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const row = data.find(r => r[0].toString() === idEntry.toString());

  if (!row) return { score: 0, status: "BELUM DATA" };

  // Helper untuk mengambil nilai berdasarkan nama kolom
  const getVal = (hName) => {
    const idx = headers.indexOf(hName);
    return idx > -1 ? row[idx] : null;
  };

  const isTrue = (val) => (val === 'Ya' || val === 'Ada' || (typeof val === 'number' && val > 0));

  let totalScore = 0;

  // ==========================================
  // LOGIKA SKORING LKD (Total Maks: 100)
  // ==========================================
  if (type === 'LKD') {
    // 1. Legalitas SK (15 Poin)
    if (getVal('SK_NOMOR') && getVal('SK_TAHUN')) totalScore += 15;

    // 2. Regulasi Perdes (10 Poin)
    if (getVal('PERDES_ADA') === 'Ya') totalScore += 10;

    // 3. Sarana Prasarana (15 Poin)
    if (getVal('ADA_SEKRETARIAT') === 'Ada') totalScore += 10;
    if (getVal('SARANA_KERJA')) totalScore += 5;

    // 4. Dokumen Kerja AD/ART (10 Poin)
    if (getVal('DOK_KERJA_ADA') === 'Ya') totalScore += 10;

    // 5. Partisipasi Musyawarah (20 Poin - @5 Poin)
    // Disesuaikan dengan name="IKUT_..." di FormInput.html
    if (getVal('IKUT_MUSDES') === 'Ya') totalScore += 5;
    if (getVal('IKUT_MUSRENBANG') === 'Ya') totalScore += 5;
    if (getVal('IKUT_RPJM') === 'Ya') totalScore += 5;
    if (getVal('IKUT_RKP') === 'Ya') totalScore += 5;

    // 6. Peningkatan Kapasitas/Bimtek (10 Poin)
    if (getVal('KAPASITAS_ADA') === 'Ya') totalScore += 10;

    // 7. Anggaran Operasional (10 Poin)
    if (Number(getVal('ANGGARAN_JUMLAH')) > 0) totalScore += 10;

    // 8. Akuntabilitas Laporan Akhir (10 Poin)
    if (getVal('ADA_LAPORAN_AKHIR') === 'Ya') totalScore += 10;
  } 

  // ==========================================
  // LOGIKA SKORING LAD (Total Maks: 100)
  // ==========================================
  else if (type === 'LAD') {
    // 1. Legalitas & Pengakuan (20 Poin)
    if (getVal('SK_NOMOR')) totalScore += 20;

    // 2. Sarana Fisik (Balai/Rumah Adat) (20 Poin)
    if (getVal('ADA_BALAI') === 'Ada' || getVal('ADA_RUMAH_ADAT') === 'Ada') totalScore += 20;

    // 3. Fungsional Adat (Sengketa/Sidang) (20 Poin)
    if (getVal('SENGKETA_JENIS') && getVal('SENGKETA_JENIS') !== "") totalScore += 20;

    // 4. Dokumen Adat (Hukum/Silsilah) (20 Poin)
    if (getVal('DOK_KERJA_ADA') === 'Ya') totalScore += 20;

    // 5. Anggaran & Laporan (20 Poin)
    if (Number(getVal('ANGGARAN_JUMLAH')) > 0) totalScore += 10;
    if (getVal('ADA_LAPORAN_AKHIR') === 'Ya') totalScore += 10;
  }

  // ==========================================
  // PENENTUAN STATUS AKHIR
  // ==========================================
  let status = "TIDAK AKTIF";
  if (totalScore >= 80) status = "AKTIF";
  else if (totalScore >= 50) status = "KURANG AKTIF";

  // SIMPAN KE STATUS_LOG & UPDATE DI MASTER
  syncStatusToDatabase(idEntry, totalScore, status);

  return { score: totalScore, status: status };
}

/**
 * Sinkronisasi hasil penilaian ke sheet STATUS_LOG
 */
function syncStatusToDatabase(idEntry, score, status) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName('STATUS_LOG');
  
  if (!logSheet) {
    logSheet = ss.insertSheet('STATUS_LOG');
    logSheet.appendRow(['ID_ENTRY', 'SKOR_KINERJA', 'STATUS_AKTIVITAS', 'TGL_UPDATE']);
  }

  const data = logSheet.getDataRange().getValues();
  const rowIndex = data.findIndex(r => r[0].toString() === idEntry.toString());

  const logRow = [idEntry, score, status, new Date()];

  if (rowIndex > -1) {
    logSheet.getRange(rowIndex + 1, 1, 1, 4).setValues([logRow]);
  } else {
    logSheet.appendRow(logRow);
  }
}