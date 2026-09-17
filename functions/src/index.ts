import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { BigQuery } from "@google-cloud/bigquery";

initializeApp();

const bigquery = new BigQuery();

const DATASET_ID = "health_resource_data";

// --------------------------------------------------
// INVENTORY LOGS
// Firestore: inventory_logs/{logId}
// Trigger: When a new inventory log is created
// --------------------------------------------------

export const inventoryLogToBigQuery = onDocumentCreated(
  "inventory_logs/{logId}",
  async (event) => {
    const data = event.data?.data();

    if (!data) {
      console.log("No inventory data found.");
      return;
    }

    await bigquery
      .dataset(DATASET_ID)
      .table("inventory_logs")
      .insert([
        {
          phcId: data.phcId,
          district: data.district,
          medicineId: data.medicineId,
          medicineName: data.medicineName,
          quantityChange: data.quantityChange,
          quantityAfter: data.quantityAfter,
          timestamp: data.timestamp,
          source: data.source || "manual",
          syncStatus: data.syncStatus || "synced",
        },
      ]);

    console.log("Inventory log sent to BigQuery.");
  }
);

// --------------------------------------------------
// STAFF PRESENCE
// Firestore: staff_presence/{logId}
// Trigger: When a new staff presence log is created
// --------------------------------------------------

export const staffPresenceToBigQuery = onDocumentCreated(
  "staff_presence/{logId}",
  async (event) => {
    const data = event.data?.data();

    if (!data) {
      console.log("No staff data found.");
      return;
    }

    await bigquery
      .dataset(DATASET_ID)
      .table("staff_presence")
      .insert([
        {
          phcId: data.phcId,
          staffId: data.staffId,
          staffName: data.staffName,
          role: data.role,
          status: data.status,
          timestamp: data.timestamp,
        },
      ]);

    console.log("Staff presence sent to BigQuery.");
  }
);

// --------------------------------------------------
// PATIENT FOOTFALL
// Firestore: patient_footfall/{logId}
// Trigger: Whenever the daily footfall document is updated
// --------------------------------------------------

export const patientFootfallToBigQuery = onDocumentUpdated(
  "patient_footfall/{logId}",
  async (event) => {
    const data = event.data?.after.data();

    if (!data) {
      console.log("No updated footfall data found.");
      return;
    }

    await bigquery
      .dataset(DATASET_ID)
      .table("patient_footfall")
      .insert([
        {
          phcId: data.phcId,
          date: data.date,
          patientCount: data.patientCount,
          timestamp: data.timestamp,
        },
      ]);

    console.log("Updated patient footfall sent to BigQuery.");
  }
);