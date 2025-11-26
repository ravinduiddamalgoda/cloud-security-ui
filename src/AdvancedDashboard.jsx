import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import api from './api/apiClient'; // Use protected API client with JWT

function AdvancedDashboard() {
  const [lbMetrics, setLbMetrics] = useState(null);
  const [rdsMetrics, setRdsMetrics] = useState(null);
  const [vpcStats, setVpcStats] = useState(null);
  const [asgMetrics, setAsgMetrics] = useState(null);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [threatClassifications, setThreatClassifications] = useState(null);
  const [securityEvents, setSecurityEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [timeRange, setTimeRange] = useState('1h');
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [generatingReport, setGeneratingReport] = useState(false);
  const navigate = useNavigate();

  // Fetch all monitoring data from backend API
  const fetchAllData = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    setError(null);
    console.log('Fetching data from backend API...');
    
    // Fetch all endpoints independently - don't fail if one fails
    await Promise.allSettled([
      fetchALBMetrics(),
      fetchRDSMetrics(),
      fetchVPCStats(),
      fetchASGMetrics(),
      fetchSageMakerMetrics(),
      fetchThreatClassifications(),
      fetchSecurityEvents()
    ]);
    
    if (isInitialLoad) {
      setLoading(false);
    }
  };

  // API call functions - don't throw errors, just log them
  const fetchALBMetrics = async () => {
    try {
      const response = await api.get(`/metrics/alb?time_range=${timeRange}`);
      setLbMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch ALB metrics:', error);
      setLbMetrics(null); // Set to null on error
    }
  };

  const fetchRDSMetrics = async () => {
    try {
      const response = await api.get(`/metrics/rds?time_range=${timeRange}`);
      setRdsMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch RDS metrics:', error);
      setRdsMetrics(null);
    }
  };

  const fetchVPCStats = async () => {
    try {
      const response = await api.get(`/metrics/vpc?time_range=${timeRange}`);
      console.log('VPC Stats received:', response.data);
      setVpcStats(response.data);
    } catch (error) {
      console.error('Failed to fetch VPC stats:', error);
      console.error('VPC Error details:', error.response || error.message);
      setVpcStats(null);
    }
  };

  const fetchASGMetrics = async () => {
    try {
      const response = await api.get(`/metrics/asg?time_range=${timeRange}`);
      setAsgMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch ASG metrics:', error);
      setAsgMetrics(null);
    }
  };

  const fetchSageMakerMetrics = async () => {
    // Using mock data since backend not implemented yet
    console.log('Using mock SageMaker data (backend not implemented)');
    const now = Date.now();
    const dataPoints = timeRange === '1h' ? 30 : timeRange === '6h' ? 36 : timeRange === '24h' ? 48 : 168;
    const interval = timeRange === '1h' ? 2 * 60000 : timeRange === '6h' ? 10 * 60000 : timeRange === '24h' ? 30 * 60000 : 3600000;
    
    const timestamps = Array.from({ length: dataPoints }, (_, i) => 
      new Date(now - (dataPoints - 1 - i) * interval).toISOString()
    );
    
    setMlMetrics({
      'ModelLatency (ms)': {
        Label: 'Model Latency',
        Timestamps: timestamps,
        Values: timestamps.map(() => Math.random() * 50 + 80) // 80-130ms
      },
      'Invocations': {
        Label: 'Invocations',
        Timestamps: timestamps,
        Values: timestamps.map(() => Math.floor(Math.random() * 200 + 150)) // 150-350
      },
      'CPUUtilization': {
        Label: 'CPU Utilization',
        Timestamps: timestamps,
        Values: timestamps.map(() => Math.random() * 30 + 35) // 35-65%
      },
      'MemoryUtilization': {
        Label: 'Memory Utilization',
        Timestamps: timestamps,
        Values: timestamps.map(() => Math.random() * 25 + 40) // 40-65%
      }
    });
  };

  const fetchThreatClassifications = async () => {
    try {
      const response = await api.get('/threats/classifications');
      setThreatClassifications(response.data);
    } catch (error) {
      console.error('Failed to fetch threat classifications:', error);
      setThreatClassifications(null);
    }
  };

  const fetchSecurityEvents = async () => {
    try {
      const response = await api.get('/threats/events');
      setSecurityEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch security events:', error);
      setSecurityEvents(null);
    }
  };

  useEffect(() => {
    // Initial load
    fetchAllData(true);
    
    // Load mock security alerts
    loadSecurityAlerts();
    
    // Auto-refresh every 5 minutes (300000ms)
    const interval = setInterval(() => {
      console.log('Auto-refreshing dashboard data (5 min interval)...');
      fetchAllData(false);
      loadSecurityAlerts();
    }, 300000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeRange]); // Refetch when time range changes

  // Load security alerts (mock data for now)
  const loadSecurityAlerts = () => {
    const mockAlerts = [
      {
        id: 1,
        severity: 'critical',
        title: 'Multiple Failed Login Attempts Detected',
        description: 'Over 50 failed SSH login attempts from IP 192.168.1.100 in the last 15 minutes',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        source: 'VPC Flow Logs'
      },
      {
        id: 2,
        severity: 'high',
        title: 'Unusual Outbound Traffic Pattern',
        description: 'Database instance attempting connections to unknown external IP addresses',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        source: 'RDS Metrics'
      },
      {
        id: 3,
        severity: 'medium',
        title: 'High CPU Utilization on RDS Instance',
        description: 'RDS database CPU usage exceeded 85% for more than 20 minutes',
        timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
        source: 'CloudWatch Alarms'
      },
      {
        id: 4,
        severity: 'high',
        title: 'Suspicious API Call Pattern',
        description: 'Unusual sequence of AWS API calls detected from IAM user account',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        source: 'CloudTrail'
      },
      {
        id: 5,
        severity: 'low',
        title: 'Security Group Rule Modified',
        description: 'Security group sg-12345abc modified to allow traffic from 0.0.0.0/0',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        source: 'Config Rules'
      }
    ];
    setSecurityAlerts(mockAlerts);
  };

  // Generate report content
  const generateReport = () => {
    const reportDate = new Date().toLocaleString();
    const timeRangeLabel = timeRange === '1h' ? 'Last 1 Hour' : 
                           timeRange === '6h' ? 'Last 6 Hours' : 
                           timeRange === '24h' ? 'Last 24 Hours' : 'Last 7 Days';
    
    let reportContent = `AWS SIEM SECURITY REPORT
${'='.repeat(80)}

Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
Generated: ${reportDate}
Time Period: ${timeRangeLabel}
Dashboard Version: 1.0

${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}

This report provides a comprehensive overview of the security posture and operational
metrics for AWS infrastructure monitored by the Advanced SIEM system.

`;

    // Add ALB metrics
    if (lbMetrics) {
      const avgRequests = lbMetrics.RequestCount?.Values?.reduce((a, b) => a + b, 0) / lbMetrics.RequestCount.Values.length || 0;
      const avgResponseTime = lbMetrics.TargetResponseTime?.Values?.reduce((a, b) => a + b, 0) / lbMetrics.TargetResponseTime.Values.length || 0;
      
      reportContent += `
APPLICATION LOAD BALANCER METRICS
${'-'.repeat(80)}

Average Request Count: ${avgRequests.toFixed(2)} requests/minute
Average Response Time: ${avgResponseTime.toFixed(3)} seconds
Total 2XX Responses: ${lbMetrics.HTTPCode_Target_2XX_Count?.Values?.reduce((a, b) => a + b, 0) || 0}
Total 5XX Errors: ${lbMetrics.HTTPCode_Target_5XX_Count?.Values?.reduce((a, b) => a + b, 0) || 0}
Healthy Hosts: ${lbMetrics.HealthyHostCount?.Values?.slice(-1)[0] || 0}
Unhealthy Hosts: ${lbMetrics.UnHealthyHostCount?.Values?.slice(-1)[0] || 0}

Status: ${lbMetrics.UnHealthyHostCount?.Values?.slice(-1)[0] === 0 ? 'HEALTHY ✓' : 'WARNING ⚠'}

`;
    }

    // Add RDS metrics
    if (rdsMetrics) {
      const avgCPU = rdsMetrics.cpu_utilization?.Values?.reduce((a, b) => a + b, 0) / rdsMetrics.cpu_utilization.Values.length || 0;
      const avgConnections = rdsMetrics.database_connections?.Values?.reduce((a, b) => a + b, 0) / rdsMetrics.database_connections.Values.length || 0;
      
      reportContent += `
RDS DATABASE METRICS
${'-'.repeat(80)}

Average CPU Utilization: ${avgCPU.toFixed(2)}%
Average Database Connections: ${avgConnections.toFixed(0)}
Current Freeable Memory: ${(rdsMetrics.freeable_memory?.Values?.slice(-1)[0] / 1048576 || 0).toFixed(0)} MB
Average Read Latency: ${((rdsMetrics.read_latency?.Values?.reduce((a, b) => a + b, 0) / rdsMetrics.read_latency.Values.length || 0) * 1000).toFixed(2)} ms
Average Write Latency: ${((rdsMetrics.write_latency?.Values?.reduce((a, b) => a + b, 0) / rdsMetrics.write_latency.Values.length || 0) * 1000).toFixed(2)} ms

Status: ${avgCPU < 80 ? 'HEALTHY ✓' : 'WARNING ⚠'}

`;
    }

    // Add VPC metrics
    if (vpcStats) {
      reportContent += `
VPC NETWORK TRAFFIC ANALYSIS
${'-'.repeat(80)}

Total Network Flows: ${vpcStats.total_flows?.toLocaleString() || 0}
Accepted Flows: ${vpcStats.accepted_flows?.toLocaleString() || 0} (${((vpcStats.accepted_flows / vpcStats.total_flows) * 100).toFixed(1)}%)
Rejected Flows: ${vpcStats.rejected_flows?.toLocaleString() || 0} (${((vpcStats.rejected_flows / vpcStats.total_flows) * 100).toFixed(1)}%)
Total Data Transfer: ${(vpcStats.byte_transfer / 1073741824).toFixed(2)} GB

Top Source IPs:
${vpcStats.top_sources?.slice(0, 5).map((item, idx) => `  ${idx + 1}. ${item.ip} - ${item.count.toLocaleString()} connections`).join('\n') || 'N/A'}

Top Destination Ports:
${vpcStats.top_ports?.map((item, idx) => `  ${idx + 1}. Port ${item.port} - ${item.count.toLocaleString()} connections`).join('\n') || 'N/A'}

Status: ${(vpcStats.rejected_flows / vpcStats.total_flows) < 0.1 ? 'HEALTHY ✓' : 'REVIEW REQUIRED ⚠'}

`;
    }

    // Add Security Alerts
    if (securityAlerts.length > 0) {
      reportContent += `
ACTIVE SECURITY ALERTS (${securityAlerts.length})
${'-'.repeat(80)}

${securityAlerts.map((alert, idx) => `
${idx + 1}. [${alert.severity.toUpperCase()}] ${alert.title}
   Description: ${alert.description}
   Source: ${alert.source}
   Timestamp: ${new Date(alert.timestamp).toLocaleString()}
`).join('\n')}

`;
    }

    // Add recommendations
    reportContent += `
RECOMMENDATIONS
${'-'.repeat(80)}

`;

    if (vpcStats && (vpcStats.rejected_flows / vpcStats.total_flows) > 0.05) {
      reportContent += `• Review security group rules - high rejection rate detected (${((vpcStats.rejected_flows / vpcStats.total_flows) * 100).toFixed(1)}%)\n`;
    }
    
    if (rdsMetrics && rdsMetrics.cpu_utilization?.Values?.some(v => v > 80)) {
      reportContent += `• Consider scaling RDS instance - CPU utilization exceeded 80%\n`;
    }
    
    if (securityAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length > 0) {
      reportContent += `• Address ${securityAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length} high-priority security alerts immediately\n`;
    }
    
    reportContent += `• Continue monitoring for unusual patterns in network traffic\n`;
    reportContent += `• Maintain regular backup schedules for all critical databases\n`;

    reportContent += `\n${'='.repeat(80)}
END OF REPORT
${'='.repeat(80)}
`;

    return reportContent;
  };

  // Download report as text file
  const downloadReport = (content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIEM_Security_Report_${new Date().toISOString().split('T')[0]}_${reportType}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear authentication data regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // Chart configuration for dark theme
  const darkChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#9CA3AF',
          font: { size: 11 }
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#374151', drawBorder: false },
        ticks: { color: '#9CA3AF', font: { size: 10 } }
      },
      y: {
        grid: { color: '#374151', drawBorder: false },
        ticks: { color: '#9CA3AF', font: { size: 10 } }
      }
    }
  };

  const barChartOptions = {
    ...darkChartOptions,
    indexAxis: 'y',
    plugins: {
      legend: { display: false }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#9CA3AF',
          font: { size: 10 },
          boxWidth: 12
        }
      }
    }
  };

  // Generate chart data
  const generateLineChart = (metric, color) => {
    if (!metric) return null;
    
    return {
      labels: metric.Timestamps?.map(t => 
        new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ) || [],
      datasets: [{
        label: metric.Label,
        data: metric.Values || [],
        borderColor: color,
        backgroundColor: `${color}33`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    };
  };

  const generateMultiLineChart = (metrics, colors) => {
    if (!metrics || metrics.length === 0) return null;
    
    const firstMetric = Object.values(metrics)[0];
    
    return {
      labels: firstMetric.Timestamps?.map(t => 
        new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ) || [],
      datasets: Object.entries(metrics).map(([key, metric], idx) => ({
        label: metric.Label,
        data: metric.Values || [],
        borderColor: colors[idx % colors.length],
        backgroundColor: `${colors[idx % colors.length]}33`,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4
      }))
    };
  };

  // Show loading screen only on initial load (when no data exists yet)
  if (loading && !lbMetrics && !rdsMetrics && !vpcStats && !asgMetrics && !mlMetrics) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-2">Loading Security Dashboard...</div>
          <div className="text-gray-400 text-sm">Fetching data from backend API</div>
          <div className="mt-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  // Helper component for error display in sections
  const ErrorPlaceholder = ({ message }) => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-4">
        <div className="text-red-400 text-2xl mb-2">⚠️</div>
        <div className="text-gray-400 text-xs">{message}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-blue-400">⚡Advanced SIEM</h1>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Live Data</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-700 text-gray-200 px-3 py-1 rounded text-sm border border-gray-600"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          
          <button
            onClick={() => {
              console.log('Manual refresh triggered');
              fetchAllData(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm"
          >
            Refresh
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 px-6">
        <div className="flex space-x-1">
          <button className="px-4 py-2 bg-gray-700 text-white border-b-2 border-blue-500">
            Dashboard
          </button>
          <Link to="/brute-force-detection" className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700">
            Threat Detection
          </Link>
          <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700">
            Security Alerts
          </button>
          <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700">
            Reports
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Top Row - Threat Classifications */}
        <div className="grid grid-cols-3 gap-6">
          {/* Top Classification - Last 1 Hour */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Top Classification</h3>
              <span className="text-xs text-gray-500">Last 1 Hour</span>
            </div>
            {threatClassifications?.last_hour ? (
              <div className="space-y-1">
                {threatClassifications.last_hour.slice(0, 11).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 truncate flex-1">{item.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-200 font-medium">{item.count}</span>
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(item.count / threatClassifications.last_hour[0].count) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ErrorPlaceholder message="Failed to load threat data" />
            )}
          </div>

          {/* Top Classification - Last 1 Day */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Top Classification</h3>
              <span className="text-xs text-gray-500">Last 1 Day</span>
            </div>
            {threatClassifications?.last_day ? (
              <div className="space-y-1">
                {threatClassifications.last_day.slice(0, 11).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 truncate flex-1">{item.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-200 font-medium">{item.count}</span>
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${(item.count / threatClassifications.last_day[0].count) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ErrorPlaceholder message="Failed to load threat data" />
            )}
          </div>

          {/* Top Log Source */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Top Log Source</h3>
              <span className="text-xs text-gray-500">Last 1 Hour</span>
            </div>
            <div className="h-48">
              {vpcStats && (
                <Line
                  data={{
                    labels: Array.from({ length: 30 }, (_, i) => {
                      const time = new Date(Date.now() - (29 - i) * 60000);
                      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }),
                    datasets: [
                      {
                        label: 'VPC Flow Logs',
                        data: Array.from({ length: 30 }, () => Math.random() * 200 + 50),
                        borderColor: '#10B981',
                        backgroundColor: '#10B98133',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                      },
                      {
                        label: 'ALB Logs',
                        data: Array.from({ length: 30 }, () => Math.random() * 150 + 80),
                        borderColor: '#3B82F6',
                        backgroundColor: '#3B82F633',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                      },
                      {
                        label: 'RDS Logs',
                        data: Array.from({ length: 30 }, () => Math.random() * 100 + 30),
                        borderColor: '#F59E0B',
                        backgroundColor: '#F59E0B33',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                      }
                    ]
                  }}
                  options={darkChartOptions}
                />
              )}
            </div>
          </div>
        </div>

        {/* Second Row - Common Events and Log Sources */}
        <div className="grid grid-cols-3 gap-6">
          {/* Top Common Event - Last 1 Hour */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Top Common Event</h3>
              <span className="text-xs text-gray-500">Last 1 Hour</span>
            </div>
            {securityEvents ? (
              <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar">
                {securityEvents.slice(0, 11).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <span className="text-gray-400 truncate flex-1 pr-2">{item.event}</span>
                    <span className="text-gray-200 font-medium min-w-[40px] text-right">{item.last_hour}</span>
                  </div>
                ))}
              </div>
            ) : (
              <ErrorPlaceholder message="Failed to load security events" />
            )}
          </div>

          {/* Top Common Event - Last 1 Day */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Top Common Event</h3>
              <span className="text-xs text-gray-500">Last 1 Day</span>
            </div>
            {securityEvents ? (
              <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar">
                {securityEvents.slice(0, 11).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <span className="text-gray-400 truncate flex-1 pr-2">{item.event}</span>
                    <span className="text-gray-200 font-medium min-w-[50px] text-right">{item.last_day}</span>
                  </div>
                ))}
              </div>
            ) : (
              <ErrorPlaceholder message="Failed to load security events" />
            )}
          </div>

          {/* Additional Log Source Chart */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Top Log Source</h3>
              <span className="text-xs text-gray-500">Last 1 Day</span>
            </div>
            <div className="h-48">
              <Line
                data={{
                  labels: Array.from({ length: 24 }, (_, i) => {
                    const time = new Date(Date.now() - (23 - i) * 3600000);
                    return time.getHours() + ':00';
                  }),
                  datasets: [
                    {
                      label: 'CloudTrail',
                      data: Array.from({ length: 24 }, () => Math.random() * 300 + 100),
                      borderColor: '#8B5CF6',
                      borderWidth: 2,
                      fill: false,
                      tension: 0.4,
                      pointRadius: 0
                    },
                    {
                      label: 'WAF Logs',
                      data: Array.from({ length: 24 }, () => Math.random() * 250 + 80),
                      borderColor: '#EC4899',
                      borderWidth: 2,
                      fill: false,
                      tension: 0.4,
                      pointRadius: 0
                    },
                    {
                      label: 'GuardDuty',
                      data: Array.from({ length: 24 }, () => Math.random() * 150 + 50),
                      borderColor: '#14B8A6',
                      borderWidth: 2,
                      fill: false,
                      tension: 0.4,
                      pointRadius: 0
                    }
                  ]
                }}
                options={darkChartOptions}
              />
            </div>
          </div>
        </div>

        {/* AWS Load Balancer Metrics */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
            <span className="text-blue-400 mr-2">📊</span>
            Application Load Balancer Metrics
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-2">Request Count</h4>
              <div className="h-32">
                {lbMetrics?.RequestCount ? (
                  <Line data={generateLineChart(lbMetrics.RequestCount, '#10B981')} options={darkChartOptions} />
                ) : (
                  <ErrorPlaceholder message="No ALB data" />
                )}
              </div>
            </div>
            
            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-2">Target Response Time</h4>
              <div className="h-32">
                {lbMetrics?.TargetResponseTime ? (
                  <Line data={generateLineChart(lbMetrics.TargetResponseTime, '#3B82F6')} options={darkChartOptions} />
                ) : (
                  <ErrorPlaceholder message="No ALB data" />
                )}
              </div>
            </div>
            
            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-2">Healthy vs Unhealthy Hosts</h4>
              <div className="h-32">
                {lbMetrics?.HealthyHostCount && lbMetrics?.UnHealthyHostCount && (
                  <Line 
                    data={{
                      labels: lbMetrics.HealthyHostCount.Timestamps.map(t => 
                        new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      ),
                      datasets: [
                        {
                          label: 'Healthy',
                          data: lbMetrics.HealthyHostCount.Values,
                          borderColor: '#10B981',
                          backgroundColor: '#10B98133',
                          borderWidth: 2,
                          fill: true,
                          tension: 0.4,
                          pointRadius: 0
                        },
                        {
                          label: 'Unhealthy',
                          data: lbMetrics.UnHealthyHostCount.Values,
                          borderColor: '#EF4444',
                          backgroundColor: '#EF444433',
                          borderWidth: 2,
                          fill: true,
                          tension: 0.4,
                          pointRadius: 0
                        }
                      ]
                    }}
                    options={darkChartOptions}
                  />
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-2">HTTP 2XX Responses</h4>
              <div className="h-32">
                {lbMetrics?.HTTPCode_Target_2XX_Count && (
                  <Line data={generateLineChart(lbMetrics.HTTPCode_Target_2XX_Count, '#10B981')} options={darkChartOptions} />
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-2">HTTP 5XX Errors</h4>
              <div className="h-32">
                {lbMetrics?.HTTPCode_Target_5XX_Count && (
                  <Line data={generateLineChart(lbMetrics.HTTPCode_Target_5XX_Count, '#EF4444')} options={darkChartOptions} />
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-2">Response Codes Distribution</h4>
              <div className="h-32 flex items-center justify-center">
                {lbMetrics?.HTTPCode_Target_2XX_Count && (
                  <Doughnut
                    data={{
                      labels: ['2XX Success', '5XX Errors', 'Other'],
                      datasets: [{
                        data: [
                          lbMetrics.HTTPCode_Target_2XX_Count.Values.reduce((a, b) => a + b, 0),
                          lbMetrics.HTTPCode_Target_5XX_Count.Values.reduce((a, b) => a + b, 0),
                          50
                        ],
                        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
                        borderColor: '#1F2937',
                        borderWidth: 2
                      }]
                    }}
                    options={doughnutOptions}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RDS Database Metrics */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
            <span className="text-purple-400 mr-2">🗄️</span>
            RDS Database Metrics
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-2">CPU Utilization (%)</h4>
              <div className="h-32">
                {rdsMetrics?.cpu_utilization ? (
                  <Line data={generateLineChart(rdsMetrics.cpu_utilization, '#8B5CF6')} options={darkChartOptions} />
                ) : (
                  <ErrorPlaceholder message="No RDS data" />
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-2">Database Connections</h4>
              <div className="h-32">
                {rdsMetrics?.database_connections ? (
                  <Line data={generateLineChart(rdsMetrics.database_connections, '#3B82F6')} options={darkChartOptions} />
                ) : (
                  <ErrorPlaceholder message="No RDS data" />
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-2">Freeable Memory (MB)</h4>
              <div className="h-32">
                {rdsMetrics?.freeable_memory ? (
                  <Line 
                    data={generateLineChart({
                      ...rdsMetrics.freeable_memory,
                      Values: rdsMetrics.freeable_memory.Values.map(v => (v / 1048576).toFixed(0))
                    }, '#06B6D4')} 
                    options={darkChartOptions} 
                  />
                ) : (
                  <ErrorPlaceholder message="No RDS data" />
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-2">Read Latency (ms)</h4>
              <div className="h-32">
                {rdsMetrics?.read_latency ? (
                  <Line 
                    data={generateLineChart({
                      ...rdsMetrics.read_latency,
                      Values: rdsMetrics.read_latency.Values.map(v => (v * 1000).toFixed(2))
                    }, '#10B981')} 
                    options={darkChartOptions} 
                  />
                ) : (
                  <ErrorPlaceholder message="No RDS data" />
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-2">Write Latency (ms)</h4>
              <div className="h-32">
                {rdsMetrics?.write_latency ? (
                  <Line 
                    data={generateLineChart({
                      ...rdsMetrics.write_latency,
                      Values: rdsMetrics.write_latency.Values.map(v => (v * 1000).toFixed(2))
                    }, '#F59E0B')} 
                    options={darkChartOptions} 
                  />
                ) : (
                  <ErrorPlaceholder message="No RDS data" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* VPC Flow Analysis */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
            <span className="text-green-400 mr-2">🌐</span>
            VPC Network Traffic Analysis
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {/* Summary Cards */}
            <div className="bg-gray-900 rounded p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Total Flows</div>
              <div className="text-2xl font-bold text-blue-400">{vpcStats?.total_flows.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Network connections</div>
            </div>

            <div className="bg-gray-900 rounded p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Accepted Flows</div>
              <div className="text-2xl font-bold text-green-400">{vpcStats?.accepted_flows.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">
                {vpcStats && ((vpcStats.accepted_flows / vpcStats.total_flows) * 100).toFixed(1)}% success rate
              </div>
            </div>

            <div className="bg-gray-900 rounded p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Rejected Flows</div>
              <div className="text-2xl font-bold text-red-400">{vpcStats?.rejected_flows.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Security violations</div>
            </div>

            <div className="bg-gray-900 rounded p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Data Transfer</div>
              <div className="text-2xl font-bold text-purple-400">
                {vpcStats && (vpcStats.byte_transfer / 1073741824).toFixed(2)} GB
              </div>
              <div className="text-xs text-gray-500 mt-1">Total bandwidth</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            {/* Top Source IPs */}
            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-3">Top Source IPs</h4>
              {vpcStats?.top_sources ? (
                <div className="space-y-2">
                  {vpcStats.top_sources.slice(0, 8).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 font-mono">{item.ip}</span>
                      <span className="text-blue-400">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <ErrorPlaceholder message="No VPC data" />
              )}
            </div>

            {/* Top Destination IPs */}
            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-3">Top Destination IPs</h4>
              {vpcStats?.top_destinations ? (
                <div className="space-y-2">
                  {vpcStats.top_destinations.slice(0, 8).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 font-mono">{item.ip}</span>
                      <span className="text-green-400">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <ErrorPlaceholder message="No VPC data" />
              )}
            </div>

            {/* Top Ports */}
            <div className="bg-gray-900 rounded p-3 border border-gray-700">
              <h4 className="text-xs text-gray-400 mb-3">Top Destination Ports</h4>
              {vpcStats?.top_ports ? (
                <div className="space-y-2">
                  {vpcStats.top_ports.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 font-mono">Port {item.port}</span>
                      <span className="text-purple-400">{item.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <ErrorPlaceholder message="No VPC data" />
              )}
            </div>
          </div>
        </div>

        {/* Auto Scaling & ML Services */}
        <div className="grid grid-cols-2 gap-6">
          {/* Auto Scaling Group */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
              <span className="text-yellow-400 mr-2">⚙️</span>
              Auto Scaling Group Status
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded p-3 border border-gray-700">
                <h4 className="text-xs text-gray-400 mb-2">Desired Capacity</h4>
                <div className="h-32">
                  {asgMetrics?.GroupDesiredCapacity ? (
                    <Line data={generateLineChart(asgMetrics.GroupDesiredCapacity, '#F59E0B')} options={darkChartOptions} />
                  ) : (
                    <ErrorPlaceholder message="No ASG data" />
                  )}
                </div>
              </div>

              <div className="bg-gray-900 rounded p-3 border border-gray-700">
                <h4 className="text-xs text-gray-400 mb-2">In-Service Instances</h4>
                <div className="h-32">
                  {asgMetrics?.GroupInServiceInstances ? (
                    <Line data={generateLineChart(asgMetrics.GroupInServiceInstances, '#10B981')} options={darkChartOptions} />
                  ) : (
                    <ErrorPlaceholder message="No ASG data" />
                  )}
                </div>
              </div>

              {/* <div className="bg-gray-900 rounded p-3 border border-gray-700">
                <h4 className="text-xs text-gray-400 mb-2">CPU Utilization (%)</h4>
                <div className="h-32">
                  {asgMetrics?.CPUUtilization ? (
                    <Line data={generateLineChart(asgMetrics.CPUUtilization, '#3B82F6')} options={darkChartOptions} />
                  ) : (
                    <ErrorPlaceholder message="No ASG data" />
                  )}
                </div>
              </div> */}

              <div className="bg-gray-900 rounded p-3 border border-gray-700">
                <h4 className="text-xs text-gray-400 mb-2">Min/Max Size</h4>
                <div className="h-32">
                  {asgMetrics?.GroupMinSize && asgMetrics?.GroupMaxSize ? (
                    <Line 
                      data={{
                        labels: asgMetrics.GroupMinSize.Timestamps.map(t => 
                          new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        ),
                        datasets: [
                          {
                            label: 'Min Size',
                            data: asgMetrics.GroupMinSize.Values,
                            borderColor: '#EF4444',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.4,
                            pointRadius: 0
                          },
                          {
                            label: 'Max Size',
                            data: asgMetrics.GroupMaxSize.Values,
                            borderColor: '#10B981',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.4,
                            pointRadius: 0
                          }
                        ]
                      }}
                      options={darkChartOptions}
                    />
                  ) : (
                    <ErrorPlaceholder message="No ASG data" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ML Service (SageMaker) */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
              <span className="text-pink-400 mr-2">🤖</span>
              ML Service (SageMaker) Metrics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded p-3 border border-gray-700">
                <h4 className="text-xs text-gray-400 mb-2">Model Latency (ms)</h4>
                <div className="h-32">
                  {mlMetrics?.['ModelLatency (ms)'] && (
                    <Line data={generateLineChart(mlMetrics['ModelLatency (ms)'], '#EC4899')} options={darkChartOptions} />
                  )}
                </div>
              </div>

              <div className="bg-gray-900 rounded p-3 border border-gray-700">
                <h4 className="text-xs text-gray-400 mb-2">Invocations</h4>
                <div className="h-32">
                  {mlMetrics?.Invocations && (
                    <Line data={generateLineChart(mlMetrics.Invocations, '#8B5CF6')} options={darkChartOptions} />
                  )}
                </div>
              </div>

              <div className="bg-gray-900 rounded p-3 border border-gray-700">
                <h4 className="text-xs text-gray-400 mb-2">CPU Utilization (%)</h4>
                <div className="h-32">
                  {mlMetrics?.CPUUtilization && (
                    <Line data={generateLineChart(mlMetrics.CPUUtilization, '#3B82F6')} options={darkChartOptions} />
                  )}
                </div>
              </div>

              <div className="bg-gray-900 rounded p-3 border border-gray-700">
                <h4 className="text-xs text-gray-400 mb-2">Memory Utilization (%)</h4>
                <div className="h-32">
                  {mlMetrics?.MemoryUtilization && (
                    <Line data={generateLineChart(mlMetrics.MemoryUtilization, '#10B981')} options={darkChartOptions} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4">
          <Link
            to="/brute-force-detection"
            className="bg-red-900 bg-opacity-20 border-2 border-red-500 rounded-lg p-4 hover:bg-opacity-30 transition-all"
          >
            <div className="text-red-400 text-2xl mb-2">🔒</div>
            <div className="text-white font-semibold">Brute Force Detection</div>
            <div className="text-gray-400 text-sm mt-1">Analyze SSH attack patterns</div>
          </Link>

          <Link
            to="/ddos-detection"
            className="bg-orange-900 bg-opacity-20 border-2 border-orange-500 rounded-lg p-4 hover:bg-opacity-30 transition-all"
          >
            <div className="text-orange-400 text-2xl mb-2">⚡</div>
            <div className="text-white font-semibold">DDoS Detection</div>
            <div className="text-gray-400 text-sm mt-1">Monitor traffic anomalies</div>
          </Link>

          <button
            onClick={() => setShowReportModal(true)}
            className="bg-blue-900 bg-opacity-20 border-2 border-blue-500 rounded-lg p-4 hover:bg-opacity-30 transition-all text-left"
          >
            <div className="text-blue-400 text-2xl mb-2">📊</div>
            <div className="text-white font-semibold">Generate Reports</div>
            <div className="text-gray-400 text-sm mt-1">Create security reports</div>
          </button>

          <button
            className="bg-purple-900 bg-opacity-20 border-2 border-purple-500 rounded-lg p-4 hover:bg-opacity-30 transition-all text-left relative"
          >
            <div className="absolute -top-2 -right-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {securityAlerts.length}
              </span>
            </div>
            <div className="text-purple-400 text-2xl mb-2">🔔</div>
            <div className="text-white font-semibold">Security Alerts</div>
            <div className="text-gray-400 text-sm mt-1">View active alerts</div>
          </button>
        </div>
      </div>

        {/* Security Alerts Section */}
        {securityAlerts.length > 0 && (
          <div className="bg-gray-800 rounded-lg border border-red-500 p-4">
            <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
              <span className="mr-2">🚨</span>
              Active Security Alerts ({securityAlerts.length})
            </h2>
            <div className="space-y-3">
              {securityAlerts.slice(0, 5).map((alert, idx) => (
                <div key={idx} className={`bg-gray-900 rounded p-3 border-l-4 ${
                  alert.severity === 'critical' ? 'border-red-500' :
                  alert.severity === 'high' ? 'border-orange-500' :
                  alert.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold text-white">{alert.title}</span>
                      </div>
                      <p className="text-sm text-gray-400">{alert.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>🕒 {new Date(alert.timestamp).toLocaleString()}</span>
                        <span>📍 {alert.source}</span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white text-xs">
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {securityAlerts.length > 5 && (
              <button className="mt-3 text-blue-400 text-sm hover:text-blue-300">
                View all {securityAlerts.length} alerts →
              </button>
            )}
          </div>
        )}

        {/* Report Generation Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-white mb-4">Generate Security Report</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-gray-700 text-gray-200 px-3 py-2 rounded border border-gray-600"
                  >
                    <option value="summary">Executive Summary</option>
                    <option value="detailed">Detailed Analysis</option>
                    <option value="compliance">Compliance Report</option>
                    <option value="incident">Incident Report</option>
                    <option value="metrics">Metrics Dashboard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time Period
                  </label>
                  <select
                    value={timeRange}
                    className="w-full bg-gray-700 text-gray-200 px-3 py-2 rounded border border-gray-600"
                    disabled
                  >
                    <option value="1h">Last 1 Hour</option>
                    <option value="6h">Last 6 Hours</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Using current dashboard time range</p>
                </div>

                <div className="bg-gray-900 rounded p-3 border border-gray-700">
                  <h3 className="text-sm font-semibold text-white mb-2">Report will include:</h3>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>✓ ALB Performance Metrics</li>
                    <li>✓ RDS Database Statistics</li>
                    <li>✓ VPC Network Traffic Analysis</li>
                    <li>✓ Auto Scaling Group Status</li>
                    <li>✓ Threat Classifications</li>
                    <li>✓ Security Events Summary</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setGeneratingReport(true);
                    // Simulate report generation
                    setTimeout(() => {
                      const reportContent = generateReport();
                      downloadReport(reportContent);
                      setGeneratingReport(false);
                      setShowReportModal(false);
                    }, 2000);
                  }}
                  disabled={generatingReport}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-semibold"
                >
                  {generatingReport ? (
                    <span className="flex items-center justify-center">
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                      Generating...
                    </span>
                  ) : (
                    'Generate & Download'
                  )}
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  disabled={generatingReport}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1F2937;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
      `}</style>
    </div>
  );
}

export default AdvancedDashboard;