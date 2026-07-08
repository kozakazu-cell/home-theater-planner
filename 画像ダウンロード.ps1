# プロジェクター商品画像を一括ダウンロードするスクリプト
# 使い方: このファイルと「プロジェクター_商品画像URL一覧.csv」を同じフォルダに置き、
#         右クリック →「PowerShellで実行」(または powershell -ExecutionPolicy Bypass -File .\画像ダウンロード.ps1)
# 出力先: .\images\[商品名]_[ASIN].jpg

$dir = Join-Path $PSScriptRoot "images"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$csv = Import-Csv (Join-Path $PSScriptRoot "プロジェクター_商品画像URL一覧.csv")
$i = 0
foreach ($row in $csv) {
    $i++
    $out = Join-Path $dir $row.ファイル名
    Write-Host ("[{0}/{1}] {2}" -f $i, $csv.Count, $row.ファイル名)
    try {
        Invoke-WebRequest -Uri $row.画像URL -OutFile $out -UseBasicParsing
        Start-Sleep -Milliseconds 300
    } catch {
        Write-Warning ("失敗: {0} ({1})" -f $row.ファイル名, $_.Exception.Message)
    }
}
Write-Host "完了。保存先: $dir"
