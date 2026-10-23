// The recovered game uses continuous combat; tests exercise its real engine.
import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['node_modules/@playwright/test/cli.js','test','e2e/gameplay.spec.js','--grep','continuous combat'],{stdio:'inherit'});
process.exitCode=result.status??1;
