#!/usr/bin/env python3
"""Builds the announcer's voice clips (voice/*.mp3 + voice/manifest.json) with espeak-ng and ffmpeg.
Same deep robot through an old-radio filter as POTUS Kombat.

Run from the repo root after adding a fighter or a spoken line:  python3 tools/make_voice.py
Needs espeak-ng and ffmpeg installed.
"""
import json, os, re, subprocess, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'voice')

def slug(t): return re.sub(r'^-+|-+$', '', re.sub(r'[^a-z0-9]+', '-', t.lower()))

# every line the announcer speaks, as the engine passes it to say() (fighter names are added below)
FIXED = ['fight', 'fatality', 'flawless victory', 'choose your fighter', 'finish him', 'finish her', 'finish it',
         'round one', 'round two', 'round three', 'round four', 'round five']
# shouted lines are slower and deeper
SHOUT = {'fight': (100, 12), 'fatality': (88, 8), 'finish him': (98, 10), 'finish her': (98, 10), 'finish it': (98, 10)}

# how a line should sound, when the written form trips up the voice
def pronounce(t):
    t = re.sub(r'\bpres\.?\s', 'president ', t)
    return t.replace('ofc ', 'officer ').replace('balling ', 'bawlin ').replace('card-card', 'card card').replace('hack-hack', 'hack hack')

src = open(os.path.join(ROOT, 'js', 'fighters.js')).read()
names = re.findall(r"""id: '\w+', name: (?:'([^']+)'|"([^"]+)"), short:""", src)
names = [(a or b).replace("'", 'g', 1).lower() for a, b in names]   # the engine swaps the first apostrophe for g
lines = FIXED + names + [n + ' wins' for n in names]

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith('.mp3'): os.remove(os.path.join(OUT, f))
FILTER = 'asetrate=22050*0.88,aresample=44100,atempo=1.5,highpass=f=250,lowpass=f=3200,acompressor=threshold=-18dB:ratio=4,volume=2,aecho=0.8:0.6:40:0.25,apad=pad_dur=0.15'
done = []
with tempfile.TemporaryDirectory() as tmp:
    for line in lines:
        spoken = pronounce(line)
        keys = {slug(line), slug(spoken)}   # config.js rewrites "pres." before some lines reach the engine
        wav = os.path.join(tmp, 'x.wav')
        speed, pitch = SHOUT.get(line, (118, 16))
        subprocess.run(['espeak-ng', '-v', 'en-us+m3', '-s', str(speed), '-p', str(pitch), '-g', '4', '-w', wav, spoken], check=True)
        for k in keys:
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', FILTER, '-b:a', '64k', os.path.join(OUT, k + '.mp3')], check=True)
            done.append(k)
json.dump(sorted(set(done)), open(os.path.join(OUT, 'manifest.json'), 'w'), indent=0)
print(f'{len(set(done))} clips written to voice/')
