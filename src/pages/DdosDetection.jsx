import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../axiosConfig';

function DdosDetection() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const result = await api.post('/detect_ddos', {
        log_group: 'ec2-sys-ddos',
        log_stream: 'eni-02e39add4dcb19a29-all',
        start_date: startDate,
        end_date: endDate,
      });
      setResponse(result.data);
    } catch (error) {
      console.error('Error detecting DDoS:', error);
      setResponse({ 
        message: 'An error occurred while detecting DDoS attacks.',
        error: error.message,
        ddos_ips: []
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-blue-400 hover:text-blue-300">
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-white">DDoS Attack Detection</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-400 text-sm">Live Monitoring</span>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Info Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">⚡</div>
            <div>
              <h2 className="text-white font-semibold mb-1">About DDoS Detection</h2>
              <p className="text-gray-400 text-sm">
                This module analyzes VPC Flow Logs to identify Distributed Denial of Service (DDoS) attacks.
                It monitors network traffic patterns, request rates, and source IP distributions to detect 
                abnormal traffic volumes. IPs generating more than 1,000 requests are flagged for review.
              </p>
            </div>
          </div>
        </div>

        {/* Detection Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Select Analysis Period</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={getTodayDate()}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={getTodayDate()}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    <span>Detect DDoS Attacks</span>
                  </>
                )}
              </button>
              
              {response && (
                <button
                  type="button"
                  onClick={() => setResponse(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Clear Results
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Detection Results
          </h2>
          
          {!response ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-400 text-lg mb-2">No Analysis Run Yet</p>
              <p className="text-gray-500 text-sm">
                Select a date range above and click "Detect DDoS Attacks" to begin analysis
              </p>
            </div>
          ) : response.ddos_ips && response.ddos_ips.length > 0 ? (
            <div className="space-y-4">
              {/* Alert Banner */}
              <div className="bg-red-900 bg-opacity-30 border-2 border-red-500 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-3xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="text-red-400 font-bold text-lg mb-1">
                      Potential DDoS Attack Detected!
                    </h3>
                    <p className="text-red-300 text-sm">
                      {response.ddos_ips.length} IP address{response.ddos_ips.length !== 1 ? 'es' : ''} detected 
                      with abnormally high request volumes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Attack Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-lg border border-red-500 p-4">
                  <div className="text-xs text-gray-400 mb-1">Affected IPs</div>
                  <div className="text-2xl font-bold text-red-400">
                    {response.ddos_ips.length}
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg border border-orange-500 p-4">
                  <div className="text-xs text-gray-400 mb-1">Total Requests</div>
                  <div className="text-2xl font-bold text-orange-400">
                    {response.ddos_ips.reduce((sum, item) => sum + item.request_count, 0).toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg border border-yellow-500 p-4">
                  <div className="text-xs text-gray-400 mb-1">Highest Volume</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {Math.max(...response.ddos_ips.map(item => item.request_count)).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Affected IPs Table */}
              <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <h4 className="text-white font-semibold">Affected IP Addresses</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Target IP
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Request Count
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {response.ddos_ips
                        .sort((a, b) => b.request_count - a.request_count)
                        .map((item, index) => {
                          const severity = item.request_count > 10000 ? 'Critical' : 
                                         item.request_count > 5000 ? 'High' : 'Medium';
                          const severityColor = severity === 'Critical' ? 'red' : 
                                               severity === 'High' ? 'orange' : 'yellow';
                          
                          return (
                            <tr key={index} className="hover:bg-gray-800 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-300">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-mono text-red-400 font-medium">{item.ip}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-white font-semibold">
                                  {item.request_count.toLocaleString()}
                                </span>
                                <span className="text-gray-500 text-xs ml-1">requests</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${severityColor}-900 bg-opacity-30 text-${severityColor}-400 border border-${severityColor}-500`}>
                                  {severity}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                  Mitigate →
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded-lg p-4">
                <h4 className="text-yellow-400 font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Recommended Mitigation Actions
                </h4>
                <ul className="space-y-1 text-yellow-200 text-sm">
                  <li>• Enable AWS Shield Advanced for enhanced DDoS protection</li>
                  <li>• Configure AWS WAF rate-based rules to limit request rates</li>
                  <li>• Implement CloudFront as a CDN layer for traffic absorption</li>
                  <li>• Scale infrastructure using Auto Scaling Groups</li>
                  <li>• Review and adjust security group rules</li>
                  <li>• Contact AWS Support for assistance if attack persists</li>
                </ul>
              </div>

              {/* Attack Timeline */}
              <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
                <h4 className="text-white font-semibold mb-3">Attack Pattern Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Analysis Period</span>
                    <span className="text-white">{startDate} to {endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Detection Time</span>
                    <span className="text-white">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Attack Type</span>
                    <span className="text-white">Volumetric (Network Layer)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Success Banner */}
              <div className="bg-green-900 bg-opacity-30 border-2 border-green-500 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-3xl">✅</div>
                  <div className="flex-1">
                    <h3 className="text-green-400 font-bold text-lg mb-1">
                      No DDoS Activity Detected
                    </h3>
                    <p className="text-green-300 text-sm">
                      Analysis complete. Network traffic patterns appear normal during the selected period.
                      No abnormal request volumes or attack signatures were identified.
                    </p>
                  </div>
                </div>
              </div>

              {/* Network Status */}
              <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
                <h4 className="text-white font-semibold mb-3">Network Health Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Traffic Flow Monitoring</span>
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Normal
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Request Rate</span>
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Within Threshold
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">AWS Shield Protection</span>
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Load Balancer Health</span>
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Healthy
                    </span>
                  </div>
                </div>
              </div>

              {/* Best Practices */}
              <div className="bg-blue-900 bg-opacity-20 border border-blue-600 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
                  <span className="mr-2">🛡️</span>
                  DDoS Protection Best Practices
                </h4>
                <ul className="space-y-1 text-blue-200 text-sm">
                  <li>• Keep AWS Shield Standard protection enabled (free for all customers)</li>
                  <li>• Use CloudFront and Route 53 for DDoS-resilient architecture</li>
                  <li>• Implement Auto Scaling to handle traffic spikes</li>
                  <li>• Configure AWS WAF rules for common attack patterns</li>
                  <li>• Monitor CloudWatch metrics for abnormal traffic patterns</li>
                  <li>• Maintain incident response plan for DDoS scenarios</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Additional Links */}
        <div className="mt-6 flex justify-center space-x-4">
          <Link
            to="/brute-force-detection"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Go to Brute Force Detection →
          </Link>
          <span className="text-gray-600">|</span>
          <Link
            to="/"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Return to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DdosDetection;