export const mealKeys = ["breakfast", "lunch", "dinner"] as const;
export type MealKey = (typeof mealKeys)[number];
export const mealLabels: Record<MealKey, string> = { breakfast: "朝ごはん", lunch: "昼ごはん", dinner: "夜ごはん" };
export const nutrientKeys = ["carbs", "protein", "fat", "vitamin", "mineral"] as const;
export type NutrientKey = (typeof nutrientKeys)[number];
export const nutrientLabels: Record<NutrientKey, string> = { carbs: "炭水化物", protein: "たんぱく質", fat: "脂質", vitamin: "ビタミン", mineral: "ミネラル" };
export type FoodObservation = { food: string; nutrients: NutrientKey[] };
export type Analysis = { foods: FoodObservation[]; message: string };
export type Photo = { id: string; url: string };
export type Meal = { photos: Photo[]; note: string; message: string; analyzed: boolean; analysis?: Analysis };
export type Snack = { id: string; note: string; date: string; photo?: string };
export type LegacyMeal = { id: string; mealType: string; note: string; date: string; photoUri?: string };
export type DayRecord = { date: string; breakfast: Meal; lunch: Meal; dinner: Meal; diary: string; snacks: Snack[]; legacyMeals: LegacyMeal[] };
export type RawRecord = { id: string; data: Record<string, unknown> };
export const emptyMeal = (): Meal => ({ photos: [], note: "", message: "", analyzed: false });
export const emptyDay = (date: string): DayRecord => ({ date, breakfast: emptyMeal(), lunch: emptyMeal(), dinner: emptyMeal(), diary: "", snacks: [], legacyMeals: [] });
export function localDateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && localDateKey(date) === value;
}
export function recordDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return isDateKey(value) ? value : null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? localDateKey(date) : null;
}
export function shiftDay(value: string, offset: number) { const d = new Date(`${value}T12:00:00`); d.setDate(d.getDate() + offset); return localDateKey(d); }
export function formatDay(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" }); }
export function monthCells(month: string): (string | null)[] {
  const start = new Date(`${month}-01T12:00:00`);
  const offset = (start.getDay() + 6) % 7;
  const count = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  return [...Array<null>(offset).fill(null), ...Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];
}
export function hasRecord(day?: DayRecord) { return !!day && (!!day.diary || day.snacks.length > 0 || day.legacyMeals.length > 0 || mealKeys.some(k => day[k].photos.length > 0 || !!day[k].note)); }
const text = (v: unknown) => typeof v === "string" ? v : "";
export const safePhotoUrl = (v: unknown): v is string => typeof v === "string" && /^https:\/\//.test(v);
export function parseAnalysis(raw: unknown): Analysis | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  if (!Array.isArray(a.foods) || typeof a.message !== "string") return null;
  const foods: FoodObservation[] = [];
  for (const item of a.foods.slice(0, 12)) {
    if (!item || typeof item !== "object") return null;
    if (typeof item.food !== "string" || !Array.isArray(item.nutrients)) return null;
    if (!item.nutrients.every((k: unknown) => nutrientKeys.includes(k as NutrientKey))) return null;
    foods.push({ food: item.food.slice(0, 60), nutrients: [...new Set<NutrientKey>(item.nutrients)] });
  }
  return { foods, message: a.message.slice(0, 500) };
}
export function normalizeMeal(value: unknown): Meal {
  const m = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const analysis = parseAnalysis(m.analysis);
  const photos = Array.isArray(m.photos) ? m.photos.filter(p => p && typeof p.id === "string" && safePhotoUrl(p.url)).map(p => ({ id: p.id, url: p.url })) : [];
  return { photos, note: text(m.note), message: text(m.message), analyzed: !!analysis, ...(analysis ? { analysis } : {}) };
}
// Preserve old collections. Explicit new fields override legacy values, including empty ones.
export function combineRecords(uid: string, daily: RawRecord[], meals: RawRecord[], diaries: RawRecord[], snacks: RawRecord[]): Record<string, DayRecord> {
  const result: Record<string, DayRecord> = {};
  const dayFor = (value: unknown) => { const date = recordDate(value); if (!date) return null; return result[date] ??= emptyDay(date); };
  for (const { id, data } of meals) {
    if (data.uid !== uid) continue;
    const day = dayFor(data.date); if (!day) continue;
    day.legacyMeals.push({ id, mealType: text(data.mealType), note: text(data.note), date: text(data.date), ...(safePhotoUrl(data.photoUri) ? { photoUri: data.photoUri } : {}) });
  }
  for (const { data } of [...diaries].sort((a,b) => text(a.data.date).localeCompare(text(b.data.date)))) {
    if (data.uid !== uid) continue;
    const day = dayFor(data.date); if (day) day.diary = text(data.note);
  }
  for (const { id, data } of snacks) {
    if (data.uid !== uid) continue;
    const day = dayFor(data.date); if (day) day.snacks.push({ id, note: text(data.note), date: text(data.date), ...(safePhotoUrl(data.photo) ? { photo: data.photo } : {}) });
  }
  for (const { data } of daily) {
    if (data.uid !== uid) continue;
    const day = dayFor(data.date); if (!day) continue;
    for (const key of mealKeys) if (data[key] !== undefined) day[key] = normalizeMeal(data[key]);
    if (typeof data.diary === "string") day.diary = data.diary;
    if (Array.isArray(data.snacks)) day.snacks = data.snacks.filter(s => s && typeof s.id === "string" && typeof s.note === "string").map(s => ({ id:s.id, note:s.note, date:text(s.date), ...(safePhotoUrl(s.photo) ? { photo:s.photo } : {}) }));
  }
  return result;
}
