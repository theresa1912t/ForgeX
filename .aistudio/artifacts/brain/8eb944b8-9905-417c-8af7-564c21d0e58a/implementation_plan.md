# Data Sources & Device Connections Integration (FactoryLens)

Rencana penambahan konfigurasi sumber data dan konektivitas perangkat IoT/PLC untuk menghilangkan ambiguitas asal data telemetri (getaran, cycle time, tekanan), memberikan transparansi penuh kepada operator dan manajer pabrik secara minimalis, intuitif, dan sesuai prinsip Nielsen Usability Heuristics.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Konfigurasi**:
> - Penambahan tab **Data Sources** di dalam **Settings** sebagai pusat manajemen koneksi gateway (OPC UA, MQTT Broker, SCADA Historian) dengan fitur uji koneksi (*Ping / Test Connection*).
> - Penambahan indikator **Signal Source & Sensor Mapping** langsung pada modul **Machines** (Machine Detail) agar pengguna dapat melihat dari mana angka getaran, tekanan, dan cycle time berasal secara nyata (nama tag PLC/node ID, protokol, dan timestamp data terakhir).
> - Seluruh antarmuka tetap mematuhi prinsip desain: Tipografi *Plus Jakarta Sans* ($\ge 13\text{px}$), palet warna B2B SaaS netral, *zero-pill discipline*, dan *tabular-nums*.

---

### 1. Overview & Core Concept

- **Problem Statement**: Pengguna mempertanyakan dari mana angka getaran ($3.31\text{ mm/s}$), tekanan ($2.78\text{ bar}$), dan cycle time ($2.11\text{ s}$) didapatkan dan mengapa terasa "muncul begitu saja" tanpa konfigurasi koneksi.
- **Solusi**: Menghadirkan subsistem **Data Sources & Industrial Connectivity**:
  1. **Gateway Connections Manager**: Mengatur dan memonitor koneksi ke server PLC/SCADA (OPC UA Gateway Lini 3, MQTT Edge Broker, SCADA Historian Connector).
  2. **Sensor Tag Mapping per Mesin**: Menampilkan pemetaan konkret antara sensor fisik (akselerometer, pressure transducer, cycle timer) dan node address industri (`ns=2;s=Line3.M03.Vibration`).
  3. **Live Telemetry Origin di Modul Machines**: Menampilkan metadata sumber sinyal (protokol, latensi, paket terakhir diterima) pada kartu detail mesin.
- **Target Pengguna**: Plant Automation Engineer, Maintenance Manager, dan Production Lead.

---

### 2. User Experience & Visual Design

#### A. Alur Interaksi Pengguna (User Flow)
1. **Melihat Sumber Data di Modul Machines**:
   - Ketika pengguna memilih mesin (misalnya **M-03 Rotary Filler**), terdapat sub-panel minimalis: *"Data Source: OPC UA Gateway Lini 3 (Node: ns=2;s=Line3.M03) · Last packet 2s ago · Latency 14ms"*.
   - Tombol cepat *"View Connection Settings"* mengarahkan pengguna langsung ke konfigurasi terkait di menu Settings.
2. **Mengelola Koneksi di Settings > Data Sources**:
   - Tampilan ringkasan koneksi aktif dengan metrik keterhubungan: Status streaming, latency, paket per detik, dan jumlah tag sensor aktif.
   - Tombol **"Test Connection"** dengan status umpan balik visual instan (*"Connection verified in 18ms - 12/12 tags streaming nominal"*).
   - Dialog **"Add / Edit Connection"**: Formulir sederhana dengan input nama gateway, protokol (OPC UA / MQTT / Modbus TCP / REST), endpoint IP/URL, port, dan interval polling (1s - 5s).
3. **Sensor Tag Inspection**:
   - Tab sekunder untuk melihat daftar sensor fisik yang terpasang pada mesin: ID sensor, tipe transduser, rentang kalibrasi, dan status transmisi saat ini.

#### B. Penerapan Prinsip Heuristik Nielsen (UX Principles)
- **Visibility of System Status (Heuristik 1)**: Status koneksi ditampilkan jelas (*Streaming / Synchronized / Offline*), timestamp paket terakhir ("Baru saja" / "2 detik lalu"), dan feedback progresif saat tombol "Test Connection" ditekan.
- **Match Between System and Real World (Heuristik 2)**: Menggunakan terminologi riil manufaktur & otomasi (OPC UA, MQTT Broker, PLC Node Tag, Polling Rate, Accelerometer), bukan istilah abstrak.
- **User Control & Freedom (Heuristik 3)**: Pengguna dapat menguji ulang koneksi, memutus sementara (Pause/Resume stream), mengedit alamat endpoint, atau membatalkan perubahan konfigurasi dengan mudah.
- **Error Prevention & Recovery (Heuristik 5 & 9)**: Validasi format alamat endpoint/port sebelum menyimpan, konfirmasi visual jika koneksi gagal dengan solusi yang jelas (misal: "Port 4840 tidak merespons, periksa firewall gateway").
- **Aesthetic and Minimalist Design (Heuristik 8)**: Layout bersih tanpa visual berlebihan, tanpa pill badge warna-warni yang mencolok, menggunakan spasi lapang dan hierarki teks yang tegas.

#### C. Standar Desain Visual
- **Tipografi**: Plus Jakarta Sans, ukuran minimal $13\text{px}$, angka menggunakan `font-mono tabular-nums`.
- **Warna**: Latar `#F7F8FA`, kartu `#FFFFFF`, teks primer `#18202A`, teks sekunder `#5F6875`, aksen `#2F5BFF`, status sukses `#18864B`, status error `#D92D20`.
- **Zero-Pill Discipline**: Metadata koneksi ditampilkan sebagai teks sebaris dengan pemisah titik tengah (`·`), bukan kapsul pill warna-warni bertumpuk.

---

### 3. Arsitektur Teknis & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    FactoryStore (State)                     │
│  - connections: DataConnection[]                            │
│  - sensorMappings: Record<machineId, SensorTagMapping[]>    │
│  - testConnection(id): Promise<TestResult>                  │
│  - updateConnection(id, updates): void                      │
│  - addConnection(connection): void                          │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      SettingsModule.tsx      │ │     MachinesModule.tsx     │
│  Tab: "Data Sources"         │ │  Panel: "Signal Source &   │
│  - Gateway Connection Cards  │ │           Sensor Mapping"  │
│  - Test Connection Button    │ │  - Active Gateway Node     │
│  - Sensor Tags Table         │ │  - Last Packet Timestamp   │
│  - Add/Edit Gateway Modal    │ │  - Physical Sensor Specs   │
└──────────────────────────────┘ └────────────────────────────┘
```

#### Struktur Data Baru di `lib/types.ts`:
- `DataConnection`:
  - `id`: string (misal: `"conn-opc-line3"`)
  - `name`: string (misal: `"Line 3 Packaging & Filling PLC"`)
  - `protocol`: `'OPC UA' | 'MQTT' | 'Modbus TCP' | 'SCADA Historian'`
  - `endpoint`: string (misal: `"opc.tcp://192.168.10.45:4840"`)
  - `status`: `'connected' | 'idle' | 'offline'`
  - `latencyMs`: number
  - `samplingRate`: string (misal: `"1000 ms"`)
  - `activeTagsCount`: number
  - `lastSync`: string
- `SensorTag`:
  - `tagId`: string (misal: `"Line3.M03.Vib_RMS"`)
  - `machineId`: string (`"M-03"`)
  - `parameter`: `'vibration' | 'pressure' | 'temperature' | 'cycleTime'`
  - `sensorType`: string (misal: `"3-Axis Accelerometer (IEPE)"`)
  - `currentValue`: string (misal: `"3.31 mm/s"`)
  - `nodeAddress`: string (misal: `"ns=2;s=Line3.M03.Vib_RMS"`)

---

### 4. Rencana File yang Akan Diperbarui

1. `lib/types.ts`: Menambahkan antarmuka `DataConnection` dan `SensorTag`.
2. `lib/mockData.ts`: Menambahkan data inisial 3 gateway koneksi riil dan pemetaan sensor untuk mesin M-01 s/d M-06.
3. `lib/factoryStore.tsx`: Menyediakan state `connections`, `sensorTags`, serta fungsi `testConnection`, `updateConnection`, dan `addConnection`.
4. `components/modules/SettingsModule.tsx`: Menambahkan tab navigasi *"Data Sources & Devices"*, kartu daftar koneksi, tabel sensor tags, dan modal tambah/edit koneksi dengan umpan balik testing.
5. `components/modules/MachinesModule.tsx`: Menambahkan ringkasan *Signal Origin & Sensor Link* pada detail mesin terpilih.
