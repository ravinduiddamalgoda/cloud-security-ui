import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../axiosConfig';

function BruteForceDetection() {
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
      const result = await api.post('/detect_brute_force', {
        log_group: 'ec2-ssh-logs2',
        log_stream: 'i-0c7119c0e578fa082',
        start_date: startDate,
        end_date: endDate,
      });
      setResponse(result.data);
    } catch (error) {
      console.error('Error detecting brute force:', error);
      setResponse({ 
        message: 'An error occurred while detecting brute force.', 
        status: 'false',
        error: error.message 
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
            <h1 className="text-xl font-bold text-white">Brute Force Attack Detection</h1>
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
            <div className="text-2xl">🔒</div>
            <div>
              <h2 className="text-white font-semibold mb-1">About Brute Force Detection</h2>
              <p className="text-gray-400 text-sm">
                This module analyzes SSH authentication logs to identify potential brute force attacks. 
                It monitors failed login attempts, connection patterns, and throttling events to detect 
                malicious activity. IPs with more than 25 failed attempts are flagged as suspicious.
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
                    <span>Detect Brute Force Attacks</span>
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
                Select a date range above and click "Detect Brute Force Attacks" to begin analysis
              </p>
            </div>
          ) : response.status === "true" ? (
            <div className="space-y-4">
              {/* Alert Banner */}
              <div className="bg-red-900 bg-opacity-30 border-2 border-red-500 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-3xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="text-red-400 font-bold text-lg mb-1">
                      Brute Force Attack Detected!
                    </h3>
                    <p className="text-red-300 text-sm">
                      {response.IPs?.length} suspicious IP address{response.IPs?.length !== 1 ? 'es' : ''} detected 
                      with excessive failed login attempts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Suspicious IPs Table */}
              <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <h4 className="text-white font-semibold">Suspicious IP Addresses</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Threat Level
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {response.IPs?.map((ip, index) => (
                        <tr key={index} className="hover:bg-gray-800 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-red-400 font-medium">{ip}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 bg-opacity-30 text-red-400 border border-red-500">
                              High Risk
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                              Block IP →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded-lg p-4">
                <h4 className="text-yellow-400 font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Recommended Actions
                </h4>
                <ul className="space-y-1 text-yellow-200 text-sm">
                  <li>• Add suspicious IPs to security group block list</li>
                  <li>• Enable AWS WAF rules for rate limiting</li>
                  <li>• Consider implementing fail2ban on affected instances</li>
                  <li>• Review and strengthen SSH authentication policies</li>
                  <li>• Enable MFA for SSH access where possible</li>
                </ul>
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
                      No Threats Detected
                    </h3>
                    <p className="text-green-300 text-sm">
                      Analysis complete. No brute force attack patterns were identified during the selected period.
                      {response.message && ` ${response.message}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
                <h4 className="text-white font-semibold mb-3">System Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">SSH Login Monitoring</span>
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Log Analysis Engine</span>
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Threat Intelligence</span>
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Up to Date
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Links */}
        <div className="mt-6 flex justify-center space-x-4">
          <Link
            to="/ddos-detection"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Go to DDoS Detection →
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

export default BruteForceDetection;