import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import {
  Users,
  UserCheck,
  UserX,
  Clock, 
  UserPlus,
  TrendingUp,
  FileText,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const [totalEmployee, setTotalEmployee] = useState(0);
  const [activeEmployee, setActiveEmployee] = useState(0);
  const [leftEmployee, setLeftEmployee] = useState(0);
  const [leaveThisMonth, setLeaveThisMonth] = useState(0);
  const [monthlyHiringData, setMonthlyHiringData] = useState([]);
  const [designationData, setDesignationData] = useState([]);
  const [employeeStatusData, setEmployeeStatusData] = useState([]);
  const [leaveTypeData, setLeaveTypeData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);

  // Parse DD/MM/YYYY format date
  const parseSheetDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month, day);
  };

  // Employee Status Distribution Data
  useEffect(() => {
    const employeeStatus = [
      { name: 'Active', value: activeEmployee, color: '#10B981' },
      { name: 'Resigned', value: leftEmployee, color: '#EF4444' }
    ];
    setEmployeeStatusData(employeeStatus);
  }, [activeEmployee, leftEmployee]);

const fetchJoiningCount = async () => {
  try {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec?sheet=JOINING&action=fetch'
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch data from JOINING sheet');
    }

    const rawData = result.data || result;
    if (!Array.isArray(rawData)) {
      throw new Error('Expected array data not received');
    }

    // Headers are row 6 → index 5
    const headers = rawData[5];
    const dataRows = rawData.length > 6 ? rawData.slice(6) : [];

    // Find index of "Status", "Date of Joining", "Designation" and Column Y (index 24)
    const statusIndex = headers.findIndex(
      h => h && h.toString().trim().toLowerCase() === "status"
    );
    
    const dateOfJoiningIndex = headers.findIndex(
      h => h && h.toString().trim().toLowerCase().includes("date of joining")
    );

    const designationIndex = headers.findIndex(
      h => h && h.toString().trim().toLowerCase() === "designation"
    );

    const columnYIndex = 24; // Column Y index

    let activeCount = 0;
    const monthlyHiring = {};
    const designationCounts = {};
    
    // Initialize monthly hiring data for the last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentDate.getMonth() - i + 12) % 12;
      const monthYear = `${months[monthIndex]} ${currentDate.getFullYear()}`;
      monthlyHiring[monthYear] = { hired: 0 };
    }

    // Filter out rows that have values in Column Y
    const filteredDataRows = dataRows.filter(row => 
      !row[columnYIndex] || row[columnYIndex].toString().trim() === ''
    );

    if (statusIndex !== -1) {
      activeCount = filteredDataRows.filter(
        row => row[statusIndex]?.toString().trim().toLowerCase() === "active"
      ).length;
    }

    // Count hires by month if date of joining column exists
    if (dateOfJoiningIndex !== -1) {
      filteredDataRows.forEach(row => {
        const dateStr = row[dateOfJoiningIndex];
        if (dateStr) {
          const date = parseSheetDate(dateStr);
          if (date) {
            const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
            if (monthlyHiring[monthYear]) {
              monthlyHiring[monthYear].hired += 1;
            } else {
              monthlyHiring[monthYear] = { hired: 1 };
            }
          }
        }
      });
    }

    // Count employees by designation
    if (designationIndex !== -1) {
      filteredDataRows.forEach(row => {
        const designation = row[designationIndex]?.toString().trim();
        if (designation) {
          if (designationCounts[designation]) {
            designationCounts[designation] += 1;
          } else {
            designationCounts[designation] = 1;
          }
        }
      });

      // Convert to array format for the chart
      const designationArray = Object.keys(designationCounts).map(key => ({
        designation: key,
        employees: designationCounts[key]
      }));

      setDesignationData(designationArray);
    }

    // Update state with filtered data
    setActiveEmployee(filteredDataRows.length);
    
    // Return both counts and monthly hiring data
    return { 
      total: filteredDataRows.length, 
      active: activeCount,
      monthlyHiring 
    };

  } catch (error) {
    console.error("Error fetching joining count:", error);
    return { total: 0, active: 0, monthlyHiring: {} };
  }
};

const fetchDepartmentData = async () => {
  try {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec?sheet=JOINING&action=fetch'
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch data from JOINING sheet');
    }

    const rawData = result.data || result;
    if (!Array.isArray(rawData)) {
      throw new Error('Expected array data not received');
    }

    // Headers are row 6 → index 5
    const headers = rawData[5];
    const dataRows = rawData.length > 6 ? rawData.slice(6) : [];

    // Find index of "Department" column (Column U, index 20) and Column Y (index 24)
    const departmentIndex = 20;
    const columnYIndex = 24;

    // Filter out rows that have values in Column Y
    const filteredDataRows = dataRows.filter(row => 
      !row[columnYIndex] || row[columnYIndex].toString().trim() === ''
    );

    const departmentCounts = {};

    // Count employees by department
    filteredDataRows.forEach(row => {
      const department = row[departmentIndex]?.toString().trim();
      if (department) {
        if (departmentCounts[department]) {
          departmentCounts[department] += 1;
        } else {
          departmentCounts[department] = 1;
        }
      }
    });

    // Convert to array format for the chart
    const departmentArray = Object.keys(departmentCounts).map(key => ({
      department: key,
      employees: departmentCounts[key]
    }));

    return departmentArray;

  } catch (error) {
    console.error("Error fetching department data:", error);
    return [];
  }
};

  const fetchLeaveCount = async () => {
    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbxmXLxCqjFY9yRDLoYEjqU9LTcpfV7r9ueBuOsDsREkdGknbdE_CZBW7ZHTdP3n0NzOfQ/exec?sheet=LEAVING&action=fetch'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data from LEAVING sheet');
      }

      const rawData = result.data || result;
      if (!Array.isArray(rawData)) {
        throw new Error('Expected array data not received');
      }

      const headers = rawData[5];       // Row 6 headers
      const dataRows = rawData.slice(6); // Row 7 onwards

      // Check for Column D (index 3) for "Left This Month" count
      let thisMonthCount = 0;
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (dataRows.length > 0) {
        // Use column D (index 3) for date of leaving
        thisMonthCount = dataRows.filter(row => {
          const dateStr = row[3]; // Column D (index 3)
          if (dateStr) {
            const parsedDate = parseSheetDate(dateStr);
            return (
              parsedDate &&
              parsedDate.getMonth() === currentMonth &&
              parsedDate.getFullYear() === currentYear
            );
          }
          return false;
        }).length;
      }

      // Count leaving by month (for the chart)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyLeaving = {};
      
      // Initialize monthly leaving data for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (now.getMonth() - i + 12) % 12;
        const monthYear = `${months[monthIndex]} ${now.getFullYear()}`;
        monthlyLeaving[monthYear] = { left: 0 };
      }

      dataRows.forEach(row => {
        const dateStr = row[3]; // Use Column D (index 3) for date of leaving
        if (dateStr) {
          const date = parseSheetDate(dateStr);
          if (date) {
            const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
            if (monthlyLeaving[monthYear]) {
              monthlyLeaving[monthYear].left += 1;
            } else {
              monthlyLeaving[monthYear] = { left: 1 };
            }
          }
        }
      });

      // Update states
      setLeftEmployee(dataRows.length);
      setLeaveThisMonth(thisMonthCount);

      return { total: dataRows.length, monthlyLeaving };

    } catch (error) {
      console.error("Error fetching leave count:", error);
      return { total: 0, monthlyLeaving: {} };
    }
  };

  const prepareMonthlyHiringData = (hiringData, leavingData) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const result = [];
    
    // Get data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentDate.getMonth() - i + 12) % 12;
      const monthYear = `${months[monthIndex]} ${currentDate.getFullYear()}`;
      
      result.push({
        month: months[monthIndex],
        hired: hiringData[monthYear]?.hired || 0,
        left: leavingData[monthYear]?.left || 0
      });
    }
    
    return result;
  };

  // Color palette for charts
  const getTypeColor = (index) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    return colors[index % colors.length];
  };

useEffect(() => {
  const fetchData = async () => {
    try {
      const [joiningResult, leavingResult, departmentResult] = await Promise.all([
        fetchJoiningCount(),
        fetchLeaveCount(),
        fetchDepartmentData()
      ]);

      setTotalEmployee(joiningResult.total + leavingResult.total);
      setDepartmentData(departmentResult);

      const monthlyData = prepareMonthlyHiringData(
        joiningResult.monthlyHiring,
        leavingResult.monthlyLeaving
      );

      setMonthlyHiringData(monthlyData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
}, []);

  return (
    <div className="space-y-6 page-content p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">HR Dashboard</h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border p-6 flex items-start">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <Users size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Total Employees</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalEmployee}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6 flex items-start">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <UserCheck size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Active Employees</p>
            <h3 className="text-2xl font-bold text-gray-800">{activeEmployee}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6 flex items-start">
          <div className="p-3 rounded-full bg-amber-100 mr-4">
            <Clock size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">On Resigned</p>
            <h3 className="text-2xl font-bold text-gray-800">{leftEmployee}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6 flex items-start">
          <div className="p-3 rounded-full bg-red-100 mr-4">
            <UserX size={24} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Left This Month</p>
            <h3 className="text-2xl font-bold text-gray-800">{leaveThisMonth}</h3>
          </div>
        </div>
      </div>

      {/* New Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Status Distribution Chart */}
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Users size={20} className="mr-2" />
            Employee Status Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={employeeStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {employeeStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ color: '#374151' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise Employee Count Chart */}
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Users size={20} className="mr-2" />
            Department-wise Employee Count
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="department" stroke="#374151" />
                <YAxis stroke="#374151" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#374151'
                  }}
                />
                <Bar dataKey="employees" name="Employees">
                  {departmentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 3 === 0 ? '#EF4444' : index % 3 === 1 ? '#10B981' : '#3B82F6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Designation-wise Employee Count */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <UserPlus size={20} className="mr-2" />
          Designation-wise Employee Count
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={designationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="designation" stroke="#374151" />
              <YAxis stroke="#374151" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#374151'
                }}
              />
              <Bar dataKey="employees" name="Employees">
                {designationData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 3 === 0 ? '#EF4444' : index % 3 === 1 ? '#10B981' : '#3B82F6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;