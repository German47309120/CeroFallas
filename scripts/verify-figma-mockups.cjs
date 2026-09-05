const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const out = path.resolve(__dirname, '../deliverables/mockups_figma');
async function main(){
 const items=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
 const composites=[];
 for(let i=0;i<items.length;i++){
  const item=items[i],svg=fs.readFileSync(path.join(out,item.file));
  const metadata=await sharp(svg).metadata();
  if(metadata.width!==item.width||metadata.height!==item.height)throw Error('Dimensiones incorrectas: '+item.file);
  const png=await sharp(svg).png().toBuffer();
  fs.writeFileSync(path.join(out,item.file.replace('.svg','.png')),png);
  const thumb=await sharp(png).resize({width:480,height:520,fit:'contain',background:'#e7eeee'}).png().toBuffer();
  composites.push({input:thumb,left:(i%3)*500+10,top:Math.floor(i/3)*540+10});
 }
 await sharp({create:{width:1500,height:2700,channels:4,background:'#e7eeee'}}).composite(composites).png().toFile(path.join(out,'vista-general.png'));
 console.log('Verificados y renderizados: '+items.length+' SVG.');
}
main().catch(e=>{console.error(e);process.exit(1);});
