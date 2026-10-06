
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { storage } from "../../firebase";
export async function prepareImage(file: File): Promise<string> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('JPEG・PNG・WebPの写真を選んでください。');
  if (file.size > 12 * 1024 * 1024) throw new Error('写真は12MB以下で選んでください。');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1,Math.round(bitmap.width*scale)); canvas.height = Math.max(1,Math.round(bitmap.height*scale));
    const context = canvas.getContext('2d'); if (!context) throw new Error('写真を読み込めませんでした。');
    context.fillStyle = '#ffffff'; context.fillRect(0,0,canvas.width,canvas.height); context.drawImage(bitmap,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',0.8);
  } finally { bitmap.close(); }
}
export async function uploadPhoto(uid: string, date: string, data: string) {
  const id = crypto.randomUUID();
  const target = ref(storage, 'meals/' + uid + '/' + date + '/' + id + '.jpg');
  await uploadString(target,data,'data_url');
  return {id,url:await getDownloadURL(target)};
}
export async function analyzePhotos(images: string[], token: string) {
  const response = await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({images}),signal:AbortSignal.timeout(65000)});
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '食材を確認できませんでした。時間をおいてお試しください。');
  return data.analysis;
}
export async function photoData(url: string) {
  const response = await fetch(url,{signal:AbortSignal.timeout(20000)});
  if (!response.ok) throw new Error('写真を読み込めませんでした。');
  const blob = await response.blob();
  return prepareImage(new File([blob],'photo',{type:blob.type}));
}
