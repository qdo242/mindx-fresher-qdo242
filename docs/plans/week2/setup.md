# Hướng dẫn Kỹ thuật: Cấu hình Instrumentation và Triển khai Hạ tầng

## 1. Node.js Instrumentation
Trong môi trường Node.js sử dụng tiêu chuẩn **ES Modules** (`"type": "module"`), việc nạp các thư viện giám sát yêu cầu một phương pháp tiếp cận đặc thù do cơ chế nạp module V8.

### 1.1. Giải pháp: Kỹ thuật Monkey-patching qua Preload
Áp dụng mô hình Instrumentation Preloading để đảm bảo SDK Azure bao vây (intercept) được các module mạng trước khi ứng dụng thực thi logic nghiệp vụ:
* **File `instrumentation.ts`**: Đóng gói mã cấu hình Azure SDK để đảm bảo tính cô lập và khả năng tái sử dụng.
* **Module Loader**: Sử dụng `--import` (Node.js 20+) để nạp lớp giám sát vào bộ nhớ ngay tại thời điểm khởi động của engine.

---

## 2. Quy trình Cập nhật và Đồng bộ Hạ tầng (Deployment Lifecycle)

### Bước 1: Cấu hình Backend và Build Pipelines
* Phát triển module `instrumentation.ts` hỗ trợ thu thập dữ liệu Performance định kỳ từ động cơ Node.js.
* Điều chỉnh `package.json` để đồng bộ lệnh khởi động ứng dụng với cơ chế nạp module mới.

### Bước 2: Tối ưu hóa Docker Artifacts (Image v2.10)
* Sửa đổi cấu trúc `Dockerfile` để thực thi ứng dụng thông qua `npm start`, đảm bảo tính toàn vẹn của các cờ khởi động (runtime flags) trong môi trường containerized.

### Bước 3: Đồng bộ Kubernetes & Ingress Controller
* Cấu hình **Nginx Ingress** với chỉ thị `rewrite-target` nhằm chuẩn hóa đường dẫn API khi yêu cầu đi từ Gateway vào bên trong Microservices.
* Thực thi lệnh `kubectl rollout restart` để áp dụng cấu hình mới nhất mà không gây gián đoạn dịch vụ (Zero-downtime update).

## 3. Danh sách Kiểm tra Nghiệm thu (Final Verification)
1. **Pod Status**: Trạng thái `Running (1/1 Ready)` xác nhận tính ổn định của ứng dụng.
2. **Telemetry Flow**: Kiểm chứng sự hiện diện của Telemetry data trong tab **Search** của Azure Portal.
3. **Connectivity**: Đảm bảo endpoint `/health` phản hồi mã trạng thái HTTP 200.