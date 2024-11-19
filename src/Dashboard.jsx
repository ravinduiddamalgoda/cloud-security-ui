import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import api from './axiosConfig';

function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // useEffect(() => {
  //   try {
  //     const user = JSON.parse(localStorage.getItem('user'));
  //     if (user && user.name) {
  //       setUsername(user.name);
  //     } else {
  //       // Redirect to login if user data is not found
  //       navigate('/login');
  //     }
  //   } catch (error) {
  //     console.error("Error parsing user data:", error);
  //     localStorage.removeItem('user'); // Clear invalid data
  //     navigate('/login');
  //   }
  // }, [navigate]);
  
  useEffect(() => {
    // Fetch metrics on load
    const fetchMetrics = async () => {
      try {
        const response = await api.post('/fetch_metrics', {
          instance_id: 'i-0c7119c0e578fa082',
        });
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    // Get the username from localStorage
    // const user = JSON.parse(localStorage.getItem('user'));
    // if (user && user.name) {
    //   setUsername(user.name);
    // } else {
    //   // Redirect to login if not authenticated
    //   navigate('/login');
    // }

    fetchMetrics();
  }, [navigate]);

  const fetchLogs = async () => {
    try {
      const response = await api.post('/fetch_logs', {
        log_group: 'ec2-ssh-logs2',
        log_stream: 'i-0c7119c0e578fa082',
        start_date: startDate,
        end_date: endDate,
      });
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Helper function to generate chart data from metrics
  const getChartData = (metric) => ({
    labels: metric.Timestamps.map((timestamp) =>
      new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    ),
    datasets: [
      {
        label: metric.Label,
        data: metric.Values,
        fill: false,
        borderColor: '#4a90e2',
        backgroundColor: '#4a90e2',
        pointBorderColor: '#4a90e2',
        pointBackgroundColor: '#fff',
      },
    ],
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex items-center justify-between bg-blue-700 text-white px-6 py-4 rounded-md mb-8">
        <h1 className="text-2xl font-bold">Security Dashboard</h1>
        <div className="flex items-center space-x-4">
          {/* <p className="text-lg">Welcome, <span className="font-bold">{username}</span></p> */}
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Threat Detection Links */}
      <div className="flex justify-center space-x-4 mb-6">
        <Link
          to="/brute-force-detection"
          className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600"
        >
          Go to Brute Force Detection
        </Link>
        <Link
          to="/ddos-detection"
          className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
        >
          Go to DDoS Detection
        </Link>
      </div>

      {/* Date Range Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Select Date Range</h2>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-col w-full md:w-auto">
            <label htmlFor="startDate" className="text-gray-700">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={getTodayDate()} // Restrict to today or earlier
              className="border border-gray-300 rounded-md px-4 py-2 mt-1 w-full"
              required
            />
          </div>
          <div className="flex flex-col w-full md:w-auto">
            <label htmlFor="endDate" className="text-gray-700">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={getTodayDate()} // Restrict to today or earlier
              className="border border-gray-300 rounded-md px-4 py-2 mt-1 w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full md:w-auto"
          >
            Fetch Logs
          </button>
        </div>
      </form>

      {/* Logs Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Logs</h2>
        <div className="bg-gray-800 text-white p-4 rounded-lg max-h-64 overflow-y-auto">
          <pre>
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index}>{log.message}</div>
              ))
            ) : (
              <p>No logs available for the selected date range.</p>
            )}
          </pre>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="space-y-6 max-w-5xl mx-auto">
        {metrics
          .filter((metric) => metric.Label !== 'DiskReadOps' && metric.Label !== 'DiskWriteOps') // Filter out DiskReadOps and DiskWriteOps
          .map((metric, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{metric.Label}</h3>
              <div className="h-48">
                <Line
                  data={getChartData(metric)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Dashboard;
