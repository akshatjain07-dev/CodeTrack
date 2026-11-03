Add-Type -AssemblyName System.Drawing

$srcPath = Resolve-Path "public\images\codetrack-logo.png"
$destIconPath = Join-Path (Split-Path $srcPath) "codetrack-icon.png"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Source Width: $($src.Width), Height: $($src.Height)"

# The C symbol is from y: 190 to 555 (height ~365) and x: 330 to 695 (width ~365)
# Perfectly framed 390x390 square with no wordmark text at bottom:
$cropX = 317
$cropY = 175
$cropSize = 390

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
$cropped = $src.Clone($rect, $src.PixelFormat)

$cropped.Save($destIconPath, [System.Drawing.Imaging.ImageFormat]::Png)

$cropped.Dispose()
$src.Dispose()

Write-Host "Created centered square icon at $destIconPath"
