// api/dashboard-data.js
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    scopes: SCOPES,
  });
  return google.sheets({ version: 'v4', auth });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'LESSONS!A:I',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(200).json({ lessons: [] });
    }

    // Map rows to objects (skipping header if exists)
    const headers = rows[0];
    const lessons = rows.slice(1).map(row => {
      const lesson = {};
      headers.forEach((header, index) => {
        lesson[header] = row[index];
      });
      return lesson;
    });

    return res.status(200).json({ lessons });
  } catch (error) {
    console.error('Dashboard Data Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
