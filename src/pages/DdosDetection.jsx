import React, { useState } from "react";
import api from "../axiosConfig";

function DdosDetection() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const result = await api.post("/detect_ddos", {
        log_group: "ec2-sys-ddos", // Hardcoded log group
        log_stream: "eni-02e39add4dcb19a29-all", // Hardcoded log stream
        start_date: startDate,
        end_date: endDate,
      });
      setResponse(result.data);
    } catch (error) {
      console.error("Error detecting DDoS:", error);
      setResponse({ message: "An error occurred while detecting DDoS." });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
        DDoS Detection
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg mb-8 max-w-3xl mx-auto"
      >
        <h2 className="text-xl font-bold text-gray-700 mb-4">Select Date Range</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="startDate" className="text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 mt-1 w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="text-gray-700">
              End Date
            </label>
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
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Detecting..." : "Detect DDoS"}
          </button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Detection Results</h2>
        {response ? (
          <div>
            {response.ddos_ips && response.ddos_ips.length > 0 ? (
              <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                <p className="text-lg font-bold mb-2">Potential DDoS Detected!</p>
                <p>Affected IPs:</p>
                <ul className="list-disc pl-5">
                  {response.ddos_ips.map((ip, index) => (
                    <li key={index} className="mt-1">
                      <span className="font-medium">{ip.ip}</span> - Requests:{" "}
                      <span className="font-bold">{ip.request_count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4 bg-green-100 text-green-700 border border-green-300 rounded-lg">
                <p className="text-lg font-bold">No DDoS Activity Detected</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">
            Submit the form to check for DDoS activity.
          </p>
        )}
      </div>
    </div>
  );
}

export default DdosDetection;
