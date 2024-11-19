// src/BruteForceDetection.js
import React, { useState } from 'react';
import api from '../axiosConfig';


function BruteForceDetection() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

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
      console.log(response);
    } catch (error) {
      console.error('Error detecting brute force:', error);
      setResponse({ message: 'An error occurred while detecting brute force.', status: false });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Brute Force Detection</h1>

      {/* Form to select date range */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Select Date Range</h2>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-col w-full md:w-auto">
            <label htmlFor="startDate" className="text-gray-700">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
              className="border border-gray-300 rounded-md px-4 py-2 mt-1 w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full md:w-auto"
            disabled={loading}
          >
            {loading ? 'Detecting...' : 'Detect Brute Force'}
          </button>
        </div>
      </form>

      {/* Display results */}
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Detection Results</h2>
        {response ? (
          <div
            className={`p-4 rounded-lg ${
              response.status == "true"
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'bg-green-100 text-green-700 border border-green-300'
            }`}
          >
            {response.status == "true" ? (
              <>
                <p className="text-lg font-bold mb-2">Brute Force Detected!</p>
                <p>IP Addresses:</p>
                <ul className="list-disc pl-5">
                  {response.IPs.map((ip, index) => (
                    <li key={index}>{ip}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-lg font-bold">No Brute Force Activity Detected</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Submit the form to check for brute force activity.</p>
        )}
      </div>
    </div>
  );
}

export default BruteForceDetection;
