"""Original Hong Kong comic teaching panels; no external image or font requests.
Each cropped puzzle has a hand-chosen diagnostic rectangle, shared with the renderer.
"""
import json,pathlib,sys,html
root=pathlib.Path(__file__).resolve().parents[1]
manifest=json.loads((root/'docs/source-street-60-topics.json').read_text())
# SVG primitives deliberately use generous outlines and plain geometric details.
def rect(x,y,w,h,fill='#e5ddc9',r=8):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"/>'
def line(x1,y1,x2,y2,color='#304b43',w=5):return f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{color}" stroke-width="{w}"/>'
def path(d,fill='none',stroke='#304b43',w=5):return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"/>'
def circle(x,y,r,fill='#fff1ce'):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}"/>'
def text(x,y,s,size=34,fill='#263e37'):return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" stroke="none" text-anchor="middle" font-family="sans-serif" font-weight="700">{html.escape(str(s))}</text>'
def arrow(x,y,dx,dy,color='#d0743c'):
 # The shaft and chevron are authentic visual information, not an answer overlay.
 import math
 length=(dx*dx+dy*dy)**.5;ux,uy=dx/length,dy/length;ex,ey=x+dx,y+dy
 return line(x,y,ex,ey,color,9)+path(f'M{ex-ux*18-uy*12} {ey-uy*18+ux*12}L{ex} {ey}L{ex-ux*18+uy*12} {ey-uy*18-ux*12}','none',color,8)
def face(x,y):return circle(x,y,12,'#ffe0ac')+circle(x-4,y-2,1,'#293e35')+circle(x+4,y-2,1,'#293e35')+path(f'M{x-4} {y+4}q4 4 8 0','none','#293e35',2)
def wheels(xs,y):return ''.join(circle(x,y,21,'#475752')+circle(x,y,8,'#e7dac1')for x in xs)
def label_card(s):return rect(260,145,280,210,'#fff7df')+text(400,260,s,48)+line(300,305,500,305,'#c7bda6',3)
scenes={}
scenes['studs']=rect(145,240,510,112,'#c1bdb0')+path('M140 240L290 175H670L655 240Z','#ddd7c6')+''.join(rect(x,219,26,38,'#8b9894',3)+line(x+5,223,x+20,223,'#f4f0e5',3)for x in [275,365,455,545])+rect(495,120,120,55,'#789a68')
scenes['door-gap']=rect(235,80,330,285,'#b7c1ad')+rect(270,100,260,140,'#dfb87e')+rect(270,240,260,78,'#4a5b53',0)+line(270,240,530,240,'#304b43',6)+rect(480,165,10,25,'#807b5c')+line(160,320,640,320,'#a99b7c',5)+path('M300 285Q360 270 420 285','none','#bad5c7',8)
scenes['bus-stop']=path('M140 340L270 120H640L670 340Z','#66746f')+''.join(line(x,175,x+12,202,'#eac454',8)for x in range(250,600,55))+text(400,276,'BUS STOP',53,'#f5da70')+rect(610,90,20,235,'#d1d5c4')+circle(620,95,40,'#b54e43')
scenes['rail']=rect(170,280,460,100,'#d0d7c9')+''.join(rect(x,233,13,115,'#9aaba1')for x in [220,310,400,490,580])+path('M175 225Q200 200 225 225H605Q627 225 627 241Q627 256 605 256H200Q175 256 175 225Z','#afbeb5')+line(205,221,599,221,'#e5eadd',3)
scenes['readers']=rect(368,105,64,290,'#9aaea4')+rect(337,153,126,77,'#ecbd6f')+rect(337,254,126,77,'#ecbd6f')+rect(360,168,80,39,'#435c54')+rect(360,270,80,39,'#435c54')+circle(400,192,12,'#8bb9a0')+circle(400,294,12,'#8bb9a0')
scenes['queue']=rect(255,60,290,130,'#c5cfc2')+rect(275,70,118,110,'#597a74')+rect(407,70,118,110,'#597a74')+arrow(400,195,0,100,'#6c9681')+arrow(240,290,70,-65,'#c78c38')+arrow(560,290,-70,-65,'#c78c38')+line(140,334,660,334,'#dfba55',10)
scenes['taxis']=''.join(rect(x,225,155,65,c)+path(f'M{x+18} 225l25-48h65l35 48Z','#bdd8ce')+rect(x+60,160,45,19,'#f5eed7')+wheels([x+30,x+125],298)for x,c in [(125,'#be594b'),(324,'#649369'),(523,'#678cba')])
scenes['bus-step']=rect(160,100,480,255,'#b9c4b9')+rect(185,118,160,110,'#76928b')+rect(490,118,120,110,'#76928b')+path('M180 320H300V285H400V250H600V355H180Z','#d9c9a3')+rect(410,208,70,42,'#688984')+line(400,294,595,294,'#c7b387',3)
scenes['floor-zones']=path('M170 100H630L680 380H120Z','#b2bdb0')+path('M260 100H540L585 380H215Z','#ddd7b9')+rect(130,150,87,158,'#637a71')+rect(583,150,87,158,'#637a71')+line(270,100,230,380,'#ece5d1',5)+line(530,100,570,380,'#ece5d1',5)
scenes['heartbeat-bus']=rect(140,110,520,235,'#b8493d')+''.join(rect(x,135,65,60,'#88a99d')+rect(x,227,65,50,'#88a99d')for x in [165,245,325,405,485,565])+path('M260 242H310L337 215L361 280L387 226L415 246H540','none','#f4eee0',10)+wheels([240,565],352)
scenes['bun']=path('M175 300Q170 170 350 150Q500 130 640 250L590 340H230Z','#d7a264')+path('M275 292Q285 205 425 211Q500 211 520 291Q425 340 275 292Z','#f2d394')+''.join(circle(x,y,5,'#b98e54')for x,y in [(300,270),(334,247),(365,286),(400,240),(438,275),(476,250),(493,282)])+path('M220 225Q240 203 275 198','none','#f6d398',8)
scenes['warm-cup']=rect(270,203,215,135,'#f7eed4')+path('M485 225Q560 225 530 289Q510 305 485 283','#f7eed4')+path('M288 208Q340 238 465 208','#bad3c1')+path('M225 110L300 135L325 185L280 205L232 148Z','#a5b8ad')+path('M285 178Q320 190 345 221','none','#a7c6bb',10)+path('M370 190Q350 165 375 145M420 190Q400 165 425 145','none','#fff9ec',5)
scenes['buckets']=path('M270 145H530L505 345H295Z','#b85545')+path('M285 220H515L495 388H305Z','#d17458')+rect(270,205,260,21,'#e69973')+rect(291,229,220,14,'#4b6756')+path('M285 250Q400 440 515 250','none','#6c6e59',9)
scenes['gourd']=path('M375 100Q340 105 340 150Q340 181 370 195Q335 204 303 245Q270 300 315 355Q398 400 480 355Q525 300 493 245Q467 212 430 195Q461 179 461 145Q457 110 425 100Z','#d3a94f')+rect(370,75,60,28,'#b68b3c')+path('M494 260Q555 255 548 220Q543 204 525 212','none','#b68b3c',22)+path('M330 250Q310 300 335 329','none','#f4d783',8)
scenes['cup-base']=path('M300 175H500L540 355H260Z','#bdc6ab')+path('M300 175Q400 126 500 175Q500 213 400 220Q300 213 300 175Z','#9caa91')+path('M330 190Q400 225 470 190L470 250Q400 275 330 250Z','#617b72')+path('M393 212Q367 240 400 248Q430 240 407 212Z','#8ac6c4')
scenes['hydrant-plate']=rect(270,90,260,320,'#f0cf5a')+text(400,180,'150',48)+text(400,270,'H',100)+line(292,286,507,286,'#344c3c',6)+text(400,365,'2.5',57)
scenes['flood-slots']=rect(210,90,380,290,'#dfd3b5')+rect(255,110,290,250,'#6c8175')+rect(270,130,20,220,'#9dada2')+rect(510,130,20,220,'#9dada2')+''.join(rect(283,y,235,30,'#c2cbc0',2)for y in [245,277,309])+path('M130 350Q170 330 210 350T290 350','none','#719b9c',10)
scenes['pipes']=rect(155,100,490,290,'#d6c9aa')+rect(370,110,60,255,'#b5b9a9')+rect(355,215,90,35,'#8b9f91')+path('M435 252Q455 278 440 293Q426 290 435 252Z','#68a5a5')+path('M454 258Q480 300 474 350','none','#809889',8)+line(160,195,330,195,'#c6b79a',4)
scenes['shelter']=path('M170 190L610 255L633 234L192 169Z','#c69c62')+rect(190,195,16,175,'#8ca197')+rect(583,255,16,115,'#8ca197')+path('M560 243L600 250V350','none','#6e9686',13)+path('M300 170L450 192L560 208','none','#9bc8c1',5)+arrow(430,213,90,15,'#74a6a1')
scenes['pool-gutter']=rect(140,150,530,230,'#83bab9')+rect(260,207,330,87,'#e8ddbc')+rect(270,225,310,42,'#5f8178')+''.join(line(x,223,x,270,'#c2c7af',8)for x in range(277,580,24))+''.join(path(f'M170 {y}q30-14 60 0t60 0','none','#bcddd1',4)for y in [180,320,350])
scenes['light-rail-readers']=''.join(rect(x,155,155,190,color)+rect(x+17,188,121,78,'#f5efd7')+text(x+77,216,ch,24)+text(x+77,248,en,20)+rect(x+45,283,65,32,'#506b5e')for x,color,ch,en in [(210,'#dba253','入站','ENTRY'),(435,'#73a58a','出站','EXIT')])
scenes['gangway']=rect(155,100,490,275,'#bec9b9')+path('M170 235Q390 130 500 240L490 290Q320 205 170 305Z','#aab5aa')+path('M300 235Q470 175 630 240V309Q430 260 310 299Z','#d1d5c3')+path('M300 250Q405 215 492 255','none','#6e8276',5)+''.join(line(175+i*25,120,185+i*25,195,'#7c9384',6)for i in range(7))
scenes['rebate-reader']=rect(170,85,470,310,'#c2d1bf')+rect(315,137,170,225,'#b19e6c')+rect(330,185,140,104,'#f3e4b5')+text(400,225,'回贈',31)+text(400,264,'REBATE',25)+rect(355,307,90,32,'#657d6e')
scenes['tram-window']=rect(200,80,400,290,'#6d977f')+rect(265,130,270,190,'#bad3c4')+path('M270 150L512 172L500 285L270 298Z','#d5e3d0')+path('M510 174L540 149L530 310L500 285Z','#678b80')+arrow(560,240,-40,0,'#7caca9')+line(280,164,280,281,'#fff0cb',5)
scenes['luggage-rack']=rect(170,95,470,285,'#c7d4c5')+rect(250,150,300,190,'#8aa69b')+line(260,230,540,230,'#e5e1c7',12)+rect(326,230,150,96,'#bd925d')+rect(365,211,70,20,'#465d51')+line(365,245,365,310,'#e5c893',4)+line(435,245,435,310,'#e5c893',4)
scenes['tea-sock']=path('M290 180H510Q500 300 420 319Q350 323 320 275Z','#d3b583')+path('M300 180Q400 145 500 180Q400 205 300 180Z','#e7d4ac')+path('M300 179Q400 164 500 179','none','#617e6a',11)+line(500,180,620,155,'#617e6a',10)+path('M420 316L420 355','none','#aa7148',8)+path('M300 350H510V385H300Z','#b2bcb0')
scenes['wonton']=path('M190 250H610Q565 402 400 400Q235 402 190 250Z','#ece2bf')+path('M200 249Q400 184 600 249Q400 317 200 249Z','#c49a54')+''.join(circle(x,y,27,'#ead499')for x,y in [(315,273),(400,283),(480,269)])+''.join(path(f'M{290+i*20} 235q40-40 90 0t80 0','none','#efcf6a',5)for i in range(6))
scenes['plug']=rect(280,215,240,145,'#f1e5c6')+rect(366,112,67,120,'#c5b06a')+rect(292,249,56,65,'#c5b06a')+rect(453,249,56,65,'#c5b06a')+path('M350 360Q400 425 450 360','none','#7e8977',28)+line(380,122,380,215,'#f8dfa0',6)
scenes['peephole']=rect(165,90,470,300,'#c4a779')+circle(400,250,88,'#b6ab78')+circle(400,250,62,'#455f57')+circle(400,250,38,'#89aea1')+path('M375 237Q390 207 417 216','none','#d7ebd4',8)+circle(400,250,12,'#577f70')
scenes['drink-packs']=path('M235 190L255 165V125H325V165L345 190V350H235Z','#c5d8b0')+rect(250,242,80,63,'#f0dfaf')+rect(445,173,130,177,'#d7d9a3')+path('M445 173L465 130H555L575 173Z','#ece4c4')+rect(463,242,95,63,'#f0dfaf')
scenes['look-right']=path('M140 145H660V355H140Z','#62726b')+text(400,252,'LOOK RIGHT',45,'#f8eed0')+arrow(280,300,240,0,'#f8eed0')+line(170,155,630,155,'#dcc15b',9)
scenes['crossing']=label_card('↗')+rect(330,170,140,180,'#354c42')+circle(410,210,17,'#92ba78')+path('M408 235L385 280L430 315M403 250L445 274M390 280L360 315','none','#92ba78',14)
scenes['bollard']=rect(355,90,90,240,'#8aa496')+rect(340,270,120,55,'#c0ba99')+rect(370,244,60,47,'#d4ba73')+circle(400,266,10,'#405c4d')+rect(396,268,8,12,'#405c4d',1)+line(357,300,443,300,'#405c4d',5)
scenes['double-door']=rect(190,75,420,320,'#bfa579')+rect(225,110,220,265,'#d3ba88')+rect(400,100,160,280,'#839781')+''.join(line(x,110,x,365,'#455e4e',8)for x in [418,450,482,514,546])+line(405,235,551,235,'#455e4e',8)
scenes['neon-bracket']=rect(120,65,200,340,'#beaf91')+rect(320,167,310,160,'#477469')+path('M335 150H520L460 205L330 215Z','#8e7c5b')+circle(349,190,24,'#9f6748')+circle(349,190,10,'#554e38')+path('M365 198L380 245L430 267','none','#a77450',10)+text(501,274,'茶',83,'#eab577')
scenes['announcement']=label_card('…')+path('M300 220L350 220L420 170V320L350 270H300Z','#789c87')+path('M450 205Q505 245 450 285M480 170Q570 245 480 320','none','#8faca0',8)
scenes['seat-counter']=label_card('08')+rect(300,150,200,90,'#416c5c')+text(400,213,'08',62,'#c7d8a5')+rect(375,270,50,25,'#7b8e77')+path('M330 350V325H380V300H430','none','#7b8e77',8)
scenes['trolley']=rect(200,310,400,85,'#658a6d')+path('M285 310L460 167L500 139','none','#677c63',12)+line(140,110,650,110,'#4c6658',7)+circle(502,138,15,'#d4bc76')+path('M502 153Q565 220 560 320','none','#526d5c',5)
scenes['seatbelt']=rect(250,140,300,240,'#889f83')+path('M280 140L500 350','none','#4c6152',31)+rect(376,248,59,44,'#b85c4c')+rect(390,258,30,20,'#d8b979')
scenes['suitcase-measures']=rect(315,145,170,210,'#b49068')+rect(365,125,70,20,'#4d6756')+line(306,135,490,135,'#527a68',4)+text(400,116,'60',32)+line(520,145,520,355,'#527a68',4)+text(555,258,'50',32)+line(275,260,315,220,'#527a68',4)+text(260,238,'40',32)+wheels([346,459],365)
scenes['waffle']=path('M210 280Q200 160 400 140Q590 160 590 280Q400 375 210 280Z','#ad8d5d')+''.join(circle(x,y,24,'#e7bd70')for y in [210,262]for x in [285,342,399,456,513])+path('M610 220Q675 290 585 335','none','#b97447',9)+path('M585 310L585 335L613 330','none','#b97447',9)
scenes['dumpling']=path('M230 320Q220 220 315 205Q400 145 480 200Q560 220 570 320Q400 390 230 320Z','#eee2bd')+''.join(path(f'M{270+i*24} 303Q{260+i*26} 226 {300+i*25} 213','none','#bcae8e',5)for i in range(9))+path('M315 302Q400 250 490 301','none','#e0b5a2',15)
scenes['lactic-label']=''.join(path(f'M{x} 174L{x+16} 153V130H{x+83}V153L{x+100} 174V335H{x}Z','#e3d7ac')+rect(x+5,210,90,62,'#f3e7bd')+text(x+50,250,'100mL',24)for x in [248,452])
scenes['claypot']=path('M210 210H590Q560 370 400 370Q240 370 210 210Z','#a16f4f')+path('M250 217H550Q530 337 400 337Q270 337 250 217Z','#eee0ac')+path('M268 303Q400 347 531 303L516 327Q400 368 281 327Z','#c6984c')+''.join(line(x,237,x+15,245,'#f9edc6',4)for x in range(290,515,29))+rect(172,223,43,36,'#936747')+rect(585,223,43,36,'#936747')
scenes['yuenyeung']=rect(330,250,140,110,'#ddd3a7')+path('M230 125L300 190L260 230L190 170Z','#698b74')+path('M565 125L600 170L535 230L495 190Z','#698b74')+path('M272 211Q325 215 367 264','none','#c19a62',17)+path('M524 211Q475 215 436 264','none','#78573f',17)+rect(339,277,122,61,'#a77c4e')
scenes['loop']=path('M140 110H660L700 390H100Z','#6f7e70')+path('M267 179H530L552 293H245Z','none','#384f42',12)+path('M395 293L390 370','none','#384f42',7)+line(175,140,623,140,'#f3e7c5',12)
scenes['signal-border']=rect(305,90,190,315,'#f3efd7')+rect(321,106,158,283,'#304a3f')+circle(400,157,36,'#b75f4e')+circle(400,248,36,'#d7b65f')+circle(400,339,36,'#86ae86')+rect(390,406,20,40,'#5d7d67')
scenes['tunnel-louvers']=path('M160 365V200Q400-25 640 200V365Z','#adb59a')+path('M230 365V215Q400 35 570 215V365Z','#405b50')+path('M100 380L300 170H500L700 380Z','#7c8977')+''.join(path(f'M{210-i*25} {190+i*28}L{590+i*25} {190+i*28}','none','#c4c4a7',18)for i in range(5))+line(396,230,396,370,'#e4cd87',7)
scenes['sand-box']=rect(250,160,300,200,'#c59651')+path('M233 160L260 135H540L565 160Z','#b85e4b')+text(400,272,'SAND',55)+''.join(circle(x,y,3,'#e4c385')for x,y in [(275,172),(288,169),(310,175),(322,166),(496,175),(515,169)])
scenes['tactile']=path('M130 190H670V340H130Z','#d7cbaa')+rect(250,210,300,95,'#d4b959')+''.join(circle(x,y,9,'#f0d67f')for x in range(270,550,35)for y in [230,264,295])+''.join(line(x,115,x,188,'#b99748',13)for x in range(290,530,36))+path('M130 340H670L630 390H170Z','#a7a88e')
scenes['raised-entry']=rect(220,50,360,315,'#b9c2a5')+rect(260,80,280,275,'#486858')+path('M250 365V320H275V280H525V320H550V365Z','#d1c9a8')+''.join(rect(269,y,261,26,'#aabfb0',2)for y in [234,261,288])+path('M100 350Q140 330 180 350T260 350','none','#7fb3ad',12)
scenes['hammer']=rect(225,105,350,260,'#afd2be')+rect(360,180,80,160,'#8b9d7c')+path('M384 185L396 315H415L416 185Z','#b95b4a')+path('M338 179L338 206L460 196L440 170Z','#c7c3a6')+rect(485,115,55,70,'#f1e3bd')+path('M500 132L525 169M525 132L500 169','none','#b45b48',6)
scenes['post-slots']=rect(190,110,420,285,'#6d997a')+rect(214,168,170,126,'#e2d8b5')+rect(416,168,170,126,'#e2d8b5')+text(299,210,'本港',33)+text(501,210,'外地',33)+text(299,241,'LOCAL',22)+text(501,241,'OVERSEAS',22)+rect(225,262,148,17,'#354e3f')+rect(427,262,148,17,'#354e3f')
scenes['rain']=label_card('☂')+''.join(circle(x,290,22,c)for x,c in [(310,'#d8b34e'),(400,'#b8574b'),(490,'#314c41')])
scenes['triage']=label_card('I')+path('M390 285V325M370 305H410','none','#b95a48',14)
scenes['menu']=rect(200,95,400,290,'#e8d8ac')+rect(225,125,350,235,'#fff0ca')+text(400,160,'今日餐牌',29)+line(240,181,560,181,'#819079',4)+text(400,232,'轉指定品牌麵',34)+text(400,295,'+$4',57,'#9b4f38')
scenes['water-tooth']=path('M280 150Q340 120 385 160Q440 120 485 150Q530 180 475 320Q447 370 425 300Q400 265 375 300Q350 370 325 320Q265 180 280 150Z','#f3ead0')+path('M542 170Q485 245 542 270Q600 245 542 170Z','#8abbb0')
scenes['vegetables']=''.join(path(f'M{315+i*24} 345Q{250+i*35} 160 {310+i*30} 130Q{350+i*25} 160 {375+i*10} 335Z',c)for i,c in enumerate(['#648b5b','#89a66c','#557c55','#719b61','#98b16f']))+path('M282 228L510 240L506 280L280 266Z','#bf6054')+path('M330 243L460 250','none','#dd8870',5)
scenes['pastry']=path('M210 300Q210 160 400 145Q585 160 590 300L540 355H260Z','#cc9b5c')+path('M270 305Q270 205 410 200Q525 218 530 305L490 333H310Z','#d9bd7c')+path('M335 290Q330 215 410 222Q480 235 465 305Z','#5e654b')+path('M295 250L335 242L345 265L307 273Z','#e7b99c')+path('M480 277L510 267L518 288L484 300Z','#e7b99c')
scenes['floorplan']=rect(150,100,500,295,'#e4ddba')+rect(180,130,330,235,'#f4edcd')+line(350,130,350,270,'#586e58',8)+line(180,250,350,250,'#586e58',8)+line(520,100,520,260,'#586e58',12)+line(520,325,520,395,'#586e58',12)+path('M520 325Q585 325 585 260H520','none','#a47545',5)+rect(555,148,60,65,'#a9b49d')+text(600,345,'公用',23)+text(600,375,'大堂',23)+text(265,200,'睡房',29)+text(265,315,'廚房',29)+text(423,220,'客廳',29)
# Repeatable city context is deliberately outside the diagnostic detail.
for t in manifest['topics']:
 n=int(t['id'][1:]);name=t['scene'];assert name in scenes,name
 background=rect(0,0,800,500,'#f6edcf',0)+''.join(rect(x,20+(i%3)*12,86,90,'#e3e4c9',3)for i,x in enumerate([28,125,590,687]))+''.join(rect(x,y,13,18,'#bec9b0',1)for x in [42,72,140,170,604,634,702,732]for y in [46,77])+path('M0 415Q150 400 300 419T600 416T800 416','none','#dbcfac',4)
 panel=f'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><title>香港街角觀察漫畫 {n:02}</title><desc>日常物件的原創教學示意，並非官方圖則或現場照片。</desc><g stroke="#304b43" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">{background}{scenes[name]}</g><g stroke="none">{face(73,439)}{text(116,448,"!",30)}</g></svg>\n'
 file=root/'assets'/f'street-{n:02}.svg'
 if '--check' in sys.argv:
  assert file.read_text()==panel,f'Out of date: {file}'
 else:file.write_text(panel)
print('60 original street panels '+('verified' if '--check' in sys.argv else 'generated'))
