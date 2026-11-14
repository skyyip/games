from pathlib import Path
import xml.etree.ElementTree as ET

ROOT=Path(__file__).parent
P={'ink':'#293f53','navy':'#17283f','sea':'#71b9bd','light':'#f8efd7','gold':'#e7bd73','green':'#739b82','rose':'#d69a91','sky':'#c7ded8'}

def path(d,fill='none',stroke=P['ink'],w=3,extra=''):
 return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def rect(x,y,w,h,fill,rx=0,stroke=P['ink'],sw=3):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def ellipse(x,y,rx,ry,fill,stroke='none',sw=3):
 return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def circle(x,y,r,fill,stroke='none',sw=3):return ellipse(x,y,r,r,fill,stroke,sw)
def line(x1,y1,x2,y2,color=P['ink'],w=3):return path(f'M{x1} {y1}L{x2} {y2}',stroke=color,w=w)
def group(content,transform='',extra=''):return f'<g transform="{transform}" {extra}>{content}</g>'
def sky():
 return '<rect width="800" height="500" fill="url(#sky)"/>'+circle(602,123,69,'#f4d89c')+path('M0 293Q98 232 183 273T359 262T540 282T800 250V500H0Z','#acc9ba','none')+''.join(path(f'M{x} {y}q24-18 47 0t47 0',stroke='#eff5e6',w=5) for x,y in [(85,81),(291,123),(581,48)])
def water(y=330):
 return rect(0,y,800,500-y,'#76b5b8',stroke='none')+''.join(path(f'M{x} {yy}q26-8 52 0t52 0',stroke='#c5e2d6',w=3) for x,yy in [(35,y+28),(238,y+62),(539,y+35),(99,y+117),(586,y+116)])
def ground(y=390):return path(f'M0 {y}Q200 {y-22} 400 {y}T800 {y}V500H0Z','#d9dcc0','none')
def skyline(y=330,opacity=1):
 a=''
 for x,w,h,c in [(37,49,114,'#8faeb0'),(97,55,162,'#adc5b9'),(165,40,105,'#9fbbb5'),(222,49,194,'#82a5ac'),(294,58,147,'#bdd0bd'),(381,56,247,'#8babb3'),(468,65,175,'#b3c5b4'),(552,48,130,'#8daeb2'),(620,66,212,'#99b4b4'),(712,49,116,'#b8c9b6')]:
  a+=rect(x,y-h,w,h,c,6,sw=2)
  for xx in range(x+10,x+w-4,13):a+=line(xx,y-h+17,xx,y-13,'#d4ded0',2)
 a+=path(f'M225 {y-194}L246 {y-231}L269 {y-194}M225 {y-194}L269 {y-149}L225 {y-103}L269 {y-58}M269 {y-194}L225 {y-149}L269 {y-103}L225 {y-58}',stroke='#dce9db',w=3)
 a+=rect(391,y-272,36,25,'#adc8c5',7,sw=2)
 return group(a,extra=f'opacity="{opacity}"')
def ferry(x=400,y=330,s=1):
 a=path('M-162 2H154L129 49Q-4 79-139 48Z','#457d6c',P['ink'],4)+path('M-137-54H133L150 2H-152Z','#fff3d8',w=4)+rect(-121,-102,229,49,'#ebedd7',7)+path('M-135-102H126L110-119H-119Z','#4c806c',w=4)
 for xx in [-104,-61,-18,25,68]:a+=rect(xx,-92,29,24,'#8cb7be',4,sw=2)
 for xx in [-116,-73,-30,13,56,99]:a+=rect(xx,-44,29,24,'#a1c7ca',3,sw=2)
 a+=line(-145,11,144,11,'#e8dec0',5)+line(-31,-121,-31,-166,P['ink'],3)+path('M-31-166L14-153L-31-143Z','#d7a582',w=2)
 a+=circle(-106,14,13,'#e6ceb3',P['ink'],3)+circle(107,14,13,'#e6ceb3',P['ink'],3)
 return group(a,f'translate({x} {y}) scale({s})')
def tram(x=400,y=293,s=1):
 a=rect(-116,-148,232,269,'#50917e',18,sw=4)+rect(-103,-135,206,98,'#e5ead5',9,sw=3)+rect(-102,-23,204,105,'#edf0dd',8,sw=3)+rect(-91,88,182,22,'#e6c583',4,sw=2)
 for yy in [-123,-10]:
  for xx in [-88,-25,38]:a+=rect(xx,yy,51,68,'#91c2ca',5,sw=3)
 a+=line(-114,-35,114,-35,'#293f53',5)+path('M-117-147L-91-166H91L115-147Z','#ebd18e',w=4)+path('M-48-167L-17-205L48-167',stroke='#324958',w=5)+circle(-70,125,18,'#3d5160')+circle(72,125,18,'#3d5160')+circle(-95,62,9,'#f6d894')+circle(95,62,9,'#f6d894')
 return group(a,f'translate({x} {y}) scale({s})')

def svg(name,content,bg=True,w=800,h=500):
 defs='<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c9dfdc"/><stop offset="1" stop-color="#f4e8c9"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0b7"/><stop offset=".55" stop-color="#e7bd73"/><stop offset="1" stop-color="#be884e"/></linearGradient><radialGradient id="spot"><stop stop-color="#345268"/><stop offset="1" stop-color="#142038"/></radialGradient></defs>'
 if name=='bun':defs=defs.replace('</defs>','<clipPath id="bun-top"><ellipse cx="400" cy="276" rx="191" ry="124"/></clipPath></defs>')
 out=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" aria-hidden="true" focusable="false">{defs}{sky() if bg else ""}{content}</svg>'
 ET.fromstring(out);(ROOT/(name+'.svg')).write_text(out)

svg('harbour',skyline()+water(336)+ferry(440,383,.52))
svg('ferry',skyline(325,.45)+water(329)+ferry(400,305,1.12))
svg('tram',ground(408)+''.join(rect(x,170,90,238,c,7,sw=2) for x,c in [(35,'#ddc8ac'),(144,'#c6cbb1'),(566,'#b1c9be'),(674,'#ddc4aa')])+line(0,448,800,448,'#a3ad99',4)+line(0,463,800,463,'#a3ad99',4)+line(0,62,800,62,'#556c6c',2)+tram(400,286,1.03))
# Tsim Sha Tsui station clock-tower illustration.
a=ground(418)+path('M95 415L181 367H619L711 418Z','#cfbd99','none')+rect(314,148,172,267,'#b66d56',5,sw=4)+rect(338,64,124,108,'#bc795f',5,sw=4)+path('M327 66L400 27L473 66Z','#78a38a',w=4)+rect(351,35,98,29,'#dfc18d',3,sw=2)+rect(343,190,114,215,'#c78366',3,sw=2)
for yy in range(211,404,28):a+=line(344,yy,456,yy,'#dfac88',2)
a+=circle(400,119,39,'#f7eccb',P['ink'],4)+circle(400,119,31,'none','#b39464',1.5)+line(400,119,400,95,w=4)+line(400,119,419,130,w=4)
for x in [363,397,431]:a+=rect(x,211,15,55,'#668382',5,sw=2)
a+=path('M365 415V329Q400 293 435 329V415Z','#596d67',w=4)+path('M61 417V356M55 357h12M739 417V356M733 357h12',stroke='#647d70',w=7)+ellipse(99,423,61,13,'#a8bca0')+ellipse(698,423,61,13,'#a8bca0')
svg('clock',a)
# Peak and a red hill tram, with harbour beneath.
a=path('M0 406L165 169L294 293L453 94L800 397V500H0Z','#6f9a7f',w=3)+path('M0 445L211 277L385 357L574 221L800 414V500H0Z','#94b798','none')+water(414)+path('M246 413L473 139M272 425L499 151',stroke='#e8d6ae',w=7)+group(tram(0,0,.58),'translate(403 281) rotate(33)')
svg('peak',a)
# Lion Rock's recognizable reclining lion ridge.
a=path('M0 404L119 300L232 258L273 199L306 194L322 144L377 142L408 181L423 238L474 252L554 312L632 331L800 413V500H0Z','#a6b492',w=4)+path('M245 259L291 221L310 192L330 183L377 184L405 213M331 147L342 177M417 239L382 263L371 303',stroke='#6e8875',w=4)+path('M0 440L156 359L301 386L464 336L650 409L800 388V500H0Z','#719c7f','none')+''.join(rect(x,430-h,30,h,'#c7d4bd',3,sw=2) for x,h in [(94,53),(146,62),(561,45),(608,58),(660,49)])
svg('lion',a)
# Fire dragon, intentionally an original illustration rather than event photography.
a=rect(0,0,800,500,'#223b50',stroke='none')+circle(637,91,53,'#ecd394')+path('M68 305C140 178 237 342 330 246S535 158 630 246',stroke='#d8b678',w=48)+path('M68 305C140 178 237 342 330 246S535 158 630 246',stroke='#f0d39b',w=26)
for i in range(32):
 x=77+i*17;y=259+35*((i%6)-3)/3
 a+=line(x,y,x-4,y-44,'#b48b59',2)+circle(x-4,y-45,3,'#f3c15b')
a+=ellipse(654,227,66,45,'#c99863',P['ink'],4)+path('M685 200L739 166L725 209L759 231L709 244L729 271L687 259Z','#e0be80',w=3)+circle(673,212,12,'#fff3d3',P['ink'],2)+circle(677,212,5,'#263b43')+path('M625 201L605 161L645 189M643 191L643 149L667 185',stroke='#efd597',w=7)+path('M709 230Q744 198 768 211M707 246Q747 262 770 241',stroke='#d9be85',w=4)
for x in [150,283,430,565]:a+=line(x,290,x,382,'#bb9f7c',5)+circle(x,393,15,'#b8cfbb')+path(f'M{x-14} 416L{x-26} 466H{x+25}L{x+14} 416Z','#899f90',w=2)
svg('dragon',a,bg=False)
# Cheung Chau-style bun tower.
a=ground(415)+path('M244 422L307 102L400 45L493 102L557 422Z','#c6a56c',w=4)+path('M309 104L400 52L491 104M277 272H523M261 352H539M293 188H507',stroke='#7c8569',w=6)
for row in range(9):
 yy=111+row*34;count=3+row//2
 for j in range(count):
  xx=400+(j-(count-1)/2)*35
  a+=circle(xx,yy,17,'#fff1d0','#b59b76',2)+path(f'M{xx-5} {yy-3}h10m-5-4v13',stroke='#bf8b7d',w=1.8)
a+=path('M306 102L297 64L324 81M493 102L503 64L477 81',stroke='#d9a174',w=10)
svg('buns',a)
# Mid-autumn lantern display.
a=rect(0,0,800,500,'#213c53',stroke='none')+circle(617,110,72,'#f6e0a4')+path('M0 413Q187 353 360 409T800 393V500H0Z','#537a72','none')
for x,y,s in [(166,243,1.0),(386,270,1.3),(617,291,.88)]:
 b=line(0,-200,0,-86,'#c2ad82',3)+ellipse(0,-9,68,84,'#dba18c','#e8c388',4)+ellipse(0,-9,33,82,'none','#f2cf9d',3)+line(-68,-9,68,-9,'#efca99',3)+rect(-32,-94,64,15,'#e3bc78',4,sw=2)+rect(-30,71,60,13,'#e3bc78',4,sw=2)+line(0,85,0,122,'#d9aa6d',6)+ellipse(0,126,7,18,'#e4ba78')
 a+=group(b,f'translate({x} {y}) scale({s})')
svg('lantern',a,bg=False)
# Tea preparation scene: cotton filter sleeve, not a depiction of actual stockings.
a=ground(405)+rect(171,380,458,25,'#9b896e',6)+path('M210 180H376L364 334Q300 365 224 333Z','#b6cac6',w=4)+path('M214 179Q293 143 373 179Q302 205 214 179Z','#e5e8da',w=3)+path('M253 145Q260 256 300 308Q339 249 339 145Z','#eee6c9',w=4)+path('M257 157H337L320 231Q301 254 279 230Z','#d4b48a',w=2)+line(246,144,345,144,'#7b8d88',8)+path('M376 205Q440 186 427 256Q420 288 372 281',stroke='#899f9a',w=13)+ellipse(521,368,94,19,'#d1d6bd',P['ink'],3)+path('M451 254H587L574 354Q522 385 466 354Z','#f6edcf',w=4)+ellipse(519,254,69,19,'#cfaa76',P['ink'],3)+ellipse(519,254,56,12,'#b58656')+path('M585 272Q649 257 634 309Q622 331 581 321',stroke='#ebdfbd',w=15)
svg('milk',a)
# Pineapple bun with its characteristic scored crust, no pineapple ingredient pictured.
a=ground(407)+ellipse(400,398,240,40,'#c1cbb0',P['ink'],3)+ellipse(400,371,219,48,'#f8edce',P['ink'],3)+path('M214 324Q205 163 401 150Q595 161 587 324Q547 392 400 392Q254 391 214 324Z','#d9a26a',w=4)+ellipse(400,276,191,124,'#efcb80',P['ink'],4)
a+='<g clip-path="url(#bun-top)">'
for x in [-120,-60,0,60,120]:
 a+=path(f'M{400+x-44} 175L{400+x+98} 373',stroke='#c79b5d',w=6)
for x in [-120,-60,0,60,120]:a+=path(f'M{400+x+46} 178L{400+x-97} 373',stroke='#c79b5d',w=6)
a+='</g>'
a+=path('M229 282Q254 193 356 176',stroke='#fae1a0',w=9)
svg('bun',a)
# Hong Kong volcanic hexagonal columns.
a=water(347)
for i,(x,y,h) in enumerate([(91,260,173),(182,201,229),(273,144,280),(364,199,228),(455,119,307),(546,180,248),(637,239,191)]):
 c=['#bfaf95','#c7b89e','#b1aa97'][i%3]
 a+=path(f'M{x-44} {y+15}L{x} {y-11}L{x+44} {y+15}V{y+h}L{x} {y+h+20}L{x-44} {y+h}Z',c,w=3)+path(f'M{x-44} {y+15}L{x} {y+40}L{x+44} {y+15}M{x} {y+40}V{y+h+20}',stroke='#8b8c7e',w=3)
a+=path('M0 461Q160 429 319 466T800 450V500H0Z','#8cbaa9','none')
svg('geopark',a)
# Anonymous distance-marker illustration, with no route code or answer-giving numerals.
a=path('M0 339L139 177L301 308L493 134L800 330V500H0Z','#8ead91',w=2)+water(354)+path('M0 356L207 303L399 368L493 316L800 394V500H0Z','#bec9a3','none')+path('M620 500Q315 432 340 358Q354 322 426 294',stroke='#e9d7ac',w=46)+path('M620 500Q315 432 340 358Q354 322 426 294',stroke='#c2b488',w=2)
a+=path('M262 396L267 165L352 165L356 396Z','#b8b09a',w=4)+rect(266,164,86,33,'#6b8979',3)+rect(280,216,58,61,'#e4e6d2',4)+path('M293 263L309 232L325 263M300 251h18',stroke='#7e9b83',w=4)+rect(280,296,58,53,'#9ea58e',3,sw=2)
svg('trail',a)
# Multiple sports motifs; quizzes specify which contextual detail they ask about.
a=ground(416)+circle(400,235,118,'#f5e8bd','#c9a66d',4)+path('M361 171L389 218L355 281M439 171L411 218L445 281',stroke='#cc9d7b',w=17)+circle(400,263,48,'url(#gold)',P['ink'],4)+path('M400 235L407 252L426 253L411 265L416 284L400 274L384 284L389 265L374 253L393 252Z','#f9e8a8','#bc955e',2)
a+=path('M87 333L202 135L315 333Z','#eff0dd',w=4)+path('M202 139V356M125 357H286L259 389H149Z','#83aeb0',P['ink'],4)+path('M536 337L681 149M549 346L694 158',stroke='#79949c',w=5)+path('M528 329L555 353M669 140L702 165',stroke='#d4ad70',w=7)+''.join(path(f'M{x} 422q20-11 40 0t40 0',stroke='#7ea6a2',w=4) for x in [79,304,545])
svg('sport',a)
# A generic Chinese temple courtyard, deliberately not a facsimile of a named shrine.
a=ground(416)+path('M187 426L228 382H573L613 426Z','#a2b9a6',w=3)+rect(254,216,292,164,'#d7a17e',6)+rect(279,249,240,132,'#bf795f',2)+path('M194 224Q297 222 400 144Q503 222 606 224L566 248H235Z','#6e927c',w=4)+path('M235 180Q306 178 400 101Q494 178 566 180L529 203H271Z','#83a28a',w=4)+path('M269 140Q330 136 400 72Q470 136 531 140L499 159H302Z','#91ad8e',w=4)
for x in [277,326,474,523]:a+=rect(x,247,13,131,'#b96352',3,sw=2)
a+=rect(358,273,84,108,'#536d65',12)+rect(337,231,125,22,'#dabc7a',3)+path('M320 384H480M301 402H499M281 421H519',stroke='#e5d6b8',w=7)+ellipse(170,398,48,16,'#94ad90')+ellipse(636,398,48,16,'#94ad90')
svg('temple',a)
# Brushwork shown as abstract practice strokes, not a historical calligrapher's work.
a=ground(413)+rect(174,86,451,319,'#e1ceaa',8,sw=3)+rect(195,107,409,274,'#f4e8cb',6,sw=1)+path('M262 171Q330 135 391 161M320 131Q343 220 290 317M261 243Q362 197 429 226M399 154Q479 211 422 309M367 296Q437 265 491 315',stroke='#3e4546',w=14)+path('M473 121L592 368',stroke='#8e6f50',w=19)+path('M589 352L607 389L578 368Z','#35464c',w=3)+ellipse(162,340,51,28,'#78918b',P['ink'],3)+ellipse(162,330,44,15,'#33494e',P['ink'],3)+rect(513,307,42,42,'#b97162',5,sw=2)
svg('calligraphy',a)
# Pictograph teaching diagrams, clearly schematic rather than claimed historical glyphs.
for name,glyph in {
 'sun':circle(400,245,117,'none',P['ink'],14)+circle(400,245,18,P['ink']),
 'moon':path('M462 113Q287 132 294 257Q301 365 464 382Q372 324 373 249Q372 175 462 113Z','#5d7d83',P['ink'],7),
 'mountain':path('M246 359V228L314 275L401 127L491 274L557 216V359Z','none',P['ink'],13),
 'tree':path('M400 107V388M400 166L300 230M400 166L501 230M400 271L304 367M400 271L500 367',stroke=P['ink'],w=14),
 'river':path('M292 112Q246 177 292 246T292 389M401 110Q354 176 401 245T401 390M510 110Q463 176 510 245T510 390',stroke=P['ink'],w=13)
}.items():
 svg(name,circle(400,250,194,'#f4e8cb','#d5bd8e',3)+glyph)
# Five-petal bauhinia inspired botanical illustration (not an official flag reproduction).
a=circle(400,250,178,'#e8dfbb','#c9ad7f',3)
for i in range(5):a+=group(path('M0 0C-36-32-38-116 6-132C58-132 67-72 25-23L0 0Z','#f5edda',P['ink'],3)+path('M7-12Q29-57 11-102',stroke='#c89982',w=3),f'translate(400 250) rotate({i*72})')
a+=circle(400,250,17,'#dcba78',P['ink'],2)
svg('star',a)
# Cover uses the same original skyline motifs, surrounded by a quiz-show spotlight.
a=rect(0,0,1280,800,'url(#spot)',stroke='none')+path('M77 0L489 800H753L228 0Z','#e0c69a','none',extra='opacity=".06"')+path('M1080 0L657 800H924L1242 0Z','#84d1cc','none',extra='opacity=".08"')+group(skyline(330,.42),'translate(0 234) scale(1.6)')+path('M0 669Q320 629 640 676T1280 654V800H0Z','#224e60','none')+ellipse(640,677,362,59,'#102535')
a+=circle(640,350,219,'#ac7c49','#f3d9a0',5)+circle(640,333,207,'url(#gold)','#fff0bd',6)+circle(640,333,176,'none','#c59255',4)+circle(640,333,157,'none','#f5d995',3)
a+=path('M579 272Q576 201 647 203Q719 208 706 268Q701 295 660 317Q638 333 639 367',stroke='#233f50',w=27)+circle(640,416,16,'#233f50')
for x,y,r in [(296,217,11),(949,312,15),(361,527,9),(912,542,10)]:a+=path(f'M{x-r} {y}L{x} {y-r}L{x+r} {y}L{x} {y+r}Z','#edd394','none')
svg('cover',a,bg=False,w=1280,h=800)
for file in ROOT.glob('*.svg'):ET.parse(file)
print('Validated',len(list(ROOT.glob('*.svg'))),'original SVG assets')
