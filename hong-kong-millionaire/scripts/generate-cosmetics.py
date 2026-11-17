"""Original vector motifs for account frames and readable Hong Kong themes."""
from pathlib import Path
from math import sin,cos,pi
root=Path(__file__).resolve().parents[1]/'assets'
ink='#29483e'
def svg(body,view='0 0 120 120'):
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}"><g stroke="{ink}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>'
def circle(r,fill,stroke=ink,width=1.4):return f'<circle cx="60" cy="60" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
for name in ['rwb','neon','gold','jade','harbour','lantern']:
 b=''
 if name=='rwb':
  b=circle(55,'#2b6590')+circle(50,'#fff3d9')
  for i in range(36):
   a=i*pi/18;x=60+52*cos(a);y=60+52*sin(a);color=['#bc493e','#fff8e5','#2f6895'][i%3]
   b+=f'<path d="M{x:.2f} {y:.2f}l-3 -3 6 6" stroke="{color}" stroke-width="5"/>'
  b+=circle(46,'none','#bc493e',2)+circle(43,'none','#2f6895',1)+ '<path d="m16 23 9 2-2-9m81 88-9-2 2 9" fill="none" stroke="#fff7dc" stroke-width="2"/>'
 elif name=='neon':
  b=circle(55,'#263f50')+circle(51,'none','#e389b0',3)+circle(46,'none','#7adecd',2)
  for i in range(20):
   a=i*pi/10;x=60+55*cos(a);y=60+55*sin(a);b+=f'<circle cx="{x:.2f}" cy="{y:.2f}" r="2.3" fill="#ffe4a0" stroke="none"/>'
  b+='<path d="M18 85 9 91m87-66 9-7M9 47l9 2m83 27 9 4" stroke="#f8acbf" stroke-width="2.8"/>'
 elif name=='gold':
  b=circle(55,'#a2712c')+circle(51,'#efd38b')+circle(47,'none','#ac7630',2)
  for i in range(20):
   a=i*pi/10;x=60+51*cos(a);y=60+51*sin(a);b+=f'<circle cx="{x:.2f}" cy="{y:.2f}" r="2" fill="#fff3bb"/>'
  b+='<path d="m40 13 8 3 5-10 7 8 7-8 5 10 8-3-4 13H44Z" fill="#ebbe50"/><path d="m45 101-5 14 20-7 20 7-5-14" fill="#b75035"/><path d="m24 73-9-4 1 11 11 4m-4 1-6 4 9 8 9-3m62-21 9-4-1 11-11 4m4 1 6 4-9 8-9-3" fill="#e8c76b"/>'
 elif name=='jade':
  b=circle(55,'#305c47')+circle(51,'#aac6a5')+circle(47,'#e5c983')+circle(44,'none','#426d56',2)
  for i in range(16):
   a=i*pi/8;x=60+51*cos(a);y=60+51*sin(a);b+=f'<circle cx="{x:.2f}" cy="{y:.2f}" r="1.6" fill="#d8b85e"/>'
  b+='<path d="M44 13h32l-3 14H47Z" fill="#356a50"/><path d="M50 16h20v7H50Zm-1 82h22v9H49Z" fill="#ffe4a0"/><path d="M54 102h12"/>'
 elif name=='harbour':
  b=circle(55,'#365b78')+circle(50,'#a6cccd')+circle(46,'none','#d9bd7a',2)
  for i in range(24):
   a=i*pi/12;x=60+53*cos(a);y=60+53*sin(a);b+=f'<path d="M{x-1:.2f} {y-2:.2f}l2 4" stroke="#e9d6a2" stroke-width="2"/>'
  b+='<path d="M21 94q10-10 20 0t20 0t20 0t20 0v13H21Z" fill="#76b8b8"/><path d="m60 4 2 5 6 1-5 4 1 6-4-3-5 3 1-6-4-4 6-1Z" fill="#ffe3a0"/><path d="m30 14 1 3 3 1-3 2-1 3-2-3-3-2 4-1" fill="#ffe3a0"/>'
 else:
  b=circle(55,'#ae4a37')+circle(50,'#efd594')+circle(46,'none','#b8693e',2)
  for x,y in [(18,31),(102,31),(25,92),(95,92)]:
   b+=f'<path d="M{x} {y-13}v4m0 18v7m-3-3h6" fill="none"/><ellipse cx="{x}" cy="{y}" rx="8" ry="11" fill="#cc6246"/><path d="M{x} {y-9}v18m-6-15q6 4 12 0m-12 12q6-4 12 0" fill="none" stroke="#f4cd73"/>'
  b+='<path d="M43 13q17-12 34 0m-29 92q12 8 24 0" fill="none" stroke="#f6d67c" stroke-width="3"/>'
 b+=circle(40,'none',ink,1.5)
 # Inner aperture is transparent: rings are cut out rather than painted over the avatar.
 b='<defs><mask id="aperture"><rect width="120" height="120" fill="white"/><circle cx="60" cy="60" r="39.5" fill="black"/></mask></defs><g mask="url(#aperture)">'+b+'</g>'
 (root/f'frame-{name}.svg').write_text(svg(b))
scenes={
 'ink':'<path d="M15 0 0 150m80-140L30 180m400 20 80-80m-60 250 50-140" stroke="#344739" stroke-width="8" opacity=".16"/><path d="m30 260 12-170 28-20-5 220m290-20 22-200 25 15-3 180" stroke="#253c33" stroke-width="17" opacity=".12"/><text x="70" y="115" fill="#2f4337" stroke="none" font-family="serif" font-size="66" transform="rotate(-8 70 115)">香港</text><text x="210" y="240" fill="#34473b" stroke="none" font-family="serif" font-size="62" transform="rotate(6 210 240)">街坊</text><rect x="395" y="275" width="47" height="47" rx="2" fill="none" stroke="#a3503b" stroke-width="4"/><path d="m404 282v28h27v-27m-18 9h14m-15 10h13" stroke="#a3503b" stroke-width="3"/>',
 'cafe':'<path d="M0 320h500M30 325v45m40-45v45m40-45v45m40-45v45m40-45v45m40-45v45m40-45v45m40-45v45m40-45v45m40-45v45" stroke="#61856c"/><ellipse cx="120" cy="235" rx="73" ry="26" fill="#e2c38a"/><path d="M73 230v-87h92v87q-45 30-92 0" fill="#e6f0de"/><path d="M165 150q54-5 38 42-7 17-38 15" fill="none" stroke-width="7"/><ellipse cx="119" cy="143" rx="46" ry="14" fill="#ae7850"/><path d="M96 101q-15-23 3-42m35 42q18-23 2-42" fill="none" stroke="#9bb396" stroke-width="4"/><path d="M300 230q-45-38-12-66 0-45 55-32 43-17 58 25 44 25 10 58-15 35-56 25-30 18-55-10" fill="#e6b565"/><path d="m299 154 28 70m6-86 27 90m5-91 27 67" stroke="#ba7c46" stroke-width="3"/>',
 'harbour':'<path d="M0 250h500v120H0Z" fill="#8aafb5"/><path d="M0 245v-42h45v-42h38v81h32V119h23v-27h17v151h38V160h39v83h30V91h32V43h15v200h41V119h40v122h34v-71h39v73h37" fill="#55798c"/><path d="M270 294h122l-15 31h-91Z" fill="#e6dcbb"/><path d="M287 295v-27h72v27" fill="#d8e3d8"/><path d="M0 346q30-12 60 0t60 0t60 0t60 0t60 0t60 0t60 0t80 0" fill="none" stroke="#d7d9bb" stroke-width="4"/>',
 'tram':'<path d="M35 370 125 0m250 0 90 370M0 24h500M0 53h500" stroke="#819b7a" stroke-width="3"/><path d="M170 280V81q0-15 15-15h130q15 0 15 15v199Z" fill="#649778"/><path d="M182 83h54v58h-54Zm66 0h66v58h-66Zm-66 77h54v65h-54Zm66 0h66v65h-66Z" fill="#f4e8b9"/><path d="M170 240h160m-160 18h160" stroke="#d8bb6c" stroke-width="4"/><circle cx="192" cy="282" r="12" fill="#435d48"/><circle cx="308" cy="282" r="12" fill="#435d48"/><path d="M208 65V42h84v23" fill="none" stroke="#6d7857" stroke-width="4"/>',
 'lantern':'<path d="M0 48q250 85 500 0" fill="none" stroke="#a07c4e" stroke-width="4"/>'+''.join(f'<path d="M{x} 75v38m0 112v55m-9-7h18" fill="none" stroke="#a87942" stroke-width="3"/><ellipse cx="{x}" cy="168" rx="45" ry="60" fill="#c46a50"/><path d="M{x} 113v110m-35-89q35 20 70 0m-70 65q35-20 70 0" fill="none" stroke="#f2ce83" stroke-width="3"/>' for x in [90,250,410]),
 'porcelain':''.join(f'<g transform="translate({x} {y})"><path d="M-52-52H52V52H-52Z" fill="none" stroke="#7f9fa7"/><path d="M0-38Q25-14 0 0Q-25-14 0-38Zm38 38Q14 25 0 0Q14-25 38 0ZM0 38Q-25 14 0 0Q25 14 0 38Zm-38-38Q-14-25 0 0Q-14 25-38 0Z" fill="#91aeb5"/><circle r="8" fill="#4c7888"/></g>' for x in [40,145,250,355,460] for y in [30,135,240,345])
}
for name,body in scenes.items():
 color={'ink':'#e8e0ce','cafe':'#eee6cb','harbour':'#c7d5d3','tram':'#dbe2c8','lantern':'#f1d8ad','porcelain':'#eceddf'}[name]
 (root/f'theme-{name}.svg').write_text(svg(f'<rect width="500" height="370" fill="{color}" stroke="none"/>'+body,'0 0 500 370'))
print('Generated six frame rings and six theme illustrations')
