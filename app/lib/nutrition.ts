import type { DayRecord, Meal } from './records';
export const intakeKeys = ['carbs','protein','fat','vitaminC','calcium'] as const;
export type IntakeKey = typeof intakeKeys[number];
export type NutritionAmounts = Record<IntakeKey, number | null>;
export type NutritionGoals = Partial<Record<IntakeKey, number>>;
export const intakeLabels: Record<IntakeKey,string> = {carbs:'炭水化物',protein:'たんぱく質',fat:'脂質',vitaminC:'ビタミンC',calcium:'カルシウム'};
export const intakeUnits: Record<IntakeKey,string> = {carbs:'g',protein:'g',fat:'g',vitaminC:'mg',calcium:'mg'};
export const unknownNutrition = (): NutritionAmounts => ({carbs:null,protein:null,fat:null,vitaminC:null,calcium:null});
export function parseNutrition(raw: unknown): NutritionAmounts | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const source=raw as Record<string,unknown>, result=unknownNutrition();
  for (const key of intakeKeys) {
    const value=source[key];
    if(value===null || value===undefined)continue;
    if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>100000)return null;
    result[key]=value;
  }
  return result;
}
export function parseGoals(raw: unknown): NutritionGoals {
  const amounts=parseNutrition(raw), goals: NutritionGoals={};
  if(amounts)for(const key of intakeKeys)if(amounts[key]!==null && amounts[key]!>0)goals[key]=amounts[key]!;
  return goals;
}
export function mealAmounts(meal: Meal): NutritionAmounts { return meal.nutrition ?? meal.analysis?.estimatedNutrition ?? unknownNutrition(); }
export function nutritionEntries(day: DayRecord) {
  const entries: {id:string;label:string;amounts:NutritionAmounts;portion:number}[]=[];
  for(const [key,label] of [['breakfast','朝ごはん'],['lunch','昼ごはん'],['dinner','夜ごはん']] as const){
    const meal=day[key];if(meal.photos.length||meal.note||meal.analysis||meal.nutrition)entries.push({id:key,label,amounts:mealAmounts(meal),portion:meal.portion??1});
  }
  for(const snack of day.snacks)entries.push({id:snack.id,label:'おやつ・飲みもの：'+snack.note,amounts:snack.nutrition??unknownNutrition(),portion:snack.portion??1});
  return entries;
}
export function dailyNutrition(day: DayRecord) {
  const entries=nutritionEntries(day), result={} as Record<IntakeKey,{total:number;known:number;missing:number}>;
  for(const key of intakeKeys){let total=0,known=0,missing=day.legacyMeals.length;
    for(const entry of entries){const amount=entry.amounts[key];if(entry.portion===0){known++;continue;}if(amount===null){missing++;continue;}total+=amount*entry.portion;known++;}
    result[key]={total,known,missing};
  }
  return result;
}
export function goalProgress(total:number,goal:number|undefined){return goal && goal>0 ? {percent:total/goal*100,width:Math.min(100,total/goal*100)} : null;}
