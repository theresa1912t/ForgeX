# Real-World Scenario Plan: Dairy & UHT Milk Liquid Packaging Plant

## User Review & Critical Decisions

> [!IMPORTANT]
> This plan grounds the application's entire dummy dataset and incident response workflows into an authentic **Dairy and Aseptic UHT Milk Liquid Packaging Plant** scenario with deep, realistic equipment, chemical/physical telemetry, and floor loss chains.

- **Confirmed Industry & Plant Profile**: High-capacity Dairy & UHT Milk processing and aseptic packaging facility (*LactaPure Dairy Industries - Aseptic Processing Facility #1*).
- **Presentation Mode**: Deep single scenario with interconnected physical equipment (homogenizers, UHT sterilizers, aseptic rotary fillers), ingredient lots (raw milk, milkfat stabilizers, aseptic packaging rollstock), and realistic root-cause loss chains.
- **Incident Hero Storyline (Line 3)**:
  - *Product*: UHT Fortified Whole Milk 1000ml (3.5% Milkfat).
  - *Symptom*: Output speed drop from 5,400 to 4,380 units/hr (-18.9% speed loss) with checkweigher weight reject spikes.
  - *Root Cause Chain*: 2nd-stage homogenizer valve seat wear combined with filling valve #4 elastomeric diaphragm micro-tear under 138°C aseptic backpressure, producing milk protein fouling and dosing lag.
  - *Corrective Action*: Emergency valve rebuild kit, homogenizer pressure realignment (180 bar / 40 bar), and quarantine of off-spec batch lot.

---

## 1. Overview & Operational Domain

* **Plant Profile**:
  * **Company**: LactaPure Dairy Industries Inc.
  * **Facility**: Aseptic Processing & Packaging Plant #1 (Capacity: 320,000 liters/day).
  * **Standard**: ISA-88 Batch Processing & ISO 22000 / HACCP Food Safety.
* **4 Realistic Dairy Production Lines**:
  1. **Line 1 (L-01)**: *Aseptic UHT Carton Line 1L* — Tetra Pak TBA/19 style aseptic packaging line for Plain & Skim UHT Milk (Nominal: 6,000 packs/hr).
  2. **Line 2 (L-02)**: *Portion UHT Flavored Milk 250ml* — Portion carton line with integrated high-speed straw applicator for Chocolate & Strawberry UHT Milk (Nominal: 4,800 packs/hr).
  3. **Line 3 (L-03 - Focus Line)**: *High-Speed ESL/UHT Bottle Line 1000ml* — Rotary aseptic bottle filler with induction foil heat sealing (Nominal: 5,400 bottles/hr, current degraded speed: 4,380 bottles/hr).
  4. **Line 4 (L-04)**: *Pasteurized Fresh Milk & Cultured Dairy Gable-Top Line* (Nominal: 3,600 cartons/hr).
* **Target Personas in Context**:
  * **Shift Supervisor (Packaging Floor)**: Monitors line alarms, filling speed drops, checkweigher reject rates, and logs milk scrap on rugged tablets.
  * **Plant Operations Manager**: Tracks shift OEE, total product loss in dollars, and downtime Pareto charts.
  * **Maintenance & Reliability Lead**: Dispatches homogenizer and filling valve preventive maintenance tickets.
  * **QA/HACCP Specialist**: Audits fat globule dispersion, milk temperature (138.5°C holding), and raw milk intake lot certificates.

---

## 2. User Experience & Real-World Data Architecture

### Entity Transformation Map

| Entity Domain | Current Generic State | Realistic Dairy & UHT Plant Data |
| :--- | :--- | :--- |
| **Organization** | FreshBite Foods Inc. | **LactaPure Dairy Industries Inc.** (Dairy Processing & Aseptic Packaging) |
| **Facility** | Generic Main Plant | **LactaPure Main Dairy & Aseptic Facility** (Midwest Dairy District) |
| **Products** | Orange Drink, Chili Sauce, etc. | • **UHT Whole Milk 1000ml (3.5% Fat)**<br>• **UHT Chocolate Milk 250ml**<br>• **UHT Skim Milk 1000ml (0.1% Fat)**<br>• **Fresh Pasteurized Whole Milk 1L** |
| **Raw Materials** | Generic citrus concentrate | • **Raw Grade A Fresh Farm Milk (3.8% Fat, 8.6% SNF)** ($0.46/L)<br>• **UHT Dairy Stabilizer & Carrageenan System** ($16.20/kg)<br>• **Vitamin A & D3 Fortification Premix** ($48.00/kg)<br>• **1000ml Aseptic Multi-Layer Barrier Bottles & Preforms** ($0.14/ea) |
| **Material Batches** | Batch RM-284 | **LOT-RAW-904** (Grade A Raw Milk, 24,000 L, Flagged for Elevated Somatic Cell Count & Viscosity Deviation +8.4%) |
| **Machines** | Generic mixers and fillers | • **Two-Stage Aseptic Homogenizer (HG-03)**: Stage 1 @ 180 bar, Stage 2 @ 40 bar<br>• **UHT Tubular Direct-Steam Sterilizer (ST-03)**: 138.5°C, 4.2s holding<br>• **Aseptic Rotary Liquid Filler M-03**: 36-head positive displacement filling valves<br>• **Induction Foil Sealer CS-03**<br>• **Dynamic Inline Checkweigher CW-03** |
| **Alert Trigger** | Line 3 Speed Loss Alert | **Line 3 (Bottling) Speed Loss & Valve Dosing Lag**: Flow resistance in Valve #4 causing underfill rejects and speed loss to 4,380 bpm |
| **Investigation** | Bottling line loss investigation | **Aseptic Bottle Line 3 - Viscosity Surge & Diaphragm Dosing Anomaly**: Homogenizer pressure loss combined with Valve #4 elastomeric diaphragm wear |
| **Action Tasks** | Generic fix valve | **Replace Valve #4 Diaphragm Kit & Re-seat Homogenizer Stage 2 Valve** (Assignee: Carlos Ruiz / Marcus Vance) |
| **Waste Records** | Generic scrap | • **Off-spec Viscosity Checkweigher Rejects**: 128 kg / 256 bottles ($768.00)<br>• **CIP Sterilization Flushing Loss**: 85 L ($41.00)<br>• **Induction Foil Seal Integrity Leakers**: 42 bottles ($69.00) |

---

## 3. Step-by-Step Incident Resolution Walkthrough (Dairy Grounded)

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│ 1. UHT Line 3 Speed Alarm       │       │ 2. Slide-Over Dairy Diagnostics │       │ 3. 1-Click Maintenance Dispatch │
│ Speed: 4,380 / 5,400 units/hr   │ ────> │ Milk Viscosity: 68.2 cP (+8.4%) │ ────> │ Assign Diaphragm Kit replacement│
│ Amber outline on L-03 card      │       │ Homogenizer: 165 vs 180 bar     │       │ Dispatched to Carlos Ruiz (Maint)│
└─────────────────────────────────┘       └─────────────────────────────────┘       └─────────────────────────────────┘
                                                                                               │
                                                                                               ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│ 6. Speed & Throughput Recovery  │       │ 5. Floor Scrap Ledger Log       │       │ 4. Work Order Completion        │
│ Output restored to 5,400 bph    │ <──── │ Record 256 leaking/underfilled  │ <──── │ Technician replaces diaphragm   │
│ Incident marked "Resolved"      │       │ bottles ($768.00 loss)          │       │ Status: Work Order Verified     │
└─────────────────────────────────┘       └─────────────────────────────────┘       └─────────────────────────────────┘
```

1. **Dashboard & Line Monitoring**:
   - Line 3 alert highlights speed drop to `4,380 units/hr` (-1,020 units/hr deficit) while packaging *UHT Whole Milk 1000ml*.
2. **Investigation Drawer (Slide-Over)**:
   - Root-cause telemetry correlates milk temperature, sterilizer pressure, homogenization efficiency, and filling valve cycle times.
   - Evidence shows milkfat globule coalescence and valve diaphragm fatigue causing dosing lag.
3. **Dispatch & Resolution**:
   - Supervisor dispatches work order ticket directly to maintenance.
   - Once executed, simulated recovery restores line speed back to nominal `5,400 units/hr`.
4. **Scrap Logging in Materials Module**:
   - Supervisor records off-spec dairy batch scrap with pre-filled defect codes (`Off-Spec Viscosity / Checkweigher Rejects`, `Seal Integrity Leakers`).

---

## 4. Implementation Steps (To Execute Upon Approval)

1. **Update `lib/mockData.ts`**:
   - Replace company, facilities, users, products, raw materials, batches, machines, production lines, alerts, investigations, maintenance logs, and downtime records with authentic dairy processing data.
   - Maintain all exact TypeScript types and interface IDs (`line-1`, `line-2`, `line-3`, `line-4`, `inv-line3-hero`, `alt-line3-loss`) so no component bindings or navigation links break.
2. **Synchronize UI Copy & Telemetry**:
   - Update `lib/factoryStore.tsx` initial state bindings, speed recovery numbers (restores to 5,400 units/hr / 90 bpm), and default scrap log presets.
   - Ensure `DashboardModule`, `ProductionModule`, `InvestigationDrawer`, and `MaterialsModule` display realistic dairy units (`cP`, `°C`, `bar`, `L`, `kg`, `bottles`).
3. **Verify App Compilation & Dev Server**:
   - Run `lint_applet` and `compile_applet` to ensure zero compilation or type errors.
