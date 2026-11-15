"""Original teaching diagrams, not photographs, official marks or historic facsimiles."""
from pathlib import Path
import math
import xml.etree.ElementTree as ET

ROOT = Path(__file__).parent
INK, CREAM, GREEN, GOLD = '#293f53', '#f8efd7', '#739b82', '#e7bd73'
def rect(x,y,w,h,fill,rx=8,stroke=INK,sw=4):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def path(d,fill='none',stroke=INK,sw=4):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
def circle(x,y,r,fill,stroke=INK,sw=4):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def text(x,y,value,size=24,fill=INK):
    return f'<text x="{x}" y="{y}" fill="{fill}" text-anchor="middle" font-family="sans-serif" font-size="{size}" font-weight="700">{value}</text>'
def svg(name,title,content):
    value=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" role="img"><title>{title}</title><defs><linearGradient id="metal" x2="0" y2="1"><stop stop-color="#e9eeeb"/><stop offset=".5" stop-color="#9eb1b5"/><stop offset="1" stop-color="#d5dfdf"/></linearGradient></defs><rect width="800" height="500" fill="{CREAM}"/>{content}</svg>'
    ET.fromstring(value)
    (ROOT/(name+'.svg')).write_text(value)

# Historical tram, simplified gate and tray below the front (no electronics / operational guarantee).
a=rect(0,385,800,115,'#b9c7c5',0,'none')+path('M0 445H800M0 467H800',stroke='#7c9298',sw=7)
a+=rect(185,-15,430,330,GREEN,24)+rect(216,29,167,135,'#c2dbda')+rect(416,29,167,135,'#c2dbda')+rect(212,190,376,77,CREAM)
a+=circle(230,368,35,INK)+circle(570,368,35,INK)+rect(238,306,324,20,'#71858a',4)
a+=path('M225 334L201 399H599L575 334','#bba478')
for x in range(224,590,26):a+=path(f'M{x} 345L{x-11} 386',stroke='#785f45',sw=10)
a+=path('M208 396H593',stroke=INK,sw=8)
svg('tram-lifeguard','舊式電車車頭救生網裝置位置示意',a)

# Reversible wooden bench: visible pivots and alternate backrest position.
a=rect(0,345,800,155,'#cdb99b',0,'none')
for y in range(360,500,28):a+=path(f'M0 {y}H800',stroke='#b29a7b',sw=2)
a+=rect(130,230,540,45,'#b88d5e')+rect(143,143,514,75,'#d7bc8d')
for y in [162,185,207]:a+=path(f'M160 {y}H640',stroke='#9b784f',sw=5)
a+=path('M160 193L181 294V372M640 193L619 294V372M181 294H619',stroke=INK,sw=12)
a+=circle(181,270,12,GOLD)+circle(619,270,12,GOLD)
a+='<g opacity=".3">'+rect(143,290,514,73,'#d7bc8d')+'</g>'+path('M92 158Q42 246 92 330M708 330Q758 246 708 158',stroke=GREEN,sw=6)
a+=path('M72 315L92 330L100 305M700 183L708 158L728 171',stroke=GREEN,sw=6)
svg('ferry-bench','木椅椅背與兩側轉軸示意',a)

a=rect(0,0,800,500,'#c6d8d4',0,'none')+rect(55,35,690,167,'#e5ebe4',20)+rect(84,55,632,128,'#abc9ca',16)
a+=path('M100 216Q400 174 700 216V309Q400 354 100 309Z','url(#metal)')+path('M100 309L132 374H668L700 309','url(#metal)')
for x in [250,400,550]:a+=path(f'M{x} 215Q{x-15} 257 {x} 318',stroke='#7d9299',sw=3)
a+=path('M167 374V435M633 374V435',stroke=INK,sw=14)
svg('steel-seats','市區列車不銹鋼硬座椅示意',a)

a=rect(0,365,800,135,'#d1d8cd',0,'none')+rect(372,5,56,470,'#a9b8b9',18)+rect(249,65,302,325,'#f7f1dc',16)
a+=rect(270,84,260,43,'#c88876',4)+text(400,115,'R8 · DEMO',26)
for i in range(6):
    y=155+i*31
    a+=circle(305,y,6,'#f8efd7')+path(f'M305 {y+6}V{y+24}',stroke=GREEN)+rect(329,y-6,155-(i%3)*20,9,'#819b8f',2,'none',0)
a+=text(404,368,'08:00 — 20:00',19)
svg('bus-route-sheet','虛構巴士路線資料紙示意，非真實路線時間',a)

a=rect(0,0,800,500,'#203a50',0,'none')+rect(0,400,800,100,'#71878c',0,'none')
a+=circle(400,183,114,'#395767','none')+path('M134 359L193 266L577 266L665 359V423H134Z','#b87970')
a+=path('M225 266L268 209H504L556 266Z','#b4cfd0')+rect(293,156,214,55,'#fff6d1',8,'#e7bd73',5)+text(400,194,'TAXI',35)
a+=circle(246,415,39,INK)+circle(568,415,39,INK)+rect(147,355,91,36,'#f6dda2')+rect(576,355,76,36,'#f6dda2')
svg('taxi-light','夜間亮起的的士車頂燈示意',a)

a=rect(0,0,800,500,'#b0bcb4',0,'none')
for y in [60,180,300,420]:a+=path(f'M0 {y}H800',stroke='#92a59f',sw=3)
for x,y in [(177,100),(412,257),(655,413)]:
    a+=path(f'M{x} {y+28}Q{x+25} {y+88} {x+12} {y+140}L{x-18} {y+140}Q{x-10} {y+65} {x-24} {y+26}Z','#819b96','none')
    a+=path(f'M{x-42} {y-13}L{x-10} {y-31}H{x+31}V{y+28}L{x-10} {y+45}Z','#f1eee0')+circle(x-10,y+12,31,'#f7f1e2')+circle(x-10,y+12,20,'#526c74')
svg('weep-holes','擋土牆疏水孔及水漬示意',a)

a=rect(96,5,608,460,'#d0c4ae',5)+rect(159,35,482,430,'#7c624c')+rect(189,52,422,393,'#243c48')
a+=rect(252,102,296,338,'#ae875e')+rect(273,125,254,288,'#846647')
for x in [296,400,504]:a+=path(f'M{x} 149V388',stroke='#d6b789',sw=6)
for y in [176,259,341]:a+=path(f'M291 {y}H509',stroke='#d6b789',sw=6)
a+=path('M0 465H800',stroke='#c5b091',sw=45)
svg('pawn-screen','舊式當舖入口的高木屏風示意',a)

a=rect(0,0,800,500,'#bdc9c6',0,'none')+path('M0 160H800V500H0Z','#778f96')
for y in range(187,510,30):a+=path(f'M0 {y}H800',stroke='#becbcb',sw=4)
a+=path('M0 0H800V190H0Z','#e1e8df')+path('M0 202H800',stroke=INK,sw=12)
for x in range(-10,825,10):a+=path(f'M{x} 207L{x+19} 279',stroke='#293f53',sw=5)
a+=path('M0 306H800',stroke=GOLD,sw=7)
svg('escalator-brush','自動梯裙板旁的毛刷型偏轉裝置示意',a)

a=rect(0,0,800,500,'#c8dbd1',0,'none')+rect(110,-10,580,292,'#d7ba92')
for x in [151,307,463]:a+=rect(x,51,108,131,'#eff0d8')+path(f'M{x+54} 60V171M{x+8} 113H{x+100}',stroke=GREEN)
a+=rect(110,245,580,52,'#b5916d')+rect(130,297,65,180,'#e2cfac')+rect(610,297,65,180,'#e2cfac')
a+=rect(202,305,400,169,'#718c83')+rect(239,344,326,130,'#496a65')+path('M0 480H800',stroke='#c6bda2',sw=25)
svg('tong-lau-arcade','柱子支撐的唐樓騎樓及有蓋通道示意',a)

a=rect(0,340,800,160,'#87b8b8',0,'none')
for y in [365,403,445]:a+=path(f'M0 {y}Q100 {y-15} 200 {y}T400 {y}T600 {y}T800 {y}',stroke='#d0e2d5')
a+=rect(485,110,180,170,'#e9e8d4')+path('M480 280H682Q682 352 604 354Q520 354 520 305Z','#f6f1df')+path('M584 354V424H660',stroke=INK,sw=13)
a+=path('M0 302H340V202H480',stroke='#436e77',sw=28)+path('M0 302H340V202H480',stroke='#9bc7c5',sw=16)
svg('seawater-flushing','獨立海水供應與沖廁的概念示意',a)

a=rect(0,0,800,500,'#bed5ce',0,'none')+rect(330,-15,140,540,'url(#metal)',26)+rect(315,165,170,166,'#f5f0e1',8)
a+=circle(332,182,4,INK)+circle(468,314,4,INK)+text(400,236,'AA',36)+text(400,291,'1234',38)
svg('lamppost-number','虛構燈柱編號AA1234示例，不作實際定位',a)

def scalloped(cx,cy,r,color):
    points=[]
    for i in range(240):
        t=2*math.pi*i/240
        rr=r*(1+.055*math.cos(t*12))
        points.append((cx+rr*math.cos(t),cy+rr*math.sin(t)))
    d='M'+'L'.join(f'{x:.2f} {y:.2f}' for x,y in points)+'Z'
    return path(d,color)+circle(cx,cy,r*.8,'none','#8c876c',3)
a=scalloped(292,257,147,'#d5ddda')+scalloped(538,257,104,'#d5b76c')
svg('scalloped-coins','兩枚波浪形硬幣輪廓示意，不含面額及官方幣面',a)

a=rect(0,0,800,500,'#83918f',0,'none')+rect(160,0,480,500,'#566c77',0,'none')+rect(0,100,800,300,'#566c77',0,'none')
a+=rect(165,105,470,290,'none',0,GOLD,7)
for k in range(-400,900,65):
    # Clip diagonal hatch to the junction box.
    a+=f'<g clip-path="url(#box)">'+path(f'M{k} 105L{k+290} 395M{k} 395L{k+290} 105',stroke=GOLD,sw=4)+'</g>'
a='<defs><clipPath id="box"><rect x="168" y="108" width="464" height="284"/></clipPath></defs>'+a
svg('yellow-box','路口黃色方格標記示意',a)

a=path('M234 130Q400 83 566 130L610 410Q400 479 190 410Z','#c86c78')
a+=path('M256 142Q231 42 300 42Q352 43 334 128M466 128Q447 44 500 42Q569 42 543 142',stroke='#a95263',sw=24)
a+=path('M269 177L244 403M532 177L557 403M370 145L340 427M430 145L460 427',stroke='#e8a8a9',sw=5)
a+=path('M207 408Q400 446 594 408',stroke='#9c4d62',sw=5)
svg('red-market-bag','街市紅膠袋的原創物件插畫',a)
print('Validated 14 original urban-design SVGs')
