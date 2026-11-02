// Render 1080x1080 text cards for Instagram with the pre-installed Chromium.
// Usage: node scripts/make-instagram-cards.js cards.json outdir
// cards.json: [{"file":"card1","headline":"...","sub":"..."}]
const {chromium}=require('playwright');
const fs=require('fs');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
(async()=>{
  const [,, input, out]=process.argv;
  const cards=JSON.parse(fs.readFileSync(input,'utf8'));
  fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1080,height:1080}});
  for(const c of cards){
    await p.setContent(`<body style="margin:0;width:1080px;height:1080px;background:linear-gradient(160deg,#101828,#1d2b4a);color:#fff;font-family:Helvetica,Arial,sans-serif;box-sizing:border-box;padding:96px;display:flex;flex-direction:column;justify-content:space-between">
<div style="font-size:40px;font-weight:700;color:#78b4ff">passdropit</div>
<div><div style="font-size:92px;font-weight:800;line-height:1.08">${esc(c.headline)}</div><div style="margin-top:40px;font-size:42px;line-height:1.35;color:#c9d6ee">${esc(c.sub)}</div></div>
<div style="font-size:40px;font-weight:700">passdropit.com</div></body>`);
    await p.screenshot({path:`${out}/${c.file}.png`});
  }
  await b.close();
})();
