"""Original sound-design sketches; not field recordings or operator sound samples."""
import math, random, struct, wave
from pathlib import Path
RATE=22050
ROOT=Path(__file__).resolve().parent.parent/'assets'
def render(name,events,bed=None):
 rng=random.Random(name);samples=[]
 for i in range(int(RATE*4)):
  t=i/RATE;v=bed(t,rng) if bed else 0
  for start,length,freq,gain,kind in events:
   u=t-start
   if 0<=u<length:
    envelope=(1-math.exp(-u*180))*math.exp(-u*(5 if kind=='bell' else 14)/length)
    sound=(math.sin(2*math.pi*freq*u)+.32*math.sin(2*math.pi*freq*2.73*u)) if kind=='bell' else (rng.uniform(-1,1) if kind=='click' else math.sin(2*math.pi*freq*u))
    v+=gain*envelope*sound
  fade=min(1,t*15,(4-t)*12);samples.append(int(max(-.95,min(.95,v*fade))*32767))
 with wave.open(str(ROOT/(name+'.wav')),'wb') as f:
  f.setnchannels(1);f.setsampwidth(2);f.setframerate(RATE);f.writeframes(struct.pack('<'+'h'*len(samples),*samples))
bell=lambda t,f,g=.5:(t,.9,f,g,'bell')
click=lambda t,g=.4:(t,.11,0,g,'click')
render('sound-tram',[bell(.35,1180),bell(.8,1180)]+[click(t,.22) for t in [.12,.45,.95,1.3,1.8,2.15,2.65,3,3.5]],lambda t,r:.035*math.sin(2*math.pi*70*t))
render('sound-ferry',[(.45,2.1,146,.5,'tone'),(.45,2.1,218,.16,'tone')]+[bell(t,400,.15) for t in [2.6,2.86,3.15]],lambda t,r:.06*r.uniform(-1,1)*(.65+.35*math.sin(t*8)))
render('sound-bus',[(1.25,.65,1046,.62,'tone')],lambda t,r:.045*math.sin(2*math.pi*78*t)+.012*r.uniform(-1,1))
render('sound-crossing',[(t,.12,1800,.4,'tone') for t in [.2,.85,1.5,2.1,2.3,2.5,2.7,2.9,3.1,3.3,3.5,3.7]])
render('sound-mahjong',[click(.18+i*.073,.32) for i in range(27)]+[click(t,.7) for t in [2.5,2.85,3.2]])
render('sound-cafe',[bell(t,2200,.22) for t in [.25,.42,.68,2.7,3.05,3.4]],lambda t,r:.18*r.uniform(-1,1) if 1<t<2.2 else 0)
print('Six original 4-second mono sound sketches generated.')
