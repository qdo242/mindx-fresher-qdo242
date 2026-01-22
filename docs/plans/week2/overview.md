# Quản trị Quan sát Hệ thống Toàn diện (System Observability Framework)

## 1. Tầm nhìn Chiến lược và Mục tiêu Vận hành (Strategic Vision & Operational Objectives)

Trong kiến trúc phần mềm phân tán hiện đại trên nền tảng **Cloud-native**, việc duy trì **Tính sẵn sàng cao (High Availability)** đòi hỏi một hệ thống **Quan sát (Observability)** tinh vi. Chúng tôi không chỉ giám sát trạng thái nhị phân (Đang chạy/Ngừng chạy) mà tập trung vào việc phân tích các trạng thái nội tại của hệ thống thông qua các luồng dữ liệu **Telemetry (Metrics, Logs, Traces)**.

### 1.1. Mục tiêu cốt lõi

- **Tối ưu hóa MTTR (Mean Time To Resolve)**: Rút ngắn thời gian xử lý sự cố thông qua việc cung cấp các bối cảnh dữ liệu (Contextual Data) chi tiết từ ứng dụng Node.js.

- **Giảm thiểu MTTD (Mean Time To Detect)**: Phát hiện sớm các bất thường về hiệu năng trước khi chúng gây ra tác động tiêu cực đến người dùng cuối thông qua các thuật toán cảnh báo ngưỡng (Threshold-based alerting).

- **Minh bạch hóa luồng dữ liệu**: Đảm bảo mọi tương tác từ Ingress Controller tới Backend API đều được định lượng hóa trên các bảng điều khiển trực quan.

## 2. Kiến trúc Quan sát 3 Trụ cột (The Three Pillars of Observability)

Chúng tôi cấu trúc hóa khả năng quan sát của dự án dựa trên ba thành phần dữ liệu nền tảng:

### 2.1. Thông số Định lượng Hiệu năng (Performance Metrics)

Phản ánh trạng thái tài nguyên và hiệu suất xử lý của hệ thống trong thời gian thực:

- **Tần suất Yêu cầu (Request Throughput)**: Đo lường khối lượng công việc hệ thống đang xử lý mỗi giây để nhận diện các đợt tăng tải đột biến.

- **Độ trễ Phản hồi (Response Latency)**: Chỉ số quyết định trải nghiệm người dùng, được giám sát ở các mức phân vị (Percentiles) để phát hiện tình trạng nghẽn cổ chai (Bottlenecks).

- **Sức khỏe Tài nguyên (Resource Health)**: Giám sát mức độ tiêu thụ CPU và Memory của các Pod chạy trên cụm AKS để tối ưu hóa việc cấp phát tài nguyên.

### 2.2. Nhật ký Sự kiện Hệ thống (System Event Logs)

Cung cấp các bản ghi không thể thay đổi về các sự kiện rời rạc diễn ra trong vòng đời của ứng dụng:

- **Chẩn đoán Lỗi xác thực (401 Unauthorized)**: Phân tích sâu các yêu cầu không hợp lệ tới các Endpoint bảo mật để xác định các lỗ hổng bảo mật hoặc lỗi phiên làm việc (Session errors).

- **Runtime Exceptions**: Tự động bắt giữ các ngoại lệ chưa được xử lý để phục vụ công tác chẩn đoán nguyên nhân gốc rễ (Root Cause Analysis).

### 2.3. Truy vết Luồng Yêu cầu (Distributed Tracing)

Giám sát hành trình xuyên suốt của một yêu cầu đi qua các tầng hạ tầng:

- **Gateway Mapping**: Theo dõi cơ chế định tuyến và chuyển đổi đường dẫn (Path Rewrite) tại tầng Nginx Ingress Controller.

- **Dependency Tracking**: Giám sát thời gian phản hồi khi ứng dụng tương tác với các dịch vụ xác thực OIDC bên ngoài.

## 3. Quy trình Triển khai và Cấu hình Kỹ thuật (Technical Implementation)

### 3.1. Instrumentation & SDK Configuration

Hệ thống sử dụng chuẩn **Node.js 20+** với cơ chế ES Modules, yêu cầu một quy trình nạp SDK đặc thù:

- **Module Preloading**: Sử dụng cờ `--import` để kích hoạt file `instrumentation.ts` ngay khi khởi động Engine Node.js, đảm bảo toàn bộ thư viện mạng đều được "monkey-patched" để thu thập dữ liệu.

- **Application Insights SDK**: Cấu hình kết nối thông qua Connection String được lưu trữ an toàn trong biến môi trường của Kubernetes.

### 3.2. Đóng gói Container và Vận hành (Docker & K8s)

- **Docker Image v2.10**: Đóng gói mã nguồn cùng với các cấu hình giám sát mới nhất, thực thi qua lệnh `npm start` để đảm bảo tính toàn vẹn của các cờ runtime.

- **Azure Kubernetes Service (AKS)**: Triển khai các Pod với đầy đủ các bài kiểm tra Liveness/Readiness để đồng bộ dữ liệu sức khỏe với Azure Monitor.

## 4. Chiến lược Phản ứng Sự cố (Incident Response & Alerting)

Hệ thống được thiết lập để phản ứng chủ động với các lỗi vận hành thông qua **Azure Monitor Alert Rules**:

### 4.1. Logic Cảnh báo

- **Kích hoạt**: Khi số lượng Failed Requests vượt quá ngưỡng **5 lỗi** trong chu kỳ **5 phút**.
- **Khoảng thời gian đánh giá**: 5 phút
- **Tần suất đánh giá**: Mỗi phút

### 4.2. Luồng Thông báo

- **Tự động gửi Email thông báo** tới đội ngũ vận hành ngay khi hệ thống phát hiện các chỉ số vượt ngưỡng cho phép.
- **Escalation Policy**: Nếu không được xác nhận trong 15 phút, hệ thống sẽ gửi thông báo tới on-call engineer.

### 4.3. Xác thực Cảnh báo

Đã thực hiện kịch bản giả lập lỗi 401 hàng loạt để xác nhận:
- **Tính chính xác** của luồng cảnh báo
- **Thời gian phản ứng** của hệ thống
- **Độ trễ thông báo** từ khi xảy ra sự cố

## 5. Danh mục Công nghệ Triển khai (Implemented Tech Stack)

### 5.1. User Behavior Analytics
- **Google Analytics 4 (GA4)** phối hợp cùng thư viện `react-ga4`

### 5.2. Application Performance Management (APM)
- **Azure Application Insights SDK** chuyên dụng cho Node.js
- **OpenTelemetry instrumentation** cho distributed tracing

### 5.3. Infrastructure Monitoring
- **Azure Monitor Metrics** kết hợp cùng Kubernetes Dashboard trên AKS
- **Prometheus + Grafana** cho custom metrics visualization
- **Kubernetes Events** monitoring

### 5.4. Incident Notification
- **Azure Monitor Action Groups** (Email Notifications)
- **Microsoft Teams integration** cho real-time alerts
- **PagerDuty/Slack integration** (tuỳ chọn)

### 5.5. Log Management
- **Azure Log Analytics Workspace**
- **Fluentd/Fluent Bit** cho log aggregation
- **ELK Stack** (Elasticsearch, Logstash, Kibana) cho advanced log analysis

## 6. Dashboard và Báo cáo (Dashboards & Reporting)

### 6.1. Real-time Dashboards

#### **Ứng dụng Performance Dashboard**
- Request rate per second
- Average response time (p50, p95, p99)
- Error rate and distribution
- User session analytics

#### **Hạ tầng Health Dashboard**
- CPU/Memory utilization per pod
- Network I/O metrics
- Disk usage and IOPs
- Pod restart counts

#### **Business Metrics Dashboard**
- Active users count
- Authentication success/failure rate
- API endpoint usage statistics
- Geographical distribution of users

### 6.2. Báo cáo Định kỳ

#### **Hàng ngày**
- System availability report
- Peak traffic analysis
- Error trend analysis

#### **Hàng tuần**
- Performance trend report
- Capacity planning insights
- Security audit logs

#### **Hàng tháng**
- SLA compliance report
- Cost optimization suggestions
- Infrastructure health score

## 7. Quy trình Giám sát và Phản ứng (Monitoring & Response Workflow)

### 7.1. Phát hiện (Detection)