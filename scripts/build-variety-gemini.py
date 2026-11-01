"""Merge approved Gemini presentation/pacing into the latest tactics release."""
from pathlib import Path
import runpy
build=runpy.run_path(str(Path(__file__).with_name('build-gemini-preview.py')))['build']
build('variety-v1-lab','variety-gemini-v1-lab','variety-gemini-v1')
