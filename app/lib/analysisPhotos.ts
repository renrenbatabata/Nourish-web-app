// Server-only photo loading: do not import this module into client components.
const bucket = 'taberu-app-79faf.firebasestorage.app';
const maxPhotoBytes = 3 * 1024 * 1024;
export class PhotoError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export function ownedPhotoUrl(value: unknown, uid: string): URL {
  const invalid = () => new PhotoError('このアカウントの写真を選んでください。', 400);
  if (typeof value !== 'string' || value.length > 2048) throw invalid();
  let url: URL;
  try { url = new URL(value); } catch { throw invalid(); }
  const prefix = '/v0/b/' + bucket + '/o/';
  if (url.protocol !== 'https:' || url.hostname !== 'firebasestorage.googleapis.com' ||
      url.port || url.username || url.password || !url.pathname.startsWith(prefix) ||
      url.searchParams.get('alt') !== 'media') throw invalid();
  let object: string;
  try { object = decodeURIComponent(url.pathname.slice(prefix.length)); } catch { throw invalid(); }
  const parts = object.split('/');
  if (parts.length !== 4 || parts[0] !== 'meals' || parts[1] !== uid ||
      !/^\d{4}-\d{2}-\d{2}$/.test(parts[2]) || !/^[A-Za-z0-9_-]+\.(?:jpg|jpeg|png|webp)$/.test(parts[3])) throw invalid();
  url.hash = '';
  return url;
}
export async function loadAnalysisPhotos(urls: URL[], signal: AbortSignal): Promise<string[]> {
  return Promise.all(urls.map(async url => {
    let response: Response;
    try { response = await fetch(url, { signal, redirect: 'error', cache: 'no-store' }); }
    catch { throw new PhotoError('写真を読み込めませんでした。時間をおいてもう一度お試しください。', 502); }
    if (!response.ok || !response.body) throw new PhotoError('保存した写真を読み込めませんでした。写真を追加し直してお試しください。', 502);
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = []; let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        size += value.byteLength;
        if (size > maxPhotoBytes) { await reader.cancel(); throw new PhotoError('写真が大きすぎます。写真を追加し直してお試しください。', 413); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const bytes = Buffer.concat(chunks);
    const type = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? 'image/jpeg' :
      bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'image/png' :
      bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? 'image/webp' : null;
    if (!type) throw new PhotoError('JPEG・PNG・WebPの写真を選んでください。', 400);
    return 'data:' + type + ';base64,' + bytes.toString('base64');
  }));
}
