$services = @(
    "backend\services\user-service",
    "backend\services\trip-service",
    "backend\services\seat-inventory-service",
    "backend\services\catalog-service",
    "backend\services\booking-service",
    "backend\services\analytics-service",
    "backend\services\ticket-worker",
    "backend\graphql-server"
)

foreach ($service in $services) {
    Write-Host "Starting $service..."
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd $service && npm start" -WindowStyle Normal
}

Write-Host "Starting frontend..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd frontend && npm run dev" -WindowStyle Normal

Write-Host "All services (Backend + Frontend) started in new windows!"
