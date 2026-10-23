$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot
$sdkRoot = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Join-Path $env:LOCALAPPDATA 'Android/Sdk' }
$buildTools = Join-Path $sdkRoot 'build-tools/36.0.0'
$androidJar = Join-Path $sdkRoot 'platforms/android-35/android.jar'
$apkWork = Join-Path $repoRoot 'android/app/build'
New-Item -ItemType Directory -Force "$apkWork/classes","$apkWork/dex","$apkWork/assets/game" | Out-Null
node scripts/build-preview.mjs
if ($LASTEXITCODE -ne 0) { throw 'Web build failed' }
Copy-Item -Path 'dist/*' -Destination "$apkWork/assets/game" -Recurse -Force
& "$buildTools/aapt2.exe" link -I $androidJar --manifest android/AndroidManifest.xml -A "$apkWork/assets" -o "$apkWork/unsigned.apk"
if ($LASTEXITCODE -ne 0) { throw 'APK resource link failed' }
javac -source 8 -target 8 -bootclasspath $androidJar -d "$apkWork/classes" android/src/com/xilike/neondefense/sd2/preview/MainActivity.java
if ($LASTEXITCODE -ne 0) { throw 'Java compile failed' }
$classFiles = @(Get-ChildItem "$apkWork/classes" -Recurse -Filter '*.class' | ForEach-Object FullName)
& "$buildTools/d8.bat" --lib $androidJar --min-api 26 --output "$apkWork/dex" @classFiles
if ($LASTEXITCODE -ne 0) { throw 'DEX failed' }
jar uf "$apkWork/unsigned.apk" -C "$apkWork/dex" classes.dex
python scripts/normalize-apk.py "$apkWork/unsigned.apk"
if ($LASTEXITCODE -ne 0) { throw 'APK asset integrity failed' }
& "$buildTools/zipalign.exe" -f -p 4 "$apkWork/unsigned.apk" "$apkWork/aligned.apk"
if ($LASTEXITCODE -ne 0) { throw 'Alignment failed' }
$keyFile = Join-Path $apkWork 'preview.keystore'
if (!(Test-Path $keyFile)) {
  keytool -genkeypair -keystore $keyFile -storepass android -keypass android -alias preview -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=Neon SD2 Preview'
  if ($LASTEXITCODE -ne 0) { throw 'Preview signing key failed' }
}
& "$buildTools/apksigner.bat" sign --ks $keyFile --ks-key-alias preview --ks-pass pass:android --key-pass pass:android --out "$apkWork/neon-defense-sd2-preview.apk" "$apkWork/aligned.apk"
if ($LASTEXITCODE -ne 0) { throw 'APK signing failed' }
& "$buildTools/apksigner.bat" verify --verbose "$apkWork/neon-defense-sd2-preview.apk"
if ($LASTEXITCODE -ne 0) { throw 'APK verification failed' }
Write-Output "APK: $apkWork/neon-defense-sd2-preview.apk"
