import { getFirebaseFirestore, isFirebaseConfigured } from '../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = req.headers['x-prime-pipeline-secret'] || req.headers['x-pipeline-secret'];
  const expectedSecret = process.env.PRIME_PIPELINE_INGEST_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { transcript_id, file_id, lesson_id, studentEmail, content, metadata } = req.body;

    if (!studentEmail || !content) {
      return res.status(400).json({ error: 'studentEmail and content are required' });
    }

    // Persistência no Firestore se configurado
    let persistenceStatus = 'skipped';
    if (isFirebaseConfigured) {
      const db = getFirebaseFirestore();
      const docRef = db.collection('transcripts').doc(transcript_id || `ts-${Date.now()}`);
      await docRef.set({
        studentEmail: studentEmail.toLowerCase(),
        lessonId: lesson_id || 'unassigned',
        fileId: file_id || null,
        content,
        metadata: metadata || {},
        receivedAt: new Date().toISOString(),
        status: 'PENDING_AI_PROCESS'
      });
      persistenceStatus = 'success';
    }

    return res.status(200).json({
      status: 'PROCESSING',
      job_id: Date.now(),
      persistence: persistenceStatus
    });
  } catch (error) {
    console.error('Ingest error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
