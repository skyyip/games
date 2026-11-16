"""Original explanatory SVG comics for the 60 everyday-design questions."""
from pathlib import Path
from html import escape

OUT = Path(__file__).parent
INK = '#243335'
PAPER = '#fff5dc'
RED = '#ce523c'
GREEN = '#3d8068'
GOLD = '#e8b851'
BLUE = '#76a6b7'

def rect(x,y,w,h,fill=PAPER,r=8):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"/>'
def line(x,y,a,b,color=INK,width=5):
    return f'<path d="M{x} {y}L{a} {b}" fill="none" stroke="{color}" stroke-width="{width}"/>'
def path(d,fill='none',color=INK,width=5):
    return f'<path d="{d}" fill="{fill}" stroke="{color}" stroke-width="{width}"/>'
def circle(x,y,r,fill=PAPER):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}"/>'
def text(x,y,value,size=32,fill=INK):
    return f'<text x="{x}" y="{y}" fill="{fill}" stroke="none" font-size="{size}" font-weight="700" text-anchor="middle" font-family="system-ui,PingFang TC,Noto Sans TC,sans-serif">{escape(str(value))}</text>'
def arrow(x,y,a,b,color=RED):
    return line(x,y,a,b,color,8)+path(f'M{a-12} {b-10}L{a} {b}L{a+12} {b-10}',color=color,width=7)
def road():
    return path('M300 100H500L660 430H140Z','#6b7476')+line(400,130,400,180,'#fff5dc',7)+line(400,215,400,275,'#fff5dc',7)+line(400,325,400,400,'#fff5dc',7)
def wheel(x,y,r=31):
    return circle(x,y,r,INK)+circle(x,y,r*.44,'#a7b7b2')
def bus(color=RED,label='BUS'):
    return rect(205,130,390,235,color,23)+rect(230,155,340,77,'#b9d6d8')+rect(230,249,340,60,'#b9d6d8')+wheel(270,368)+wheel(530,368)+text(400,220,label,38)
def cup(x=400,y=285):
    return path(f'M{x-73} {y-64}H{x+73}L{x+51} {y+58}H{x-51}Z','#eee6cd')+path(f'M{x+70} {y-40}Q{x+130} {y-28} {x+58} {y+35}')+path(f'M{x-90} {y+66}Q{x} {y+108} {x+90} {y+66}')
def door(x=245,y=115,w=310,h=290):
    return rect(x,y,w,h,'#d6e6df',0)+line(x+w/2,y,x+w/2,y+h)+line(x+w/2-17,y+h*.5,x+w/2-17,y+h*.65)+line(x+w/2+17,y+h*.5,x+w/2+17,y+h*.65)
def minibus(x,y,color):
    return rect(x,y,240,115,'#eee9d7',14)+rect(x,y,240,31,color,10)+rect(x+20,y+42,132,43,'#b9d6d8')+rect(x+169,y+42,48,43,'#b9d6d8')+wheel(x+53,y+119,22)+wheel(x+188,y+119,22)
def stall(papers=False):
    s=rect(240,130,320,280,GREEN)+path('M240 130H560L620 205H180Z','#b7d0a0')+rect(270,215,260,120,'#172f2b')+rect(215,340,370,35,GREEN)
    if papers:
        for x in range(280,510,48):s+=rect(x,235,42,88,'#f4ecd6',0)+text(x+21,259,'報',20)+line(x+8,273,x+33,273,width=2)+line(x+8,282,x+33,282,width=2)
    return s

def scene(n):
    if n==1:return road()+rect(330,252,140,70,'#a5b0af',12)+rect(345,263,110,41,RED)+line(320,245,305,226,GOLD)+line(477,245,492,226,GOLD)
    if n==2:return line(412,280,412,420,'#91a19a',15)+rect(300,133,220,175,'#eb8d39',15)+circle(410,209,48,'#2f4146')+circle(410,209,21,BLUE)+rect(330,275,72,17,'#f7e2a0')
    if n==3:return path('M120 160H680V425H120Z','#788283')+path('M120 160L680 160L680 205H120Z','#c8bfa4')+line(140,246,660,246,GOLD,13)+line(140,280,660,280,GOLD,13)
    if n==4:
        return path('M250 430L360 120M450 430L410 120M350 430L550 120M490 430L595 120',color='#7f9292',width=11)+path('M336 320Q410 240 557 210',color='#e5b04a',width=7)+line(450,190,370,320,'#3c5055',10)+circle(458,180,17,'#c79b75')
    if n==5:return line(400,90,400,430,GOLD,24)+rect(305,175,190,150,'#e6c363',25)+circle(400,247,53,RED)+text(400,255,'STOP',23,'#fff9e9')
    if n==6:return rect(180,130,440,270,'#d8ded0',20)+circle(280,245,45,'#a8baae')+path('M215 350Q280 276 345 350','#a8baae')+text(462,245,'***',67)+text(453,300,'DEMO',26)+line(380,328,565,328,'#758b82',9)
    if n==7:return rect(210,171,320,170,'#f4efe0')+rect(530,220,78,121,RED)+rect(210,171,320,37,RED)+rect(210,303,320,38,BLUE)+rect(257,226,188,64,'#b3d8d6')+wheel(278,354)+wheel(547,354)+path('M380 166L359 112H401Z',GOLD)+circle(380,101,30,'#fff9e9')
    if n==8:return rect(168,150,464,232,'#bfb3cf',14)+circle(492,265,61,'#dbe1df')+text(319,265,'HK$10',52,'#55426e')+text(400,350,'示意 SAMPLE',20,'#55426e')
    if n==9:return rect(285,105,230,300,GREEN,25)+rect(313,143,174,102,'#e0edcd')+text(400,206,'-$12.4',32)+rect(322,275,156,85,'#d59d6d')+circle(400,311,27,'#dfc5ac')
    if n==10:return rect(266,136,268,255,RED,19)+rect(306,198,188,135,'#eee6d7')+circle(400,263,14,INK)+path('M355 166L366 151L377 166L388 151L400 166L411 151L423 166L434 151L445 166',color='#fff5dc',width=4)+text(400,369,'FIRE',24,'#fff9e9')
    if n==11:
        s=rect(165,156,470,206,'#b6c6bf',13)+rect(185,188,74,158,'#dce4cf',3)+rect(275,186,335,86,'#315b50',5)+rect(165,282,470,16,GOLD,0)+text(444,243,'頭等  1',42,'#fff9e9')
        return s+wheel(259,373,22)+wheel(292,373,22)+wheel(509,373,22)+wheel(542,373,22)+line(145,404,655,404,'#7d8d84',8)+line(145,421,655,421,'#7d8d84',8)
    if n==12:
        s=''
        for y in [165,197,229,284,312]:s+=rect(210,y,380,23,'#be956b',3)
        return s+line(250,336,235,410,width=13)+line(550,336,566,410,width=13)+path('M365 322V245Q400 192 435 245V322',color='#b0bab5',width=15)
    if n==13:return rect(235,105,330,310,BLUE,1)+line(400,105,400,415,width=11)+line(235,260,565,260,width=11)+line(250,120,550,400,GOLD,12)+line(550,120,250,400,GOLD,12)+line(270,155,280,185,'#eff6e6',5)+line(610,160,665,125,'#7b9a8d',6)+line(607,223,675,187,'#7b9a8d',6)
    if n==14:
        s=rect(172,95,456,320,'#dbd3bd',0)
        for x in [280,390,500]:s+=line(x,365,x-35,178,'#edeedb',15)+circle(x,365,13,'#87968c')
        return s+path('M319 183L367 169L392 231L362 239L372 321L293 330L284 254L260 262L241 203L282 189L302 212Z','#8bbca8',width=3)
    if n==15:return stall()+path('M240 130L165 170V403L240 375Z','#83aa92')+path('M560 130L635 170V403L560 375Z','#83aa92')
    if n==16:
        s=path('M180 360L580 160Q625 140 642 169L230 392Z','#303b3d',width=13)
        for x,y in [(255,337),(360,285),(465,232),(575,178)]:s+=circle(x,y,13,'#fff9e9')
        return s+path('M230 402L638 198L638 243L280 425Z','#aabcb5',width=4)
    if n==17:return rect(265,232,250,103,RED,15)+rect(300,162,111,85,'#bfd4d3')+rect(411,210,70,90,RED)+rect(330,139,52,20,BLUE)+wheel(297,342,43)+wheel(487,342,43)+path('M250 230Q195 190 195 270T260 317',color='#a2bd96',width=12)
    if n==18:return door()+rect(330,90,140,25,GOLD,4)+line(300,78,284,60,GOLD,7)+line(500,78,517,60,GOLD,7)+line(400,65,400,45,GOLD,7)
    if n==19:
        s=road()
        for y,w in [(145,160),(176,193),(217,235),(274,288),(351,365)]:s+=path(f'M{400-w/2} {y}H{400+w/2}',color=GOLD,width=13)
        return s
    if n==20:return rect(230,145,340,230,'#b6d4d6',22)+rect(333,182,134,141,'#fff9e9',1)+text(400,291,'P',109,RED)+line(185,391,615,391,width=18)
    if n==21:
        s=door()
        for y in [233,320]:
            for x in range(266,550,35):s+=circle(x,y,8,'#fff9e9')
        return s
    if n==22:return path('M240 118H560V390H410V265H240Z','#b7cdb7',width=5)+path('M315 370V206H485V140',color=BLUE,width=18)+path('M296 350L315 375L334 350',color=BLUE,width=9)+rect(250,119,125,86,'#efd395',2)+text(313,173,'更衣',26)
    if n==23:
        s=''
        for y in [128,219,310]:
            for x in [230,345,460]:s+=rect(x,y,101,77,'#b1bbaa',0)+path(f'M{x+12} {y+38}L{x+50} {y+11}L{x+89} {y+38}L{x+50} {y+66}Z','#6f9687',width=3)
        return s
    if n==24:return circle(400,262,152,'#b6b294')+circle(400,262,124,'#f8eed7')+rect(289,215,225,64,'#fff9e9',3)+text(350,259,'0001',35)+rect(412,216,101,62,RED,0)+text(461,258,'1992',28,'#fff9e9')+text(400,317,'m³',28)+path('M366 361L400 339L432 361',color=BLUE,width=5)
    if n==25:
        s=rect(185,150,430,230,'#b4c9aa',10)+text(400,260,'SAMPLE',42,'#4f6a55')
        for x in [230,249,268,530,549,568]:s+=line(x,290,x+20,260,'#375948',7)
        return s+circle(336,325,6,INK)+circle(356,325,6,INK)+circle(336,342,6,INK)
    if n==26:return path('M291 175L340 126H460L509 175V389H291Z','#c2d99b')+rect(291,175,218,214,'#a4c682',2)+path('M291 175L242 145L282 124L340 126Z',PAPER)+path('M460 126L514 124L555 147L509 175Z',PAPER)+path('M428 240V95L487 58',color='#f7e9ca',width=13)+circle(385,293,47,GOLD)
    if n==27:return rect(215,115,370,284,'#315b50')+text(400,184,'套餐',38,'#fff9e9')+text(400,245,'熱飲 / 凍飲',28,'#fff9e9')+text(400,314,'+$ ?',40,GOLD)+line(255,346,545,346,'#fff9e9',3)
    if n==28:return rect(170,181,170,118,'#b65342',16)+rect(460,181,170,118,'#b65342',16)+rect(170,292,170,70,'#d77d61')+rect(460,292,170,70,'#d77d61')+path('M305 235H495L540 295H260Z','#e9c58d')+line(400,297,400,395,width=18)+line(330,398,470,398,width=10)
    if n==29:
        s=rect(275,105,250,310,'#b4c5be')
        for x,y,v in [(340,180,3),(460,180,5),(340,300,12),(460,300,15)]:s+=circle(x,y,37,'#ece8d9')+text(x,y+11,v,30)
        return s
    if n==30:return path('M270 201H530L557 400H243Z','#b4cda5')+path('M330 202V164Q400 102 470 164V202',color='#9dbb8e',width=21)+path('M301 282Q380 223 477 283L517 247V326L477 293Q383 352 301 292Z','#b9ced0')+circle(328,281,5,INK)
    if n==31:return rect(120,352,560,64,'#c6b798',0)+rect(281,198,238,176,RED,3)+path('M255 202L400 130L545 202Z','#b74032')+text(400,273,'土地',40,'#f0cc6b')+rect(340,310,120,45,GOLD,4)+line(378,319,378,285,width=3)+line(422,319,422,285,width=3)
    if n==32:return path('M180 370L535 130H620L265 370Z','#a8beb1')+path('M180 338L535 100M265 338L620 100',color=GREEN,width=15)+path('M280 330L498 183',color=RED,width=10)+path('M475 179L505 177L493 209',color=RED,width=8)+path('M479 304L359 386',color=BLUE,width=10)+path('M362 361L352 391L383 385',color=BLUE,width=8)
    if n==33:return minibus(130,173,GREEN)+minibus(420,235,RED)
    if n==34:
        s=path('M175 380L400 295L625 380Z','#9c9b87')+line(400,300,400,120,width=9)+line(250,159,550,159,'#789195',7)
        for x in range(280,550,45):s+=line(x,125,x,193,'#789195',6)
        return s+path('M573 137Q615 158 573 181M600 118Q666 159 600 200',color=BLUE,width=6)
    if n==35:return road()+line(185,170,615,170,width=15)+rect(220,124,140,115,'#233b3b')+rect(440,124,140,115,'#233b3b')+line(253,149,327,212,RED,14)+line(327,149,253,212,RED,14)+line(509,145,509,210,'#9edbb4',12)+path('M484 186L509 216L534 186',color='#9edbb4',width=12)
    if n==36:return path('M190 402H295V335H400V270H505V204H610',color='#8fa69a',width=21)+circle(409,217,106,RED)+circle(409,217,91,'#b1d2d7')+path('M339 256L371 237L399 217L430 192L468 168',color='#6e8e8b',width=14)+path('M351 162Q373 144 393 145',color='#fff9e9',width=9)
    if n==37:return rect(207,224,386,119,RED,24)+path('M286 224L330 149H482L524 224Z','#afd2d6')+rect(338,113,140,47,'#fff9e9',4)+text(408,146,'交更',30)+wheel(285,350)+wheel(517,350)
    if n==38:
        s=rect(166,140,468,118,'#bdcfce',2)+path('M166 295H634V406H166Z','#c9c6ac')+line(180,350,620,350,GOLD,9)
        for x in range(185,620,31):s+=rect(x,276,23,31,'#d1aa55',1)
        return s+path('M166 258H634V276H166Z','#4c625e',width=2)
    if n==39:return line(400,300,400,425,'#a3b3a9',14)+rect(220,125,360,194,GREEN,6)+text(329,235,'1',83,'#fff9e9')+path('M425 256L508 173M466 174H510V218',color='#fff9e9',width=13)
    if n==40:
        s=line(220,145,220,411,width=15)+line(580,145,580,411,width=15)+line(220,145,580,145,width=18)
        for i,x in enumerate(range(255,565,46)):s+=rect(x,165,23,151,GOLD if i%2 else INK,1)
        return s+path('M350 120L400 48L450 120Z',GOLD)+text(400,108,'!',43)
    if n==41:return cup()+path('M359 183Q335 152 361 118M401 177Q378 147 405 113M441 183Q420 156 444 127',color='#9cb1a0',width=7)
    if n==42:return path('M208 278L276 179H359L385 262L548 288Q587 312 565 343H219Q186 321 208 278Z','#eee9d7')+path('M216 341H566V367H206Z',GREEN)+line(312,236,357,254,width=4)+line(303,255,347,271,width=4)+line(295,274,337,290,width=4)
    if n==43:return path('M300 140H500L474 402H326Z','#c29357')+path('M322 169H478L468 230H332Z','#b6d5dc')+circle(393,290,59,GOLD)+circle(393,290,44,'#f1d88a')+path('M393 246V334M349 290H437',color='#b08d3d',width=3)+line(459,341,515,77,'#a6b8ae',12)+circle(452,355,24,'#a6b8ae')
    if n==44:
        s=''
        for x,c in [(170,'#557eaa'),(340,GOLD),(510,'#a47850')]:s+=rect(x,160,125,238,c,12)+rect(x-8,139,141,47,c,13)+rect(x+24,151,76,20,INK,8)+path(f'M{x+47} 283L{x+67} 248L{x+87} 283L{x+47} 283',color='#fff9e9',width=5)
        return s
    if n==45:
        s=path('M170 410L292 110H500L630 410Z','#b9bca5')
        for row in range(7):
            y=143+row*37;t=(y-110)/300;left=292-122*t;right=500+130*t
            for col in range(7):s+=f'<ellipse cx="{left+20+col*(right-left-40)/6:.2f}" cy="{y}" rx="13" ry="10" fill="{["#8a9e97","#c8c3a7","#b1b3a3"][(row+col)%3]}" stroke-width="2"/>'
        return s
    if n==46:return rect(130,130,540,280,'#cbbfa5',1)+rect(226,195,156,151,'#8e9c95',7)+rect(420,195,156,151,'#8e9c95',7)+text(304,287,'SV',51)+text(498,287,'FH',51)
    if n==47:return line(400,90,400,420,'#8b9e91',23)+rect(293,173,214,159,GOLD,24)+circle(400,257,45,'#a8bba6')+path('M369 232L400 206L431 232M400 208V246',color='#716b45',width=9)+rect(344,311,113,24,'#8f895b',4)
    if n==48:
        s=rect(309,116,182,270,'#fff9e9',1)
        for y in [118,188,258]:s+=path(f'M310 {y}L490 {y+105}V{min(385,y+142)}L310 {y+38}Z',INK,width=1)
        return s+line(400,387,400,433,width=13)
    if n==49:return circle(353,259,133,'#c1d8d5')+line(353,128,353,391,width=9)+line(220,259,486,259,width=9)+rect(529,129,102,263,'#dbe4cd',2)+line(609,239,609,282,width=7)+path('M565 98L587 76L609 98',color=GREEN,width=8)
    if n==50:
        s=rect(307,95,186,330,'#b7b1a4',2)
        for y in [150,221,292,363]:s+=text(400,y,'旺角',38,'#fff9e9')
        return s+path('M282 95L307 95V425H282Z','#999e91',width=2)
    if n==51:return rect(272,171,49,204,'#768c86',8)+wheel(425,330,66)+wheel(531,371,24)+circle(423,159,28,'#d2ad8a')+path('M414 189L402 272H478L507 345H552',color=BLUE,width=19)+path('M376 194V291H483',color=INK,width=12)+path('M530 111H326M351 92L323 111L351 130',color=RED,width=8)
    if n==52:return rect(190,135,420,250,'#fff9e9',4)+text(400,247,'旺角',84,RED)+text(400,323,'經紅隧',42,'#5379a0')
    if n==53:return bus(GOLD,'')+rect(260,108,280,82,'#263c3c',10)+text(400,166,'N121',54,'#f1b950')
    if n==54:return rect(225,134,350,114,'#fff9e9',9)+text(400,207,'HK 0000',48)+rect(225,291,350,114,GOLD,9)+text(400,364,'HK 0000',48)
    if n==55:return path('M170 402V240Q170 105 310 105H490Q630 105 630 240V402Z','#a5b3a6')+path('M235 402V250Q235 167 320 167H480Q565 167 565 250V402Z','#344c4b')+line(180,234,620,234,BLUE,15)+rect(328,193,144,54,'#ecddae',4)+text(400,231,'TOLL',29)+line(400,276,400,314,'#fff9e9',5)+line(400,350,400,389,'#fff9e9',5)
    if n==56:return path('M286 239Q400 183 514 239L491 350Q400 400 309 350Z','#ede3c6')+path('M514 252Q602 201 597 293Q577 331 505 315')+path('M289 247L231 187L206 205L285 303Z','#ede3c6')+path('M322 214L446 159L464 180L340 235Z','#ede3c6')+circle(389,178,15,GOLD)
    if n==57:
        s=path('M234 209L520 171L579 299L292 353Z','#d6ad70')+path('M234 209L292 353V397L234 262Z','#9d684c')+path('M292 353L579 299V346L292 397Z','#ecd1aa')
        for x,y in [(287,235),(335,229),(386,218),(439,211),(487,205),(317,287),(369,278),(419,267),(469,257),(517,245)]:s+=circle(x,y,5,'#8e5e39')
        return s
    if n==58:
        s=rect(213,124,374,215,'#c4cec5',10)+rect(225,139,259,181,'#e0e3cd',4)+circle(538,216,28,'#84978a')+path('M525 330V361H564',color='#99b9b3',width=9)
        for y in range(160,310,23):s+=line(243,y,467,y,'#82938a',4)
        return s+path('M564 374Q588 407 564 419Q540 407 564 374Z',BLUE)
    if n==59:
        s=rect(208,103,384,313,'#8d674e',4)
        for row in range(4):
            for col in range(4):
                x,y=225+col*92,120+row*71;s+=rect(x,y,78,58,'#bb9069',3)+circle(x+39,y+43,5,GOLD)+text(x+39,y+26,['甘草','陳皮','藥材','分類'][(row+col)%4],17)
        return s
    if n==60:return stall(True)+text(400,174,'NEWS',33,'#f9efd5')
    raise ValueError(n)

for number in range(1,61):
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" role="img"><title>香港日常細節原創漫畫示意 {number:02d}</title><defs><pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.3" fill="#a99d7e" opacity=".25"/></pattern></defs><rect width="800" height="500" fill="{PAPER}"/><path d="M0 0H800V170L0 405Z" fill="url(#dots)"/><path d="M100 430H700" stroke="#b1bea1" stroke-width="9" stroke-linecap="round"/><g stroke="{INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">{scene(number)}</g><path d="M38 69L62 77M48 43L70 59M731 415L756 426M728 442L754 446" stroke="{RED}" stroke-width="6" stroke-linecap="round"/>{text(400,482,'原創漫畫示意 · 圖案並非官方規格圖或實拍',15,'#5e6a5a')}</svg>'''
    (OUT/f'daily-{number:02d}.svg').write_text(svg)
print('Generated 60 original everyday-design SVG diagrams.')
