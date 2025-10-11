import React, { useState, useEffect } from 'react';

const MisReport = () => {
  const [peopleData, setPeopleData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]); // New state for history data

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec?sheet=MIS Scorecard&action=fetch');
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Process the data from the sheet
        const processedData = processSheetData(data.data);
        setPeopleData(processedData);
        setFilteredData(processedData);
      } else {
        throw new Error(data.error || 'Failed to fetch data from sheet');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch history data
  const fetchHistoryData = async (employeeName) => {
    try {
      setLoading(true);
      const response = await fetch('https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec?sheet=MIS Scorecard History&action=fetch');
      
      if (!response.ok) {
        throw new Error('Failed to fetch history data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Process the history data and filter by employee name
        const processedHistoryData = processHistoryData(data.data, employeeName);
        setHistoryData(processedHistoryData);
        setFilteredData(processedHistoryData);
      } else {
        throw new Error(data.error || 'Failed to fetch history data from sheet');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching history data:', err);
    } finally {
      setLoading(false);
    }
  };

  const processSheetData = (sheetData) => {
    if (!sheetData || sheetData.length < 2) return [];
    
    const rows = sheetData.slice(1);
    
    return rows.map((row, index) => {
      return {
        id: index + 1,
        name: row[2] || '', // Column C (index-2) for Name
        dateStart: row[0] || '', // Column A (index-0) for Date Start
        dateEnd: row[1] || '', // Column B (index-1) for Date End
        target: row[3] || '', // Column D (index-3) for Target
        actualWeekDone: row[4] || '', // Column E (index-4) for Actual Week Done
        actualWorkDoneOnTime: row[5] || '', // Column F (index-5) for Actual Work Done On Time
        workNotDoneOnTime: row[6] || '', // Column G (index-6) for Work Not Done On Time
        workDoneOnTime: parseInt(row[7]) || 0, // Column H (index-7) for Work Done On Time %
        workNotDone: row[8] || '', // Column I (index-8) for Work Not Done
        workNotDonePercent: row[9] || '', // Column J (index-9) for % Work Not Done
        overallDone: row[10] || '', // Column K (index-10) for % Overalls Done
      };
    });
  };

  // New function to process history data
  const processHistoryData = (sheetData, employeeName) => {
    if (!sheetData || sheetData.length < 2) return [];
    
    const rows = sheetData.slice(1);
    
    // Filter rows by employee name and process
    const filteredHistory = rows
      .filter(row => row[2] === employeeName) // Column C (index-2) for Name
      .map((row, index) => {
        return {
          id: index + 1,
          name: row[2] || '', // Column C (index-2) for Name
          dateStart: row[0] || '', // Column A (index-0) for Date Start
          dateEnd: row[1] || '', // Column B (index-1) for Date End
          target: row[3] || '', // Column D (index-3) for Target
          actualWeekDone: row[4] || '', // Column E (index-4) for Actual Week Done
          actualWorkDoneOnTime: row[5] || '', // Column F (index-5) for Actual Work Done On Time
          workNotDoneOnTime: row[6] || '', // Column G (index-6) for Work Not Done On Time
          workDoneOnTime: parseInt(row[7]) || 0, // Column H (index-7) for Work Done On Time %
          workNotDone: row[8] || '', // Column I (index-8) for Work Not Done
          workNotDonePercent: row[9] || '', // Column J (index-9) for % Work Not Done
          overallDone: row[10] || '', // Column K (index-10) for % Overalls Done
        };
      });
    
    return filteredHistory;
  };

  const handleEmployeeClick = async (employeeName) => {
    setSelectedEmployee(employeeName);
    await fetchHistoryData(employeeName);
  };

  const handleBackClick = () => {
    setSelectedEmployee(null);
    setFilteredData(peopleData);
    setHistoryData([]); // Clear history data when going back
  };

  const TotalDoneWork = ({ weeks }) => {
    const getColor = (weeks) => {
      if (weeks === 1) return 'bg-green-100 text-green-800';
      if (weeks === 2) return 'bg-yellow-100 text-yellow-800';
      if (weeks === 3) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    };

    return (
      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getColor(weeks)}`}>
        {weeks}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-50 z-10 py-2">
          <div className="flex items-center">
            {selectedEmployee && (
              <button 
                onClick={handleBackClick}
                className="mr-4 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedEmployee ? `${selectedEmployee}'s Score Card` : 'Balanced Score Card'}
            </h1>
            {selectedEmployee && (
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                History View
              </span>
            )}
          </div>
          <button 
            onClick={selectedEmployee ? () => fetchHistoryData(selectedEmployee) : fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">NAME</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">DATE START</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">DATE END</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">TARGET</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">Actual Week Done</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">Actual  Work Done  On Time</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">WORK Not Done On Time</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">Work Done On Time %</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">Work Not Done</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">Work Not Done %</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">Overall Done %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((person, index) => (
                    <tr key={person.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            {!selectedEmployee ? (
                              <button
                                onClick={() => handleEmployeeClick(person.name)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                              >
                                {person.name}
                              </button>
                            ) : (
                              <span className="text-sm font-medium text-gray-900">
                                {person.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.dateStart}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.dateEnd}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.target}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.actualWeekDone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.actualWorkDoneOnTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.workNotDoneOnTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.workDoneOnTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.workNotDone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.workNotDonePercent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.overallDone}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisReport;