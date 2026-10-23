# Recovered Vercel SD2 preview — continuation baseline

Recovered from the exact deployment provided by the user:
https://neon-defense-sd2-preview-5di2a47zj-xilike3-8922s-projects.vercel.app/?sd2debug=mid&schedule=1

The user selected this deployed version as the source for continuation. Keep this snapshot intact; make future edits in a separate working copy. Do not replace it with the current dev root or publish to Production.

## Contents and verification

- index.html: deployed game HTML, including its inline game implementation.
- sd2.js: deployed SD2 module loaded by the HTML.
- recovery-manifest.json: file sizes, SHA-256 hashes, origin, and verification limits.
- Local JavaScript syntax parsing passed for the inline game script and SD2 module. Closing HTML tags are present.
- No gameplay browser test was run in this recovery task. Successful parsing is not proof of game balance or runtime correctness.
- Text was recovered through authenticated HTTP responses. Original uploaded compressed chunks were not used because their API responses were truncated. The Vercel feedback script is preserved as served.

## Difference from current dev

The recovered HTML is 209,250 bytes; the current dev root HTML is 122,492 bytes. They are different implementations, not interchangeable releases.

This preview loads sd2.js and maps sd2debug=new|mid|adv and schedule=1 into SD2 debug and schedule settings. SD2 includes 15 levels in Aurora, a 60-second budget distribution target, maxAlive=12 and an additional Splitter child allowance of 6. The mid fixture starts electric and base upgrades at level 3.

The current dev RECOVERY.md describes rebuilding an older continuous-game source and disabling finite-budget SD2 in the shipping game. Its tests must not be used as evidence that this recovered preview passed gameplay checks.

The latest reviewed historical report completed levels 1 and 2 and began level 3; it reported saveIsolation.ok=false. Recovering these files does not repair that failure.

## Local use

Serve this directory with a local HTTP server, then open /?sd2debug=mid&schedule=1. Use a dedicated browser context so test storage does not overlap other local projects. No build step is required for this snapshot.
