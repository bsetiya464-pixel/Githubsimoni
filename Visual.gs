/**
 * Modul Statistik (Update: Regional Awareness & Role-Based Aggregation)
 * Tanggung Jawab: Mengolah data mentah menjadi statistik dashboard dan agregasi wilayah.
 * Ditambahkan: Fungsi getRecordDetail dan deleteRecord untuk mendukung fitur EDIT/HAPUS data.
 */

function getDashboardStats(user) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const lkdRows = ss.getSheetByName('DATA_LKD_MASTER').getDataRange().getValues().slice(1);
    const ladRows = ss.getSheetByName('DATA_LAD_MASTER').getDataRange().getValues().slice(1);
    const logMap = new Map(ss.getSheetByName('STATUS_LOG').getDataRange().getValues().map(l => [l[0].toString().toUpperCase(), l[2]]));

    const isKabAdmin = user && user.role === "KABUPATEN";
    const kabFilter = isKabAdmin ? user.namaWilayah.replace("Kab/Kota: ", "").toUpperCase() : null;
    
    const filterFn = r => !kabFilter || (r[2] && r[2].toString().toUpperCase() === kabFilter);

    const fLkd = lkdRows.filter(r => r[0] && filterFn(r));
    const fLad = ladRows.filter(r => r[0] && filterFn(r));

    const stats = {
      total: fLkd.length + fLad.length, 
      aktif: 0, 
      kurang: 0, 
      tidak: 0,
      bimtekPct: 0
    };

    [...fLkd, ...fLad].forEach(r => {
      const s = logMap.get(r[0].toString().toUpperCase()) || "TIDAK AKTIF";
      if (s === 'AKTIF') stats.aktif++; else if (s === 'KURANG AKTIF') stats.kurang++; else stats.tidak++;
    });

    return stats;
  } catch (e) { return { total: 0 }; }
}

/**
 * Mengambil data agregat kepatuhan wilayah berdasarkan Role
 */
function getRegionalAggregateData(user) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const wData = ss.getSheetByName('WILAYAH').getDataRange().getValues().slice(1);
    const lkdData = ss.getSheetByName('DATA_LKD_MASTER').getDataRange().getValues().slice(1).filter(r => r[0]);
    const ladData = ss.getSheetByName('DATA_LAD_MASTER').getDataRange().getValues().slice(1).filter(r => r[0]);

    const isKabAdmin = user && user.role === "KABUPATEN";
    const userKabName = isKabAdmin ? user.namaWilayah.replace("Kab/Kota: ", "").toUpperCase() : null;
    
    const targetMap = {};
    const realMap = {};
    const reportedDesaIds = new Set();

    wData.forEach(r => {
      const kabName = r[2] ? r[2].toString().toUpperCase() : "";
      const kecName = r[3] ? r[3].toString().toUpperCase() : "";
      
      if (isKabAdmin) {
        if (kabName === userKabName && kecName !== "") {
          targetMap[kecName] = (targetMap[kecName] || 0) + 1;
        }
      } else {
        if (kabName !== "") {
          targetMap[kabName] = (targetMap[kabName] || 0) + 1;
        }
      }
    });

    [...lkdData, ...ladData].forEach(r => {
      const idDesa = r[1] ? r[1].toString() : null;
      const kabName = r[2] ? r[2].toString().toUpperCase() : "";
      const kecName = r[3] ? r[3].toString().toUpperCase() : "";

      if (idDesa && !reportedDesaIds.has(idDesa)) {
        if (isKabAdmin) {
          if (kabName === userKabName && kecName !== "") {
            reportedDesaIds.add(idDesa);
            realMap[kecName] = (realMap[kecName] || 0) + 1;
          }
        } else {
          if (kabName !== "") {
            reportedDesaIds.add(idDesa);
            realMap[kabName] = (realMap[kabName] || 0) + 1;
          }
        }
      }
    });

    const progress = Object.keys(targetMap).map(name => {
      const target = targetMap[name];
      const real = realMap[name] || 0;
      return {
        name: name,
        jmlDes: target,
        inputDes: real,
        pct: Math.round((real / target) * 100)
      };
    }).sort((a, b) => b.pct - a.pct);

    return { 
      success: true, 
      role: user ? user.role : "UNKNOWN",
      progress: progress 
    };
  } catch (e) {
    console.error("Error getRegionalAggregateData: " + e.toString());
    return { success: false, progress: [] };
  }
}

/**
 * Mengambil daftar Kabupaten atau Kecamatan sesuai Role
 */
function getKabupatenList(user) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('WILAYAH');
    const data = sheet.getDataRange().getValues().slice(1);
    
    if (user && user.role === "KABUPATEN") {
      const userKab = user.namaWilayah.replace("Kab/Kota: ", "").toUpperCase();
      const list = data.filter(r => r[2] && r[2].toString().toUpperCase() === userKab)
                       .map(r => r[3]);
      return [...new Set(list)];
    } else {
      const list = data.map(r => r[2]);
      return [...new Set(list)];
    }
  } catch (e) { return []; }
}

/**
 * FUNGSI PENDUKUNG EDIT: Mengambil data lengkap satu rekaman
 */
function getRecordDetail(idEntry, type) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = type === 'LKD' ? 'DATA_LKD_MASTER' : 'DATA_LAD_MASTER';
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, message: "Sheet tidak ditemukan." };

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const row = data.find(r => r[0] === idEntry);
    
    if (!row) return { success: false, message: "Rekaman tidak ditemukan." };

    const result = {};
    headers.forEach((h, i) => {
      result[h] = row[i];
    });

    const prefix = type === 'LKD' ? 'LKD' : 'LAD';
    result.pengurus_detail = fetchDetailsInternal(ss, 'DETAIL_PENGURUS_' + prefix, idEntry, prefix);
    result.kapasitas_detail = fetchDetailsInternal(ss, 'DATA_' + prefix + '_MASTER_KAPASITAS', idEntry, 'KAPASITAS');
    result.kegiatan_detail = fetchDetailsInternal(ss, 'DATA_' + prefix + '_MASTER_KEGIATAN', idEntry, 'KEGIATAN');

    return { success: true, data: result };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * FUNGSI PENDUKUNG HAPUS: Menghapus data master dan rincian detailnya
 */
function deleteRecord(idEntry, type) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = type === 'LKD' ? 'DATA_LKD_MASTER' : 'DATA_LAD_MASTER';
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, message: "Sheet master tidak ditemukan." };

    const data = sheet.getDataRange().getValues();
    const idx = data.findIndex(r => r[0] === idEntry);
    
    if (idx > -1) {
      sheet.deleteRow(idx + 1);
      
      // Hapus data rincian di tabel pendukung
      const prefix = type === 'LKD' ? 'LKD' : 'LAD';
      const detailSheets = [
        'DETAIL_PENGURUS_' + prefix, 
        'DATA_' + prefix + '_MASTER_KAPASITAS', 
        'DATA_' + prefix + '_MASTER_KEGIATAN'
      ];
      
      detailSheets.forEach(name => {
        const dSheet = ss.getSheetByName(name);
        if (dSheet) {
          const dData = dSheet.getDataRange().getValues();
          for (let i = dData.length - 1; i >= 1; i--) {
            if (dData[i][1] === idEntry) dSheet.deleteRow(i + 1);
          }
        }
      });

      // Hapus log status
      const logSheet = ss.getSheetByName('STATUS_LOG');
      if (logSheet) {
        const ld = logSheet.getDataRange().getValues();
        const lIdx = ld.findIndex(r => r[0] === idEntry);
        if (lIdx > -1) logSheet.deleteRow(lIdx + 1);
      }
      
      return { success: true };
    }
    return { success: false, message: "ID rekaman tidak ditemukan." };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * Menghasilkan konten CSV lengkap untuk Rekap LKD atau LAD (Role-Aware)
 */
function apiGetFullRekapCSV(type, user) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = type === 'LKD' ? 'DATA_LKD_MASTER' : 'DATA_LAD_MASTER';
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, message: "Sheet database tidak ditemukan." };
    
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const rows = allData.slice(1);
    
    const isKabAdmin = user && user.role === "KABUPATEN";
    const userKabName = isKabAdmin ? user.namaWilayah.replace("Kab/Kota: ", "").toUpperCase() : null;
    
    const kabIdx = headers.indexOf('KABUPATEN');
    const filteredRows = rows.filter(r => {
      if (!isKabAdmin) return true;
      return r[kabIdx] && r[kabIdx].toString().toUpperCase() === userKabName;
    });
    
    const finalData = [headers, ...filteredRows];
    
    const csvContent = finalData.map(row => 
      row.map(cell => {
        let val = cell === null || cell === undefined ? "" : cell.toString();
        return `"${val.replace(/"/g, '""')}"`;
      }).join(",")
    ).join("\n");
    
    return {
      success: true,
      csv: csvContent,
      filename: `REKAP_${type}_${userKabName || 'SULTRA'}_${Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd")}.csv`
    };
  } catch(e) { 
    return { success: false, message: "Gagal memproses rekap: " + e.toString() }; 
  }
}