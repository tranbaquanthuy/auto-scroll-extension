# Auto Scroll - Build & Package Script

$zipOutput = "auto-scroll-youtube-tiktok.zip"

# Extension runtime files to package
$itemsToZip = @(
    "manifest.json",
    "content.js",
    "content.css",
    "popup.html",
    "popup.css",
    "popup.js",
    "icon16.png",
    "icon48.png",
    "icon128.png",
    "_locales"
)

# Remove old zip before building
if (Test-Path $zipOutput) {
    Remove-Item $zipOutput -Force
}

# Compress into clean release zip using Python to guarantee forward-slash paths for Chrome, Edge & Firefox AMO
python -c "import os, zipfile, shutil; p = r'$PSScriptRoot'; os.chdir(p); files = ['manifest.json', 'content.js', 'content.css', 'popup.html', 'popup.css', 'popup.js', 'icon16.png', 'icon48.png', 'icon128.png']; z = zipfile.ZipFile('$zipOutput', 'w', zipfile.ZIP_DEFLATED); [z.write(f, f) for f in files if os.path.exists(f)]; [(z.write(os.path.join(r, fn), os.path.join(r, fn).replace('\\', '/'))) for r, d, fns in os.walk('_locales') for fn in fns]; z.close(); shutil.copy('$zipOutput', 'auto-scroll-v1.6.0.zip'); shutil.copy('$zipOutput', os.path.join(os.path.dirname(p), '$zipOutput'))"

Write-Host "Package created successfully: $zipOutput"
Get-Item $zipOutput | Select-Object Name, Length, LastWriteTime
