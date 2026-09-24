#!/usr/bin/env python3
"""Static integrity audit for the LEVÁRIA catalog (stdlib only)."""
import hashlib
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parent
manifest = json.loads((ROOT / 'audit_manifest.json').read_text(encoding='utf-8'))
errors=[]
for rel, expected in manifest.items():
    path=ROOT/rel
    if not path.is_file():
        errors.append(f'FALTA: {rel}')
        continue
    result=hashlib.sha256(path.read_bytes()).hexdigest()
    if result != expected: errors.append(f'ARCHIVO ALTERADO: {rel}')
# Comprueba además que cada ruta descrita en pages.js apunte a un archivo real.
import re
text = (ROOT / 'pages.js').read_text(encoding='utf-8')
references = re.findall(r"src:'(assets/[^']+)'", text)
if len(references) != 11:
    errors.append(f'El listado contiene {len(references)} páginas; se esperan 11.')
for rel in references:
    if not (ROOT / rel).is_file():
        errors.append(f'IMAGEN SIN ARCHIVO: {rel}')
print(f'Archivos comprobados: {len(manifest)}; páginas declaradas: {len(references)}')
print('AUDITORÍA OK' if not errors else '\n'.join(errors))
raise SystemExit(bool(errors))
