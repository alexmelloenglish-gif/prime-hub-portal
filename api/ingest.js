// api/ingest.js
import { google } from 'googleapis';

const SHEET_ID = process.env.PRIME_SHEETS_ID || process.env.GOOGLE_SHEET_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getSheets() {
  let credentials;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  } else {
    // Fallback to individual Firebase/GCP variables
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

function analyzeTranscript(content) {
  const wordCount = content.split(/\s+/).length;
  const fluencyScore = Math.min(100, Math.floor((wordCount / 500) * 100)); // Simplified logic
  const vocabularyRichness = new Set(content.toLowerCase().match(/\b\w+\b/g)).size / wordCount;
  
  let decision = 'CONTINUE';
  if (wordCount < 50) decision = 'EXCEPTION'; // Too short
  
  return {
    wordCount,
    fluencyScore,
    vocabularyRichness: vocabularyRichness.toFixed(2),
    decision,
    signalSummary: `Fluency: ${fluencyScore}%, Words: ${wordCount}`
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = req.headers['x-pipeline-secret'] || req.headers['x-prime-pipeline-secret'];
  if (secret !== process.env.PRIME_PIPELINE_INGEST_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { transcript_id, file_id, lesson_id, student_email, content, meeting_date } = req.body;
  const jobId = `job-${Date.now()}`;
  
  try {
    const analysis = analyzeTranscript(content || '');
    const sheets = await getSheets();

    // Tab: JOBS
    // job_id | transcript_id | file_id | lesson_id | status | source | created_at | completed_at
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'JOBS!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          jobId, transcript_id, file_id, lesson_id, 
          'COMPLETED', 'GOOGLE_MEET', new Date().toISOString(), new Date().toISOString()
        ]]
      }
    });

    // Tab: LESSONS
    // lesson_id | transcript | evidence | signals | insights | decision | action | memory | created_at
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'LESSONS!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          lesson_id || `L-${Date.now()}`, 
          content,
          JSON.stringify({ wordCount: analysis.wordCount }), 
          analysis.signalSummary, 
          'AI Generated Insight',
          analysis.decision, 
          'Review lesson content', 
          'Initial lesson context',
          meeting_date || new Date().toISOString()
        ]]
      }
    });

    return res.status(200).json({
      ok: true,
      job_id: jobId,
      decision: analysis.decision,
      signals: analysis.signalSummary
    });
  } catch (error) {
    console.error('Pipeline Error:', error);
    return res.status(500).json({ error: 'Internal error', details: error.message });
  }
}
