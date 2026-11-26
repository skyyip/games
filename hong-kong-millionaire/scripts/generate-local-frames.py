"""Four original Hong Kong motifs with a transparent avatar aperture."""
from pathlib import Path
from math import sin,cos,pi
root=Path(__file__).resolve().parents[1]/'assets'
ink='#29483e'
def ring(r,color,width=2):return f'<circle cx="60" cy="60" r="{r}" fill="none" stroke="{color}" stroke-width="{width}"/>'
frames={}
b='<rect x="8" y="8" width="104" height="104" rx="24" fill="#2c6b51" stroke="'+ink+'" stroke-width="2"/>'+ring(50,'#edd9a7',3)+ring(45,'#ad473c',2)
b+='<rect x="26" y="5" width="68" height="20" rx="3" fill="#f7e9b9" stroke="'+ink+'" stroke-width="2"/><path d="M32 12h12m-12 6h8m13-6h9m-9 6h14m8-6h12m-10 6h8" stroke="#a94130" stroke-width="2"/><rect x="26" y="96" width="68" height="17" rx="3" fill="#d36a4b" stroke="'+ink+'"/><path d="M34 104h16m8 0h29" stroke="#f5deb0" stroke-width="3"/>'
for x in [8,103]:
 for y in [33,54,75]:b+=f'<rect x="{x}" y="{y}" width="9" height="12" rx="2" fill="#bcd4bc" stroke="{ink}" stroke-width="1"/>'
frames['minibus']=b
b=ring(52,'#986a3f',10)+ring(47,'#e1bb76',4)+ring(57,'#ba8f58',3)
for i in range(48):
 a=i*pi/24;x=60+52*cos(a);y=60+52*sin(a);b+=f'<path d="M{x-2:.2f} {y-2:.2f}l4 4" stroke="#f1d69b" stroke-width="1.5"/>'
for x in [26,47,68,89]:b+=f'<path d="M{x-7} 13q7-13 14 0v8q-7 8-14 0Z" fill="#e8cb91" stroke="{ink}" stroke-width="1.4"/><path d="M{x-5} 13h10m-8-4 3 10m3-11-1 10" fill="none" stroke="#b9864c"/>'
b+='<path d="M33 103q27-11 54 0l-3 10H36Z" fill="#efdfbc" stroke="'+ink+'" stroke-width="1.5"/>'
frames['dimsum']=b
b=ring(52,'#7a9271',9)+ring(46,'#e8c78f',2)
for i in range(12):
 a=i*pi/6;x=60+52*cos(a);y=60+52*sin(a)
 b+=f'<ellipse cx="{x:.2f}" cy="{y:.2f}" rx="5" ry="10" transform="rotate({i*30+35} {x:.2f} {y:.2f})" fill="#7b9a69" stroke="{ink}" stroke-width="1"/>'
for cx,cy in [(29,20),(94,35),(33,101),(92,91)]:
 for i in range(5):
  a=i*2*pi/5;b+=f'<ellipse cx="{cx+7*cos(a):.2f}" cy="{cy+7*sin(a):.2f}" rx="6" ry="9" transform="rotate({i*72-18} {cx+7*cos(a):.2f} {cy+7*sin(a):.2f})" fill="#b95386" stroke="#743c66" stroke-width="1"/>'
 b+=f'<circle cx="{cx}" cy="{cy}" r="3" fill="#efcf80"/>'
frames['bauhinia']=b
b=ring(52,'#b64a39',11)+ring(46,'#e7bd66',3)+ring(57,'#e4b76a',3)
b+='<path d="M28 22q32-32 64 0l-4 15H32Z" fill="#c96849" stroke="'+ink+'" stroke-width="1.5"/>'
for x in [42,78]:b+=f'<ellipse cx="{x}" cy="20" rx="13" ry="11" fill="#f4dfb2" stroke="{ink}" stroke-width="1.5"/><circle cx="{x}" cy="21" r="5" fill="#284e45"/><path d="M{x-12} 11q12-9 24 0" fill="none" stroke="#e1bd6e" stroke-width="4"/>'
for x in [12,108]:
 for y in [48,65,82]:b+=f'<circle cx="{x}" cy="{y}" r="6" fill="#edd395" stroke="{ink}" stroke-width="1"/>'
b+='<path d="M32 99q28 14 56 0l-7 15H39Z" fill="#e5bc72" stroke="'+ink+'" stroke-width="1.5"/><path d="M42 102v9m9-7v9m9-7v9m9-9v8m9-10v8" stroke="#ac583d" stroke-width="2"/>'
frames['lion']=b
for name,body in frames.items():
 data='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><mask id="aperture"><rect width="120" height="120" fill="white"/><circle cx="60" cy="60" r="39.5" fill="black"/></mask></defs><g mask="url(#aperture)">'+body+'</g></svg>'
 (root/('frame-'+name+'.svg')).write_text(data)
print('Generated four transparent-centre Hong Kong avatar frames.')
