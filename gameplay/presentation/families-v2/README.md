# Supplied visual-only enemy family painters

The two JS files are the user's original attachments, copied byte-for-byte.
Their source hashes are recorded in each release's integrity.json.

Build with python scripts/build-families.py after the approved campaign build.
This reads releases/campaign-v3 and campaign-v3-lab and emits families-v2 and
families-v2-lab, retaining all non-HTML files unchanged except integrity metadata.
Only the old enemy body drawing function and damaged-only HP bar are replaced.
The family function is renamed internally and called through a save/restore
canvas wrapper. The segmented ring occupies the old HP-bar drawing position,
after type features/hit flash and before the targeting marker. The user-provided
painter files themselves remain unchanged. Special gold/composite drawing and
all existing type/shield/guardian marks are preserved.

Do not alter stats, prices, movement, enemy radius, collision, visibility grace,
focus duration, targeting, rewards, guardian siege or save formats in this layer.
