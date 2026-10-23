// Compatibility entry point. The complete source now lives in this repository.
if(process.argv.length>2) throw new Error('External integrated HTML is no longer needed. Run npm run build:preview.');
await import('./build-preview.mjs');
