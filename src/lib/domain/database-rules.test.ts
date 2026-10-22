import { describe,it,expect,beforeAll,afterAll } from 'vitest';
// Runs only when explicit server-side test credentials exist. Never bundles credentials.
const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];const admin=process.env['SUPABASE_SERVICE_ROLE_KEY'];
const suite=url&&key&&admin?describe:describe.skip;
suite('Real database access and registration rules',()=>{
 const users:{id:string;token:string}[]=[];let eventId='';let postId='';
 const request=async(path:string,token:string|undefined,method='GET',body?:unknown)=>fetch(`${url}${path}`,{method,headers:{apikey:key??'',...(token?{Authorization:`Bearer ${token}`}:{}) ,'Content-Type':'application/json',Prefer:'return=representation'},...(body?{body:JSON.stringify(body)}:{})});
 const adminRequest=async(path:string,method:string,body?:unknown)=>fetch(`${url}/auth/v1/admin${path}`,{method,headers:{apikey:admin??'',Authorization:`Bearer ${admin}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 beforeAll(async()=>{
  for(let i=0;i<2;i++){
   const password=crypto.randomUUID()+'Aa1!';const email=`sports-rules-${crypto.randomUUID()}@test.mataesportes.com.br`;
   const r=await adminRequest('/users','POST',{email,password,email_confirm:true,user_metadata:{nome:'Conferência temporária'}});expect(r.ok).toBe(true);const u=await r.json();users.push({id:u.id,token:''});
   const auth=await request('/auth/v1/token?grant_type=password',undefined,'POST',{email,password});expect(auth.ok).toBe(true);const created=users[i];if(!created)throw new Error('Test account missing');created.token=(await auth.json()).access_token;
  }
  const ev=await request('/rest/v1/eventos',users[0]?.token,'POST',{organizador:users[0]?.id,nome:'Teste de vagas temporário',modalidade:'Corrida',cidade:'Palmares',data:'2099-01-01',local:'Centro',vagas:1});expect(ev.ok).toBe(true);eventId=(await ev.json())[0].id;
  const post=await request('/rest/v1/posts',users[0]?.token,'POST',{autor:users[0]?.id,texto:'Registro temporário de regra',tipo:'Treino',modalidade:'Corrida',cidade:'Palmares'});expect(post.ok).toBe(true);postId=(await post.json())[0].id;
 },30000);
 afterAll(async()=>{for(const u of users)await adminRequest(`/users/${u.id}`,'DELETE');});
 it('only the owner can edit a profile',async()=>{
  const r=await request(`/rest/v1/profiles?id=eq.${users[0]?.id}`,users[1]?.token,'PATCH',{nome:'Invadido'});expect(await r.json()).toEqual([]);
  const read=await request(`/rest/v1/profiles?id=eq.${users[0]?.id}&select=nome`,users[0]?.token);expect((await read.json())[0].nome).toBe('Conferência temporária');
 });
 it('only the owner can edit a post',async()=>{const r=await request(`/rest/v1/posts?id=eq.${postId}`,users[1]?.token,'PATCH',{texto:'Invadido'});expect(await r.json()).toEqual([]);});
 it('one user can like a post only once',async()=>{
  const responses=await Promise.all([1,2].map(()=>request('/rest/v1/likes',users[0]?.token,'POST',{post_id:postId,user_id:users[0]?.id})));expect(responses.filter(r=>r.ok)).toHaveLength(1);
  const rows=await request(`/rest/v1/likes?post_id=eq.${postId}`,users[0]?.token);expect(await rows.json()).toHaveLength(1);
 });
 it('stored like and comment counters follow real likes and comments',async()=>{
  const read=async()=>(await (await request(`/rest/v1/posts?id=eq.${postId}&select=likes_count,comments_count`,undefined)).json())[0];
  expect((await read()).likes_count).toBe(1);
  const c=await request('/rest/v1/comments',users[1]?.token,'POST',{post_id:postId,autor:users[1]?.id,texto:'Bom treino'});expect(c.ok).toBe(true);const commentId=(await c.json())[0].id;
  expect((await read()).comments_count).toBe(1);
  await request(`/rest/v1/comments?id=eq.${commentId}`,users[1]?.token,'DELETE');
  expect((await read()).comments_count).toBe(0);
 });
 it('a post owner cannot overwrite the like counter',async()=>{
  const r=await request(`/rest/v1/posts?id=eq.${postId}`,users[0]?.token,'PATCH',{likes_count:999});expect(r.ok).toBe(false);
 });
 it('simultaneous registrations cannot exceed one place',async()=>{
  const responses=await Promise.all(users.map(u=>request('/rest/v1/inscricoes',u.token,'POST',{evento_id:eventId,user_id:u.id})));expect(responses.filter(r=>r.ok)).toHaveLength(1);
  const counts=await request('/rest/v1/rpc/event_counts',undefined,'POST',{});const rows=await counts.json();expect(rows.find((r:{id:string})=>r.id===eventId).inscritos).toBe(1);
 });
 it('repeat registration does not duplicate a participant',async()=>{
  const rows=await request(`/rest/v1/inscricoes?evento_id=eq.${eventId}`,users[0]?.token);const registered=await rows.json();expect(registered).toHaveLength(1);const u=users.find(x=>x.id===registered[0].user_id);expect(u).toBeDefined();
  const repeat=await request('/rest/v1/inscricoes',u?.token,'POST',{evento_id:eventId,user_id:u?.id});expect(repeat.ok).toBe(true);
  const after=await request(`/rest/v1/inscricoes?evento_id=eq.${eventId}`,users[0]?.token);expect(await after.json()).toHaveLength(1);
 });
 it('visitors cannot read registrations',async()=>{const r=await request('/rest/v1/inscricoes?select=*',undefined);expect(r.ok).toBe(false);});
 it('anonymous writes are rejected',async()=>{const r=await request('/rest/v1/posts',undefined,'POST',{autor:users[0]?.id,texto:'Sem sessão',tipo:'Treino',modalidade:'Corrida',cidade:'Palmares'});expect(r.ok).toBe(false);});
});
