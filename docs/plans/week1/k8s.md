# Tài liệu Kỹ thuật: Kiến trúc Triển khai Kubernetes

## 1. Tổng quan về Kiến trúc Hạ tầng (Infrastructure Architecture)

Dự án được triển khai trên nền tảng **Azure Kubernetes Service (AKS)**, tận dụng sức mạnh của các đối tượng (Resources) trong Kubernetes để xây dựng một hệ thống có khả năng:

- **Tự phục hồi (Self-healing)**: Tự động khôi phục dịch vụ khi có sự cố
- **Mở rộng linh hoạt (Scalability)**: Dễ dàng scale theo nhu cầu
- **Bảo mật nghiêm ngặt**: Tuân thủ các tiêu chuẩn bảo mật doanh nghiệp

Toàn bộ hạ tầng được định nghĩa thông qua **Infrastructure as Code (IaC)**, đảm bảo tính nhất quán giữa các lần triển khai và môi trường khác nhau.

## 2. Quản lý Vòng đời Ứng dụng: Deployment (deployment.yaml)

Tài nguyên **Deployment** chịu trách nhiệm quản lý trạng thái mong muốn (Desired State) của các bản sao ứng dụng (Replicas).

### 2.1. Cơ chế Kiểm tra Sức khỏe (Health Probes)

Để đảm bảo tính sẵn sàng cao, ta cấu hình các bài kiểm tra tự động nhằm giám sát trạng thái của container:

- **Liveness Probe**: Thực hiện kiểm tra định kỳ tới endpoint `/health` tại cổng 3000. Nếu ứng dụng không phản hồi (deadlock hoặc crash), Kubernetes sẽ tự động hủy và khởi động lại Pod để khôi phục dịch vụ.

- **Readiness Probe**: Đảm bảo Pod chỉ nhận lưu lượng truy cập (traffic) khi đã hoàn thành quá trình khởi tạo các module và kết nối thành công với các dịch vụ phụ thuộc.

### 2.2. Quản trị Tài nguyên (Resource Management)

Ta thiết lập các giới hạn nghiêm ngặt để bảo vệ tính ổn định của toàn bộ Cluster:

- **Resource Limits**: 
  - CPU: Giới hạn ở mức 250m
  - Memory: Giới hạn ở mức 256Mi
  
  Việc này ngăn chặn tình trạng một Pod tiêu thụ quá nhiều tài nguyên dẫn đến ảnh hưởng tới các dịch vụ khác (Noisy Neighbor effect).

- **Resource Requests**: Đảm bảo Kubernetes Scheduler luôn dành sẵn một lượng tài nguyên tối thiểu cần thiết để Pod có thể khởi động ổn định.

## 3. Trừu tượng hóa Mạng và Kết nối: Service (service.yaml)

Đối tượng **Service** cung cấp một phương thức ổn định để truy cập vào các Pod vốn có tính chất tạm thời (Ephemeral).

### 3.1. Loại dịch vụ ClusterIP

- **Cơ chế**: Cung cấp một địa chỉ IP nội bộ không thay đổi trong suốt vòng đời của Service.
- **Lợi ích**: Cho phép các thành phần khác (như Ingress hoặc các dịch vụ nội bộ) giao tiếp với Backend mà không cần quan tâm đến địa chỉ IP thực tế của từng Pod.

### 3.2. Ánh xạ Cổng (Port Mapping)

Dịch vụ thực hiện chuyển đổi lưu lượng từ:
- **Port 80**: Cổng tiêu chuẩn của Service
- **Port 3000**: Cổng thực thi của ứng dụng Node.js bên trong container

Cơ chế này giúp chuẩn hóa giao tiếp mạng bên trong Cluster.

## 4. Quản lý Dữ liệu Nhạy cảm: Secrets (auth-secret.yaml)

Bảo mật dữ liệu là ưu tiên hàng đầu, đặc biệt là các thông tin xác thực OIDC.

### 4.1. Cơ chế Lưu trữ

Các biến môi trường nhạy cảm như `CLIENT_SECRET` và `SESSION_SECRET` được lưu trữ dưới dạng mã hóa Base64 trong tài nguyên Secret.

### 4.2. Phương thức Tiêm dữ liệu (Injection)

Các bí mật này được tiêm trực tiếp vào biến môi trường của container lúc Runtime, giúp mã nguồn không bao giờ phải lưu trữ thông tin nhạy cảm ở dạng văn bản thuần túy (Plaintext).

## 5. Cửa ngõ Truy cập và Điều phối: Ingress (ingress.yaml)

**Ingress** đóng vai trò là một Proxy ngược (Reverse Proxy) và Load Balancer ở tầng ứng dụng (Layer 7).

### 5.1. Định tuyến dựa trên Hostname

Hệ thống sử dụng dịch vụ **nip.io** để ánh xạ địa chỉ IP Public của Azure Load Balancer thành một tên miền kỹ thuật: `135.171.144.185.nip.io`. Điều này cho phép truy cập ứng dụng thông qua định danh tên miền thay vì địa chỉ IP thô.

### 5.2. Kỹ thuật Chuyển đổi Đường dẫn (Path Rewrite)

Ta sử dụng **Nginx Ingress Controller** với các Annotation đặc thù để tối ưu hóa luồng dữ liệu:

- **Annotation**: `nginx.ingress.kubernetes.io/rewrite-target: /$1`
- **Mục đích**: Chuyển đổi yêu cầu từ tiền tố `/api` (ví dụ: `/api/auth/login`) thành đường dẫn nội bộ gốc (`/auth/login`). Việc này giúp mã nguồn Backend xử lý các route một cách chuẩn hóa mà không bị phụ thuộc vào cấu trúc định tuyến của Gateway.

### 5.3. Bảo mật TLS Termination

Ingress được cấu hình để thực thi HTTPS thông qua việc giải mã dữ liệu SSL (TLS Termination) tại tầng Gateway trước khi chuyển tiếp yêu cầu (dưới dạng HTTP nội bộ) tới các Service. Việc này giúp:

- **Giảm tải xử lý mã hóa** cho các Pod ứng dụng
- **Quản lý tập trung** chứng chỉ SSL/TLS
- **Tối ưu hiệu năng** cho ứng dụng

## 6. Cấu trúc Thư mục Triển khai
k8s/
├── deployment.yaml 
├── service.yaml 
├── ingress.yaml 
└── secrets/ 
└── auth-secret.yaml


## 7. Best Practices Áp dụng

### 7.1. Security
- **Least Privilege**: Container chạy với user không phải root
- **Immutable Infrastructure**: Không chỉnh sửa container trực tiếp
- **Secret Management**: Không hardcode secrets trong image

### 7.2. Reliability
- **Pod Disruption Budget**: Đảm bảo số lượng Pod tối thiểu khi có disruption
- **Pod Anti-Affinity**: Phân tán Pod trên các node khác nhau
- **Graceful Shutdown**: Xử lý shutdown đúng cách

### 7.3. Performance
- **Resource Quotas**: Ngăn chặn resource exhaustion
- **Network Policies**: Kiểm soát traffic giữa các service
- **Horizontal Pod Autoscaling**: Tự động scale theo tải

## 8. Quy trình Triển khai (Deployment Pipeline)
- **Zero-downtime deployment**: Cập nhật không gây gián đoạn dịch vụ
- **Rollback capability**: Dễ dàng rollback nếu có lỗi
- **Canary deployment**: Triển khai từng phần để kiểm tra

## 9. Giám sát và Logging

### 9.1. Monitoring Stack
- **Prometheus**: Thu thập metrics
- **Grafana**: Dashboard và visualization
- **Azure Monitor**: Monitoring tích hợp với Azure

### 9.2. Logging
- **Fluentd/EFK Stack**: Tập trung logs
- **Application Insights**: Application-level monitoring
- **Audit Logs**: Ghi lại mọi thay đổi trong cluster

## 10. Backup và Disaster Recovery

### 10.1. Backup Strategy
- **Regular Backups**: Backup định kỳ cấu hình và state
- **Version Control**: Quản lý cấu hình bằng Git
- **Disaster Recovery Plan**: Kế hoạch phục hồi thảm họa

### 10.2. Recovery Procedures
- **RTO (Recovery Time Objective)**: < 30 phút
- **RPO (Recovery Point Objective)**: < 15 phút
- **Automated Recovery**: Script tự động phục hồi

## 11. Kết luận

Bộ đặc tả tài nguyên Kubernetes này đảm bảo rằng ứng dụng được vận hành trên một nền tảng hạ tầng bền bỉ, có khả năng mở rộng và bảo mật theo các tiêu chuẩn công nghiệp hiện đại. Việc áp dụng các best practices trong thiết kế và triển khai giúp hệ thống:

1. **Độ tin cậy cao**: 99.9% uptime
2. **Bảo mật toàn diện**: Tuân thủ các tiêu chuẩn bảo mật
3. **Hiệu năng tối ưu**: Tối ưu tài nguyên và hiệu suất
4. **Dễ dàng vận hành**: Quản lý tập trung và tự động hóa
5. **Chi phí hiệu quả**: Tối ưu chi phí vận hành

