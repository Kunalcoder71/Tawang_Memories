import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const client = () => axios.create({
  baseURL: 'https://api-devload.cloudcoderhub.in',
  headers: { 'x-api-key': process.env.DEVLOAD_API_KEY },
});

export async function uploadToDevLoad(filePath, originalName) {
  const projectId = process.env.DEVLOAD_PROJECT_ID;
  if (!process.env.DEVLOAD_API_KEY || !projectId) throw new Error('DevLoad credentials not set in .env');

  const ext = originalName ? path.extname(originalName).toLowerCase() : '.jpg';
  const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
  const mimeType = mimeMap[ext] || 'image/jpeg';

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), {
    filename: `upload_${Date.now()}${ext}`,
    contentType: mimeType,
    knownLength: fs.statSync(filePath).size,
  });

  const res = await client().post(`/api/v1/devload/projects/${projectId}/upload`, form, {
    headers: { ...form.getHeaders() },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return res.data;
}

// Batched delete — sends requests with delay to avoid rate limit
export async function batchDeleteFromDevLoad(fileIds, batchSize = 5, delayMs = 300) {
  const results = [];
  for (let i = 0; i < fileIds.length; i += batchSize) {
    const batch = fileIds.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(fileId => deleteFromDevLoad(fileId))
    );
    results.push(...batchResults);
    if (i + batchSize < fileIds.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return results;
}

export async function deleteFromDevLoad(fileId) {
  if (!process.env.DEVLOAD_API_KEY || !fileId) return;
  try {
    await client().delete(`/api/v1/devload/file/${fileId}`);
  } catch (e) {
    console.warn('DevLoad delete warning:', e.response?.data?.message || e.message);
  }
}
