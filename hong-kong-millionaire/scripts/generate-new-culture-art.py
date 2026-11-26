"""Original Hong Kong comic motifs; no third-party artwork or fonts."""
from pathlib import Path
import math
root=Path(__file__).resolve().parents[1]/'assets'
INK='#29483e';PAPER='#fff4d8'
def rect(x,y,w,h,fill,rx=0,stroke=INK,sw=3):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def path(d,fill='none',stroke=INK,sw=3):return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"/>'
def circle(x,y,r,fill,stroke=INK,sw=3):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def lines(xs,y1,y2,color=INK):return ''.join(path(f'M{x} {y1}V{y2}',stroke=color)for x in xs)
def house(x,y,w=140,h=170,color='#d6bb8d'):
 b=rect(x,y,w,h,color)+path(f'M{x-12} {y}L{x+w/2} {y-48}L{x+w+12} {y}Z','#6f8577')+rect(x+w*.35,y+h*.5,w*.3,h*.5,'#536a60',8)
 for xx in [x+20,x+w-42]:b+=rect(xx,y+28,25,35,'#bdd4c1',3)+path(f'M{xx+12} {y+28}V{y+63}')
 return b

def boat(x,y,w=190):return path(f'M{x} {y}Q{x+w*.5} {y+65} {x+w} {y}Z','#875b45')+rect(x+45,y-55,w-90,55,'#d6c58e',15)+path(f'M{x+28} {y-20}Q{x+w/2} {y-108} {x+w-28} {y-20}','#d4b678')
def tree(x,y,r=60):return path(f'M{x} {y}v110m0-60-30-40m30 30 34-38',stroke='#7e6549',sw=15)+circle(x,y,r,'#89ab78')+circle(x-40,y+15,r*.65,'#a9be83')+circle(x+40,y+12,r*.7,'#729a75')
scenes={}
scenes['peng-chau-lane']=house(55,190,145,220)+house(300,150,150,250,'#b2c4b8')+path('M205 490 250 300 305 490','#d8cdb3')+path('M45 110Q245 150 455 85',stroke='#83786a')+''.join(circle(x,116+(x%3)*5,9,'#f4c97d')for x in range(70,450,40))
scenes['tai-o-bridge']=path('M0 340Q130 310 250 340T500 340V500H0Z','#94b9bd')+house(30,180,145,150)+house(335,160,135,160)+path('M150 300Q250 240 350 300',stroke='#638f83',sw=22)+path('M155 275Q250 218 345 275',sw=7)+lines(range(165,340,25),275,313)+boat(170,390,165)
scenes['lamma-bay']=path('M0 280Q150 160 290 275T500 275V500H0Z','#8fb3b3')+house(45,210,125,180,'#e2c49a')+house(190,240,100,150,'#c7d1b4')+path('M295 360H500v140H295Z','#c7bca3')+path('M320 340v145m65-145v145m65-145v145M300 350H500',sw=8)+boat(310,295,155)
scenes['tsang-house']=rect(20,160,460,310,'#9cac9c')+path('M5 160Q70 145 95 117L250 95 405 117Q430 145 495 160Z','#526f64')+rect(195,245,110,225,'#526c60',9)+path('M215 470V285h70v185','#ad8a61')+''.join(rect(x,y,55,24,'none',0,'#819388',1)for y in range(180,460,32)for x in range(34+(y%2)*20,455,65))+rect(202,200,95,30,'#c8b179',5)
scenes['lai-chi-wo-foil']=house(240,280,170,170,'#d7cfab')+tree(125,185,88)+path('M125 255Q80 410 15 470M125 290Q185 400 230 480',stroke='#7f7450',sw=13)+path('M20 470Q250 430 480 480',stroke='#a9b99b',sw=18)+''.join(circle(x,80+(x%100),3,'#fff0a5','none')for x in range(40,470,39))
scenes['cheung-chau-pier-foil']=rect(0,0,500,500,'#354f64',stroke='none')+circle(390,75,38,'#ffe9ac')+rect(35,250,430,80,'#9fa99d',9)+path('M20 245H480M60 245v90m90-90v90m90-90v90m90-90v90m90-90v90',stroke='#e0c58a',sw=7)+boat(115,385,280)+''.join(path(f'M{x} 440l-25 20h45',stroke='#d5c88c',sw=5)for x in range(70,450,68))
scenes['bamboo-steamer']=rect(55,345,390,55,'#b8844c',20)+rect(55,275,390,60,'#d8b36d',20)+rect(55,205,390,60,'#e1bd7d',20)+path('M80 205Q250 125 420 205Z','#ddc189')+''.join(path(f'M{x} 210v180',stroke='#aa7a45',sw=2)for x in range(75,430,20))+path('M150 130q-28-25 0-50m95 45q-27-25 0-65m100 65q-27-25 0-50',stroke='#e0dfc9',sw=12)
scenes['salt-crystals']=path('M0 120Q250 60 500 120V500H0Z','#a6c2bf')+''.join(rect(x,y,190,100,'#d4e4d4',0,'#a88d65',12)for x in [40,270]for y in [200,345])+''.join(path(f'M{x} {y}l20-34 24 34Z','#fffdf0','#c3d1c4',2)for x,y in [(90,270),(125,270),(320,280),(355,425),(90,420)])+path('M410 100 225 430m-55 0h115',stroke='#9e7555',sw=13)
scenes['eggroll-workshop']=rect(0,320,500,180,'#c19970',stroke='none')+rect(45,125,195,185,'#566f64',24)+rect(60,140,165,150,'#d8b873',15)+path('M135 312v135m-22 0h44',stroke='#52685e',sw=11)+''.join(path(f'M{x} {y}l130-45q22 8 10 28l-130 45Z','#e6bb68')+circle(x+8,y+10,12,'#b48143')for x,y in [(260,310),(275,350),(270,395)])
scenes['neon-workshop']=rect(30,85,440,320,'#354e58',20)+path('M105 300V180q0-45 45-45h95m-140 85h140m-95-85v205m110-170 100 0v140h-90m45-140v140',stroke='#eba69c',sw=13)+path('M90 327q120 35 300 0',stroke='#9ec8b2',sw=9)+rect(80,400,340,45,'#bca27b',8)+path('M160 430l70-35m60 38 65-40',stroke='#6f8170',sw=10)
scenes['paper-lion-foil']=path('M95 210Q250 60 405 210L380 390Q250 480 120 390Z','#cf6f4b')+circle(168,230,67,'#f1d894')+circle(332,230,67,'#f1d894')+circle(168,230,33,'#fdf1d6')+circle(332,230,33,'#fdf1d6')+circle(175,232,17,INK)+circle(325,232,17,INK)+path('M190 160 250 110 310 160M145 345Q250 405 355 345','#e9be70')+''.join(path(f'M{x} 370q-15 65 0 90',stroke='#e6d9b0',sw=12)for x in range(155,360,25))+circle(250,180,22,'#b8c694')
scenes['painted-porcelain-foil']=path('M165 100h170l-15 40q80 80 70 195-15 105-140 105T110 335q-10-115 70-195Z','#fff5d9')+path('M165 100q85 25 170 0m-190 92q105 25 210 0m-235 180q130 30 260 0',stroke='#d2a65d',sw=10)+path('M160 325q40-125 155-100m-60 100q40-110 80-90',stroke='#6f987d',sw=6)+''.join(circle(x,y,27,'#ca7661')+circle(x,y,10,'#e9c572')for x,y in [(195,260),(285,210),(315,310)])
# Additional scenes stay in the existing seven collection categories.
scenes['light-rail-car']=path('M0 390H500V500H0Z','#b8bda5')+path('M30 450H470M0 480H500M70 430 30 500M430 430 470 500',stroke='#65776a',sw=7)+rect(65,160,370,250,'#dfbb65',22)+rect(82,180,336,88,'#7da9a5',10)+rect(219,180,62,220,'#b4cec2',5)+path('M250 180V400M90 300H410',stroke='#9f583f',sw=9)+circle(140,410,25,INK)+circle(360,410,25,INK)+path('M90 70H425M250 70 205 105 270 150M100 70V440',sw=6)
scenes['peak-tram-foil']=path('M0 420 500 180V500H0Z','#88a382')+path('M15 465 485 245m-450 247 450-213',stroke='#62786c',sw=9)+path('M100 310 370 180 405 325 135 450Z','#b95d4c')+path('M125 319 350 211 369 278 146 387Z','#a7c7b5')+path('M180 294 203 365m45-105 23 71m45-105 23 70',sw=8)+circle(170,430,23,INK)+circle(362,338,23,INK)+tree(430,110,38)
scenes['flower-cannon']=rect(0,380,500,120,'#c0ae85',stroke='none')+path('M95 360 110 140 390 140 405 360Z','#d37758')+path('M100 155Q250 35 400 155L365 180Q250 100 135 180Z','#e4bb72')+rect(155,180,190,150,'#f5df9c',13)+circle(250,245,50,'#77947b')+path('M220 240q30-45 60 0l-30 40Z','#eecb83')+''.join(circle(x,y,20,'#d99877')for x,y in [(105,180),(395,180),(115,290),(385,290),(165,125),(335,125)])+path('M110 350v95m280-95v95M155 380h190',stroke='#a47b51',sw=12)
scenes['paper-windmill-foil']=rect(0,400,500,100,'#b9b79b',stroke='none')+path('M250 180V465',stroke='#9e8054',sw=14)+''.join(path(f'M250 230Q{250+dx} {230+dy} {250+dy} {230-dx}L250 230Z',color)for dx,dy,color in [(130,0,'#c66f51'),(0,130,'#e5bf72'),(-130,0,'#7fa181'),(0,-130,'#d6a073')])+circle(250,230,22,'#f8e7b6')+path('M40 125q50-55 100-35m220 245q60-25 100-5',stroke='#84a5a2',sw=8)+house(35,350,105,115)
scenes['siu-mai-skewer']=rect(35,385,430,65,'#ad8059',12)+path('M205 105 310 445',stroke='#aa8655',sw=13)
for x,y in [(225,165),(250,255),(277,344)]:
 scenes['siu-mai-skewer']+=path(f'M{x-57} {y-30}q57-40 114 0l-10 68q-48 32-95 0Z','#e1ba67')+circle(x,y-23,42,'#b7b996')+''.join(path(f'M{x+dx} {y-35}v63',stroke='#bd914f',sw=4)for dx in [-43,-24,23,43])+circle(x,y-25,8,'#ad6547')
scenes['red-bean-ice-foil']=rect(155,140,190,280,'#b3cfc2',30)+rect(169,225,162,180,'#dbd2a9',15)+path('M170 320q80-35 160 0v75H170Z','#a06c5d')+''.join(circle(x,y,12,'#956052','#7a5148',2)for x,y in [(192,340),(230,356),(270,340),(308,363),(202,382),(265,385)])+''.join(path(f'M{x} {y}l35-12 13 32-35 12Z','#e2ead7','#a8beb1',2)for x,y in [(180,182),(231,198),(275,174)])+path('M310 75 280 300',stroke='#6a8c83',sw=10)+rect(110,419,280,25,'#ba9974',12)
scenes['shoe-repair-stall']=rect(45,320,410,130,'#b79569',9)+rect(65,110,370,70,'#8fa58a',7)+path('M100 320q-15-70 25-90l50 12 20 48q60 5 80 30Z','#94624a')+path('M260 275q-10-70 26-85l40 10 20 45q60 5 78 30Z','#586f61')+path('M150 340v90m215-90v90M80 185v135m340-135v135',sw=8)+circle(320,350,24,'#dfc48a')+path('M320 326v48m-18-38h36m-36 28h36',sw=3)+path('M100 385 190 365m-80 45 70-55',stroke='#695f49',sw=9)
scenes['letter-writer-foil']=rect(45,290,410,155,'#b49670',12)+rect(100,175,195,120,'#fff2cc',5)+path('M100 175 198 240 295 175M100 295 168 238m127 57-68-57',stroke='#82927b',sw=4)+rect(260,315,135,90,'#f3ddb2',5)+path('M280 335h90m-90 22h70m-70 22h85',stroke='#7e8e75',sw=4)+path('M245 85 200 335',stroke='#5b7264',sw=13)+path('M230 315 220 348 205 315Z','#b48c58')+circle(110,365,30,'#647f72')+rect(83,370,54,45,'#8aa48a',4)
scenes['typhoon-shelter']=path('M0 230Q250 200 500 250V500H0Z','#9dbeb8')+''.join(rect(x,65+(x%4)*20,55,170,'#b2bea8',5)for x in range(20,490,75))+boat(30,335,190)+boat(280,370,175)+path('M50 230H440l30 35H75Z','#a7a68b')+path('M25 440q80 25 160 0m60 15q80 20 160 0',stroke='#d6ddbd',sw=7)
scenes['lei-yue-mun-foil']=path('M0 0H500V500H0Z','#627e7b')+path('M0 260 150 150 230 310 360 170 500 270V500H0Z','#8aa18a')+path('M140 320q100-60 220 0l90 180H50Z','#9dbdb8')+''.join(house(x,260+(i%2)*30,78,95,'#c7b38b')for i,x in enumerate([15,95,340,420]))+''.join(path(f'M{x} 370v75',stroke='#e9ca80',sw=7)for x in [90,155,335,410])+boat(180,390,145)+circle(400,75,38,'#f0d696','none')
scenes['kat-hing-courtyard']=path('M0 0H500V500H0Z','#cad6bb')+house(45,220,120,190,'#b1b7a0')+house(335,220,120,190,'#b1b7a0')+rect(145,140,210,230,'#adbaa5',5)+path('M125 140 250 75 375 140Z','#708477')+rect(203,225,94,145,'#667f6d',16)+path('M170 160h160m-160 25h160m-160 25h160M250 225v145',stroke='#d4d3ac',sw=4)+path('M170 500 220 370h60l50 130Z','#d1bd93')
scenes['mui-wo-silvermine-foil']=path('M0 260 120 150 210 235 365 105 500 260V500H0Z','#88a381')+path('M0 320q250-60 500-10v190H0Z','#95b9b6')+path('M0 420q180-65 500-35v115H0Z','#dbc997')+house(50,290,100,100,'#d9c69c')+boat(280,350,165)+path('M25 445q140-40 330-25',stroke='#f6e5b6',sw=8)+tree(430,250,45)
scenes['scissor-repair']=rect(0,345,500,155,'#b89c76',stroke='none')+rect(85,215,330,105,'#98a79a',20)+path('M105 235q145-35 290 0',stroke='#d4dac4',sw=5)+circle(170,145,40,'none','#55796c',12)+circle(290,145,40,'none','#55796c',12)+path('M188 177 305 385 265 245 262 177M273 178 155 385 195 245 198 177','#b6c1a9',sw=5)+circle(230,230,13,'#e2bd76')+path('M115 405h115m-125 23h90',stroke='#746c52',sw=7)
scenes['dough-figurine-foil']=rect(35,360,430,100,'#b99a72',12)+path('M170 290v135m170-125v125',stroke='#a17d52',sw=10)+circle(170,185,43,'#e7c99e')+path('M125 170q45-65 90 0v-35q-45-50-90 0Z','#5d7d6d')+path('M135 225h70l30 110H105Z','#c47758')+path('M140 250 90 292m110-42 45 42',stroke='#dcb77e',sw=16)+circle(340,210,40,'#e7c99e')+path('M302 197q38-58 76 0v-36q-38-37-76 0Z','#a37957')+path('M307 250h66l35 100H272Z','#7b9d8a')+circle(157,184,4,INK)+circle(183,184,4,INK)+circle(328,210,4,INK)+circle(352,210,4,INK)+path('M160 202q10 10 20 0m150 26q10 10 20 0',sw=3)
def svg(body,view='0 0 500 500'):
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}"><defs><pattern id="paper" width="19" height="17" patternUnits="userSpaceOnUse"><path d="M1 3h2m8 10h2" stroke="#8e796d" stroke-width=".5" opacity=".2"/></pattern></defs>{body}</svg>'
for name,body in scenes.items():
 sky=rect(0,0,500,500,'#dce5d1',stroke='none')+circle(405,85,46,'#f3cf8f','none')
 paper=rect(12,12,476,476,PAPER,22)+rect(27,27,446,446,'url(#paper)',15,'#b2a17d',1)
 root.joinpath('card-'+name+'.svg').write_text(svg(sky+body+paper.replace(PAPER,'none')))
# Four transparent-centre account frames.
for name in ['ferry','waffle','bamboo','tile']:
 b=circle(60,60,54,'none',INK,5)
 if name=='ferry':
  b+=circle(60,60,50,'none','#c7b581',8)+''.join(path(f'M{60+52*math.cos(a):.2f} {60+52*math.sin(a):.2f}l-3-3 6 6',stroke='#f2e4b8',sw=3)for a in [i*math.pi/20 for i in range(40)])+path('M25 105h70l-10 9H35Z','#56846f')
 elif name=='waffle':
  for i in range(18):
   a=i*math.pi/9;b+=circle(60+51*math.cos(a),60+51*math.sin(a),8,'#ddb26c','#8d6a3b',1.5)
  b+=circle(60,60,42,'none','#e4bb6f',2)
 elif name=='bamboo':
  b=''.join(path(d,stroke='#6e9a68',sw=9)for d in ['M16 14V106','M104 14V106','M14 16H106','M14 104H106'])+''.join(path(f'M{x-6} {y}h12M{y} {x-6}v12',stroke='#c7b583',sw=2)for x in [16,104]for y in [32,59,87])
 else:
  b=circle(60,60,51,'none','#376f6a',10)
  for i in range(16):
   a=i*math.pi/8;x=60+51*math.cos(a);y=60+51*math.sin(a);b+=rect(round(x-5,2),round(y-5,2),10,10,'#d48a68',2,PAPER,1)
 root.joinpath('frame-'+name+'.svg').write_text(svg(b,'0 0 120 120'))
# Readable repeating motifs double as compact shop previews.
for name,body in [('village',house(40,160,190,200,'#aab9a8')+tree(360,170,65)),('island',path('M0 245Q250 180 500 245V500H0Z','#a7c8c4')+boat(140,290,240)+house(20,160,110,130)),('workshop',rect(0,250,500,250,'#d2b38a',stroke='none')+scenes['bamboo-steamer'])]:
 root.joinpath('theme-'+name+'.svg').write_text(svg(rect(0,0,500,500,PAPER,stroke='none')+body+rect(0,0,500,500,'url(#paper)',stroke='none')))
print('Wrote '+str(len(scenes))+' card scenes, four frames and three theme motifs.')
