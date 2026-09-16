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
    availableSpecialties: ["Emergency & Trauma", "Pediatrics", "General Surgery", "Cardiology", "Orthopedics"],
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
    availableSpecialties: ["Trauma Surgery", "Neurosurgery", "Cardiology", "ICU Intensive Care", "Orthopedics"],
    favourabilityScore: 98,
    favourabilityReason: "Top recommendation! 18 ICU beds, 14 ventilators, 26 specialist doctors.",
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
