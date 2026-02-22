/**
 * Fungsi untuk menyimpan atau update data LAD
 * Menyesuaikan inputan Form LAD ke Database DATA_LAD_MASTER
 * Versi: Dynamic Header Mapping (Aman jika urutan kolom di Sheet berubah)
 */
function saveLADEntry(formObject) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('DATA_LAD_MASTER');
    if (!sheet) throw new Error("Sheet DATA_LAD_MASTER tidak ditemukan.");

    const fullData = sheet.getDataRange().getValues();
    const headers = fullData[0]; // Baris pertama sebagai acuan nama kolom
    
    // 1. Definisikan Pemetaan Kolom secara Dinamis berdasarkan nama Header
    const getColIdx = (name) => headers.indexOf(name);
    
    const COL = {
      ID: getColIdx('ID_ENTRY'),
      ID_DESA: getColIdx('ID_DESA'),
      TIMESTAMP: getColIdx('TGL_INPUT'),
      KABUPATEN: getColIdx('KABUPATEN'),
      KECAMATAN: getColIdx('KECAMATAN'),
      DESA: getColIdx('DESA'),
      NAMA_LEMBAGA: getColIdx('NAMA_LAD'),
      WILAYAH_ADAT: getColIdx('WILAYAH_ADAT'),
      NOMOR_SK: getColIdx('SK_NOMOR'),
      TANGGAL_SK: getColIdx('SK_TAHUN'),
      SARANA_PRASARANA: getColIdx('ADA_BALAI'), 
      BIMTEK_KAPASITAS: getColIdx('KAPASITAS_ADA'),
      DOKUMEN_KERJA: getColIdx('DOK_KERJA_ADA'),
      KEAKTIFAN_SENGKETA: getColIdx('SENGKETA_JENIS'),
      ANGGARAN_LAPORAN: getColIdx('ANGGARAN_JUMLAH'),
      KADES_NAMA: getColIdx('KADES_NAMA'),
      KADES_HP: getColIdx('KADES_HP'),
      KANTOR_ALAMAT: getColIdx('KANTOR_DESA_ALAMAT'),
      SKOR: getColIdx('SKOR_KINERJA'),
      STATUS: getColIdx('STATUS_AKTIVITAS')
    };

    // Validasi apakah kolom kritikal ditemukan
    if (COL.ID === -1) throw new Error("Kolom ID_ENTRY tidak ditemukan di database.");

    // 2. Hitung Skor Otomatis berdasarkan inputan (Sinkron dengan Calc.gs)
    const skor = calculateLADSkor(formObject);
    const status = skor >= 80 ? "AKTIF" : (skor >= 50 ? "KURANG AKTIF" : "TIDAK AKTIF");

    // 3. Cari apakah data sudah ada (berdasarkan ID Desa + Nama Lembaga) untuk update
    let targetRow = -1;
    // Format ID: LAD_IDDESA_NAMALAD
    const entryId = "LAD_" + (formObject.ID_DESA || "NON") + "_" + formObject.NAMA_LAD.toString().toUpperCase().replace(/\s+/g, '_');

    for (let i = 1; i < fullData.length; i++) {
      if (fullData[i][COL.ID] === entryId) {
        targetRow = i + 1;
        break;
      }
    }

    // 4. Siapkan Array Data sesuai lebar kolom yang ada
    const newRow = new Array(headers.length).fill("");
    
    // Isi data berdasarkan pemetaan dinamis (sesuai input dari FormInput.html)
    if (COL.ID > -1) newRow[COL.ID] = entryId;
    if (COL.ID_DESA > -1) newRow[COL.ID_DESA] = formObject.ID_DESA;
    if (COL.TIMESTAMP > -1) newRow[COL.TIMESTAMP] = new Date();
    if (COL.KABUPATEN > -1) newRow[COL.KABUPATEN] = formObject.KABUPATEN;
    if (COL.KECAMATAN > -1) newRow[COL.KECAMATAN] = formObject.KECAMATAN;
    if (COL.DESA > -1) newRow[COL.DESA] = formObject.DESA;
    if (COL.NAMA_LEMBAGA > -1) newRow[COL.NAMA_LEMBAGA] = formObject.NAMA_LAD;
    if (COL.WILAYAH_ADAT > -1) newRow[COL.WILAYAH_ADAT] = formObject.WILAYAH_ADAT;
    if (COL.NOMOR_SK > -1) newRow[COL.NOMOR_SK] = formObject.SK_NOMOR;
    if (COL.TANGGAL_SK > -1) newRow[COL.TANGGAL_SK] = formObject.SK_TAHUN;
    if (COL.SARANA_PRASARANA > -1) newRow[COL.SARANA_PRASARANA] = formObject.ADA_BALAI;
    if (COL.BIMTEK_KAPASITAS > -1) newRow[COL.BIMTEK_KAPASITAS] = formObject.KAPASITAS_ADA;
    if (COL.DOKUMEN_KERJA > -1) newRow[COL.DOKUMEN_KERJA] = formObject.DOK_KERJA_ADA;
    if (COL.KEAKTIFAN_SENGKETA > -1) newRow[COL.KEAKTIFAN_SENGKETA] = formObject.SENGKETA_JENIS || "";
    if (COL.ANGGARAN_LAPORAN > -1) newRow[COL.ANGGARAN_LAPORAN] = formObject.ANGGARAN_JUMLAH;
    
    // Identitas Kades
    if (COL.KADES_NAMA > -1) newRow[COL.KADES_NAMA] = formObject.KADES_NAMA;
    if (COL.KADES_HP > -1) newRow[COL.KADES_HP] = formObject.KADES_HP;
    if (COL.KANTOR_ALAMAT > -1) newRow[COL.KANTOR_ALAMAT] = formObject.KANTOR_DESA_ALAMAT;
    
    // Status & Skor (Jika ada kolomnya di Master)
    if (COL.SKOR > -1) newRow[COL.SKOR] = skor;
    if (COL.STATUS > -1) newRow[COL.STATUS] = status;

    // 5. Eksekusi Simpan (Update atau Append)
    if (targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, newRow.length).setValues([newRow]);
    } else {
      sheet.appendRow(newRow);
    }

    // 6. Sinkronkan ke STATUS_LOG (Centralized Rating)
    if (typeof saveToStatusLog === 'function') {
      saveToStatusLog(entryId, skor);
    }

    return { success: true, message: "Data monitoring LAD berhasil disinkronkan ke database." };

  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * Logika perhitungan skor LAD
 * Disesuaikan dengan atribut name di FormInput.html dan bobot di Calc.gs
 */
function calculateLADSkor(form) {
  let s = 0;
  
  // A. LEGALITAS (15 Poin)
  if (form.SK_NOMOR && form.SK_TAHUN) s += 15;
  
  // B. SARANA FISIK ADAT (15 Poin)
  if (form.ADA_BALAI === 'Ada' || form.ADA_RUMAH_ADAT === 'Ada') s += 15;
  
  // C. KAPASITAS & BIMTEK (20 Poin)
  if (form.KAPASITAS_ADA === 'Ya') s += 20;
  
  // D. DOKUMEN KERJA ADAT (20 Poin)
  if (form.DOK_KERJA_ADA === 'Ya') s += 20;
  
  // E. KEAKTIFAN FUNGSIONAL (15 Poin)
  if (form.SENGKETA_JENIS && form.SENGKETA_JENIS !== "") s += 15;
  
  // F. ANGGARAN & LAPORAN (15 Poin)
  if (Number(form.ANGGARAN_JUMLAH) > 0) s += 7;
  if (form.ADA_LAPORAN_AKHIR === 'Ya') s += 8;
  
  return s;
}