import { Activity, ChartLine } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const MisReport = () => {
  const [peopleData, setPeopleData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showPIPPage, setShowPIPPage] = useState(false);
  const [pipActionLoading, setPipActionLoading] = useState({});
  const [isNewPIPRecord, setIsNewPIPRecord] = useState(false);
  const [pipData, setPipData] = useState([]);
  const [emailForm, setEmailForm] = useState({
    recipientName: '',
    recipientEmail: '',
    subject: '',
    message: '',
    startDate: '',
    endDate: '',
    totalDays: 0
  });
  const [employeeEmails, setEmployeeEmails] = useState({});
  const [showExtendPopup, setShowExtendPopup] = useState(false); 
  const [selectedPIPRecord, setSelectedPIPRecord] = useState(null);
  const [extendForm, setExtendForm] = useState({
  startDate: "",
  endDate: "",
  totalDays: 0,
  });

  const handleExtendClick = (record) => {
  setSelectedPIPRecord(record);
  setExtendForm({
    startDate: record.startDate || '',
    endDate: record.endDate || '',
    totalDays: record.totalDays || 0
  });
  setShowExtendPopup(true);
};

const handleExtendFormChange = (field, value) => {
  if (field === 'startDate' || field === 'endDate') {
    const updatedForm = {
      ...extendForm,
      [field]: value
    };
    
    // Calculate total days if both dates are selected
    if (updatedForm.startDate && updatedForm.endDate) {
      const start = new Date(updatedForm.startDate);
      const end = new Date(updatedForm.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      updatedForm.totalDays = dayDiff > 0 ? dayDiff : 0;
    } else {
      updatedForm.totalDays = 0;
    }
    
    setExtendForm(updatedForm);
  }
};

  useEffect(() => {
    fetchData();
    fetchEmployeeEmails(); // Fetch email data when component mounts
  }, []);

  const fetchEmployeeEmails = async () => {
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec?sheet=JOINING&action=fetch');
      
      if (!response.ok) {
        throw new Error('Failed to fetch email data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const emailMap = processEmailData(data.data);
        setEmployeeEmails(emailMap);
      } else {
        console.warn('Failed to fetch email data from JOINING sheet:', data.error);
      }
    } catch (err) {
      console.warn('Error fetching email data:', err);
      // Don't set error state as this is non-critical functionality
    }
  };

  const processEmailData = (sheetData) => {
    if (!sheetData || sheetData.length < 2) return {};
    
    const rows = sheetData.slice(1);
    const emailMap = {};
    
    rows.forEach(row => {
      const name = row[2] || ''; // Column C (index 2)
      const email = row[18] || ''; // Column S (index 18)
      
      if (name && email) {
        emailMap[name] = email;
      }
    });
    
    return emailMap;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec?sheet=MIS Scorecard&action=fetch');
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      
      if (data.success) {
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

  const fetchHistoryData = async (employeeName) => {
    try {
      setLoading(true);
      const response = await fetch('https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec?sheet=MIS Scorecard History&action=fetch');
      
      if (!response.ok) {
        throw new Error('Failed to fetch history data');
      }
      
      const data = await response.json();
      
      if (data.success) {
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

  const fetchPIPData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec?sheet=PIP&action=fetch');
      
      if (!response.ok) {
        throw new Error('Failed to fetch PIP data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const processedPIPData = processPIPData(data.data);
        setPipData(processedPIPData);
      } else {
        throw new Error(data.error || 'Failed to fetch PIP data from sheet');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching PIP data:', err);
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
        name: row[2] || '',
        dateStart: row[0] || '',
        dateEnd: row[1] || '',
        target: row[3] || '',
        actualWeekDone: row[4] || '',
        actualWorkDoneOnTime: row[5] || '',
        workNotDoneOnTime: row[6] || '',
        workDoneOnTime: parseInt(row[7]) || 0,
        workNotDone: row[8] || '',
        workNotDonePercent: row[9] || '',
        overallDone: (row[10]) || 0,
      };
    });
  };

  const processHistoryData = (sheetData, employeeName) => {
    if (!sheetData || sheetData.length < 2) return [];
    
    const rows = sheetData.slice(1);
    
    const filteredHistory = rows
      .filter(row => row[2] === employeeName)
      .map((row, index) => {
        return {
          id: index + 1,
          name: row[2] || '',
          dateStart: row[0] || '',
          dateEnd: row[1] || '',
          target: row[3] || '',
          actualWeekDone: row[4] || '',
          actualWorkDoneOnTime: row[5] || '',
          workNotDoneOnTime: row[6] || '',
          workDoneOnTime: parseInt(row[7]) || 0,
          workNotDone: row[8] || '',
          workNotDonePercent: row[9] || '',
          overallDone: parseFloat(row[10]) || 0,
        };
      });
    
    // Sort by date (latest first) - assuming dateEnd format is consistent
    return filteredHistory.sort((a, b) => {
      const dateA = parseDate(a.dateEnd);
      const dateB = parseDate(b.dateEnd);
      return dateB - dateA;
    });
  };

const processPIPData = (sheetData) => {
    if (!sheetData || sheetData.length < 2) return [];
    
    const rows = sheetData.slice(1);
    
    return rows.map((row, index) => {
      return {
        id: index + 1,
        timestamp: row[0] || '',
        employeeName: row[1] || '',
        latestScore: row[2] || '',
        monthlyAverage: row[3] || '',
        status: row[4] || '',           // Column E (index 4) - status
        email: row[5] || '',            // Column F (index 5) - email
        emailContent: row[6] || '',     // Column G (index 6) - email content
        startDate: row[7] || '',        // Column H (index 7) - start date
        endDate: row[8] || '',          // Column I (index 8) - end date
        totalDays: row[9] || 0,         // Column J (index 9) - total days
      };
    });
  };

// Add this function to handle status updates
const updatePIPStatus = async (recordId, employeeName, newStatus, buttonType, extendData = null) => {
  // Set loading state for this specific record and button
  setPipActionLoading(prev => ({ ...prev, [`${recordId}-${buttonType}`]: true }));
  
  try {
    let success = true;
    
    // If it's an extend action and we have extend data, update the dates first
    if (buttonType === 'extend' && extendData) {
      const dateFormData = new URLSearchParams();
      dateFormData.append('action', 'updateCell');
      dateFormData.append('sheetName', 'PIP');
      dateFormData.append('rowIndex', recordId + 1);
      
      // Update start date (Column H - index 7)
      dateFormData.append('columnIndex', '8');
      dateFormData.append('value', extendData.startDate);
      
      const dateResponse = await fetch(
        'https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec',
        {
          method: 'POST',
          body: dateFormData
        }
      );
      
      const dateResult = await dateResponse.json();
      if (!dateResult.success) {
        throw new Error(dateResult.error || 'Failed to update start date');
      }
      
      // Update end date (Column I - index 8)
      dateFormData.set('columnIndex', '9');
      dateFormData.set('value', extendData.endDate);
      
      const endDateResponse = await fetch(
        'https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec',
        {
          method: 'POST',
          body: dateFormData
        }
      );
      
      const endDateResult = await endDateResponse.json();
      if (!endDateResult.success) {
        throw new Error(endDateResult.error || 'Failed to update end date');
      }
      
      // Update total days (Column J - index 9)
      dateFormData.set('columnIndex', '10');
      dateFormData.set('value', extendData.totalDays.toString());
      
      const daysResponse = await fetch(
        'https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec',
        {
          method: 'POST',
          body: dateFormData
        }
      );
      
      const daysResult = await daysResponse.json();
      if (!daysResult.success) {
        throw new Error(daysResult.error || 'Failed to update total days');
      }
    }
    
    // Update status (Column E - index 4)
    const formData = new URLSearchParams();
formData.append('action', 'updateCell');
formData.append('sheetName', 'PIP');
formData.append('rowIndex', recordId + 1);
formData.append('columnIndex', '5'); // Column E in Sheets (1-based)
formData.append('value', newStatus);

    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec',
      {
        method: 'POST',
        body: formData
      }
    );

    const result = await response.json();

    if (result.success) {
      await fetchPIPData();
      return true;
    } else {
      throw new Error(result.error || 'Failed to update PIP status');
    }
  } catch (error) {
    console.error('Error updating PIP status:', error);
    return false;
  } finally {
    // Clear loading state for this specific record and button
    setPipActionLoading(prev => ({ ...prev, [`${recordId}-${buttonType}`]: false }));
  }
};

// Add this function to handle extend submission
const handleExtendSubmit = async () => {
  if (!extendForm.startDate || !extendForm.endDate) {
    alert('Please select both start and end dates');
    return;
  }

  if (extendForm.totalDays <= 0) {
    alert('Please select valid dates');
    return;
  }

  // Set loading state for the extend submit button
  setPipActionLoading(prev => ({ ...prev, 'extend-submit': true }));

  const success = await updatePIPStatus(
    selectedPIPRecord.id,
    selectedPIPRecord.employeeName,
    "Extended",
    "extend",
    {
      startDate: extendForm.startDate,
      endDate: extendForm.endDate,
      totalDays: extendForm.totalDays
    }
  );

  // Clear loading state
  setPipActionLoading(prev => ({ ...prev, 'extend-submit': false }));

  if (success) {
    setShowExtendPopup(false);
    setSelectedPIPRecord(null);
    setExtendForm({
      startDate: '',
      endDate: '',
      totalDays: 0
    });
  }
};


  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    // Handle various date formats (DD/MM/YYYY, MM/DD/YYYY, etc.)
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // Assuming DD/MM/YYYY format
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(dateStr);
  };

  const handleEmployeeClick = async (employeeName) => {
    setSelectedEmployee(employeeName);
    await fetchHistoryData(employeeName);
  };

  const handleBackClick = () => {
    setSelectedEmployee(null);
    setFilteredData(peopleData);
    setHistoryData([]);
  };

  const handlePIPClick = async () => {
    setShowPIPPage(true);
    await fetchPIPData();
  };

  const handleBackToMain = () => {
    setShowPIPPage(false);
    setSelectedEmployee(null);
    setFilteredData(peopleData);
  };

const storePIPRecord = async (employeeName, latestScore, monthlyAverage, recipientEmail, emailContent) => {
    try {
      const timestamp = new Date().toLocaleString('en-GB'); // DD/MM/YYYY, HH:MM:SS format
      const status = 'Pending';
      
      // Updated row data with additional columns for dates
      const rowData = [
        timestamp,
        employeeName,
        latestScore,
        monthlyAverage,
        status,
        recipientEmail,           // Column F (index 5) - recipient email
        emailContent,             // Column G (index 6) - email content
        emailForm.startDate,      // Column H (index 7) - start date
        emailForm.endDate,        // Column I (index 8) - end date
        emailForm.totalDays       // Column J (index 9) - total days
      ];

      const formData = new URLSearchParams();
      formData.append('action', 'insert');
      formData.append('sheetName', 'PIP');
      formData.append('rowData', JSON.stringify(rowData));

      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec',
        {
          method: 'POST',
          body: formData
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to store PIP record');
      }
      
      return true;
    } catch (error) {
      console.error('Error storing PIP record:', error);
      return false;
    }
  };

const handleSharePIP = async (employeeName) => {
  if (showEmailPopup) return;
  
  // Find employee data to get their performance details
  const employeeRecords = filteredData.slice(0, 3); // Latest 3 records
  const latestRecord = employeeRecords[0];
  const monthlyAverage = calculateMonthlyAverage();
  
  // Get email from employeeEmails mapping
  const employeeEmail = employeeEmails[employeeName] || '';
  
  const emailContent = `Dear ${employeeName},

We would like to share your recent performance scorecard for review.

Performance Summary:
- Latest Overall Score: ${latestRecord?.overallDone || 0}%
- 3-Month Average: ${monthlyAverage}%
- Period: ${latestRecord?.dateStart || ''} to ${latestRecord?.dateEnd || ''}

Your detailed performance metrics are as follows:
- Target: ${latestRecord?.target || ''}
- Actual Work Done: ${latestRecord?.actualWeekDone || ''}
- Work Done On Time: ${latestRecord?.workDoneOnTime || 0}%
- Overall Completion: ${latestRecord?.overallDone || 0}%

Please review these metrics and let us know if you have any questions. We are available to discuss your performance and any support you may need.

Best regards,
Management Team`;

  setEmailForm({
    recipientName: employeeName,
    recipientEmail: employeeEmail, // Auto-filled with employee's email
    subject: `Performance Review - ${employeeName}`,
    message: emailContent,
    startDate: '',
    endDate: '',
    totalDays: 0
  });
  
  // Set flag to indicate this is a new PIP record that should be stored when email is sent
  setIsNewPIPRecord(true);
  setShowEmailPopup(true);
};

  const handleEmailFormChange = (field, value) => {
    if (field === 'startDate' || field === 'endDate') {
      const updatedForm = {
        ...emailForm,
        [field]: value
      };
      
      // Calculate total days if both dates are selected
      if (updatedForm.startDate && updatedForm.endDate) {
        const start = new Date(updatedForm.startDate);
        const end = new Date(updatedForm.endDate);
        const timeDiff = end.getTime() - start.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
        updatedForm.totalDays = dayDiff > 0 ? dayDiff : 0;
      } else {
        updatedForm.totalDays = 0;
      }
      
      setEmailForm(updatedForm);
    } else {
      setEmailForm(prev => ({ ...prev, [field]: value }));
    }
  };

const handleSendEmail = async () => {
  // Validate email form
  if (!emailForm.recipientEmail || !emailForm.subject || !emailForm.message) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    setLoading(true);
    
    // Store PIP record only when sending email (if it's a new record)
    if (isNewPIPRecord) {
      const employeeRecords = filteredData.slice(0, 3);
      const latestRecord = employeeRecords[0];
      const monthlyAverage = calculateMonthlyAverage();
      
      const storeSuccess = await storePIPRecord(
        emailForm.recipientName,
        latestRecord?.overallDone || 0,
        monthlyAverage,
        emailForm.recipientEmail,
        emailForm.message // Use the actual message that was sent
      );
      
      if (!storeSuccess) {
        alert('Failed to store performance record. Email was not sent.');
        return;
      }
      
      // Reset the flag after successful storage
      setIsNewPIPRecord(false);
    }
    
    // Prepare scorecard data
    const scorecardData = filteredData.slice(0, 3).map(record => ({
      dateStart: record.dateStart,
      dateEnd: record.dateEnd,
      target: record.target,
      overallDone: record.overallDone
    }));

    const formData = new URLSearchParams();
    formData.append('action', 'shareViaEmail');
    formData.append('recipientEmail', emailForm.recipientEmail);
    formData.append('subject', emailForm.subject);
    formData.append('message', emailForm.message);
    formData.append('documents', JSON.stringify(scorecardData));

    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec',
      {
        method: 'POST',
        body: formData
      }
    );

    const result = await response.json();

    if (result.success) {
      alert('Email sent successfully!');
      setShowEmailPopup(false);
      setEmailForm({
        recipientName: '',
        recipientEmail: '',
        subject: '',
        message: '',
        startDate: '',
        endDate: '',
        totalDays: 0
      });
    } else {
      throw new Error(result.error || 'Failed to send email');
    }
  } catch (error) {
    console.error('Error sending email:', error);
    alert('Failed to send email: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const calculateMonthlyAverage = () => {
    if (filteredData.length === 0) return 0;
    // Calculate average of latest 3 months (or all if less than 3)
    const latestRecords = filteredData.slice(0, Math.min(3, filteredData.length));
    const sum = latestRecords.reduce((acc, curr) => acc + (curr.overallDone || 0), 0);
    return (sum / latestRecords.length).toFixed(2);
  };

  const getPerformanceStatus = (percentage) => {
    if (percentage >= 90) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 75) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 60) return { text: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
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

  // PIP Page Component
  if (showPIPPage) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-50 z-10 py-2">
            <div className="flex items-center">
              <button
                onClick={handleBackToMain}
                className="mr-4 px-2 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">PIP Records</h1>
            </div>
            {/* <button
              onClick={fetchPIPData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh PIP Data
            </button> */}
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div
              className="overflow-x-auto"
              style={{ maxHeight: "calc(100vh - 180px)" }}
            >
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                      Employee Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                      Latest Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                      3-Month Average
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                      End Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                      Total Days
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                      Email Content
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pipData.length > 0 ? (
                    pipData
                      .filter((record) => record.status !== "Done")
                      .map((record, index) => (
                        <tr
                          key={record.id}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.timestamp}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.employeeName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.latestScore}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.monthlyAverage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : record.status === "In Progress"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : record.status === "Extended"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {record.status || "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.startDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.endDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.totalDays}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div
                              className="max-w-md truncate"
                              title={record.emailContent}
                            >
                              {record.emailContent}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleExtendClick(record)}
                                disabled={
                                  pipActionLoading[`${record.id}-extend`]
                                }
                                className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs flex items-center justify-center min-w-[60px] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {pipActionLoading[`${record.id}-extend`] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  "Extend"
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  updatePIPStatus(
                                    record.id,
                                    record.employeeName,
                                    "Done",
                                    "done"
                                  )
                                }
                                disabled={pipActionLoading[`${record.id}-done`]}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs flex items-center justify-center min-w-[60px] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {pipActionLoading[`${record.id}-done`] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  "Done"
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No PIP records available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {showExtendPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Extend PIP Period
                  </h2>
                  <button
                    onClick={() => {
                      setShowExtendPopup(false);
                      setSelectedPIPRecord(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Employee:</strong>{" "}
                      {selectedPIPRecord?.employeeName}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={extendForm.startDate}
                        onChange={(e) =>
                          handleExtendFormChange("startDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={extendForm.endDate}
                        onChange={(e) =>
                          handleExtendFormChange("endDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Days
                      </label>
                      <input
                        type="text"
                        value={extendForm.totalDays}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowExtendPopup(false);
                        setSelectedPIPRecord(null);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExtendSubmit}
                      disabled={pipActionLoading["extend-submit"]}
                      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pipActionLoading["extend-submit"] ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Update Dates
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const monthlyAverage = selectedEmployee ? calculateMonthlyAverage() : 0;
  const performanceStatus = getPerformanceStatus(monthlyAverage);

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
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedEmployee
                ? `${selectedEmployee}'s Score Card`
                : "Balanced Score Card"}
            </h1>
            {selectedEmployee && (
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                History View
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handlePIPClick}
              className="space-x-2 px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
            >
              <Activity size={18} />
              <span>PIP</span>
            </button>
            {/* <button
              onClick={
                selectedEmployee
                  ? () => fetchHistoryData(selectedEmployee)
                  : fetchData
              }
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button> */}
          </div>
        </div>

        {selectedEmployee && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Latest 3 Months Average
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {monthlyAverage}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Based on {Math.min(3, filteredData.length)} most recent records
              </p>
            </div>
            <div
              className={`bg-white rounded-lg shadow p-6 ${performanceStatus.bg}`}
            >
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Performance Status
              </h3>
              <p className={`text-2xl font-bold ${performanceStatus.color}`}>
                {performanceStatus.text}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Total Records
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {filteredData.length}
              </p>
            </div>
          </div>
        )}

        {selectedEmployee && monthlyAverage < 75 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-red-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-red-800">
                  Performance Below Threshold
                </h4>
                <p className="text-sm text-red-600">
                  This employee's performance is below 75%. Consider sharing
                  performance feedback.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSharePIP(selectedEmployee)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center whitespace-nowrap ml-4"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Share Performance
            </button>
          </div>
        )}

        {selectedEmployee && monthlyAverage >= 75 && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-green-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-green-800">
                  Good Performance
                </h4>
                <p className="text-sm text-green-600">
                  This employee is performing well. You can share positive
                  feedback.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSharePIP(selectedEmployee)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center whitespace-nowrap ml-4"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Share Performance
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div
            className="overflow-x-auto"
            style={{ maxHeight: "calc(100vh - 180px)" }}
          >
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    NAME
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    DATE START
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    DATE END
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    TARGET
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    Actual Week Done
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    Actual Work Done On Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    WORK Not Done On Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    Work Done On Time %
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    Work Not Done
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    Work Not Done %
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                    Overall Done %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((person, index) => (
                    <tr
                      key={person.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.dateStart}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.dateEnd}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.target}
                      </td>
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
                    <td
                      colSpan="11"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showEmailPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Share Performance Scorecard
              </h2>
              <button
                onClick={() => setShowEmailPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={emailForm.recipientName}
                  onChange={(e) =>
                    handleEmailFormChange("recipientName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter recipient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailForm.recipientEmail}
                  onChange={(e) =>
                    handleEmailFormChange("recipientEmail", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="recipient@example.com"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={emailForm.startDate}
                    onChange={(e) =>
                      handleEmailFormChange("startDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={emailForm.endDate}
                    onChange={(e) =>
                      handleEmailFormChange("endDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Days
                  </label>
                  <input
                    type="text"
                    value={emailForm.totalDays}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) =>
                    handleEmailFormChange("subject", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) =>
                    handleEmailFormChange("message", e.target.value)
                  }
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your message"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowEmailPopup(false);
                    setIsNewPIPRecord(false); // Reset the flag when canceling
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisReport;