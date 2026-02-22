/**
 * Modul Autentikasi (Update: Role-Based Routing for Provinsi vs Super Admin)
 */

function authenticateUser(username, password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName('USERS');
  const wilayahSheet = ss.getSheetByName('WILAYAH');
  
  if (!userSheet) return { success: false, message: 'Tabel USERS tidak ditemukan.' };

  const userData = userSheet.getDataRange().getValues();
  const inputUser = username.toString().trim().toLowerCase();
  const inputPass = password.toString().trim();

  for (let i = 1; i < userData.length; i++) {
    const storedUser = userData[i][1] ? userData[i][1].toString().trim().toLowerCase() : ""; 
    const storedPass = userData[i][2] ? userData[i][2].toString().trim() : ""; 
    const userRole = userData[i][3] ? userData[i][3].toString().toUpperCase().trim() : "";
    
    const idKab  = userData[i][5];
    const idKec  = userData[i][6];
    const idDesa = userData[i][7];
    
    if (storedUser === inputUser && inputPass === storedPass) {
        
        let displayRegion = "SULTRA";
        let detailWilayah = { kab: "", kec: "", des: "" };
        
        if (wilayahSheet) {
          const wData = wilayahSheet.getDataRange().getValues();
          
          if (userRole === "KABUPATEN" && idKab) {
            const row = wData.find(r => r[0].toString().startsWith(idKab.toString()));
            if (row) displayRegion = "Kab/Kota: " + row[2];
          } 
          else if (userRole === "KECAMATAN" && idKec) {
            const row = wData.find(r => r[0].toString().startsWith(idKec.toString()));
            if (row) displayRegion = "Kecamatan: " + row[3];
          } 
          else if (userRole === "DESA" && idDesa) {
            const row = wData.find(r => r[0].toString() === idDesa.toString());
            if (row) {
              displayRegion = "Desa: " + row[4] + " (" + row[3] + ")";
              detailWilayah = { kab: row[2], kec: row[3], des: row[4] };
            }
          } else if (userRole === "PROVINSI" || userRole === "SUPER ADMIN") {
            displayRegion = "OTORITAS PUSAT SULTRA";
          }
        }

        /**
         * LOGIKA ROUTING DINAMIS (UPDATE):
         * - Role SUPER ADMIN -> Masuk ke Panel Super Admin (AdminPanel.html)
         * - Role PROVINSI -> Masuk ke Dashboard Monitoring (Dashboard.html)
         * - Role DESA -> Masuk ke Formulir Input (FormInput.html)
         * - Role Lainnya (KAB/KEC) -> Masuk ke Dashboard Monitoring (Dashboard.html)
         */
        let targetPage = "dashboard"; // Default
        if (userRole === "SUPER ADMIN") {
          targetPage = "admin";
        } else if (userRole === "DESA") {
          targetPage = "form";
        }
        
        return { 
          success: true, 
          targetPage: targetPage,
          user: {
            id: userData[i][0],
            username: userData[i][1],
            role: userRole,
            idKab: idKab,
            idKec: idKec,
            idDesa: idDesa,
            namaWilayah: displayRegion,
            detail: detailWilayah
          }
        };
    }
  }
  return { success: false, message: 'Login Gagal. Periksa Username/Sandi.' };
}