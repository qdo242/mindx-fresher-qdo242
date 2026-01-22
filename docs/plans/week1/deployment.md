# Tài liệu Triển khai Hạ tầng (Deployment Guide)

## 1. Tổng quan Hạ tầng Cloud-Native

Dự án được thiết kế theo mô hình **ứng dụng cloud-native**, tận dụng tối đa sức mạnh của nền tảng **Microsoft Azure** nhằm đảm bảo tính sẵn sàng cao, khả năng mở rộng linh hoạt và bảo mật nghiêm ngặt.

### 1.1. Các thành phần cốt lõi

- **Azure Kubernetes Service (AKS)**: Đóng vai trò là công cụ điều phối container chính, quản lý vòng đời của các Pod ứng dụng (backend và frontend).

- **Azure Container Registry (ACR)**: Hệ thống lưu trữ ảnh Docker riêng tư, đảm bảo quản lý các bản đóng gói ứng dụng an toàn.

- **Azure Load Balancer**: Tự động điều phối lưu lượng truy cập đến các instance đang hoạt động ổn định trong cụm.

## 2. Định tuyến và Quản lý Lưu lượng

### 2.1. NGINX Ingress Controller

Sử dụng **NGINX Ingress Controller** làm cổng vào duy nhất cho mọi lưu lượng từ Internet, đóng vai trò là **proxy ngược** cho các dịch vụ nội bộ, cung cấp khả năng định tuyến nâng cao.

### 2.2. Kỹ thuật Chuyển đổi Đường dẫn

Để tách biệt đường dẫn hạ tầng và logic nội bộ của ứng dụng, ta triển khai cơ chế **Path Rewrite**:

- **Annotation**: `nginx.ingress.kubernetes.io/rewrite-target: /$1`
- **Logic**: Khi một request truy cập `/api/auth/login`, Ingress Controller sẽ loại bỏ tiền tố `/api` và chuyển tiếp request tới Backend tại `/auth/login`
- **Lợi ích**: Cho phép Backend duy trì các route tiêu chuẩn và sạch sẽ, không phụ thuộc vào tiền tố đường dẫn được định nghĩa ở tầng Gateway

## 3. Bảo mật, SSL/TLS và Quản lý Tên miền

### 3.1. Cert-Manager & Chứng chỉ Tự động

**Bảo mật là ưu tiên hàng đầu**. Triển khai **Cert-manager** để tự động hóa toàn bộ vòng đời của chứng chỉ SSL/TLS:

- **Let's Encrypt**: Đóng vai trò là Tổ chức cấp phát chứng chỉ (CA), cung cấp chứng chỉ HTTPS miễn phí và tin cậy
- **ClusterIssuer**: Tài nguyên cấp cụm xử lý các yêu cầu cấp phát chứng chỉ cho toàn bộ Kubernetes cluster

### 3.2. DNS Động với nip.io

Do hoạt động trong môi trường cloud động, ta sử dụng **nip.io** để ánh xạ địa chỉ IP công cộng của Azure Load Balancer tới một Hostname hợp lệ:

- **Cơ chế**: Một hostname như `api.20.x.x.x.nip.io` sẽ phân giải trực tiếp tới IP tĩnh được gán bởi Azure
- **Lợi ích**: Cho phép truy cập ứng dụng qua giao thức HTTPS một cách dễ dàng, đặc biệt hữu ích trong môi trường development và staging

## 4. Triển khai Liên tục và Giám sát

### 4.1. Chiến lược Cập nhật Cuốn chiếu

Quy trình triển khai sử dụng chiến lược **RollingUpdate** để đảm bảo dịch vụ không bị gián đoạn khi phát hành phiên bản mới:

- **Health Checks**: Tích hợp các **Liveness và Readiness probes** để đảm bảo chỉ các Pod hoạt động tốt mới nhận lưu lượng
- **Tính khả dụng**: Tự động thay thế các instance cũ bằng instance mới mà không gây downtime

### 4.2. Giám sát chuyên sâu

Việc triển khai được tích hợp chặt chẽ với **Azure Application Insights** để giám sát thời gian thực:

- **Live Metrics**: Giám sát tần suất yêu cầu và thời gian phản hồi của máy chủ ngay lập tức
- **Alerting**: Cấu hình cảnh báo tự động qua **Azure Monitor** để thông báo cho đội ngũ SRE khi có bất thường hoặc vi phạm ngưỡng
- **Logging**: Tập trung logs từ tất cả các microservices để phân tích và khắc phục sự cố

## 5. Quản lý Cấu hình và Secrets

### 5.1. Kubernetes ConfigMaps

- **Tách biệt cấu hình**: Toàn bộ cấu hình ứng dụng được tách riêng khỏi code
- **Quản lý tập trung**: Dễ dàng cập nhật cấu hình mà không cần rebuild container
- **Môi trường đa tầng**: Hỗ trợ cấu hình khác nhau cho môi trường development, staging và production

### 5.2. Kubernetes Secrets

- **Bảo mật thông tin nhạy cảm**: Lưu trữ an toàn các thông tin như database passwords, API keys, OAuth client secrets
- **Mã hóa**: Secrets được mã hóa ở rest trong etcd
- **Phân quyền truy cập**: Kiểm soát chặt chẽ quyền truy cập qua RBAC

## 6. Mô hình Triển khai và Scaling

### 6.1. Auto-scaling

- **Horizontal Pod Autoscaler (HPA)**: Tự động điều chỉnh số lượng Pod dựa trên CPU, memory hoặc custom metrics
- **Cluster Autoscaler**: Tự động thêm/xóa node trong AKS cluster dựa trên nhu cầu tài nguyên

### 6.2. High Availability

- **Multi-AZ Deployment**: Triển khai ứng dụng trên nhiều Availability Zones
- **Load Balancing**: Phân phối tải đều giữa các Pod và node
- **Health Monitoring**: Liên tục kiểm tra sức khỏe của các thành phần

## 7. Backup và Disaster Recovery

### 7.1. Backup Strategies

- **Regular Backups**: Sao lưu định kỳ cấu hình Kubernetes và persistent data
- **Version Control**: Toàn bộ cấu hình hạ tầng được quản lý bằng Infrastructure as Code (IaC)

### 7.2. Recovery Procedures

- **RTO/RPO Defined**: Xác định rõ Recovery Time Objective và Recovery Point Objective
- **Automated Recovery**: Script tự động phục hồi dịch vụ trong trường hợp thảm họa
- **Regular Drills**: Thực hiện định kỳ các bài tập phục hồi thảm họa

## 8. Chi phí Tối ưu

### 8.1. Cost Management

- **Resource Quotas**: Đặt giới hạn tài nguyên cho các namespace và team
- **Cost Analysis**: Sử dụng Azure Cost Management để phân tích và tối ưu chi phí
- **Right-sizing**: Điều chỉnh kích thước resource phù hợp với nhu cầu thực tế

### 8.2. Spot Instances

- **Tiết kiệm chi phí**: Sử dụng Azure Spot VMs cho các workload có thể chịu được gián đoạn
- **Mixed Deployment**: Kết hợp giữa regular VMs và spot instances để cân bằng giữa chi phí và độ tin cậy

## 9. Kết luận

Kiến trúc hạ tầng của dự án **MindX Onboarding** được xây dựng dựa trên các tiêu chuẩn công nghiệp, đảm bảo tính bền vững, bảo mật và dễ dàng bảo trì. Việc áp dụng các best practices cloud-native giúp hệ thống:

1. **Linh hoạt mở rộng**: Dễ dàng scale theo nhu cầu business
2. **Bảo mật toàn diện**: Tuân thủ các tiêu chuẩn bảo mật doanh nghiệp
3. **Độ tin cậy cao**: Đảm bảo 99.9% uptime với cơ chế HA
4. **Chi phí tối ưu**: Tận dụng tối đa tài nguyên cloud
5. **Quản lý hiệu quả**: Giám sát và vận hành tập trung

