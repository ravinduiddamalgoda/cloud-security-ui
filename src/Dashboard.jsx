import React, { useState } from 'react';

function Dashboard() {
  // Hardcoded logs, threats, and brute force IPs
  const [logs] = useState([
    'Sep 10 14:23:45 server sshd[12345]: Failed password for root from 192.168.1.1 port 22 ssh2',
    'Sep 10 14:25:12 server sshd[12346]: Failed password for root from 192.168.1.2 port 22 ssh2',
    'Sep 10 14:27:36 server sshd[12347]: Accepted password for root from 192.168.1.100 port 22 ssh2',
  ]);

  const [threats] = useState([
    { type: 'DDoS', description: 'Detected high traffic from 192.168.1.10' },
    { type: 'Brute Force', description: 'Multiple failed login attempts from 192.168.1.1' },
  ]);

  const [bruteForceIps] = useState([
    '192.168.1.1',
    '192.168.1.2',
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Security Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Logs Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Logs</h2>
          <div className="bg-gray-800 text-white p-4 rounded-lg max-h-64 overflow-auto">
            <pre>
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </pre>
          </div>
        </div>

        {/* Threats Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Detected Threats</h2>
          <ul className="list-disc pl-5">
            {threats.map((threat, index) => (
              <li key={index} className="text-gray-600 mb-2">
                <strong>{threat.type}:</strong> {threat.description}
              </li>
            ))}
          </ul>
        </div>

        {/* Brute Force Detection Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Brute Force Detection</h2>
          <div className="bg-red-100 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-red-700 mb-2">IPs Detected:</h3>
            {bruteForceIps.length > 0 ? (
              <ul className="list-disc pl-5">
                {bruteForceIps.map((ip, index) => (
                  <li key={index} className="text-red-600">
                    {ip}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-700">No brute force attempts detected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
