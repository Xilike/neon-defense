"""Normalize Windows aapt2 asset paths before alignment/signing, then verify bytes."""
import hashlib
import json
from pathlib import Path
import sys
from zipfile import ZipFile

apk = Path(sys.argv[1])
fixed = apk.with_suffix('.normalized.apk')
with ZipFile(apk) as source, ZipFile(fixed, 'w') as dest:
    for entry in source.infolist():
        data = source.read(entry)
        entry.filename = entry.filename.replace('\\', '/')
        dest.writestr(entry, data)
fixed.replace(apk)
with ZipFile(apk) as result:
    manifest = json.loads(result.read('assets/game/integrity.json'))
    for name, expected in manifest['sha256'].items():
        actual = hashlib.sha256(result.read('assets/game/' + name)).hexdigest()
        if actual != expected:
            raise RuntimeError('APK asset hash mismatch: ' + name)
print('APK paths and all bundled SHA-256 hashes verified.')
