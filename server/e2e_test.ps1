try {
  $login = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body (ConvertTo-Json @{email='teacher@example.com'; password='password123'; role='teacher'}) -ContentType 'application/json'
  $token = $login.token
  Write-Output "TOKEN:$token"
  $hdr = @{ Authorization = "Bearer $token" }

  $ann = Invoke-RestMethod -Uri 'http://localhost:3001/api/announcements' -Method Post -Body (ConvertTo-Json @{title='E2E Test Announcement'; content='Created by automated test'; type='general'}) -Headers $hdr -ContentType 'application/json'
  Write-Output 'ANN_CREATED:'
  $ann | ConvertTo-Json -Depth 4 | Write-Output

  $evt = Invoke-RestMethod -Uri 'http://localhost:3001/api/calendar-events' -Method Post -Body (ConvertTo-Json @{title='E2E Test Event'; event_date=(Get-Date -Format yyyy-MM-dd); event_time='10:00 - 11:00'; event_type='meeting'; class='Class 10A'; location='Room 101'; description='Created by automated test'}) -Headers $hdr -ContentType 'application/json'
  Write-Output 'EVENT_CREATED:'
  $evt | ConvertTo-Json -Depth 4 | Write-Output

  Write-Output 'ANN_LIST:'
  (Invoke-RestMethod -Uri 'http://localhost:3001/api/announcements' -Headers $hdr) | ConvertTo-Json -Depth 4 | Write-Output

  Write-Output 'EVENTS_LIST:'
  (Invoke-RestMethod -Uri 'http://localhost:3001/api/calendar-events' -Headers $hdr) | ConvertTo-Json -Depth 6 | Write-Output
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
