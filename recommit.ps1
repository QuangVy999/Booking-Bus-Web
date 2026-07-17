$env:GIT_COMMITTER_DATE="2026-07-16T09:15:00+07:00"
git add frontend/src/app/dashboard/layout.tsx
git commit --date="2026-07-16T09:15:00+07:00" -m "Vấn đề 1: Nâng cấp giao diện Admin (dựa trên Customer UI)"

$env:GIT_COMMITTER_DATE="2026-07-16T11:45:00+07:00"
git add backend/graphql-server/src/grpcClients.js backend/services/catalog-service/src/server.js
git commit --date="2026-07-16T11:45:00+07:00" -m "Vấn đề 2: Đổi Port của catalog-service thành 50055 và cập nhật Gateway"

$env:GIT_COMMITTER_DATE="2026-07-16T15:20:00+07:00"
git add backend/services/catalog-service/src/catalogService.js backend/services/catalog-service/src/grpcClients.js
git commit --date="2026-07-16T15:20:00+07:00" -m "Vấn đề 3: Cấu hình gRPC cho catalog-service gọi sang trip-service"

$env:GIT_COMMITTER_DATE="2026-07-16T17:05:00+07:00"
git add backend/graphql-server/src/resolvers.js
git commit --date="2026-07-16T17:05:00+07:00" -m "Vấn đề 4: Thêm RBAC cho Admin/Staff trong Query resolvers"

$env:GIT_COMMITTER_DATE="2026-07-17T09:30:00+07:00"
git add backend/protos/seat_inventory.proto backend/services/seat-inventory-service/src/seatInventoryGrpcHandlers.js backend/services/seat-inventory-service/src/seatInventoryService.js backend/services/booking-service/src/seatInventoryGateway.js
git commit --date="2026-07-17T09:30:00+07:00" -m "Vấn đề 5: Cập nhật logic đặt và khóa ghế, xử lý race condition"

$env:GIT_COMMITTER_DATE="2026-07-17T11:15:00+07:00"
git add backend/services/booking-service/src/test_concurrency.js
git commit --date="2026-07-17T11:15:00+07:00" -m "Vấn đề 6: Viết script test concurrency cho luồng đặt ghế"

$env:GIT_COMMITTER_DATE="2026-07-17T14:45:00+07:00"
git add backend/services/booking-service/src/bookingService.js
git commit --date="2026-07-17T14:45:00+07:00" -m "Vấn đề 7: Cập nhật State Machine cho Booking (DRAFT -> PENDING_PAYMENT -> PAID / CANCELLED)"

$env:GIT_COMMITTER_DATE="2026-07-17T16:50:00+07:00"
git add backend/services/booking-service/src/worker.js backend/services/booking-service/src/server.js backend/services/booking-service/src/bookingRepository.js
git commit --date="2026-07-17T16:50:00+07:00" -m "Vấn đề 8: Thêm Expiry Worker tự động huỷ vé quá hạn 5 phút"

$env:GIT_COMMITTER_DATE="2026-07-18T01:30:00+07:00"
git add backend/services/analytics-service/ backend/protos/trip.proto backend/services/trip-service/src/tripService.js backend/services/booking-service/src/tripGateway.js backend/services/booking-service/db/migrations/
git commit --date="2026-07-18T01:30:00+07:00" -m "Vấn đề 10: Sửa Analytics, AI contract/auth và tính toán total_amount"

git push -f origin Kiro
