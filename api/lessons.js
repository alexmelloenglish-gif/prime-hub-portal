// api/lessons.js
import { google } from 'googleapis';

const SHEET_ID = process.env.PRIME_SHEETS_ID || process.env.GOOGLE_SHEET_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function getSheets() {
  let credentials;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  } else {
    credentials = {
      client_email: process.env.FIREBASE_CLIENT_EMAIL || process.env.GCP_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
      project_id: process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT_ID
    };
  }
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  return google.sheets({ version: 'v4', auth });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'LESSONS!A:I',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return res.status(200).json({ lessons: [], totalLessons: 0 });
    }

    const headers = rows[0];
    const lessons = rows.slice(1).map(row => {
      const lesson = {};
      headers.forEach((header, index) => {
        lesson[header] = row[index];
      });
      return lesson;
    });

    return res.status(200).json({
      lessons,
      totalLessons: lessons.length,
      lastLesson: lessons[lessons.length - 1]
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
