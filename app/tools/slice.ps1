param([string]$file, [int]$slice = 1150, [string]$out = "")
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile($file)
if (-not $out) { $out = Join-Path (Split-Path $file) ([IO.Path]::GetFileNameWithoutExtension($file)) }
$n = [Math]::Ceiling($img.Height / $slice)
for ($i = 0; $i -lt $n; $i++) {
  $y = $i * $slice
  $h = [Math]::Min($slice, $img.Height - $y)
  $rect = New-Object System.Drawing.Rectangle(0, $y, $img.Width, $h)
  $crop = $img.Clone($rect, $img.PixelFormat)
  $crop.Save(("{0}-{1:d2}.png" -f $out, $i), [System.Drawing.Imaging.ImageFormat]::Png)
  $crop.Dispose()
}
$img.Dispose()
Write-Output ("sliced {0} -> {1} pieces" -f $file, $n)
