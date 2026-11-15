"""67 original vector teaching comics. No photographs, official marks or copied calligraphy."""
from pathlib import Path
import math
import xml.etree.ElementTree as ET
from html import escape
from functools import lru_cache
import os

# Outline the reading-critical Chinese text so SVG images do not depend on device font coverage.
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
FONT_PATH = Path(os.environ.get('HK_COMIC_FONT','/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc'))
FONT = TTFont(FONT_PATH,fontNumber=3) if FONT_PATH.exists() else None
GLYPHS = FONT.getGlyphSet() if FONT else None
@lru_cache(maxsize=128)
def glyph(character):
    name=FONT.getBestCmap().get(ord(character))
    if not name: raise ValueError('Missing illustration character: '+character)
    pen=SVGPathPen(GLYPHS);GLYPHS[name].draw(pen)
    return pen.getCommands(),FONT['hmtx'][name][0]

ROOT = Path(__file__).parent
INK, PAPER, RED, JADE, GOLD, BLUE = '#243335', '#fff5dc', '#d64b38', '#2f806d', '#efb94f', '#6a9fae'

def path(d, fill='none', stroke=INK, sw=5):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
def rect(x,y,w,h,fill=PAPER,rx=8,sw=5):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{INK}" stroke-width="{sw}"/>'
def circle(x,y,r,fill=PAPER,sw=5):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{INK}" stroke-width="{sw}"/>'
def ellipse(x,y,rx,ry,fill=PAPER,sw=5):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{INK}" stroke-width="{sw}"/>'
def text(x,y,value,size=38,fill=INK):
    if FONT and any(ord(c)>127 for c in value):
        scale=size/FONT['head'].unitsPerEm;shapes=[glyph(c) for c in value];left=x-sum(advance for _,advance in shapes)*scale/2;out=''
        for d,advance in shapes:
            out+=f'<path d="{d}" transform="translate({left:.2f} {y}) scale({scale:.5f} {-scale:.5f})" fill="{fill}"/>';left+=advance*scale
        return out
    return f'<text x="{x}" y="{y}" fill="{fill}" text-anchor="middle" font-family="serif" font-size="{size}" font-weight="700">{escape(value)}</text>'
def group(content, transform):
    return f'<g transform="{transform}">{content}</g>'
def line(x,y,xx,yy,stroke=INK,sw=5):
    return path(f'M{x} {y}L{xx} {yy}',stroke=stroke,sw=sw)
def face(x,y,s=1):
    return group(circle(0,0,30,GOLD)+circle(-10,-4,3,INK,0)+circle(10,-4,3,INK,0)+path('M-10 10Q0 20 10 10',sw=3),f'translate({x} {y}) scale({s})')
def street():
    return path('M0 392H800V500H0Z','#d6d3ba',sw=0)+''.join(rect(x,100+h,88,290-h,['#b8c7ad','#e5bb8c','#a7c9c4'][i%3],3,3)+''.join(rect(x+12+j*32,127+h+k*49,24,32,PAPER,2,2) for j in range(2) for k in range(4)) for i,(x,h) in enumerate([(24,16),(129,0),(581,40),(687,5)]))
def sea():
    return path('M0 330Q150 305 300 330T600 330T900 330V500H0Z',BLUE,sw=0)+''.join(path(f'M{x} {y}q25-14 50 0t50 0',stroke=PAPER,sw=4) for x,y in [(44,378),(260,430),(570,390),(650,460)])
def rocks():
    return ''.join(path(f'M{x} {400-h}l24-14 24 14v{h}l-24 14-24-14Z',c,sw=4)+line(x+24,386-h,x+24,400,INK,3) for x,h,c in [(170,160,'#c59472'),(218,190,'#d1a07b'),(266,225,'#b78766'),(314,250,'#c9a57a'),(362,200,'#d7b891'),(410,275,'#a98a6c'),(458,245,'#c8a07a'),(506,175,'#ddba8d')])
def flower(x=400,y=240,s=1):
    a=''.join(group(ellipse(0,-68,40,68,'#cf628a',4),f'rotate({i*72})') for i in range(5))
    a+=circle(0,0,23,GOLD,3)+path('M0 22Q-10 90 3 154',stroke=JADE,sw=8)
    return group(a,f'translate({x} {y}) scale({s})')
def tram():
    a=rect(246,78,308,326,JADE,22)+rect(265,94,270,118,PAPER,8)+rect(265,231,270,109,PAPER,8)
    for yy in [110,249]:
        for xx in [280,363,446]: a+=rect(xx,yy,69,78,BLUE,3,3)
    return a+rect(287,357,226,28,GOLD,4,3)+path('M325 78L365 34H438L476 78',sw=6)+circle(282,412,24,INK)+circle(519,412,24,INK)
def temple():
    return path('M130 184L400 68L670 184L632 216H168Z',JADE)+rect(190,210,420,219,RED,5)+rect(330,264,140,165,INK,4)+rect(226,249,61,87,GOLD,3)+rect(513,249,61,87,GOLD,3)+path('M125 184Q177 185 178 149M675 184Q623 185 622 149',stroke=JADE,sw=14)
def dragon():
    a=path('M90 318C170 164 250 367 358 241S533 176 625 255',stroke=RED,sw=47)
    for i in range(28):
        x=106+i*18; y=257+math.sin(i*.43)*34
        a+=line(x,y,x-9,y-48,INK,3)+circle(x-9,y-51,4,GOLD,0)
    return a+ellipse(654,238,61,46,GOLD)+circle(669,221,13,PAPER,3)+circle(673,221,5,INK,0)+path('M706 230l50-25-11 38-32 17M630 201l-10-47 32 31',RED)+circle(182,137,48,GOLD)+''.join(line(182,137,182+68*math.cos(i),137+68*math.sin(i),RED,3) for i in range(14))
def bun_tower():
    a=path('M246 423L315 119L400 54L485 119L554 423Z',GOLD)
    for row in range(9):
        yy=135+row*30; count=3+row//2
        for j in range(count):
            xx=400+(j-(count-1)/2)*36
            a+=circle(xx,yy,16,PAPER,3)+path(f'M{xx-4} {yy}h8m-4-4v8',stroke=RED,sw=2)
    return a
def bamboo(close=False):
    a=''
    for x in [190,400,610]: a+=path(f'M{x} 48V449',stroke=JADE,sw=24)+''.join(line(x-9,y,x+9,y,INK,4) for y in [100,190,280,370])
    for y in [160,320]: a+=path(f'M92 {y}H709',stroke=GOLD,sw=23)
    for x in [190,400,610]:
        for y in [160,320]:
            a+=''.join(path(f'M{x-23} {y-16+i*5}l46 25',stroke=INK,sw=5) for i in range(6))
    return group(a,'translate(-270 -100) scale(1.7)') if close else a
def stadium():
    return ellipse(400,290,290,127,BLUE)+ellipse(400,270,271,110,PAPER)+ellipse(400,270,204,77,RED)+ellipse(400,270,150,50,JADE)+path('M117 260L211 143H588L683 260L548 211H252Z',PAPER)+path('M259 153L269 221M540 153L530 221',stroke=INK,sw=8)
def athlete(kind='fencing'):
    a=circle(353,147,45,PAPER)+rect(323,181,59,118,RED,18)+path('M333 299L271 381M367 299L440 382M329 200L262 252L221 208M377 201L471 209',sw=23)
    if kind=='fencing': a+=line(459,208,655,93,INK,6)+circle(464,206,13,GOLD)
    else: a+=path('M468 86L468 336M468 88L604 311H468Z',GOLD)+ellipse(460,395,210,26,JADE)
    return a
def teacup(x=400,y=290,s=1):
    return group(ellipse(0,88,124,25,PAPER)+path('M-87-42H87L71 71Q0 105-71 71Z',PAPER)+ellipse(0,-42,87,23,'#bb7a48')+path('M88-22Q154-37 140 21Q133 48 82 39',sw=13)+path('M-24-87Q-52-113-23-139M23-87Q-5-113 24-139',stroke=RED,sw=5),f'translate({x} {y}) scale({s})')
def road():
    return rect(60,80,680,355,'#889799',8)+''.join(rect(105+i*88,190,51,177,PAPER,0,0) for i in range(7))
def coin():
    return circle(400,250,159,GOLD)+circle(400,250,139,GOLD,3)+flower(400,248,.8)
def sign(value='街',color=JADE):
    return rect(156,169,488,159,color,10)+rect(171,184,458,129,PAPER,4,3)+text(400,273,value,65)
def skyline():
    return ''.join(rect(67+i*87,272-h,63,h,JADE if i%2 else BLUE,3,3) for i,h in enumerate([110,154,98,201,142,173,117,160]))

SCENES={}
SCENES[1]=''.join(rect(90+col*52,75+row*47,49,44,['#b9b091','#db9273','#e7c650','#75a27f','#79b3b2','#698daa','#ad84a0'][row],2,2) for row in range(7) for col in range(12))
SCENES[2]=street()+rect(147,90,506,236,RED,12)+rect(165,109,470,198,PAPER,5)+text(400,239,'大角咀',99)+path('M160 329l-25 85M640 329l25 85',stroke=JADE,sw=16)
SCENES[3]=coin()
SCENES[4]=path('M0 420L167 180L300 317L499 117L800 407V500H0Z','#9db497',sw=0)+rect(332,78,136,354,GOLD,8)+rect(345,112,110,99,JADE,4)+text(400,180,'M',65,PAPER)+text(400,289,'001',46)
SCENES[5]=sea()+rocks()
SCENES[6]=path('M0 411L160 170L307 279L454 83L800 421V500H0Z',JADE)+path('M60 425L270 222L372 332L575 207L756 425','#9eb387')+path('M146 450Q289 317 351 344T545 229',stroke=GOLD,sw=15)
SCENES[7]=street()+rect(161,121,478,297,'#d3c7ad',3)+''.join(text(220+col*83,193+row*65,['街','文','墨','字','城'][(col+row)%5],45) for row in range(3) for col in range(5))
SCENES[8]=rect(145,78,510,352,JADE,8)+rect(169,102,462,304,PAPER,3)+text(400,203,'乾炒牛河',70)+path('M240 288q65-45 124 0t121 0M232 323q69-43 129 0t120 0',stroke='#bd986a',sw=16)
SCENES[9]=path('M284 166l69-55 70 14 40 100 95 46-12 64-103-22-37 80M323 213L272 343M388 278L328 398M468 314L502 396M279 170l-35 103',JADE,sw=15)+path('M354 116l2-43 35 46M400 131l35-44 3 63',RED,sw=5)+circle(373,157,6,INK,0)
SCENES[10]=bun_tower()
SCENES[11]=dragon()
SCENES[12]=bamboo()
SCENES[13]=stadium()
SCENES[14]=athlete()
SCENES[15]=skyline()+path('M75 379L713 271',stroke=INK,sw=36)+path('M250 189L573 202L715 247L571 274L505 344L466 334L480 273L269 248L227 287L195 282L216 226Z',PAPER)+text(614,405,'HKG',54)
SCENES[16]=sign('芒角')+path('M92 429q25-130 74-78M98 428q-42-123-57-99M665 434q20-138 80-104',stroke=JADE,sw=9)
SCENES[17]=teacup()+ellipse(400,282,38,51,PAPER,4)+face(400,280,.6)
SCENES[18]=ellipse(400,382,221,35,JADE)+path('M190 212H610Q590 385 400 389Q213 374 190 212Z',PAPER)+ellipse(400,212,210,39,PAPER)+path('M330 330q-61-48-17-78l24 13 42-21 37 32-36 47Z',RED)+path('M382 295q72-99 105-13q-51-18-63 52',JADE)+circle(340,257,5,INK,0)
SCENES[19]=teacup(292,249,.9)+ellipse(550,345,120,47,GOLD)+circle(520,324,32,PAPER)+circle(582,324,32,PAPER)
SCENES[20]=''.join(ellipse(400,250,320-i*46,207-i*28,JADE if i%2 else PAPER,5) for i in range(6))+''.join(line(400+320*math.cos(a),250+207*math.sin(a),400+90*math.cos(a),250+67*math.sin(a),INK,4) for a in [i*math.pi/8 for i in range(16)])
SCENES[21]=sign('街',BLUE)+rect(366,328,68,146,'#a9b5af',2)+path('M227 154l12-63M567 156l-5-68',stroke=RED,sw=6)
SCENES[22]=rect(198,69,404,367,RED,20)+path('M400 219Q327 106 251 175L280 272L348 242L400 282L452 242L520 272L549 175Q473 106 400 219Z',JADE)+circle(400,309,56,GOLD)+rect(382,291,36,36,PAPER,0,3)
SCENES[23]=path('M398 428V111M400 262L294 192M400 207L500 139',stroke=INK,sw=20)+ellipse(305,172,71,33,JADE)+ellipse(483,118,67,35,JADE)+ellipse(407,91,60,45,JADE)+path('M246 382l70-80 75 68-72 43Z','#b88856')+path('M270 357l38 6M309 333l28 20',sw=3)
SCENES[24]=sea()+path('M113 326L662 310L617 378H174Z',RED)+''.join(line(x,268,x-29,404,INK,10) for x in [245,328,411,494,577])+path('M114 326L81 255L127 263L158 317',GOLD)+circle(118,278,6,INK,0)
SCENES[25]=temple()+path('M304 423L322 258L400 212L478 258L496 423Z',BLUE)+circle(400,216,58,RED)+path('M337 173L355 116H445L463 173Z',GOLD)+circle(400,111,15,PAPER)+path('M384 129L373 160H427L415 129Z',PAPER)+circle(380,207,10,PAPER)+circle(420,207,10,PAPER)+path('M375 243Q400 257 425 243',sw=6)
SCENES[26]=''.join(path(f'M98 {113+i*38}Q280 {85+i*39} 457 {118+i*38}T712 {105+i*38}L704 {136+i*38}Q493 {152+i*38} 289 {133+i*38}T98 {145+i*38}Z',['#c7a58c','#e0c9a3','#a7ada0'][i%3],sw=4) for i in range(8))
SCENES[27]=sea()+path('M104 112H696L732 396H68Z','#b8a98c')+''.join(path(f'M{x} 359V216Q{x+33} 145 {x+66} 216V359Z',BLUE,sw=5) for x in [152,262,372,482,592])+path('M110 119H690',stroke=INK,sw=13)
SCENES[28]=flower()+path('M86 413q39-47 73 0t70 0M572 414q39-47 73 0t70 0',stroke=JADE,sw=7)
SCENES[29]=rect(103,108,594,291,'#c7ae86',16)+rect(130,131,540,244,PAPER,5,3)+group(rocks(),'translate(154 0) scale(.65)')+path('M149 330q42-22 83 0t83 0',stroke=BLUE,sw=5)
SCENES[30]=circle(400,250,166,BLUE)+path('M282 198Q379 94 504 184Q572 257 453 321Q341 365 286 289Q246 231 332 204Q406 177 448 224Q484 271 413 283Q369 288 364 252',stroke=PAPER,sw=23)+text(400,450,'8',74,RED)
SCENES[31]=road()+path('M71 131l53-47 50 48 49-47 50 48 48-47 50 48 49-47 50 48 48-47 50 48 48-47 50 48M71 402l53-47 50 48 49-47 50 48 48-47 50 48 49-47 50 48 48-47 50 48 48-47 50 48',stroke=PAPER,sw=8)
SCENES[32]=path('M217 306L280 214L396 207L466 148L540 176L547 245L475 272L446 368L421 371L421 278L330 281L287 371L262 365L274 284Z','#bb8e60')+path('M262 218L211 173L184 227',stroke=INK,sw=19)+circle(509,195,6,INK,0)+ellipse(386,407,215,23,JADE)+circle(375,148,25,PAPER)+path('M351 170l57-12 34 57-47 18Z',BLUE)
SCENES[33]=skyline()+rect(73,364,654,90,'#b6c3bc',0)+rect(108,183,124,166,BLUE,2)+ellipse(170,181,62,18,BLUE)+face(370,242,1)+face(560,242,1)+path('M340 278L324 365H411L398 278Z',INK)+path('M529 278L512 365H600L588 278Z',JADE)+path('M408 286L488 274',sw=15)
SCENES[34]=sea()+athlete('windsurf')
SCENES[35]=rect(126,86,548,331,JADE,14)+rect(148,108,504,287,PAPER,4)+text(400,272,'〤〥',122)+text(400,355,'元',58)+line(251,312,543,312,RED,6)
SCENES[36]=rect(162,77,476,346,RED,9)+rect(184,99,432,302,PAPER,3)+text(400,300,'茶',180)+path('M235 352L568 352',stroke=JADE,sw=8)
SCENES[37]=bamboo()+path('M126 351L179 111L400 62L621 111L674 351Z',RED)+rect(179,168,442,177,GOLD,0)+''.join(circle(x,126,37,c,4) for x,c in [(240,RED),(345,JADE),(450,RED),(555,JADE)])+text(400,284,'賀',94,INK)
SCENES[38]=path('M0 421L199 235L354 348L526 184L800 430V500H0Z','#9eb18f',sw=0)+rect(347,125,106,293,PAPER,3)+rect(347,207,106,78,INK,0,0)+ellipse(400,124,53,21,PAPER)+circle(400,122,10,INK,0)
SCENES[39]=rect(130,228,540,198,'#a5ac9c',3)+path('M93 228L240 109H560L707 228Z',JADE)+path('M153 237L161 122Q159 59 207 73Q258 100 233 237Z',PAPER)+path('M567 237Q542 100 593 73Q641 59 639 122L647 237Z',PAPER)+rect(354,291,92,135,RED,2)
SCENES[40]=sea()+path('M62 160L159 126L639 332L602 394Z','#d5b894')+path('M62 160L82 125L659 312L639 332Z',PAPER)+path('M56 177L609 412',stroke=INK,sw=9)+path('M170 67Q368 64 605 244',stroke=JADE,sw=14)
SCENES[41]=street()+tram()
SCENES[42]=sea()+path('M197 253Q352 111 511 253Q352 394 197 253ZM511 253L636 161V344Z',GOLD)+circle(265,238,13,INK,0)+path('M314 201L357 244L315 286M379 201L422 244L380 286',sw=4)
SCENES[43]=sea()+rect(103,315,264,58,PAPER,0)+rect(116,250,241,58,PAPER,0)+rect(128,184,221,58,PAPER,0)+rect(499,179,144,223,PAPER,4)+path('M479 179L571 92L663 179Z',RED)+path('M571 65V113M550 85H592',sw=8)+rect(545,294,52,108,JADE,12)
SCENES[44]=face(397,134,1.05)+path('M367 172L343 246H452L430 172Z',RED)+path('M393 246V374L323 402M402 247L485 273',stroke=INK,sw=14)+path('M281 423H516',stroke=GOLD,sw=23)+ellipse(404,383,92,29,JADE)+path('M485 276q83-34 94 46q-49 48-91-8Z',PAPER)
SCENES[45]=temple()+rect(269,110,262,300,RED,12)+rect(289,131,222,259,GOLD,5)+text(400,245,'福',95,RED)+path('M320 302q81-35 161 0',stroke=RED,sw=7)
SCENES[46]=temple()+line(401,416,401,255,INK,15)+''.join(group(path('M0 0L-24-113Q58-140 80-65L0 0Z',c),f'translate(400 255) rotate({i*90})') for i,c in enumerate([RED,GOLD,JADE,BLUE]))+circle(400,255,19,PAPER)
SCENES[47]=group(skyline(),'rotate(-20 400 250)')+path('M126 420L677 124M147 438L698 143',stroke=INK,sw=12)+group(tram(),'translate(186 82) rotate(28 400 250) scale(.62)')
SCENES[48]=rect(71,75,658,347,JADE,8)+rect(118,113,564,270,RED,0,4)+circle(400,249,61,'none',4)+line(400,113,400,383,PAPER,4)+rect(137,53,143,92,PAPER,3)+ellipse(208,147,42,14,GOLD)+path('M169 147L179 184H238L247 147',sw=3)
SCENES[49]=rect(263,132,274,273,RED,6)+ellipse(400,132,137,34,RED)+rect(296,199,208,31,INK,3)+rect(331,277,138,86,PAPER,3)+path('M238 410H562',stroke=INK,sw=13)+text(400,339,'郵',42)
SCENES[50]=stadium()+ellipse(402,309,50,79,GOLD)+path('M402 231V388M382 269H422M381 291H423M381 313H423M382 335H422',stroke=PAPER,sw=5)
SCENES[51]=path('M250 250C95 55 485 45 504 199C521 321 245 300 267 172C294 35 697 200 554 339C424 468 319 332 250 250Z',JADE,sw=8)+path('M276 245Q371 322 482 240',stroke=GOLD,sw=18)
SCENES[52]=sea()+path('M0 385Q200 300 800 425V500H0Z','#ddc48c',sw=0)+path('M123 220H693V390H123Z',fill='url(#mesh)',sw=2)+''.join(ellipse(x,220,29,20,GOLD) for x in [126,218,310,402,494,586,678])
SCENES[53]=rect(147,94,506,322,'#a6b0a7',9)+rect(169,116,462,278,'#c6c8b5',4)+''.join(line(184+i*43,129,184+i*43,380,INK,4) for i in range(11))+''.join(line(181,139+i*42,619,139+i*42,INK,4) for i in range(6))+rect(340,213,121,85,PAPER,1,3)+text(400,273,'?',62)
SCENES[54]=rect(274,88,253,292,GOLD,22)+circle(400,211,64,INK)+circle(400,211,39,PAPER)+path('M369 336Q401 370 431 336L420 391H381Z',JADE)+path('M343 401q-16 32 0 52M456 401q16 32 0 52',stroke=RED,sw=6)+line(401,380,401,456,INK,14)
SCENES[55]=street()+''.join(group(rect(-54,-45,108,165,c,22)+rect(-80,2,160,56,c,13)+ellipse(0,-45,54,22,c)+circle(0,26,25,PAPER)+rect(-70,117,140,27,INK,3),f'translate({x} 280)') for x,c in [(259,RED),(541,GOLD)])
SCENES[56]=street()+rect(306,77,188,234,BLUE,18)+rect(332,102,136,99,PAPER,4)+text(400,171,'P',70)+rect(349,217,102,38,INK,3)+rect(374,312,52,125,'#9dacaa',3)
SCENES[57]=sign('← 1–45',BLUE)+rect(374,330,52,116,'#a6b2ad',2)
SCENES[58]=rect(177,54,446,365,RED,26)+rect(201,103,398,181,BLUE,9)+path('M222 126Q231 33 273 39M400 124Q400 27 439 38M575 127Q584 32 619 44',stroke=INK,sw=13)+rect(215,310,373,64,PAPER,4)+path('M82 66L149 131M98 123L165 161',stroke=JADE,sw=15)
SCENES[59]=rect(117,107,566,234,INK,18)+rect(142,131,516,185,'#3b4444',6)+text(400,267,'60',132,'#fb7258')+text(400,384,'km/h',35)+path('M62 421L737 421',stroke=JADE,sw=14)
SCENES[60]=road()+''.join(line(x,197,x,412,INK,17)+''.join(line(x,y,x,y+28,PAPER,17) for y in [216,281,346])+circle(x,155,41,GOLD) for x in [109,692])
SCENES[61]=rect(96,97,608,307,'#c3c9af',0)+rect(119,119,280,262,GOLD,0,3)+rect(399,119,280,262,GOLD,0,3)+''.join(rect(x,140,15,218,'#f6d87f',5,3) for x in range(143,380,39))+''.join(circle(x,y,10,'#f6d87f',3) for x in range(427,665,39) for y in range(147,367,41))
SCENES[62]=rect(241,98,318,292,JADE,26)+rect(268,127,264,113,PAPER,5)+text(400,198,'$ 12.0',49)+circle(400,310,49,GOLD)+path('M475 78q48 4 52 48M478 47q74 7 81 80',stroke=BLUE,sw=8)
SCENES[63]=street()+path('M192 80L146 194H365L320 80Z',RED)+path('M491 80L445 194H664L619 80Z',RED)+path('M160 196L98 409H405L352 196Z','#ee9575',sw=0)+path('M457 196L392 409H710L651 196Z','#edc496',sw=0)+rect(127,367,551,45,'#b5926c',3)+path('M246 340Q220 262 287 253Q343 247 369 299Q349 358 246 340Z','#ce725e')
SCENES[64]=rect(274,91,252,326,'#e99248',38)+ellipse(400,91,126,31,'#e99248')+rect(324,176,152,64,INK,26)+rect(318,289,164,88,PAPER,10)+path('M368 314l34 46 34-46',stroke=JADE,sw=8)
SCENES[65]=bamboo(True)
SCENES[66]=''.join(rect(128+c*183,83+r*154,172,140,JADE if (r+c)%2 else '#9ea9a3',7)+rect(151+c*183,108+r*154,126,13,INK,3)+''.join(circle(173+c*183+j*36,176+r*154,9,PAPER,3) for j in range(2))+circle(263+c*183,194+r*154,11,GOLD,3) for r in range(2) for c in range(3))
SCENES[67]=path('M101 370H231L522 151H681',stroke=INK,sw=54)+path('M101 357H231L522 137H681',stroke=JADE,sw=16)+text(264,201,'0.5',64,RED)+text(573,341,'0.75',64,BLUE)

for number, content in SCENES.items():
    defs='<defs><pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.7" fill="#b3a583" opacity=".35"/></pattern><pattern id="mesh" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M0 0L22 22M22 0L0 22" stroke="#33494a" stroke-width="2" fill="none"/></pattern></defs>'
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" role="img"><title>香港生活原創漫畫示意 {number:02}</title>{defs}<rect width="800" height="500" fill="{PAPER}"/><path d="M0 0H800V105L0 390Z" fill="url(#dots)"/>{content}<path d="M31 34l31 12M34 64l24 1M731 413l33 16M739 447l22-1" stroke="{RED}" stroke-width="6" stroke-linecap="round" fill="none"/><text x="25" y="481" fill="{INK}" opacity=".65" font-family="sans-serif" font-size="14">原創漫畫示意</text></svg>'
    ET.fromstring(svg)
    (ROOT/f'comic-{number:02}.svg').write_text(svg)
assert len(SCENES)==67
print('Generated 67 original Hong Kong teaching comic panels.')
