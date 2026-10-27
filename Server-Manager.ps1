Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$projectDir = "C:\Users\PC1\Downloads\AG PROJECT\campus-print-shop"
$url = "http://localhost:3000"

function Test-ServerRunning {
    try {
        $conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
        return ($null -ne $conn)
    } catch {
        return $false
    }
}

function Start-ServerBackground {
    if (Test-ServerRunning) {
        [System.Windows.Forms.MessageBox]::Show("Server is already running on port 3000!", "Campus Print Shop", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
        [System.Diagnostics.Process]::Start($url)
        return
    }

    $statusLabel.Text = "Status: Starting server..."
    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(217, 119, 6) # Amber
    $form.Refresh()

    # Start detached background process
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cmd.exe"
    $psi.Arguments = "/c cd /d `"$projectDir`" && npm.cmd run dev"
    $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    $psi.CreateNoWindow = $true
    $psi.UseShellExecute = $true
    [System.Diagnostics.Process]::Start($psi) | Out-Null

    # Wait up to 10 seconds for port 3000 to be open
    $started = $false
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep -Seconds 1
        if (Test-ServerRunning) {
            $started = $true
            break
        }
    }

    Update-StatusUI

    if ($started) {
        [System.Diagnostics.Process]::Start($url)
    } else {
        [System.Windows.Forms.MessageBox]::Show("Server started in background. It may take a few more seconds to compile. Opening browser now...", "Campus Print Shop", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
        [System.Diagnostics.Process]::Start($url)
    }
}

function Stop-ServerBackground {
    $statusLabel.Text = "Status: Stopping server..."
    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(220, 38, 38)
    $form.Refresh()

    # Kill processes using port 3000
    try {
        $conns = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
        if ($conns) {
            foreach ($c in $conns) {
                Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
        # Also clean up any loose node processes in project dir if needed
        Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq "" } | Stop-Process -Force -ErrorAction SilentlyContinue
    } catch {}

    Start-Sleep -Milliseconds 600
    Update-StatusUI
    [System.Windows.Forms.MessageBox]::Show("Server stopped cleanly.", "Campus Print Shop", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
}

function Update-StatusUI {
    if (Test-ServerRunning) {
        $statusDot.BackColor = [System.Drawing.Color]::FromArgb(16, 185, 129) # Emerald Green
        $statusLabel.Text = "Server Status: Running (Port 3000)"
        $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(6, 95, 70)
        $startBtn.Enabled = $true
        $startBtn.Text = "🚀 Restart Server"
        $stopBtn.Enabled = $true
        $openBtn.Enabled = $true
    } else {
        $statusDot.BackColor = [System.Drawing.Color]::FromArgb(239, 68, 68) # Red
        $statusLabel.Text = "Server Status: Offline / Stopped"
        $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(153, 27, 27)
        $startBtn.Enabled = $true
        $startBtn.Text = "🚀 Start Server & Open App"
        $stopBtn.Enabled = $false
        $openBtn.Enabled = $false
    }
}

# --- GUI Window Construction ---
$form = New-Object System.Windows.Forms.Form
$form.Text = "Campus Print Shop — Server Manager"
$form.Size = New-Object System.Drawing.Size(460, 410)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(248, 250, 252) # Slate-50

# Header Panel
$header = New-Object System.Windows.Forms.Panel
$header.Size = New-Object System.Drawing.Size(460, 75)
$header.BackColor = [System.Drawing.Color]::FromArgb(15, 41, 66) # University Navy
$header.Location = New-Object System.Drawing.Point(0, 0)

$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "Campus Print Shop"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::White
$titleLabel.Location = New-Object System.Drawing.Point(22, 14)
$titleLabel.AutoSize = $true
$header.Controls.Add($titleLabel)

$subLabel = New-Object System.Windows.Forms.Label
$subLabel.Text = "One-Click Local Server Control Center"
$subLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$subLabel.ForeColor = [System.Drawing.Color]::FromArgb(203, 213, 225)
$subLabel.Location = New-Object System.Drawing.Point(24, 42)
$subLabel.AutoSize = $true
$header.Controls.Add($subLabel)
$form.Controls.Add($header)

# Status Card Panel
$statusCard = New-Object System.Windows.Forms.Panel
$statusCard.Size = New-Object System.Drawing.Size(400, 52)
$statusCard.Location = New-Object System.Drawing.Point(22, 95)
$statusCard.BackColor = [System.Drawing.Color]::White
$statusCard.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle

$statusDot = New-Object System.Windows.Forms.Panel
$statusDot.Size = New-Object System.Drawing.Size(12, 12)
$statusDot.Location = New-Object System.Drawing.Point(16, 20)
$statusCard.Controls.Add($statusDot)

$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = "Checking server status..."
$statusLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$statusLabel.Location = New-Object System.Drawing.Point(38, 16)
$statusLabel.AutoSize = $true
$statusCard.Controls.Add($statusLabel)
$form.Controls.Add($statusCard)

# Buttons
$startBtn = New-Object System.Windows.Forms.Button
$startBtn.Text = "🚀 Start Server & Open App"
$startBtn.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$startBtn.Size = New-Object System.Drawing.Size(400, 46)
$startBtn.Location = New-Object System.Drawing.Point(22, 162)
$startBtn.BackColor = [System.Drawing.Color]::FromArgb(15, 41, 66)
$startBtn.ForeColor = [System.Drawing.Color]::White
$startBtn.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$startBtn.FlatAppearance.BorderSize = 0
$startBtn.Cursor = [System.Windows.Forms.Cursors]::Hand
$startBtn.Add_Click({ Start-ServerBackground })
$form.Controls.Add($startBtn)

$openBtn = New-Object System.Windows.Forms.Button
$openBtn.Text = "🌐 Open in Browser (localhost:3000)"
$openBtn.Font = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
$openBtn.Size = New-Object System.Drawing.Size(400, 40)
$openBtn.Location = New-Object System.Drawing.Point(22, 218)
$openBtn.BackColor = [System.Drawing.Color]::White
$openBtn.ForeColor = [System.Drawing.Color]::FromArgb(15, 41, 66)
$openBtn.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$openBtn.Cursor = [System.Windows.Forms.Cursors]::Hand
$openBtn.Add_Click({ [System.Diagnostics.Process]::Start($url) })
$form.Controls.Add($openBtn)

$stopBtn = New-Object System.Windows.Forms.Button
$stopBtn.Text = "🛑 Stop Server"
$stopBtn.Font = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
$stopBtn.Size = New-Object System.Drawing.Size(192, 38)
$stopBtn.Location = New-Object System.Drawing.Point(22, 268)
$stopBtn.BackColor = [System.Drawing.Color]::FromArgb(254, 242, 242)
$stopBtn.ForeColor = [System.Drawing.Color]::FromArgb(185, 28, 28)
$stopBtn.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$stopBtn.Cursor = [System.Windows.Forms.Cursors]::Hand
$stopBtn.Add_Click({ Stop-ServerBackground })
$form.Controls.Add($stopBtn)

$folderBtn = New-Object System.Windows.Forms.Button
$folderBtn.Text = "📁 Open Folder"
$folderBtn.Font = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
$folderBtn.Size = New-Object System.Drawing.Size(198, 38)
$folderBtn.Location = New-Object System.Drawing.Point(224, 268)
$folderBtn.BackColor = [System.Drawing.Color]::White
$folderBtn.ForeColor = [System.Drawing.Color]::FromArgb(71, 85, 105)
$folderBtn.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$folderBtn.Cursor = [System.Windows.Forms.Cursors]::Hand
$folderBtn.Add_Click({ [System.Diagnostics.Process]::Start("explorer.exe", $projectDir) })
$form.Controls.Add($folderBtn)

# Footer Note
$footer = New-Object System.Windows.Forms.Label
$footer.Text = "Runs silently in the background without needing open PowerShell windows."
$footer.Font = New-Object System.Drawing.Font("Segoe UI", 8)
$footer.ForeColor = [System.Drawing.Color]::FromArgb(148, 163, 184)
$footer.Location = New-Object System.Drawing.Point(24, 324)
$footer.Size = New-Object System.Drawing.Size(400, 25)
$footer.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
$form.Controls.Add($footer)

# Timer to poll status every 3 seconds
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 3000
$timer.Add_Tick({ Update-StatusUI })
$timer.Start()

$form.Add_FormClosed({
    $timer.Stop()
    $timer.Dispose()
})

Update-StatusUI
[void]$form.ShowDialog()
