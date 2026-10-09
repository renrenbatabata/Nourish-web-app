/* This Node test runner loads transpiled TypeScript as CommonJS without extra dependencies. */
/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, dependencies = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('exports', 'require', js)(exports, name => dependencies[name] ?? require(name));
  return exports;
}
const r = load('app/lib/records.ts');
const raw = (id, data) => ({ id, data });
test('calendar supports leap years and month boundaries', () => {
  assert.equal(r.isDateKey('2026-02-29'), false);
  assert.equal(r.isDateKey('2024-02-29'), true);
  assert.equal(r.shiftDay('2026-12-31', 1), '2027-01-01');
  assert.equal(r.monthCells('2024-02').filter(Boolean).length, 29);
});
test('old diary-only and snack-only days remain visible', () => {
  const days = r.combineRecords('u', [], [], [raw('d', {uid:'u', date:'2026-10-01', note:'気持ち'})], [raw('s',{uid:'u',date:'2026-10-02',note:'お茶'})]);
  assert.equal(r.hasRecord(days['2026-10-01']), true);
  assert.equal(r.hasRecord(days['2026-10-02']), true);
});
test('explicitly cleared new fields do not resurrect old records', () => {
  const days = r.combineRecords('u', [raw('new',{uid:'u',date:'2026-10-01',diary:'',snacks:[]})], [], [raw('old',{uid:'u',date:'2026-10-01',note:'old'})], [raw('s',{uid:'u',date:'2026-10-01',note:'old'})]);
  assert.equal(days['2026-10-01'].diary, '');
  assert.deepEqual(days['2026-10-01'].snacks, []);
  assert.equal(r.hasRecord(days['2026-10-01']), false);
});
test('records from another account and invalid dates are ignored', () => {
  const foreign = raw('f',{uid:'other',date:'2026-10-01',note:'private'});
  assert.deepEqual(r.combineRecords('u',[foreign],[foreign],[foreign],[foreign]),{});
  assert.deepEqual(r.combineRecords('u',[raw('bad',{uid:'u',date:'2026-02-31'})],[],[],[]),{});
});
test('unsafe photo URLs and old analysis flags are not accepted', () => {
  const meal=r.normalizeMeal({photos:[{id:'x',url:'javascript:alert(1)'}],analyzed:true});
  assert.deepEqual(meal.photos,[]);
  assert.equal(meal.analyzed,false);
  assert.equal(r.parseAnalysis({foods:[{food:'egg',nutrients:['unknown']}],message:''}),null);
});
test('new and legacy meal records coexist without losing diary', () => {
  const days=r.combineRecords('u',[raw('n',{uid:'u',date:'2026-10-01',breakfast:{note:'new'}})],[raw('o',{uid:'u',date:'2026-10-01',mealType:'lunch',note:'old'})],[raw('d',{uid:'u',date:'2026-10-01',note:'diary'})],[]);
  assert.equal(days['2026-10-01'].breakfast.note,'new');
  assert.equal(days['2026-10-01'].legacyMeals[0].note,'old');
  assert.equal(days['2026-10-01'].diary,'diary');
});
test('analysis API rejects anonymous requests and retired scoring', async () => {
  const api=load('app/api/analyze/route.ts', {'../../lib/analysisPrompt':load('app/lib/analysisPrompt.ts'), '../../lib/records':r, '../../lib/analysisPhotos':load('app/lib/analysisPhotos.ts')});
  const result=await api.POST(new Request('http://localhost/api/analyze',{method:'POST'}));
  assert.equal(result.status,401);
  assert.equal((await api.PUT()).status,410);
});

test('detailed analysis keeps dish, overview, ingredient descriptions, and inference labels through persistence', () => {
  const analysis={dishName:'抹茶のクレープ（推定）',summary:'抹茶色の生地で包まれたクレープに見えます。',foods:[{food:'小麦粉',nutrients:['carbs'],description:'一般的なクレープ生地に使われている場合、炭水化物を含みます。',basis:'inferred'}],message:'写真からの推定です。'};
  assert.deepEqual(r.parseAnalysis(analysis),analysis);
  assert.deepEqual(r.normalizeMeal({photos:[],analysis}).analysis,analysis);
  assert.equal(r.parseAnalysis({...analysis,dishName:123}),null);
  assert.equal(r.parseAnalysis({...analysis,foods:[{...analysis.foods[0],basis:'certain'}]}),null);
  assert.deepEqual(r.parseAnalysis({foods:[{food:'卵',nutrients:['protein']}],message:''}),{foods:[{food:'卵',nutrients:['protein']}],message:''});
});

