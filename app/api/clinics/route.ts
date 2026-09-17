import { BigQuery } from '@google-cloud/bigquery';
import { NextResponse } from 'next/server';

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

export async function GET() {
  try {
    const query = `
      WITH LatestInventory AS (
        SELECT 
          phc_id, 
          medicine_id, 
          stock_count, 
          latitude, 
          longitude, 
          timestamp,
          ROW_NUMBER() OVER(PARTITION BY phc_id ORDER BY timestamp DESC) as rn
        FROM \`arogya_net.inventory_logs\`
      )
      SELECT 
        inv.phc_id,
        inv.medicine_id,
        inv.stock_count,
        inv.latitude,
        inv.longitude,
        inv.timestamp,
        TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), inv.timestamp, DAY) as days_offline,
        COALESCE(b.burnout_risk_score, 0) as burnout_risk_score,
        COALESCE(b.active_staff, 1) as active_staff
      FROM LatestInventory inv
      LEFT JOIN \`arogya_net.phc_burnout_scores\` b ON inv.phc_id = b.phc_id
      WHERE inv.rn = 1;
    `;

    const [rows] = await bigquery.query({ query });

    const formattedData = rows.map((row: any) => {
      let status = 'ACTIVE';
      if (row.days_offline > 14) {
        status = 'BLACKOUT';
      } else if (row.days_offline >= 1) {
        status = 'PREDICTIVE';
      }

      return {
        id: row.phc_id,
        name: `${row.phc_id} Health Center`,
        coords: [row.latitude, row.longitude],
        stock: row.stock_count,
        daysOffline: row.days_offline,
        status: status,
        burnoutScore: row.burnout_risk_score,
        staffPercentage: Math.min(100, Math.round((row.active_staff / 5) * 100)),
        timestamp: row.timestamp?.value || new Date().toISOString(),
      };
    });

    return NextResponse.json({ clinics: formattedData });
  } catch (error) {
    console.error('BigQuery Fetch Error (falling back to mock data):', error);

    return NextResponse.json({
      clinics: [
        {
          id: 'PHC_101',
          name: 'PHC 101 Panvel',
          coords: [19.076, 72.8777],
          stock: 150,
          daysOffline: 0,
          status: 'ACTIVE',
          burnoutScore: 4.8,
          staffPercentage: 85,
        },
        {
          id: 'PHC_102',
          name: 'PHC 102 Taloja',
          coords: [19.12, 72.91],
          stock: 12,
          daysOffline: 5,
          status: 'PREDICTIVE',
          burnoutScore: 26.8,
          staffPercentage: 40,
        },
        {
          id: 'PHC_103',
          name: 'PHC 103 Chembur',
          coords: [19.2, 72.85],
          stock: 300,
          daysOffline: 0,
          status: 'ACTIVE',
          burnoutScore: 3.2,
          staffPercentage: 95,
        },
        {
          id: 'PHC_104',
          name: 'PHC 104 Uran',
          coords: [19.01, 72.82],
          stock: 8,
          daysOffline: 18,
          status: 'BLACKOUT',
          burnoutScore: 43.4,
          staffPercentage: 20,
        },
      ],
    });
  }
}