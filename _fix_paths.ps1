# Fix paths for file:// protocol (user has no Node.js installed)
$files = @(
    "c:\Users\ik814\Desktop\nomad\public\script.js",
    "c:\Users\ik814\Desktop\nomad\public\index.html",
    "c:\Users\ik814\Desktop\nomad\public\onboarding.html"
)
foreach ($filePath in $files) {
    if (Test-Path $filePath) {
        $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
        # Revert /pic/ back to ../pic/ for file:// protocol compatibility
        $newContent = $content.Replace('"/pic/', '"../pic/').Replace("'/pic/", "'../pic/")
        [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
        Write-Output "Reverted paths in $filePath"
    }
}
Write-Output "All files reverted to ../pic/ for file:// protocol"
