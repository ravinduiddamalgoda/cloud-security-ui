# SIEM Advanced Dashboard - Cloud Security UI

A comprehensive Security Information and Event Management (SIEM) dashboard for monitoring AWS infrastructure with real-time threat detection and JWT-based authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- AWS account with CloudWatch access (for production mode)
- Python 3.8+ and Flask backend (for API mode with authentication)

### Installation

1. **Clone and Install**
```bash
cd cloud-security-ui
npm install
```

2. **Configure Environment**
```bash
# Copy environment template
cp .env.example .env

# Edit .env file
# REACT_APP_API_URL=http://localhost:5000/api (for backend integration)
# Set REACT_APP_USE_MOCK_DATA=true for development without backend
# Set REACT_APP_USE_MOCK_DATA=false for production with backend
```

3. **Run the Application**
```bash
# Option 1: Development with mock data (no backend/auth required)
npm run start:mock

# Option 2: Development with real API (requires backend + auth)
npm run start:api

# Option 3: Standard start (uses .env settings)
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication

This dashboard uses **JWT-based authentication**. Users must register and login to access protected routes.

### First Time Setup
1. Start the backend: `cd ../SIEM_Tool_AWS && python app.py`
2. Start the frontend: `npm start`
3. Navigate to `/register` to create an account
4. Login with your credentials
5. Access the dashboard with automatic authentication

**See [AUTH_INTEGRATION.md](./AUTH_INTEGRATION.md) for complete authentication guide.**

## 📊 Features

### 🔒 Security & Authentication
- **JWT Token-Based Auth** - Secure login/logout with JWT tokens
- **Protected Routes** - Dashboard requires authentication
- **Automatic Token Management** - Tokens automatically included in API requests
- **Session Persistence** - Stay logged in across page refreshes

### Real-Time Monitoring
- **Application Load Balancer (ALB)** - Request rates, response times, health status
- **RDS Database** - CPU, connections, IOPS, memory usage
- **VPC Flow Logs** - Network traffic analysis, top IPs and ports
- **Auto Scaling Group** - Instance metrics and scaling activities
- **SageMaker ML** - Model latency, invocations, resource utilization

### Security & Threat Detection
- **Threat Classifications** - Real-time categorization of security threats
- **Security Events** - Failed logins, unauthorized access, suspicious activities
- **Brute Force Detection** - SSH and authentication attack patterns
- **DDoS Detection** - Traffic spike analysis from VPC Flow Logs

### Interactive Features
- Auto-refresh every 30 seconds
- Time range selector (1h, 6h, 24h, 7d)
- Responsive dark theme design
- Real-time charts and visualizations

## 🔧 Available Scripts

### `npm start`
Runs the app in development mode using settings from `.env` file.

### `npm run start:mock`
Starts the app with **mock data mode** enabled (no backend required). Perfect for:
- Frontend development
- UI/UX testing
- Demos without AWS infrastructure

### `npm run start:api`
Starts the app connected to the **real backend API**. Requires:
- Flask backend running on port 5000
- AWS credentials configured
- CloudWatch log groups available

### `npm run build:production`
Builds the optimized production bundle with API mode enabled.

### `npm test`
Launches the test runner in interactive watch mode.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend                        │
│              (Port 3000 - This App)                     │
│                                                         │
│  • Charts & Visualizations (Chart.js)                  │
│  • Real-time Data Updates                              │
│  • Mock Data Fallback                                  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Flask Backend                         │
│              (Port 5000 - API Server)                   │
│                                                         │
│  • AWS CloudWatch Integration                          │
│  • Log Analysis & Processing                           │
│  • Threat Detection Algorithms                         │
└────────────────────┬────────────────────────────────────┘
                     │ AWS SDK (Boto3)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   AWS Services                          │
│                                                         │
│  • CloudWatch Metrics & Logs                           │
│  • VPC Flow Logs                                       │
│  • ALB Access Logs                                     │
│  • RDS Enhanced Monitoring                             │
│  • SageMaker Endpoints                                 │
└─────────────────────────────────────────────────────────┘
```

## 📝 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Backend API URL
REACT_APP_API_URL=http://localhost:5000

# Mock Data Mode
# true = Use mock data (no backend required)
# false = Use real API (requires backend)
REACT_APP_USE_MOCK_DATA=false
```

### Production Configuration

For production deployment, update `.env`:

```bash
REACT_APP_API_URL=https://your-backend-api.com
REACT_APP_USE_MOCK_DATA=false
```

## 🔌 Backend Setup

This frontend requires a Flask backend API. See `INTEGRATION_GUIDE.md` for detailed setup.

**Quick Backend Start:**
```bash
cd ../SIEM_Tool_AWS
pip install flask flask-cors boto3
python app.py
```

Backend runs on `http://localhost:5000`

## 📚 API Endpoints

The frontend connects to these backend endpoints:

- `GET /api/health` - Health check
- `GET /api/metrics/alb?time_range=1h` - ALB metrics
- `GET /api/metrics/rds?time_range=1h` - RDS metrics
- `GET /api/metrics/vpc?time_range=1h` - VPC statistics
- `GET /api/metrics/asg?time_range=1h` - Auto Scaling metrics
- `GET /api/metrics/sagemaker?time_range=1h` - ML metrics
- `GET /api/threats/classifications` - Threat data
- `GET /api/threats/events` - Security events

## 🐛 Troubleshooting

### Dashboard shows "Loading..." indefinitely

**Solution 1:** Enable mock data mode
```bash
# In .env file
REACT_APP_USE_MOCK_DATA=true
```

**Solution 2:** Verify backend is running
```bash
curl http://localhost:5000/api/health
```

**Solution 3:** Check browser console (F12) for errors

### CORS Errors

Ensure Flask backend has CORS enabled:
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
```

### No Data Displayed

1. Check backend logs for errors
2. Verify AWS credentials are configured
3. Ensure CloudWatch log groups exist
4. Check network connectivity to backend

## 📖 Documentation

- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Complete integration guide
- **[Terraform Guide](../terraform/README.md)** - AWS infrastructure setup

## 🔒 Security

- Never commit `.env` files to version control
- Use environment variables for sensitive data
- Implement authentication in production
- Enable HTTPS for production deployments
- Regular security audits of log data

## 🚢 Deployment

### Build for Production
```bash
npm run build:production
```

### Deploy Static Files
Upload the `build/` folder to:
- AWS S3 + CloudFront
- Netlify
- Vercel
- GitHub Pages

### Environment-Specific Builds
```bash
# Development
REACT_APP_USE_MOCK_DATA=true npm run build

# Production
REACT_APP_USE_MOCK_DATA=false REACT_APP_API_URL=https://api.example.com npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both mock and API modes
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

---

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
