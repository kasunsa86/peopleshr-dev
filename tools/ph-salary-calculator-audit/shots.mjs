import {chromium} from '@playwright/test';
const b=await chromium.launch();
const pages=process.argv.slice(2);
for (const p of pages){
  const pg=await b.newPage({viewport:{width:1280,height:900}});
  await pg.goto(`http://localhost:8899/${p}/`,{waitUntil:'domcontentloaded'}); await pg.waitForTimeout(1500);
  await pg.evaluate(()=>{document.querySelectorAll('[id*=cookie],[class*=cookie],[class*=consent],[id*=consent]').forEach(e=>e.remove())});
  const top=await pg.evaluate(()=>{const h=document.querySelector('.nv-bar');return h?h.getBoundingClientRect().bottom:0});
  await pg.screenshot({path:`/tmp/claude-501/shots/${p}.png`,clip:{x:0,y:top,width:1280,height:820}});
}
await b.close();
