import React, { useEffect, useState } from 'react';
import { HistoryIcon, Plus, X } from 'lucide-react';
import useDataStore from '../store/dataStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Indent = () => {
  const navigate = useNavigate();
  const { addIndent } = useDataStore();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    post: '',
    gender: '',
    department:'',
    prefer: '',
    numberOfPost: '',
    competitionDate: '',
    socialSite: '',
    indentNumber: '',
    timestamp: '',
    experience: '', // New field for experience input
    socialSiteTypes: [], // New field for social site types
  });
  const [indentData, setIndentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [emailData, setEmailData] = useState({
  recipientName: "",
  recipientEmail: "",
  subject: "",
  message: "",
  });

  const handleShareClick = (item) => {
  setSelectedRow(item);
  
  // Create a formatted message with row details
  const formattedMessage = `
Indent Details:

Indent Number: ${item.indentNumber}
Post: ${item.post}
Gender: ${item.gender}
Department: ${item.department}
Prefer: ${item.prefer}
Experience: ${item.experience || 'N/A'}
Number of Posts: ${item.noOfPost}
Completion Date: ${item.completionDate}
Social Site: ${item.socialSite}
Social Site Types: ${item.socialSiteTypes || 'N/A'}

This indent requires your attention.
  `.trim();

  setEmailData({
    recipientName: '',
    recipientEmail: '',
    subject: ``,
    message: formattedMessage
  });
  setShowEmailModal(true);
};

const handleEmailSubmit = async (e) => {
  e.preventDefault();
  
  if (!emailData.recipientEmail || !emailData.subject || !emailData.message) {
    toast.error('Please fill all required fields');
    return;
  }

  try {
    setSubmitting(true);
    
    const response = await fetch('https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec', {
      method: 'POST',
      body: new URLSearchParams({
        action: 'shareViaEmail',
        recipientEmail: emailData.recipientEmail,
        subject: emailData.subject,
        message: emailData.message,
        documents: JSON.stringify([]) // You can add documents if needed
      }),
    });

    const result = await response.json();

    if (result.success) {
      toast.success('Email sent successfully!');
      setShowEmailModal(false);
      setEmailData({
        recipientName: '',
        recipientEmail: '',
        subject: '',
        message: ''
      });
    } else {
      toast.error('Failed to send email: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Email send error:', error);
    toast.error('Failed to send email!');
  } finally {
    setSubmitting(false);
  }
};

const handleEmailInputChange = (e) => {
  const { name, value } = e.target;
  setEmailData(prev => ({
    ...prev,
    [name]: value
  }));
};

  const fetchDepartments = async () => {
  try {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec?sheet=Master&action=fetch'
    );
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.length > 0) {
      // Extract unique departments from Column B (index 1), skip header row
      const deptList = result.data
        .slice(1) // Skip header row
        .map(row => row[1]) // Column B is index 1
        .filter(dept => dept && dept.trim() !== '') // Remove empty values
        .filter((dept, index, self) => self.indexOf(dept) === index); // Get unique values
      
      setDepartments(deptList);
    }
  } catch (error) {
    console.error('Error fetching departments:', error);
  }
};

  const handleCreativeClick = (item) => {
    // Navigate to JobPoster page with indent data
    navigate('/jobPoster', { 
      state: { 
        post: item.post,
        experience: item.experience,
        indentNumber: item.indentNumber
      }
    });
  };

  // Social site options
  const socialSiteOptions = [
    'Instagram',
    'Facebook',
    'LinkedIn',
    'Referral',
    'Job Consultancy',
  ];

  useEffect(() => {
    const loadData = async () => {
      setTableLoading(true);
      const result = await fetchIndentDataFromRow7();
      if (result.success) {
        console.log('Data from row 7:', result.data);
      } else {
        console.error('Error:', result.error);
      }
      await fetchDepartments();
      setTableLoading(false);
    };
    loadData();
  }, []);

const generateIndentNumber = async () => {
  try {
    const result = await fetchLastIndentNumber();
    
    if (result.success) {
      const nextNumber = result.lastIndentNumber + 1;
      return `REC-${String(nextNumber).padStart(2, '0')}`;
    }
    // Fallback if fetch fails
    return 'REC-01';
  } catch (error) {
    console.error('Error generating indent number:', error);
    return 'REC-01';
  }
};

const getCurrentTimestamp = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

  const fetchIndentDataFromRow7 = async () => {
  try {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec?sheet=INDENT&action=fetch'
    );
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.length >= 7) {
      // Get data starting from row 7 (array index 6) to end
      const dataFromRow7 = result.data.slice(6);
      
      // Find headers (assuming they're in row 6 - array index 5)
      const headers = result.data[5].map(h => h.trim());
      
      // Find column indices for important fields
      const timestampIndex = headers.indexOf('Timestamp');
      const indentNumberIndex = headers.indexOf('Indent Number');
      const postIndex = headers.indexOf('Post');
      const genderIndex = headers.indexOf('Gender');
      const departmentIndex = headers.indexOf('Department');
       const preferIndex = headers.indexOf('Prefer');
         const noOFPostIndex = headers.indexOf('Number Of Posts');
         const completionDateIndex = headers.indexOf('Completion Date');
         const socialSiteIndex = headers.indexOf('Social Site');
         const experienceIndex = headers.indexOf('Experience')
         const socialSiteTypesIndex = headers.indexOf('Social Site Types')
      // Add other column indices as needed
      
      // Process the data
      const processedData = dataFromRow7.map(row => ({
        timestamp: row[timestampIndex],
        indentNumber: row[indentNumberIndex],
        post: row[postIndex],
        gender: row[genderIndex],
        department: row[departmentIndex],
        prefer:row[preferIndex],
        noOfPost:row[noOFPostIndex],
        completionDate:row[completionDateIndex],
        socialSite:row[socialSiteIndex],
        experience:row[experienceIndex],
        socialSiteTypes:row[socialSiteTypesIndex],
        // Add other fields as needed
      }));
      setIndentData(processedData)
      return {
        success: true,
        data: processedData,
        headers: headers
      };
    } else {
      return {
        success: false,
        error: 'Not enough rows in sheet data'
      };
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const fetchLastIndentNumber = async () => {
  try {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec?sheet=INDENT&action=fetch'
    );
    
    const result = await response.json();
    console.log('Full sheet data:', result); // Debugging
    
    if (result.success && result.data && result.data.length > 1) {
      // Find the first row with actual headers (skip empty rows)
      let headerRowIndex = 0;
      while (headerRowIndex < result.data.length && 
             result.data[headerRowIndex].every(cell => !cell || cell.trim() === '')) {
        headerRowIndex++;
      }
      
      if (headerRowIndex >= result.data.length) {
        throw new Error('No header row found in sheet');
      }
      
      const headers = result.data[headerRowIndex].map(h => h ? h.trim().toLowerCase() : '');
      console.log('Headers found:', headers);
      
      // Try to find the indent number column by common names
      const possibleNames = ['indent number', 'indentnumber', 'indent_no', 'indentno', 'indent'];
      let indentNumberIndex = -1;
      
      for (const name of possibleNames) {
        indentNumberIndex = headers.indexOf(name);
        if (indentNumberIndex !== -1) break;
      }
      
      if (indentNumberIndex === -1) {
        // If still not found, try to find by position (from your screenshot it's column B/index 1)
        indentNumberIndex = 1;
        console.warn('Using fallback column index 1 for indent number');
      }
      
      // Find the last non-empty row with data
      let lastDataRowIndex = result.data.length - 1;
      while (lastDataRowIndex > headerRowIndex && 
             (!result.data[lastDataRowIndex][indentNumberIndex] || 
              result.data[lastDataRowIndex][indentNumberIndex].trim() === '')) {
        lastDataRowIndex--;
      }
      
      if (lastDataRowIndex <= headerRowIndex) {
        return {
          success: true,
          lastIndentNumber: 0,
          message: 'No data rows found'
        };
      }
      
      const lastIndentNumber = result.data[lastDataRowIndex][indentNumberIndex];
      console.log('Last indent number found:', lastIndentNumber);
      
      // Extract numeric part from "REC-01" format
      let numericValue = 0;
      if (typeof lastIndentNumber === 'string') {
        const match = lastIndentNumber.match(/\d+/);
        numericValue = match ? parseInt(match[0]) : 0;
      } else {
        numericValue = parseInt(lastIndentNumber) || 0;
      }
      
      return {
        success: true,
        lastIndentNumber: numericValue,
        fullLastIndent: lastIndentNumber
      };
    } else {
      return {
        success: true,
        lastIndentNumber: 0,
        message: 'Sheet is empty or has no data rows'
      };
    }
  } catch (error) {
    console.error('Error in fetchLastIndentNumber:', error);
    return {
      success: false,
      error: error.message,
      lastIndentNumber: 0
    };
  }
};





  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialSiteTypeChange = (e) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          socialSiteTypes: [...prev.socialSiteTypes, value]
        };
      } else {
        return {
          ...prev,
          socialSiteTypes: prev.socialSiteTypes.filter(type => type !== value)
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.post ||
      !formData.gender ||
      !formData.numberOfPost ||
      !formData.competitionDate ||
      !formData.socialSite
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    // Additional validation for experience if prefer is "Experience"
    if (formData.prefer === 'Experience' && !formData.experience) {
      toast.error('Please enter experience details');
      return;
    }

    // Additional validation for social site types if socialSite is "Yes"
    if (formData.socialSite === 'Yes' && formData.socialSiteTypes.length === 0) {
      toast.error('Please select at least one social site type');
      return;
    }

    try {
      setSubmitting(true);
      // Generate indent number and timestamp
      const indentNumber = await generateIndentNumber();
      const timestamp = getCurrentTimestamp();

      // Format the competition date to MM/DD/YYYY for Google Sheets
      const formattedDate = formatDateForSheet(formData.competitionDate);
      console.log(indentNumber);

      // Prepare row data with additional columns for experience and social site types
      const rowData = [
        timestamp,
        indentNumber,
        formData.post,
        formData.gender,
        formData.prefer,
        formData.numberOfPost,
        formattedDate,
        formData.socialSite,
        "NeedMore",
        "", // Column J (empty)
        "", // Column K (empty)
        "", // Column L (empty)
        "", // Column M (empty)
        "", // Column N (empty)
        "", // Column O (empty)
        formData.prefer === 'Experience' ? formData.experience : "", // Column P - Experience
        formData.socialSite === 'Yes' ? formData.socialSiteTypes.join(', ') : "", // Column Q - Social Site Types
        formData.department,
      ];

      const response = await fetch('https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec', {
        method: 'POST',
        body: new URLSearchParams({
          sheetName: 'INDENT',
          action: 'insert',
          rowData: JSON.stringify(rowData),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Indent submitted successfully!');
        setFormData({
          post: '',
          gender: '',
          department:'',
          prefer: '',
          numberOfPost: '',
          competitionDate: '',
          socialSite: '',
          indentNumber: '',
          timestamp: '',
          experience: '',
          socialSiteTypes: [],
        });
        setShowModal(false);
        // Refresh the table data
        setTableLoading(true);
        await fetchIndentDataFromRow7();
        setTableLoading(false);
      } else {
        toast.error('Failed to insert: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Insert error:', error);
      toast.error('Something went wrong!');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to format date for Google Sheets
  const formatDateForSheet = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleCancel = () => {
    setFormData({
      post: '',
      gender: '',
      department:'',
      prefer: '',
      numberOfPost: '',
      competitionDate: '',
      socialSite: '',
      indentNumber: '',
      timestamp: '',
      experience: '',
      socialSiteTypes: [],
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6 page-content p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Indent</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </>
          ) : (
            <>
              <Plus size={16} className="mr-2" />
              Create Indent
            </>
          )}
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-gray-800">
                Create New Indent
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post *
                </label>
                <input
                  type="text"
                  name="post"
                  value={formData.post}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Any">Any</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prefer
                </label>
                <select
                  name="prefer"
                  value={formData.prefer}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="Experience">Experience</option>
                  <option value="Fresher">Fresher</option>
                </select>
              </div>

              {/* Experience input field - only show when prefer is Experience */}
              {formData.prefer === "Experience" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience *
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter experience details"
                    required={formData.prefer === "Experience"}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number Of Post *
                </label>
                <input
                  type="number"
                  name="numberOfPost"
                  value={formData.numberOfPost}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter number of posts"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Competition Date *
                </label>
                <input
                  type="date"
                  name="competitionDate"
                  value={formData.competitionDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Social Site *
                </label>
                <select
                  name="socialSite"
                  value={formData.socialSite}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Social Site Types checklist - only show when socialSite is Yes */}
              {formData.socialSite === "Yes" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Social Site Types *
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {socialSiteOptions.map((option) => (
                      <div key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          id={option}
                          value={option}
                          checked={formData.socialSiteTypes.includes(option)}
                          onChange={handleSocialSiteTypeChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={option}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-gray-800">
                Share Indent via Email
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEmailSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={emailData.recipientName}
                  onChange={handleEmailInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter recipient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="recipientEmail"
                  value={emailData.recipientEmail}
                  onChange={handleEmailInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={emailData.subject}
                  onChange={handleEmailInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={emailData.message}
                  onChange={handleEmailInputChange}
                  rows="6"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-vertical"
                  placeholder="Enter your message"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Email"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Indent Management
        </h2>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {/* Add max-height and overflow-y to the table container */}
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 shadow">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Indent Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prefer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. of Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Social Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Social Site Types
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tableLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center flex-col items-center">
                        <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-2"></div>
                        <span className="text-gray-600 text-sm">
                          Loading indent data...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : indentData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <p className="text-gray-500">No indent data found.</p>
                    </td>
                  </tr>
                ) : (
                  indentData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.indentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCreativeClick(item)}
                            className="bg-blue-600 px-4 py-2 rounded-md text-white hover:bg-blue-700 transition-colors min-w-[80px]"
                          >
                            Creative
                          </button>
                          <button
                            onClick={() => handleShareClick(item)}
                            className="bg-green-600 px-4 py-2 rounded-md text-white hover:bg-green-700 transition-colors min-w-[80px]"
                          >
                            Share
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.post}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.prefer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.experience}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.noOfPost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-sm text-gray-900 break-words">
                          {item.completionDate
                            ? (() => {
                                const date = new Date(item.completionDate);
                                if (!date || isNaN(date.getTime()))
                                  return "Invalid date";
                                const day = date
                                  .getDate()
                                  .toString()
                                  .padStart(2, "0");
                                const month = (date.getMonth() + 1)
                                  .toString()
                                  .padStart(2, "0");
                                const year = date.getFullYear();
                                const hours = date
                                  .getHours()
                                  .toString()
                                  .padStart(2, "0");
                                const minutes = date
                                  .getMinutes()
                                  .toString()
                                  .padStart(2, "0");
                                const seconds = date
                                  .getSeconds()
                                  .toString()
                                  .padStart(2, "0");
                                return (
                                  <div>
                                    <div className="font-medium break-words">
                                      {`${day}/${month}/${year}`}
                                    </div>
                                    <div className="text-xs text-gray-500 break-words">
                                      {`${hours}:${minutes}:${seconds}`}
                                    </div>
                                  </div>
                                );
                              })()
                            : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.socialSite}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.socialSiteTypes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Indent;