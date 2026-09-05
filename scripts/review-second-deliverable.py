from pathlib import Path
import json
from pypdf import PdfReader
from pdf2image import convert_from_path
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[1]
pdf=root/'deliverables/segunda_entrega/CeroFallas_Segunda_Entrega.pdf'
out=root/'output/segunda_entrega_qa'
out.mkdir(exist_ok=True,parents=True)
doc=PdfReader(pdf);stats=[];thumbs=[]
paths=convert_from_path(str(pdf),dpi=100,output_folder=str(out),fmt='png',paths_only=True,poppler_path='C:/Users/gh650/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin')
for i,page in enumerate(doc.pages):
    image=Image.open(paths[i]).convert('RGB')
    image.save(out/f'page-{i+1}.png')
    text=page.extract_text()
    stats.append({'page':i+1,'chars':len(text),'images':len(page.images),'start':text[:180]})
    image.thumbnail((255,330));tile=Image.new('RGB',(275,360),'#e3e9eb');tile.paste(image,((275-image.width)//2,20));ImageDraw.Draw(tile).text((10,3),str(i+1),fill='black');thumbs.append(tile)
for start in range(0,len(thumbs),12):
    sheet=Image.new('RGB',(1100,1080),'#e3e9eb')
    for j,t in enumerate(thumbs[start:start+12]):sheet.paste(t,((j%4)*275,(j//4)*360))
    sheet.save(out/f'contact-{start//12+1}.png')
(out/'review.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'pages':len(doc.pages),'low_content':[s for s in stats if s['chars']<200 and not s['images']]},ensure_ascii=False))
