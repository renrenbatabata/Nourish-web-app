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
const photos = load('app/lib/analysisPhotos.ts');
const records = load('app/lib/records.ts');
const uid = 'test-user';
const photo = owner => 'https://firebasestorage.googleapis.com/v0/b/taberu-app-79faf.firebasestorage.app/o/' + encodeURIComponent('meals/' + owner + '/2026-10-09/photo.jpg') + '?alt=media&token=test';
const token = 'header.' + Buffer.from(JSON.stringify({sub:uid,aud:'taberu-app-79faf',iss:'https://securetoken.google.com/taberu-app-79faf'})).toString('base64url') + '.signature';
const request = body => new Request('http://localhost/api/analyze', {method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
const api = () => load('app/api/analyze/route.ts', {'../../lib/records':records,'../../lib/analysisPhotos':photos});
function key(t) { const old=process.env.ANTHROPIC_API_KEY; process.env.ANTHROPIC_API_KEY='test-only-key'; t.after(()=>{if(old===undefined)delete process.env.ANTHROPIC_API_KEY;else process.env.ANTHROPIC_API_KEY=old;}); }
test('photo loader rejects foreign accounts, hosts, buckets, credentials, and malformed paths', () => {
  assert.equal(photos.ownedPhotoUrl(photo(uid),uid).hostname,'firebasestorage.googleapis.com');
  for(const url of [photo('other'),photo(uid).replace('https:','http:'),photo(uid).replace('googleapis.com','googleapis.com.evil.test'),photo(uid).replace('taberu-app-79faf','other'),photo(uid).replace('https://','https://user:pass@'),photo(uid).replace('photo.jpg','..%2Fprivate.jpg'),'not-a-url']) assert.throws(()=>photos.ownedPhotoUrl(url,uid),photos.PhotoError);
});
test('authenticated analysis downloads saved photo server-side and sends only bytes to Anthropic', async t => {
  key(t); const calls=[];
  t.mock.method(globalThis,'fetch',async (url,options)=>{
    calls.push(String(url));
    if(String(url).includes('identitytoolkit'))return Response.json({users:[{localId:uid}]});
    if(String(url).includes('firebasestorage')){assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');return new Response(new Uint8Array([255,216,255,224]),{headers:{'Content-Type':'image/jpeg'}});}
    assert.equal(String(url),'https://api.anthropic.com/v1/messages');
    const body=JSON.parse(options.body);assert.equal(body.messages[0].content[0].source.data,'/9j/4A==');assert.ok(!options.body.includes('token=test'));
    return Response.json({content:[{type:'text',text:JSON.stringify({foods:[{food:'卵',nutrients:['protein']}],message:''})}]});
  });
  const result=await api().POST(request({photoUrls:[photo(uid)]}));
  assert.equal(result.status,200);assert.equal((await result.json()).analysis.foods[0].food,'卵');assert.equal(calls.length,3);
});
test('foreign photo is rejected before any photo or AI request', async t => {
  key(t);let count=0;t.mock.method(globalThis,'fetch',async ()=>{count++;return Response.json({users:[{localId:uid}]});});
  assert.equal((await api().POST(request({photoUrls:[photo('other')]}))).status,400);assert.equal(count,1);
});
test('failed photo download returns Japanese error and never calls AI', async t => {
  key(t);t.mock.method(globalThis,'fetch',async url=>{if(String(url).includes('identitytoolkit'))return Response.json({users:[{localId:uid}]});throw new TypeError('Failed to fetch');});
  const result=await api().POST(request({photoUrls:[photo(uid)]}));assert.equal(result.status,502);assert.match((await result.json()).error,/写真を読み込めませんでした/);
});
test('photo size and file signature are checked', async t => {
  t.mock.method(globalThis,'fetch',async ()=>new Response('not an image'));
  await assert.rejects(photos.loadAnalysisPhotos([photos.ownedPhotoUrl(photo(uid),uid)],AbortSignal.timeout(1000)),e=>e.status===400);
  t.mock.method(globalThis,'fetch',async ()=>new Response(new Uint8Array(3*1024*1024+1)));
  await assert.rejects(photos.loadAnalysisPhotos([photos.ownedPhotoUrl(photo(uid),uid)],AbortSignal.timeout(1000)),e=>e.status===413);
});
test('legacy base64 requests remain compatible', async t => {
  key(t);t.mock.method(globalThis,'fetch',async url=>String(url).includes('identitytoolkit')?Response.json({users:[{localId:uid}]}):Response.json({content:[{type:'text',text:'{"foods":[],"message":""}'}]}));
  assert.equal((await api().POST(request({images:['data:image/jpeg;base64,/9j/4A==']}))).status,200);
});
