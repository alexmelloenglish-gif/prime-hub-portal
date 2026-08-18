// api/learning-engine.js
import { execSync } from 'child_process';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Validate Secret
  const secret = req.headers['x-prime-pipeline-secret'] || req.headers['x-pipeline-secret'];
  const expectedSecret = process.env.PRIME_PIPELINE_INGEST_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    job_id, transcript_id, file_id, lesson_id,
    status, source, transcript_text,
    evidence, signals, insights, decision, action, memory
  } = req.body;

  try {
    // Tab: JOBS
    const jobRow = [
      job_id || `job-${Date.now()}`, 
      transcript_id || '', 
      file_id || '', 
      lesson_id || '',
      status || 'COMPLETED', 
      source || 'GOOGLE_MEET', 
      new Date().toISOString(),
      status === 'COMPLETED' ? new Date().toISOString() : ''
    ];

    const jobParams = JSON.stringify({
      spreadsheetId: SHEET_ID,
      range: 'JOBS!A:H',
      valueInputOption: 'USER_ENTERED'
    });
    
    const jobJson = JSON.stringify({ values: [jobRow] });
    
    // Execute gws command via shell
    // Note: This requires gws to be installed in the Vercel environment, 
    // which is not true. This was a conceptual error.
    // In a real Vercel environment, we MUST use the googleapis library with a Service Account.
    
    return res.status(501).json({ error: 'Not Implemented: Vercel environment lacks GWS CLI. Service Account required.' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
