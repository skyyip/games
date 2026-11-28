"""Subset the existing Chiron partitions for UI text; keep full fonts as fallback.
Requires fonttools[woff]. Original binaries and OFL notices remain unchanged.
"""
from pathlib import Path
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
INPUTS = ['index.html', 'src/app.js', 'src/collection-ui.js', 'src/market-ui.js', 'src/arcade-ui.js', 'src/showtime.js']
MANIFEST = ROOT / 'docs/performance-ui-fonts.json'
CSS = ROOT / 'typography-ui.css'
DEST = ROOT / 'assets/fonts/ui'
sha = lambda data: hashlib.sha256(data).hexdigest()
inputs = {name: sha((ROOT / name).read_bytes()) for name in INPUTS}
wanted = set(range(32, 127))
for name in INPUTS:
    wanted.update(ord(c) for c in (ROOT / name).read_text() if ord(c) >= 32)

if '--check' in sys.argv:
    record = json.loads(MANIFEST.read_text())
    assert record['inputs'] == inputs, 'UI text changed; rerun generate-ui-fonts.py'
    assert record['cssSha256'] == sha(CSS.read_bytes())
    for item in record['fonts']:
        assert item['sourceSha256'] == sha((ROOT / item['source']).read_bytes())
        assert item['sha256'] == sha((ROOT / item['file']).read_bytes())
    print(f"Verified {len(record['fonts'])} UI font subsets, source text, original fonts and generated CSS.")
    sys.exit(0)

import fontTools
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import DecomposingRecordingPen

def ranges(points):
    parts = []
    for n in sorted(points):
        if parts and n == parts[-1][1] + 1:
            parts[-1][1] = n
        else:
            parts.append([n, n])
    return ','.join(f'U+{a:X}' + (f'-{b:X}' if a != b else '') for a, b in parts)

DEST.mkdir(parents=True, exist_ok=True)
output = ['/* Generated UI-only subsets of the bundled Chiron fonts. Full Unicode partitions remain the fallback. */']
records = []
for face in re.findall(r'@font-face\s*\{(.*?)\}', (ROOT / 'typography-fonts.css').read_text(), re.S):
    family = re.search(r"font-family:\s*'([^']+)'", face)[1]
    path = re.search(r"url\('([^']+)'\)", face)[1]
    weight = re.search(r'font-weight:\s*([^;]+)', face)[1]
    declared = set()
    for start, end in re.findall(r'U\+([\da-f]+)(?:-([\da-f]+))?', re.search(r'unicode-range:\s*([^;]+)', face)[1], re.I):
        declared.update(range(int(start, 16), int(end or start, 16) + 1))
    points = wanted & declared
    if not points:
        continue
    source = ROOT / path
    font = TTFont(source, recalcTimestamp=False)
    points &= font.getBestCmap().keys()
    if not points:
        font.close()
        continue
    original = TTFont(source, recalcTimestamp=False)
    options = subset.Options()
    options.name_IDs = ['*']
    options.name_languages = ['*']
    options.name_legacy = True
    options.glyph_names = True
    options.notdef_outline = True
    options.layout_features = ['*']
    worker = subset.Subsetter(options=options)
    worker.populate(unicodes=points)
    worker.subset(font)
    # Retain all copyright/license names; identify this modified subset in its version.
    for name in font['name'].names:
        if name.nameID in [3, 5]:
            font['name'].setName(name.toUnicode() + '; Sky Playground UI subset', name.nameID, name.platformID, name.platEncID, name.langID)
    target = DEST / (('hei' if family == 'ChironHeiHK' else 'sung') + '-' + source.name)
    font.flavor = 'woff2'
    font.save(target)
    font.close()
    built = TTFont(target)
    assert [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in built['fvar'].axes] == [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in original['fvar'].axes]
    for code in points:
        a, b = original.getBestCmap()[code], built.getBestCmap()[code]
        assert original['hmtx'][a] == built['hmtx'][b], (family, code, 'metrics')
        for weight_value in [400, 700]:
            source_glyphs = original.getGlyphSet(location={'wght': weight_value})
            built_glyphs = built.getGlyphSet(location={'wght': weight_value})
            source_pen, built_pen = DecomposingRecordingPen(source_glyphs), DecomposingRecordingPen(built_glyphs)
            assert source_glyphs[a].width == built_glyphs[b].width, (family, code, weight_value, 'advance')
            source_glyphs[a].draw(source_pen)
            built_glyphs[b].draw(built_pen)
            assert source_pen.value == built_pen.value, (family, code, weight_value, 'outlines')
    assert any(n.nameID == 0 for n in built['name'].names), 'Copyright notice must remain'
    original.close()
    built.close()
    relative = str(target.relative_to(ROOT))
    output.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};font-display:swap;src:url('./{relative}') format('woff2-variations');unicode-range:{ranges(points)}}}")
    records.append({'source': str(source.relative_to(ROOT)), 'sourceSha256': sha(source.read_bytes()), 'file': relative, 'sha256': sha(target.read_bytes()), 'glyphs': len(points), 'bytes': target.stat().st_size})
CSS.write_text('\n'.join(output) + '\n')
MANIFEST.write_text(json.dumps({'fontTools': fontTools.__version__, 'inputs': inputs, 'cssSha256': sha(CSS.read_bytes()), 'fonts': records}, indent=2) + '\n')
print(f"Generated and verified {len(records)} font subsets, {sum(r['bytes'] for r in records):,} bytes; original fonts retained.")
