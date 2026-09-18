export interface CriticalMedicine {
  name: string;
  category: string;
  currentStock: number;
  emergencyLimit: number;
  unit: string;
  isBelowLimit: boolean;
}

export interface StorageUnit {
  id: string;
  name: string;
  type: "Cold Chain (Vaccines/Insulin)" | "Pharmaceutical Warehouse" | "Emergency Oxygen Bank";
  temperatureCelsius: number;
  targetTempCelsius: number;
  capacityPercentage: number;
  status: "Optimal" | "Warning" | "Critical Outage";
}

export interface ConsignmentRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  medicines: { name: string; quantity: number; unit: string }[];
  urgency: "Immediate Critical" | "High Priority" | "Routine";
  status: "Pending Dispatch" | "In Transit" | "Delivered";
  requestedAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  type: "Government District Hospital" | "Sub-District Health Center" | "Rural Primary Center" | "Specialized Care Center";
  district: string;
  address: string;
  phone: string;
  coordinates: [number, number]; // [lat, lng]
  status: "Active Sync" | "Predictive Stock" | "Blackout";
  
  // Storage & Telemetry
  storageUnits: StorageUnit[];
  criticalMedicines: CriticalMedicine[];
  
  // Infrastructure
  icuBedsAvailable: number;
  icuBedsTotal: number;
  oxygenBedsAvailable: number;
  oxygenBedsTotal: number;
  generalBedsAvailable: number;
  generalBedsTotal: number;
  ventilatorsAvailable: number;
  
  // Human Resources & Treatments
  onDutyDoctors: number;
  onDutyNurses: number;
  availableSpecialties: string[];
  
  // Smart Recommendation Index (0 - 100)
  favourabilityScore: number;
  favourabilityReason: string;
}

export const LOCATION_PRESETS = [
  { id: "loc-panvel", name: "Panvel & Raigad Belt", district: "Raigad", coordinates: [18.9894, 73.1175] as [number, number] },
  { id: "loc-mumbai", name: "Mumbai & MMR Metro", district: "Mumbai", coordinates: [18.9690, 72.8210] as [number, number] },
  { id: "loc-kharghar", name: "Kharghar & Kamothe", district: "Raigad", coordinates: [19.0400, 73.0680] as [number, number] },
  { id: "loc-belapur", name: "CBD Belapur & Nerul", district: "Navi Mumbai", coordinates: [19.0260, 73.0280] as [number, number] },
  { id: "loc-thane", name: "Thane & Kalyan", district: "Thane", coordinates: [19.2180, 72.9780] as [number, number] },
  { id: "loc-pune", name: "Pune Metro Region", district: "Pune", coordinates: [18.5204, 73.8567] as [number, number] },
  { id: "loc-nashik", name: "Nashik & North Maharashtra", district: "Nashik", coordinates: [19.9975, 73.7898] as [number, number] },
  { id: "loc-aurangabad", name: "Chhatrapati Sambhajinagar (Aurangabad)", district: "Chhatrapati Sambhajinagar", coordinates: [19.8762, 75.3433] as [number, number] },
  { id: "loc-nagpur", name: "Nagpur & Vidarbha Region", district: "Nagpur", coordinates: [21.1458, 79.0882] as [number, number] },
  { id: "loc-kolhapur", name: "Kolhapur & South Maharashtra", district: "Kolhapur", coordinates: [16.7050, 74.2433] as [number, number] },
  { id: "loc-solapur", name: "Solapur Region", district: "Solapur", coordinates: [17.6599, 75.9064] as [number, number] },
  { id: "loc-alibag", name: "Alibag & Coastal Konkan", district: "Raigad", coordinates: [18.6410, 72.8720] as [number, number] },
  { id: "loc-ratnagiri", name: "Ratnagiri Coastal Belt", district: "Ratnagiri", coordinates: [16.9902, 73.3120] as [number, number] },
];

export const MAHARASHTRA_CITIES: Record<string, { name: string; district: string; coordinates: [number, number] }> = {
  panvel: { name: "Panvel", district: "Raigad", coordinates: [18.9894, 73.1175] },
  mumbai: { name: "Mumbai Central", district: "Mumbai", coordinates: [18.9690, 72.8210] },
  pune: { name: "Pune", district: "Pune", coordinates: [18.5204, 73.8567] },
  nashik: { name: "Nashik", district: "Nashik", coordinates: [19.9975, 73.7898] },
  nagpur: { name: "Nagpur", district: "Nagpur", coordinates: [21.1458, 79.0882] },
  aurangabad: { name: "Chhatrapati Sambhajinagar (Aurangabad)", district: "Chhatrapati Sambhajinagar", coordinates: [19.8762, 75.3433] },
  sambhajinagar: { name: "Chhatrapati Sambhajinagar", district: "Chhatrapati Sambhajinagar", coordinates: [19.8762, 75.3433] },
  thane: { name: "Thane", district: "Thane", coordinates: [19.2180, 72.9780] },
  kolhapur: { name: "Kolhapur", district: "Kolhapur", coordinates: [16.7050, 74.2433] },
  solapur: { name: "Solapur", district: "Solapur", coordinates: [17.6599, 75.9064] },
  alibag: { name: "Alibag", district: "Raigad", coordinates: [18.6410, 72.8720] },
  ratnagiri: { name: "Ratnagiri", district: "Ratnagiri", coordinates: [16.9902, 73.3120] },
  nanded: { name: "Nanded", district: "Nanded", coordinates: [19.1383, 77.3210] },
  amravati: { name: "Amravati", district: "Amravati", coordinates: [20.9374, 77.7796] },
  sangli: { name: "Sangli", district: "Sangli", coordinates: [16.8524, 74.5815] },
  satara: { name: "Satara", district: "Satara", coordinates: [17.6805, 74.0183] },
  jalgaon: { name: "Jalgaon", district: "Jalgaon", coordinates: [21.0077, 75.5626] },
  dhule: { name: "Dhule", district: "Dhule", coordinates: [20.9042, 74.7749] },
  latur: { name: "Latur", district: "Latur", coordinates: [18.4088, 76.5604] },
  chandrapur: { name: "Chandrapur", district: "Chandrapur", coordinates: [19.9615, 79.2961] },
  kharghar: { name: "Kharghar", district: "Raigad", coordinates: [19.0400, 73.0680] },
  taloja: { name: "Taloja", district: "Raigad", coordinates: [19.0550, 73.1120] },
  uran: { name: "Uran", district: "Raigad", coordinates: [18.8870, 72.9340] },
  belapur: { name: "CBD Belapur", district: "Navi Mumbai", coordinates: [19.0260, 73.0280] },
  nerul: { name: "Nerul", district: "Navi Mumbai", coordinates: [19.0330, 73.0160] },
  kalyan: { name: "Kalyan-Dombivli", district: "Thane", coordinates: [19.2403, 73.1305] },
};

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "hosp-01",
    name: "Panvel Sub-District Civil Hospital",
    type: "Government District Hospital",
    district: "Raigad",
    address: "Line Ali, Old Panvel, Navi Mumbai, Maharashtra 410206",
    phone: "+91 22 2745 2333",
    coordinates: [18.9950, 73.1120],
    status: "Active Sync",
    storageUnits: [
      {
        id: "st-01",
        name: "Main Vaccine Cold Chain A",
        type: "Cold Chain (Vaccines/Insulin)",
        temperatureCelsius: 3.8,
        targetTempCelsius: 4.0,
        capacityPercentage: 82,
        status: "Optimal",
      },
      {
        id: "st-02",
        name: "Emergency O2 Cylinders Depot",
        type: "Emergency Oxygen Bank",
        temperatureCelsius: 24.0,
        targetTempCelsius: 25.0,
        capacityPercentage: 75,
        status: "Optimal",
      },
    ],
    criticalMedicines: [
      { name: "Paracetamol 500mg", category: "Analgesic", currentStock: 4500, emergencyLimit: 1000, unit: "tablets", isBelowLimit: false },
      { name: "Anti-Snake Venom (ASV)", category: "Antivenom", currentStock: 120, emergencyLimit: 30, unit: "vials", isBelowLimit: false },
      { name: "Medical Oxygen Cylinders", category: "Respiratory", currentStock: 90, emergencyLimit: 25, unit: "cylinders", isBelowLimit: false },
      { name: "Human Insulin 100IU", category: "Endocrine", currentStock: 210, emergencyLimit: 50, unit: "vials", isBelowLimit: false },
      { name: "Rabies Vaccine (PVRV)", category: "Vaccine", currentStock: 180, emergencyLimit: 40, unit: "doses", isBelowLimit: false },
    ],
    icuBedsAvailable: 12,
    icuBedsTotal: 20,
    oxygenBedsAvailable: 35,
    oxygenBedsTotal: 50,
    generalBedsAvailable: 65,
    generalBedsTotal: 100,
    ventilatorsAvailable: 8,
    onDutyDoctors: 18,
    onDutyNurses: 42,
    availableSpecialties: ["Emergency & Trauma", "Pediatrics", "General Surgery", "Cardiology", "Orthopedics", "Rabies Vaccination"],
    favourabilityScore: 94,
    favourabilityReason: "High doctor count, 85%+ medicine stock, 12 ICU beds open.",
  },
  {
    id: "hosp-02",
    name: "New Panvel Community Health Depot",
    type: "Sub-District Health Center",
    district: "Raigad",
    address: "Sector 11, New Panvel East, Navi Mumbai 410206",
    phone: "+91 22 2748 1199",
    coordinates: [18.9840, 73.1250],
    status: "Predictive Stock",
    storageUnits: [
      {
        id: "st-03",
        name: "Regional Vaccine Storage B",
        type: "Cold Chain (Vaccines/Insulin)",
        temperatureCelsius: 7.2,
        targetTempCelsius: 4.0,
        capacityPercentage: 35,
        status: "Warning",
      },
      {
        id: "st-04",
        name: "General Pharma Bay",
        type: "Pharmaceutical Warehouse",
        temperatureCelsius: 26.5,
        targetTempCelsius: 22.0,
        capacityPercentage: 28,
        status: "Warning",
      },
    ],
    criticalMedicines: [
      { name: "Anti-Snake Venom (ASV)", category: "Antivenom", currentStock: 8, emergencyLimit: 20, unit: "vials", isBelowLimit: true },
      { name: "Atropine Injection 0.6mg", category: "Emergency", currentStock: 14, emergencyLimit: 40, unit: "ampoules", isBelowLimit: true },
      { name: "Oral Rehydration Salts (ORS)", category: "Essential", currentStock: 600, emergencyLimit: 200, unit: "sachets", isBelowLimit: false },
      { name: "Tetanus Toxoid Vaccine", category: "Vaccine", currentStock: 25, emergencyLimit: 50, unit: "doses", isBelowLimit: true },
      { name: "Amoxicillin 500mg", category: "Antibiotic", currentStock: 850, emergencyLimit: 300, unit: "capsules", isBelowLimit: false },
    ],
    icuBedsAvailable: 2,
    icuBedsTotal: 8,
    oxygenBedsAvailable: 10,
    oxygenBedsTotal: 25,
    generalBedsAvailable: 22,
    generalBedsTotal: 40,
    ventilatorsAvailable: 1,
    onDutyDoctors: 7,
    onDutyNurses: 16,
    availableSpecialties: ["General Medicine", "Pediatrics", "Maternity"],
    favourabilityScore: 68,
    favourabilityReason: "Limited ICU capacity. Predictive stock depletion for ASV & Atropine.",
  },
  {
    id: "hosp-03",
    name: "Khandeshwar Rural Health Unit",
    type: "Rural Primary Center",
    district: "Raigad",
    address: "Near Khandeshwar Station Road, Kamothe, Maharashtra 410209",
    phone: "+91 22 2742 8811",
    coordinates: [18.9780, 73.1050],
    status: "Blackout",
    storageUnits: [
      {
        id: "st-05",
        name: "Solar Backup Cold Box",
        type: "Cold Chain (Vaccines/Insulin)",
        temperatureCelsius: 12.4,
        targetTempCelsius: 4.0,
        capacityPercentage: 15,
        status: "Critical Outage",
      },
    ],
    criticalMedicines: [
      { name: "Medical Oxygen Cylinders", category: "Respiratory", currentStock: 3, emergencyLimit: 15, unit: "cylinders", isBelowLimit: true },
      { name: "Adrenaline 1mg/ml", category: "Emergency", currentStock: 5, emergencyLimit: 25, unit: "ampoules", isBelowLimit: true },
      { name: "Paracetamol IV Infusion", category: "Analgesic", currentStock: 12, emergencyLimit: 60, unit: "bottles", isBelowLimit: true },
    ],
    icuBedsAvailable: 0,
    icuBedsTotal: 4,
    oxygenBedsAvailable: 1,
    oxygenBedsTotal: 12,
    generalBedsAvailable: 6,
    generalBedsTotal: 30,
    ventilatorsAvailable: 0,
    onDutyDoctors: 3,
    onDutyNurses: 8,
    availableSpecialties: ["First Aid & Basic Emergency", "General OPD"],
    favourabilityScore: 35,
    favourabilityReason: "GRID BLACKOUT ACTIVE. 0 ICU beds open. Emergency consignment requested.",
  },
  {
    id: "hosp-04",
    name: "Kharghar Tertiary Trauma Center",
    type: "Specialized Care Center",
    district: "Raigad",
    address: "Sector 34, Kharghar, Navi Mumbai 410210",
    phone: "+91 22 2774 9000",
    coordinates: [19.0400, 73.0680],
    status: "Active Sync",
    storageUnits: [
      {
        id: "st-06",
        name: "Trauma Emergency Med Bank",
        type: "Pharmaceutical Warehouse",
        temperatureCelsius: 21.0,
        targetTempCelsius: 21.0,
        capacityPercentage: 90,
        status: "Optimal",
      },
      {
        id: "st-07",
        name: "Cryo-Storage Unit 1",
        type: "Cold Chain (Vaccines/Insulin)",
        temperatureCelsius: -18.0,
        targetTempCelsius: -20.0,
        capacityPercentage: 88,
        status: "Optimal",
      },
    ],
    criticalMedicines: [
      { name: "Propofol 1% Injection", category: "Anesthetic", currentStock: 300, emergencyLimit: 50, unit: "vials", isBelowLimit: false },
      { name: "Whole Blood & Plasma", category: "Blood Bank", currentStock: 140, emergencyLimit: 40, unit: "units", isBelowLimit: false },
      { name: "Medical Oxygen Cylinders", category: "Respiratory", currentStock: 180, emergencyLimit: 40, unit: "cylinders", isBelowLimit: false },
      { name: "Dialysis Fluid & Filters", category: "Renal", currentStock: 95, emergencyLimit: 20, unit: "kits", isBelowLimit: false },
    ],
    icuBedsAvailable: 18,
    icuBedsTotal: 30,
    oxygenBedsAvailable: 40,
    oxygenBedsTotal: 60,
    generalBedsAvailable: 85,
    generalBedsTotal: 120,
    ventilatorsAvailable: 14,
    onDutyDoctors: 26,
    onDutyNurses: 65,
    availableSpecialties: ["Trauma Surgery", "Neurosurgery", "Cardiology", "ICU Intensive Care", "Orthopedics", "Dialysis Unit"],
    favourabilityScore: 98,
    favourabilityReason: "Top recommendation! 18 ICU beds, 14 ventilators, 26 specialist doctors.",
  },
  {
    id: "hosp-05",
    name: "Taloja Industrial Belt PHC",
    type: "Rural Primary Center",
    district: "Raigad",
    address: "MIDC Industrial Area, Taloja, Navi Mumbai 410208",
    phone: "+91 22 2741 0022",
    coordinates: [19.0550, 73.1120],
    status: "Predictive Stock",
    storageUnits: [
      {
        id: "st-08",
        name: "Taloja Cold Chain B",
        type: "Cold Chain (Vaccines/Insulin)",
        temperatureCelsius: 6.8,
        targetTempCelsius: 4.0,
        capacityPercentage: 42,
        status: "Warning",
      },
    ],
    criticalMedicines: [
      { name: "Anti-Snake Venom (ASV)", category: "Antivenom", currentStock: 18, emergencyLimit: 25, unit: "vials", isBelowLimit: true },
      { name: "Burn Ointment (Silver Sulfadiazine)", category: "Trauma", currentStock: 120, emergencyLimit: 30, unit: "tubes", isBelowLimit: false },
      { name: "Tetanus Toxoid Vaccine", category: "Vaccine", currentStock: 80, emergencyLimit: 50, unit: "doses", isBelowLimit: false },
    ],
    icuBedsAvailable: 4,
    icuBedsTotal: 10,
    oxygenBedsAvailable: 12,
    oxygenBedsTotal: 20,
    generalBedsAvailable: 25,
    generalBedsTotal: 50,
    ventilatorsAvailable: 2,
    onDutyDoctors: 8,
    onDutyNurses: 18,
    availableSpecialties: ["Industrial Trauma", "Burn Care", "Emergency & Trauma", "General OPD"],
    favourabilityScore: 74,
    favourabilityReason: "Industrial trauma ready. 4 ICU beds open. ASV stock monitoring active.",
  },
  {
    id: "hosp-06",
    name: "Uran Coastal Dockyard Medical Unit",
    type: "Sub-District Health Center",
    district: "Raigad",
    address: "JNPT Road, Uran Coastal Belt, Raigad 400702",
    phone: "+91 22 2722 1400",
    coordinates: [18.8870, 72.9340],
    status: "Active Sync",
    storageUnits: [
      {
        id: "st-09",
        name: "Maritime Emergency Storage",
        type: "Pharmaceutical Warehouse",
        temperatureCelsius: 22.0,
        targetTempCelsius: 22.0,
        capacityPercentage: 78,
        status: "Optimal",
      },
    ],
    criticalMedicines: [
      { name: "Anti-Snake Venom (ASV)", category: "Antivenom", currentStock: 65, emergencyLimit: 20, unit: "vials", isBelowLimit: false },
      { name: "Rabies Vaccine (PVRV)", category: "Vaccine", currentStock: 110, emergencyLimit: 30, unit: "doses", isBelowLimit: false },
      { name: "Paracetamol 500mg", category: "Analgesic", currentStock: 3200, emergencyLimit: 500, unit: "tablets", isBelowLimit: false },
    ],
    icuBedsAvailable: 6,
    icuBedsTotal: 12,
    oxygenBedsAvailable: 18,
    oxygenBedsTotal: 30,
    generalBedsAvailable: 40,
    generalBedsTotal: 60,
    ventilatorsAvailable: 4,
    onDutyDoctors: 10,
    onDutyNurses: 24,
    availableSpecialties: ["Maritime Emergency", "General Surgery", "Rabies Vaccination", "Pediatrics"],
    favourabilityScore: 86,
    favourabilityReason: "Strong coastal emergency readiness. 6 ICU beds, high ASV reserves.",
  },
  {
    id: "hosp-07",
    name: "CBD Belapur Super-Specialty Medical Center",
    type: "Specialized Care Center",
    district: "Thane/Navi Mumbai",
    address: "Sector 15, CBD Belapur, Navi Mumbai 400614",
    phone: "+91 22 2757 8800",
    coordinates: [19.0200, 73.0400],
    status: "Active Sync",
    storageUnits: [
      {
        id: "st-10",
        name: "Belapur Apex Cold Storage",
        type: "Cold Chain (Vaccines/Insulin)",
        temperatureCelsius: 3.5,
        targetTempCelsius: 4.0,
        capacityPercentage: 92,
        status: "Optimal",
      },
    ],
    criticalMedicines: [
      { name: "Human Insulin 100IU", category: "Endocrine", currentStock: 450, emergencyLimit: 60, unit: "vials", isBelowLimit: false },
      { name: "Propofol 1% Injection", category: "Anesthetic", currentStock: 250, emergencyLimit: 40, unit: "vials", isBelowLimit: false },
      { name: "Whole Blood & Plasma", category: "Blood Bank", currentStock: 200, emergencyLimit: 50, unit: "units", isBelowLimit: false },
      { name: "Chemotherapy Infusion Sets", category: "Oncology", currentStock: 80, emergencyLimit: 15, unit: "kits", isBelowLimit: false },
    ],
    icuBedsAvailable: 22,
    icuBedsTotal: 35,
    oxygenBedsAvailable: 45,
    oxygenBedsTotal: 70,
    generalBedsAvailable: 95,
    generalBedsTotal: 150,
    ventilatorsAvailable: 16,
    onDutyDoctors: 32,
    onDutyNurses: 80,
    availableSpecialties: ["Cardiology", "Oncology", "Neurosurgery", "Radiology / MRI Scan", "ICU Intensive Care"],
    favourabilityScore: 97,
    favourabilityReason: "Premier tertiary hub! 22 ICU beds open, 32 doctors on duty, full blood bank.",
  },
  {
    id: "hosp-08",
    name: "Nerul Municipal General Hospital",
    type: "Government District Hospital",
    district: "Thane/Navi Mumbai",
    address: "Sector 15, Nerul West, Navi Mumbai 400706",
    phone: "+91 22 2770 1234",
    coordinates: [19.0330, 73.0160],
    status: "Active Sync",
    storageUnits: [
      {
        id: "st-11",
        name: "Nerul Central Depot",
        type: "Pharmaceutical Warehouse",
        temperatureCelsius: 20.5,
        targetTempCelsius: 21.0,
        capacityPercentage: 85,
        status: "Optimal",
      },
    ],
    criticalMedicines: [
      { name: "Paracetamol 500mg", category: "Analgesic", currentStock: 5200, emergencyLimit: 1000, unit: "tablets", isBelowLimit: false },
      { name: "Rabies Immunoglobulin (RIG)", category: "Antivenom", currentStock: 45, emergencyLimit: 10, unit: "vials", isBelowLimit: false },
      { name: "Ciprofloxacin 500mg", category: "Antibiotic", currentStock: 1200, emergencyLimit: 250, unit: "tablets", isBelowLimit: false },
    ],
    icuBedsAvailable: 15,
    icuBedsTotal: 25,
    oxygenBedsAvailable: 30,
    oxygenBedsTotal: 50,
    generalBedsAvailable: 70,
    generalBedsTotal: 110,
    ventilatorsAvailable: 10,
    onDutyDoctors: 20,
    onDutyNurses: 50,
    availableSpecialties: ["Neonatal ICU", "Pediatrics", "Maternity", "General Surgery", "Rabies Vaccination"],
    favourabilityScore: 92,
    favourabilityReason: "Excellent municipal hospital. 15 ICU beds, strong maternity & NICU care.",
  },
  {
    id: "hosp-09",
    name: "Alibag District Headquarters Hospital",
    type: "Government District Hospital",
    district: "Raigad",
    address: "Civil Hospital Road, Alibag, Maharashtra 402201",
    phone: "+91 2141 222 080",
    coordinates: [18.6410, 72.8720],
    status: "Active Sync",
    storageUnits: [
      {
        id: "st-12",
        name: "Coastal District Vaccine Bank",
        type: "Cold Chain (Vaccines/Insulin)",
        temperatureCelsius: 4.1,
        targetTempCelsius: 4.0,
        capacityPercentage: 88,
        status: "Optimal",
      },
    ],
    criticalMedicines: [
      { name: "Anti-Snake Venom (ASV)", category: "Antivenom", currentStock: 150, emergencyLimit: 30, unit: "vials", isBelowLimit: false },
      { name: "Human Insulin 100IU", category: "Endocrine", currentStock: 300, emergencyLimit: 50, unit: "vials", isBelowLimit: false },
      { name: "Medical Oxygen Cylinders", category: "Respiratory", currentStock: 110, emergencyLimit: 30, unit: "cylinders", isBelowLimit: false },
      { name: "Rabies Vaccine (PVRV)", category: "Vaccine", currentStock: 220, emergencyLimit: 40, unit: "doses", isBelowLimit: false },
    ],
    icuBedsAvailable: 14,
    icuBedsTotal: 24,
    oxygenBedsAvailable: 38,
    oxygenBedsTotal: 60,
    generalBedsAvailable: 80,
    generalBedsTotal: 130,
    ventilatorsAvailable: 9,
    onDutyDoctors: 22,
    onDutyNurses: 55,
    availableSpecialties: ["Emergency & Trauma", "Antivenom Treatment", "Cardiology", "General Surgery", "Pediatrics"],
    favourabilityScore: 95,
    favourabilityReason: "Apex Raigad hospital! 150 ASV vials, 14 ICU beds, full trauma team.",
  },
  {
    id: "hosp-10",
    name: "Pen Sub-Divisional Health Unit",
    type: "Sub-District Health Center",
    district: "Raigad",
    address: "NH-66 Highway Junction, Pen, Maharashtra 402107",
    phone: "+91 2143 252 033",
    coordinates: [18.7890, 73.0950],
    status: "Predictive Stock",
    storageUnits: [
      {
        id: "st-13",
        name: "Highway Emergency Pharma Box",
        type: "Pharmaceutical Warehouse",
        temperatureCelsius: 24.5,
        targetTempCelsius: 22.0,
        capacityPercentage: 40,
        status: "Warning",
      },
    ],
    criticalMedicines: [
      { name: "Paracetamol 500mg", category: "Analgesic", currentStock: 1800, emergencyLimit: 400, unit: "tablets", isBelowLimit: false },
      { name: "Anti-Snake Venom (ASV)", category: "Antivenom", currentStock: 12, emergencyLimit: 25, unit: "vials", isBelowLimit: true },
      { name: "Medical Oxygen Cylinders", category: "Respiratory", currentStock: 8, emergencyLimit: 20, unit: "cylinders", isBelowLimit: true },
    ],
    icuBedsAvailable: 3,
    icuBedsTotal: 8,
    oxygenBedsAvailable: 8,
    oxygenBedsTotal: 20,
    generalBedsAvailable: 30,
    generalBedsTotal: 50,
    ventilatorsAvailable: 2,
    onDutyDoctors: 6,
    onDutyNurses: 14,
    availableSpecialties: ["Highway Emergency", "First Aid", "General OPD"],
    favourabilityScore: 71,
    favourabilityReason: "Strategic highway location. Low ASV & Oxygen stock alerts active.",
  },
  {
    id: "hosp-11",
    name: "Thane Regional Apex Hospital",
    type: "Government District Hospital",
    district: "Thane",
    address: "Eastern Express Highway, Thane West, Maharashtra 400601",
    phone: "+91 22 2534 5500",
    coordinates: [19.2180, 72.9780],
    status: "Active Sync",
    storageUnits: [
      {
        id: "st-14",
        name: "Thane Regional Cryo Depot",
        type: "Cold Chain (Vaccines/Insulin)",
        temperatureCelsius: 3.2,
        targetTempCelsius: 4.0,
        capacityPercentage: 94,
        status: "Optimal",
      },
    ],
    criticalMedicines: [
      { name: "Propofol 1% Injection", category: "Anesthetic", currentStock: 500, emergencyLimit: 80, unit: "vials", isBelowLimit: false },
      { name: "Medical Oxygen Cylinders", category: "Respiratory", currentStock: 300, emergencyLimit: 60, unit: "cylinders", isBelowLimit: false },
      { name: "Whole Blood & Plasma", category: "Blood Bank", currentStock: 250, emergencyLimit: 50, unit: "units", isBelowLimit: false },
      { name: "Rabies Immunoglobulin (RIG)", category: "Antivenom", currentStock: 80, emergencyLimit: 15, unit: "vials", isBelowLimit: false },
    ],
    icuBedsAvailable: 28,
    icuBedsTotal: 45,
    oxygenBedsAvailable: 60,
    oxygenBedsTotal: 90,
    generalBedsAvailable: 120,
    generalBedsTotal: 200,
    ventilatorsAvailable: 20,
    onDutyDoctors: 40,
    onDutyNurses: 90,
    availableSpecialties: ["Trauma Surgery", "Cardiology", "Neurosurgery", "Dialysis Unit", "Radiology / MRI Scan", "ICU Intensive Care"],
    favourabilityScore: 99,
    favourabilityReason: "Top regional apex facility! 28 ICU beds, 20 ventilators, 40 doctors on duty.",
  },
  {
    id: "hosp-12",
    name: "Pune Rural Lifeline Center",
    type: "Government District Hospital",
    district: "Pune",
    address: "Sassoon Road, Near Pune Station, Pune, Maharashtra 411001",
    phone: "+91 20 2612 8000",
    coordinates: [18.5204, 73.8567],
    status: "Active Sync",
    storageUnits: [
      {
        id: "st-15",
        name: "Pune Lifeline Cold Storage",
        type: "Cold Chain (Vaccines/Insulin)",
        temperatureCelsius: 3.9,
        targetTempCelsius: 4.0,
        capacityPercentage: 90,
        status: "Optimal",
      },
    ],
    criticalMedicines: [
      { name: "Human Insulin 100IU", category: "Endocrine", currentStock: 600, emergencyLimit: 100, unit: "vials", isBelowLimit: false },
      { name: "Anti-Snake Venom (ASV)", category: "Antivenom", currentStock: 200, emergencyLimit: 40, unit: "vials", isBelowLimit: false },
      { name: "Medical Oxygen Cylinders", category: "Respiratory", currentStock: 250, emergencyLimit: 50, unit: "cylinders", isBelowLimit: false },
      { name: "Rabies Vaccine (PVRV)", category: "Vaccine", currentStock: 300, emergencyLimit: 50, unit: "doses", isBelowLimit: false },
    ],
    icuBedsAvailable: 25,
    icuBedsTotal: 40,
    oxygenBedsAvailable: 55,
    oxygenBedsTotal: 80,
    generalBedsAvailable: 110,
    generalBedsTotal: 180,
    ventilatorsAvailable: 18,
    onDutyDoctors: 35,
    onDutyNurses: 85,
    availableSpecialties: ["Emergency & Trauma", "Cardiology", "Pediatrics", "Oncology", "Neurosurgery", "Dialysis Unit"],
    favourabilityScore: 96,
    favourabilityReason: "Major Pune regional hub! 25 ICU beds, 200 ASV vials, full multi-specialty unit.",
  },
];

export const INITIAL_CONSIGNMENTS: ConsignmentRequest[] = [
  {
    id: "csg-101",
    hospitalId: "hosp-03",
    hospitalName: "Khandeshwar Rural Health Unit",
    medicines: [
      { name: "Medical Oxygen Cylinders", quantity: 20, unit: "cylinders" },
      { name: "Adrenaline 1mg/ml", quantity: 50, unit: "ampoules" },
      { name: "Paracetamol IV Infusion", quantity: 100, unit: "bottles" },
    ],
    urgency: "Immediate Critical",
    status: "Pending Dispatch",
    requestedAt: "10 minutes ago",
  },
  {
    id: "csg-102",
    hospitalId: "hosp-02",
    hospitalName: "New Panvel Community Health Depot",
    medicines: [
      { name: "Anti-Snake Venom (ASV)", quantity: 30, unit: "vials" },
      { name: "Atropine Injection 0.6mg", quantity: 60, unit: "ampoules" },
    ],
    urgency: "High Priority",
    status: "Pending Dispatch",
    requestedAt: "45 minutes ago",
  },
];

