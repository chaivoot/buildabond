const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Stores an uploaded image and returns its public URL.
 * Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set (connect a Blob store in Vercel → Storage);
 * otherwise falls back to an inline data: URL stored in the database.
 */
export async function storeImage(file: File, folder: 'products' | 'slips'): Promise<string> {
  if (!file || file.size === 0) throw new Error('ไม่ได้เลือกไฟล์');
  if (!file.type.startsWith('image/')) throw new Error('รองรับเฉพาะไฟล์รูปภาพ');
  if (file.size > MAX_BYTES) throw new Error('ไฟล์ใหญ่เกิน 4 MB');

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const blob = await put(`${folder}/${Date.now()}.${ext}`, file, { access: 'public', addRandomSuffix: true, contentType: file.type });
    return blob.url;
  }
  const buf = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buf.toString('base64')}`;
}
