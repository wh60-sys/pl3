# Setup Google Cloud untuk Google Sheets API

Panduan step-by-step untuk menghubungkan aplikasi dengan Google Sheets API menggunakan Service Account.

---

## Prerequisites

- Akun Google (Gmail)
- Akses ke [Google Cloud Console](https://console.cloud.google.com/)

---

## Step 1: Buka Google Cloud Console

1. Buka browser dan akses: **https://console.cloud.google.com/**
2. Jika ada project sebelumnya terbuka, klik dropdown di pojok kiri atas
3. Klik **"New Project"** untuk membuat project baru

![New Project Button](https://i.imgur.com/new-project-button.png)

---

## Step 2: Buat Project Baru

1. Pada halaman "New Project":
   - **Project name**: `pl3-dashboard`
   - **Location**: Select folder organization (biarkan default / No organization)

2. Klik **"CREATE"**

![Create Project Form](https://i.imgur.com/create-project-form.png)

3. Tunggu hingga project selesai dibuat (~30 detik)

---

## Step 3: Enable Google Sheets API

1. Setelah project dibuat, Anda akan diarahkan ke halaman project
2. Pada search bar, ketik: **"Google Sheets API"**
3. Klik hasil pencarian **"Google Sheets API"**

![Search Sheets API](https://i.imgur.com/search-sheets-api.png)

4. Klik **"ENABLE"**

![Enable API Button](https://i.imgur.com/enable-api-button.png)

5. Tunggu hingga API selesai di-enable (~10 detik)

---

## Step 4: Buat Service Account

1. Di sidebar kiri, navigasi ke: **IAM & Admin** → **Service Accounts**

   Atau akses langsung: **https://console.cloud.google.com/apis/credentials**

2. Klik **"+ CREATE SERVICE ACCOUNT"**

![Create Service Account Button](https://i.imgur.com/create-service-account.png)

3. Isi form:
   - **Service account name**: `pl3-sheets-writer`
   - **Service account ID**: `pl3-sheets-writer` (auto-generated)
   - **Service account description**: `Write production data to Google Sheets`

4. Klik **"CREATE AND CONTINUE"**

5. Pada step 2 (Grant this service account access to project):
   - **Select a role**: `Editor`
   - Klik dropdown → ketik "Editor" → pilih **"Editor"**

6. Klik **"DONE"**

---

## Step 5: Download Service Account Key (JSON)

1. Pada daftar Service Accounts, klik email service account yang baru dibuat
2. Klik tab **"KEYS"**
3. Klik **"ADD KEY"** → **"Create new key"**

![Add Key Button](https://i.imgur.com/add-key-button.png)

4. Pilih **"JSON"** → klik **"CREATE"**

5. File JSON akan otomatis ter-download
   - Nama file: `pl3-dashboard-xxxxx-xxxxxxxxx.json`

---

## Step 6: Simpan Credentials

1. Pindahkan file JSON yang ter-download ke folder project:
   ```bash
   mv ~/Downloads/pl3-dashboard-*.json /workspaces/pl3/scripts/credentials.json
   ```

2. Atau rename sesuai nama yang diharapkan:
   ```bash
   mv /workspaces/pl3/scripts/credentials.json.example /workspaces/pl3/scripts/credentials.json
   # Edit isi file dengan credentials yang di-download
   ```

---

## Step 7: Share Spreadsheet ke Service Account

1. Buka Google Sheets:
   **https://docs.google.com/spreadsheets/d/1O_s4A67NkLvI9Asz1CZszPNEAnQliIWV91UbTut7-Q8/edit**

2. Klik tombol **"Share"**

3. Pada dialog "Share with others":
   - Masukkan email service account (contoh):
     ```
     pl3-sheets-writer@pl3-dashboard.iam.gserviceaccount.com
     ```
   - **Note**: Email ada di file credentials.json bagian `client_email`

4. Klik dropdown **"Editor"** → pastikan sudah **"Editor"**

5. Klik **"Send"**

![Share Dialog](https://i.imgur.com/share-dialog.png)

---

## Step 8: Verifikasi Setup

1. Test koneksi dengan menjalankan script:
   ```bash
   cd /workspaces/pl3
   npm run fill-sheets
   ```

2. Jika berhasil, output:
   ```
   📊 Checking existing data...
   Found 97 existing rows
   📅 Generating data for 2026-05-14...
   ✍️  Writing production data...
   Progress: 100%
   ✅ Successfully filled Google Sheets!
   ```

---

## Troubleshooting

### Error: "The caller does not have permission"

→ Spreadsheet belum di-share ke service account email

### Error: "API not enabled"

→ Belum enable Google Sheets API (ulangi Step 3)

### Error: "Invalid credentials"

→ File credentials.json salah atau expired. Download ulang di Step 5

---

## Struktur credentials.json

```json
{
  "type": "service_account",
  "project_id": "pl3-dashboard",
  "private_key_id": "xxxxxxxxxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "pl3-sheets-writer@pl3-dashboard.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

---

## Environment Variables (Optional)

```bash
# Set spreadsheet ID
export GOOGLE_SHEETS_ID=1O_s4A67NkLvI9Asz1CZszPNEAnQliIWV91UbTut7-Q8

# Set credentials path
export GOOGLE_APPLICATION_CREDENTIALS=/workspaces/pl3/scripts/credentials.json
```

---

## Next Steps

Setelah setup selesai:

1. **Auto-fill terjadwal** (cron):
   ```bash
   # Edit crontab
   crontab -e
   
   # Tambah line untuk every hour:
   0 * * * * cd /workspaces/pl3 && npm run fill-sheets
   ```

2. **Atau gunakan PM2**:
   ```bash
   pm2 start scripts/fill-sheets.cjs --cron "0 * * * *"
   ```

---

**Referensi:**
- Google Sheets API: https://developers.google.com/sheets/api
- Google Cloud Console: https://console.cloud.google.com/