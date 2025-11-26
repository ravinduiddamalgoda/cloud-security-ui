# Backend API Requirements for SIEM Dashboard

This document outlines all the API endpoints and requirements that need to be implemented in the Flask backend to support the React frontend.

---

## 📋 Table of Contents
1. [Base Configuration](#base-configuration)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Metrics Endpoints](#metrics-endpoints)
4. [Threat Detection Endpoints](#threat-detection-endpoints)
5. [Data Structures](#data-structures)
6. [CORS Configuration](#cors-configuration)
7. [Error Handling](#error-handling)
8. [Implementation Checklist](#implementation-checklist)

---

## 🔧 Base Configuration

### Base URL
```
http://localhost:5000/api
```

### Required Headers
- **Content-Type:** `application/json`
- **Authorization:** `Bearer <JWT_TOKEN>` (for protected routes)

### Environment Variables
- `FLASK_ENV`: `development` or `production`
- `SECRET_KEY`: JWT signing key (use strong random string)
- `DATABASE_URI`: Database connection string
- `AWS_REGION`: AWS region for monitoring
- `AWS_ACCESS_KEY_ID`: AWS credentials
- `AWS_SECRET_ACCESS_KEY`: AWS credentials

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/api/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully"
}
```

**Error Response (400):**
```json
{
  "message": "User already exists"
}
```

**Implementation Requirements:**
- Hash password using bcrypt
- Validate email format
- Check for duplicate email
- Store user in database

---

### 2. Login User
**POST** `/api/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

**Implementation Requirements:**
- Verify email exists
- Compare password hash using bcrypt
- Generate JWT token with 24-hour expiration
- Include user info in response (excluding password)

---

### 3. Logout User
**POST** `/api/logout`

**Access:** Protected (requires JWT)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

**Implementation Requirements:**
- Validate JWT token
- Optionally blacklist token (if implementing token revocation)
- Clear any server-side session data

---

### 4. Get Current User
**GET** `/api/me`

**Access:** Protected (requires JWT)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200):**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Error Response (401):**
```json
{
  "message": "Unauthorized"
}
```

---

## 📊 Metrics Endpoints

All metrics endpoints are **protected** and require JWT authentication.

### Query Parameter
All metrics endpoints accept an optional `time_range` parameter:
- `1h` - Last 1 hour (default)
- `6h` - Last 6 hours
- `24h` - Last 24 hours
- `7d` - Last 7 days

---

### 1. Application Load Balancer (ALB) Metrics
**GET** `/api/metrics/alb?time_range=1h`

**Access:** Protected

**Success Response (200):**
```json
{
  "request_count": {
    "Label": "Request Count",
    "Values": [1250, 1320, 1180, 1410, 1390, 1280, 1350, 1420, 1310, 1380, 1290, 1360],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  },
  "target_response_time": {
    "Label": "Target Response Time (ms)",
    "Values": [45, 48, 52, 49, 51, 47, 50, 53, 48, 49, 51, 50],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  },
  "healthy_host_count": {
    "Label": "Healthy Hosts",
    "Values": [4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 4, 4],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  },
  "http_code_4xx": {
    "Label": "4xx Errors",
    "Values": [5, 8, 6, 7, 9, 6, 8, 7, 6, 8, 7, 6],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  },
  "http_code_5xx": {
    "Label": "5xx Errors",
    "Values": [2, 3, 1, 2, 3, 2, 1, 2, 3, 2, 1, 2],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  }
}
```

**AWS CloudWatch Metrics to Fetch:**
- `RequestCount`
- `TargetResponseTime`
- `HealthyHostCount`
- `HTTPCode_Target_4XX_Count`
- `HTTPCode_Target_5XX_Count`

**Namespace:** `AWS/ApplicationELB`

---

### 2. RDS Database Metrics
**GET** `/api/metrics/rds?time_range=1h`

**Access:** Protected

**Success Response (200):**
```json
{
  "cpu_utilization": {
    "Label": "CPU Utilization (%)",
    "Values": [35, 38, 42, 39, 41, 37, 40, 43, 38, 39, 41, 40],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  },
  "database_connections": {
    "Label": "Database Connections",
    "Values": [45, 48, 52, 49, 51, 47, 50, 53, 48, 49, 51, 50],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  },
  "read_latency": {
    "Label": "Read Latency (ms)",
    "Values": [2.5, 2.8, 3.2, 2.9, 3.1, 2.7, 3.0, 3.3, 2.8, 2.9, 3.1, 3.0],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  },
  "write_latency": {
    "Label": "Write Latency (ms)",
    "Values": [3.5, 3.8, 4.2, 3.9, 4.1, 3.7, 4.0, 4.3, 3.8, 3.9, 4.1, 4.0],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  },
  "freeable_memory": {
    "Label": "Freeable Memory (GB)",
    "Values": [2.5, 2.4, 2.3, 2.4, 2.3, 2.5, 2.4, 2.3, 2.4, 2.4, 2.3, 2.4],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  }
}
```

**AWS CloudWatch Metrics to Fetch:**
- `CPUUtilization`
- `DatabaseConnections`
- `ReadLatency`
- `WriteLatency`
- `FreeableMemory`

**Namespace:** `AWS/RDS`

---

### 3. VPC Flow Logs Statistics
**GET** `/api/metrics/vpc?time_range=1h`

**Access:** Protected

**Success Response (200):**
```json
{
  "total_flows": 125000,
  "accepted_flows": 118000,
  "rejected_flows": 7000,
  "bytes_transferred": 5368709120,
  "top_sources": [
    { "ip": "10.0.1.45", "count": 1250 },
    { "ip": "10.0.1.67", "count": 980 },
    { "ip": "10.0.2.34", "count": 875 },
    { "ip": "10.0.1.89", "count": 760 },
    { "ip": "10.0.3.12", "count": 650 }
  ],
  "top_destinations": [
    { "ip": "172.16.0.1", "count": 2100 },
    { "ip": "172.16.0.5", "count": 1850 },
    { "ip": "172.16.1.3", "count": 1620 },
    { "ip": "172.16.0.8", "count": 1450 },
    { "ip": "172.16.2.4", "count": 1280 }
  ],
  "protocol_distribution": {
    "TCP": 65,
    "UDP": 25,
    "ICMP": 10
  }
}
```

**Data Source:**
- Query VPC Flow Logs from CloudWatch Logs or S3
- Aggregate data based on time range
- Calculate statistics and top IPs

---

### 4. Auto Scaling Group (ASG) Metrics
**GET** `/api/metrics/asg?time_range=1h`

**Access:** Protected

**Success Response (200):**
```json
{
  "desired_capacity": {
    "Label": "Desired Capacity",
    "Values": [4, 4, 4, 5, 5, 4, 4, 5, 4, 4, 4, 4],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  },
  "group_in_service_instances": {
    "Label": "In-Service Instances",
    "Values": [4, 4, 4, 5, 5, 4, 4, 5, 4, 4, 4, 4],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  },
  "cpu_utilization": {
    "Label": "Average CPU (%)",
    "Values": [45, 48, 52, 65, 68, 52, 48, 62, 50, 48, 49, 47],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  }
}
```

**AWS CloudWatch Metrics to Fetch:**
- `GroupDesiredCapacity`
- `GroupInServiceInstances`
- Average `CPUUtilization` across instances

**Namespace:** `AWS/AutoScaling` and `AWS/EC2`

---

### 5. SageMaker ML Endpoint Metrics
**GET** `/api/metrics/sagemaker?time_range=1h`

**Access:** Protected

**Success Response (200):**
```json
{
  "invocations": {
    "Label": "Model Invocations",
    "Values": [450, 480, 520, 490, 510, 470, 500, 530, 480, 490, 510, 500],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  },
  "model_latency": {
    "Label": "Model Latency (ms)",
    "Values": [125, 128, 132, 129, 131, 127, 130, 133, 128, 129, 131, 130],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  },
  "invocation_errors": {
    "Label": "Invocation Errors",
    "Values": [2, 3, 1, 2, 3, 2, 1, 2, 3, 2, 1, 2],
    "Timestamps": ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55"]
  }
}
```

**AWS CloudWatch Metrics to Fetch:**
- `ModelInvocations`
- `ModelLatency`
- `ModelInvocationErrors`

**Namespace:** `AWS/SageMaker`

---

## 🚨 Threat Detection Endpoints

### 1. Threat Classifications
**GET** `/api/threats/classifications`

**Access:** Protected

**Success Response (200):**
```json
{
  "malware": 12,
  "phishing": 8,
  "ddos": 5,
  "brute_force": 15,
  "sql_injection": 3,
  "xss": 7
}
```

**Implementation:**
- Analyze security events from VPC Flow Logs
- Use SageMaker ML model for threat classification
- Return counts for each threat category

---

### 2. Recent Security Events
**GET** `/api/threats/events`

**Access:** Protected

**Success Response (200):**
```json
[
  {
    "timestamp": "2024-11-22T10:45:30Z",
    "type": "brute_force",
    "severity": "high",
    "source_ip": "203.0.113.45",
    "destination_ip": "10.0.1.50",
    "description": "Multiple failed SSH login attempts detected",
    "blocked": true
  },
  {
    "timestamp": "2024-11-22T10:42:15Z",
    "type": "ddos",
    "severity": "critical",
    "source_ip": "198.51.100.89",
    "destination_ip": "10.0.2.10",
    "description": "High volume of SYN packets detected",
    "blocked": true
  },
  {
    "timestamp": "2024-11-22T10:38:20Z",
    "type": "sql_injection",
    "severity": "high",
    "source_ip": "192.0.2.123",
    "destination_ip": "10.0.1.30",
    "description": "SQL injection attempt in HTTP request",
    "blocked": true
  }
]
```

**Implementation:**
- Query recent security events from database
- Include ML-detected threats
- Sort by timestamp (newest first)
- Limit to last 50-100 events

---

## 📐 Data Structures

### Metric Object
```python
{
    "Label": str,        # Metric name/label
    "Values": [float],   # Array of metric values
    "Timestamps": [str]  # Array of timestamps (HH:MM format)
}
```

### Security Event Object
```python
{
    "timestamp": str,      # ISO 8601 format
    "type": str,          # Threat type
    "severity": str,      # low, medium, high, critical
    "source_ip": str,     # Source IP address
    "destination_ip": str,# Destination IP address
    "description": str,   # Human-readable description
    "blocked": bool       # Whether threat was blocked
}
```

---

## 🌐 CORS Configuration

Enable CORS for the React frontend:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, 
     supports_credentials=True,
     origins=['http://localhost:3000'],
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
```

**Important:**
- Allow `Authorization` header for JWT tokens
- Allow `localhost:3000` origin for development
- Update origins for production deployment

---

## ⚠️ Error Handling

### Standard Error Response Format
```json
{
  "message": "Error description",
  "error": "Detailed error (optional, dev mode only)"
}
```

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET/POST request |
| 201 | Created | Successful resource creation (register) |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server-side error |

---

## ✅ Implementation Checklist

### 1. Project Setup
- [ ] Initialize Flask application
- [ ] Install dependencies:
  ```bash
  pip install flask flask-cors flask-jwt-extended bcrypt boto3 pymysql
  ```
- [ ] Set up environment variables
- [ ] Configure database connection
- [ ] Set up AWS credentials

### 2. Authentication
- [ ] Implement user registration endpoint
- [ ] Implement login endpoint with JWT generation
- [ ] Implement logout endpoint
- [ ] Implement get current user endpoint
- [ ] Create JWT authentication decorator
- [ ] Set up password hashing with bcrypt

### 3. Database Models
- [ ] Create User model (id, name, email, password_hash)
- [ ] Create SecurityEvent model
- [ ] Set up database migrations
- [ ] Create database indexes for performance

### 4. AWS Integration
- [ ] Configure boto3 CloudWatch client
- [ ] Implement ALB metrics fetching
- [ ] Implement RDS metrics fetching
- [ ] Implement VPC Flow Logs parsing
- [ ] Implement ASG metrics fetching
- [ ] Implement SageMaker metrics fetching

### 5. Threat Detection
- [ ] Integrate SageMaker ML model
- [ ] Implement threat classification logic
- [ ] Implement security event storage
- [ ] Create threat events endpoint
- [ ] Create threat classifications endpoint

### 6. API Endpoints
- [ ] `/api/register` - User registration
- [ ] `/api/login` - User login
- [ ] `/api/logout` - User logout
- [ ] `/api/me` - Get current user
- [ ] `/api/metrics/alb` - ALB metrics
- [ ] `/api/metrics/rds` - RDS metrics
- [ ] `/api/metrics/vpc` - VPC statistics
- [ ] `/api/metrics/asg` - Auto Scaling metrics
- [ ] `/api/metrics/sagemaker` - ML metrics
- [ ] `/api/threats/classifications` - Threat counts
- [ ] `/api/threats/events` - Security events

### 7. Security
- [ ] Enable CORS with proper configuration
- [ ] Implement JWT token validation
- [ ] Add rate limiting
- [ ] Implement input validation
- [ ] Sanitize error messages (no sensitive data)
- [ ] Set secure headers

### 8. Testing
- [ ] Test all authentication endpoints
- [ ] Test JWT token generation and validation
- [ ] Test all metrics endpoints with real AWS data
- [ ] Test CORS configuration
- [ ] Test error handling
- [ ] Test with frontend integration

### 9. Documentation
- [ ] Document API endpoints
- [ ] Create setup instructions
- [ ] Document environment variables
- [ ] Create deployment guide

### 10. Deployment
- [ ] Set up production environment
- [ ] Configure production database
- [ ] Set up AWS IAM roles
- [ ] Deploy to production server
- [ ] Update CORS origins for production
- [ ] Set up monitoring and logging

---

## 🔗 Related Documentation

- [Frontend Authentication Guide](./AUTH_INTEGRATION.md)
- [Testing Guide](./TESTING_AUTH.md)
- [Frontend Integration Guide](./INTEGRATION_GUIDE.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

---

## 📞 Support

For questions or issues with backend implementation:
1. Check the [Authentication Integration Guide](./AUTH_INTEGRATION.md)
2. Review the [Testing Guide](./TESTING_AUTH.md)
3. Verify CORS configuration matches frontend origin
4. Check CloudWatch permissions in AWS IAM

---

## 📝 Notes

### Time Range Mapping
```python
TIME_RANGES = {
    '1h': 3600,      # 1 hour in seconds
    '6h': 21600,     # 6 hours
    '24h': 86400,    # 24 hours
    '7d': 604800     # 7 days
}
```

### CloudWatch Period Selection
- For `1h`: Use 300 seconds (5 minutes) period
- For `6h`: Use 900 seconds (15 minutes) period
- For `24h`: Use 3600 seconds (1 hour) period
- For `7d`: Use 21600 seconds (6 hours) period

### JWT Token Configuration
```python
JWT_SECRET_KEY = os.environ.get('SECRET_KEY')
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
```

### Example boto3 CloudWatch Query
```python
import boto3
from datetime import datetime, timedelta

cloudwatch = boto3.client('cloudwatch', region_name='us-east-1')

end_time = datetime.utcnow()
start_time = end_time - timedelta(hours=1)

response = cloudwatch.get_metric_statistics(
    Namespace='AWS/ApplicationELB',
    MetricName='RequestCount',
    Dimensions=[
        {'Name': 'LoadBalancer', 'Value': 'app/my-load-balancer/1234567890abcdef'}
    ],
    StartTime=start_time,
    EndTime=end_time,
    Period=300,  # 5 minutes
    Statistics=['Sum']
)
```

---

**Last Updated:** November 22, 2024  
**Frontend Version:** 2.0.0 (with Authentication)  
**Required Backend Version:** 1.0.0+
