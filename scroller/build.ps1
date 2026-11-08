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

# Compress into clean release zip
Compress-Archive -Path $itemsToZip -DestinationPath $zipOutput -Force
Copy-Item $zipOutput "auto-scroll-v1.6.0.zip" -Force

Write-Host "Package created successfully: $zipOutput"
Get-Item $zipOutput | Select-Object Name, Length, LastWriteTime
