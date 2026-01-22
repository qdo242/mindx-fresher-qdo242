import * as appInsights from 'applicationinsights';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
        .setAutoCollectRequests(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectPerformance(true, false) 
        .start();
    
    console.log("Azure Application Insights đã khởi tạo thành công!");
} else {
    console.warn("Không tìm thấy CONNECTION_STRING, Azure App Insights sẽ không chạy.");
}