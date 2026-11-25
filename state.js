// One endpoint: GET = read everyone. POST = edit (needs code). Data lives in Upstash Redis (Vercel Marketplace).
const U=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const T=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY='growth:state';
const cmd=async a=>(await(await fetch(U,{method:'POST',headers:{Authorization:'Bearer '+T},body:JSON.stringify(a)})).json()).result;
const F=['ws','t','a','r','c','s','d','dl','st','n'];
module.exports=async(req,res)=>{
  try{
    let s=JSON.parse((await cmd(['GET',KEY]))||'null');
    if(!s){s={items:require('../lib/seed').items,log:[{at:new Date().toISOString(),who:'System',act:'Seeded from 23-Nov meeting, Puja plan v2, payer slide'}]};await cmd(['SET',KEY,JSON.stringify(s)]);}
    if(req.method!=='POST')return res.status(200).json(s);
    const b=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const role=b.code&&b.code===process.env.ADMIN_CODE?'admin':b.code&&b.code===process.env.TEAM_CODE?'team':null;
    if(!role||!b.who)return res.status(401).json({error:'Wrong code or missing name'});
    if(b.op==='auth')return res.status(200).json({role});
    const at=new Date().toISOString(),who=b.who.slice(0,40);
    if(b.op==='del'){
      if(role!=='admin')return res.status(403).json({error:'Admin only'});
      const i=s.items.findIndex(x=>x.id===b.id);if(i<0)return res.status(404).json({error:'Not found'});
      s.log.unshift({at,who,role,id:b.id,t:s.items[i].t,act:'Deleted'});s.items.splice(i,1);
    }else if(b.op==='save'){
      const it=b.item||{};let old=s.items.find(x=>x.id===it.id);
      if(!old){
        if(role!=='admin')return res.status(403).json({error:'Only the admin can add items'});
        const n={id:'N'+Date.now().toString(36)};F.forEach(f=>n[f]=String(it[f]||'').slice(0,600));
        s.items.push(n);s.log.unshift({at,who,role,id:n.id,t:n.t,act:'Created'});
      }else{
        const fields=role==='admin'?F:['st','n'],ch=[];
        fields.forEach(f=>{const v=String(it[f]??'').slice(0,600);if(v!==(old[f]||'')){ch.push([f,old[f]||'',v]);old[f]=v;}});
        if(ch.length)s.log.unshift({at,who,role,id:old.id,t:old.t,act:'Edited',ch});
      }
    }else return res.status(400).json({error:'Bad op'});
    s.log=s.log.slice(0,1500);
    await cmd(['SET',KEY,JSON.stringify(s)]);
    res.status(200).json(s);
  }catch(e){res.status(500).json({error:String(e.message||e)});}
};
