// components/Finance/EmployeeSalary.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaUser,
  FaEye,
  FaHandHoldingUsd,
  FaCoins,
  FaPlus,
  FaClock,
  FaSpinner,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUserCog,
  FaCreditCard,
  FaRupeeSign,
  FaInfoCircle,
  FaCalendarCheck,
  FaArrowRight
} from 'react-icons/fa';
import { salaryService } from '../../services/salaryService';

const EmployeeSalary = ({ 
  employees, 
  salaries, 
  onRefresh,
  formatCurrency,
  getRoleBadge,
  getRoleIcon,
  getUserInitials,
  getUserAvatar 
}) => {
  const [loading, setLoading] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [employeeSalaries, setEmployeeSalaries] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceReason, setAdvanceReason] = useState('');
  const [salaryForm, setSalaryForm] = useState({
    employee: '',
    basicSalary: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [missingMonths, setMissingMonths] = useState([]);
  const [showMissingMonths, setShowMissingMonths] = useState(false);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [nextMonth, setNextMonth] = useState(null);
  const [nextYear, setNextYear] = useState(null);

  const fetchEmployeeSalaries = async (employeeId) => {
    try {
      const response = await salaryService.getSalaries({ employee: employeeId });
      setEmployeeSalaries(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch employee salaries:', error);
      return [];
    }
  };

  // Get unique employees with their salary info
  const employeeMap = new Map();
  employees.forEach(emp => {
    const empSalaries = salaries.filter(s => s.employee?._id === emp._id);
    const latestSalary = empSalaries.length > 0 ? empSalaries[empSalaries.length - 1] : null;
    
    let totalDue = 0;
    let totalPaid = 0;
    let totalAdvance = 0;
    let advanceRemaining = 0;
    
    empSalaries.forEach(s => {
      totalDue += s.dueAmount || 0;
      totalPaid += s.paidAmount || 0;
      totalAdvance += s.advanceSalary || 0;
      advanceRemaining += s.advanceRemaining || 0;
    });
    
    employeeMap.set(emp._id, {
      ...emp,
      latestSalary,
      totalSalaries: empSalaries,
      totalDue,
      totalPaid,
      totalAdvance,
      advanceRemaining,
      hasAdvance: empSalaries.some(s => s.advanceSalary > 0),
      monthlySalary: latestSalary?.totalSalary || 0,
      joinDate: emp.createdAt || emp.joinDate || new Date()
    });
  });

  const employeeList = Array.from(employeeMap.values());

  // ============================================
  // FIND NEXT MONTH FOR SALARY CREATION
  // ============================================
  const findNextMonthForSalary = (employeeId) => {
    const empSalaries = salaries.filter(s => s.employee?._id === employeeId);
    
    // Get employee join date
    const employee = employees.find(e => e._id === employeeId);
    if (!employee) return { error: 'Employee not found', month: null, year: null };
    
    const joinDate = new Date(employee.createdAt || employee.joinDate || new Date());
    const joinMonth = joinDate.getMonth() + 1;
    const joinYear = joinDate.getFullYear();
    
    // Get current date
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // If no salaries exist, start from join month
    if (empSalaries.length === 0) {
      return { error: null, month: joinMonth, year: joinYear };
    }
    
    // Find the latest salary month
    let latestMonth = joinMonth;
    let latestYear = joinYear;
    
    empSalaries.forEach(s => {
      if (s.year > latestYear || (s.year === latestYear && s.month > latestMonth)) {
        latestMonth = s.month;
        latestYear = s.year;
      }
    });
    
    // Calculate next month
    let nextMonth = latestMonth + 1;
    let nextYear = latestYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }
    
    // Check if next month is beyond current month
    if (nextYear > currentYear || (nextYear === currentYear && nextMonth > currentMonth)) {
      return { 
        error: 'All salaries are up to date. Please wait for next month.',
        month: null, 
        year: null 
      };
    }
    
    return { error: null, month: nextMonth, year: nextYear };
  };

  // ============================================
  // FIND ALL MISSING MONTHS
  // ============================================
  const findAllMissingMonths = (employeeId) => {
    const empSalaries = salaries.filter(s => s.employee?._id === employeeId);
    
    const employee = employees.find(e => e._id === employeeId);
    if (!employee) return { error: 'Employee not found', months: [] };
    
    const joinDate = new Date(employee.createdAt || employee.joinDate || new Date());
    const joinMonth = joinDate.getMonth() + 1;
    const joinYear = joinDate.getFullYear();
    
    // Get current date
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Check all months from join date to current month
    const missing = [];
    let currentMonthIterator = joinMonth;
    let currentYearIterator = joinYear;
    
    while (currentYearIterator < currentYear || (currentYearIterator === currentYear && currentMonthIterator <= currentMonth)) {
      // Check if salary exists for this month
      const exists = empSalaries.some(s => s.month === currentMonthIterator && s.year === currentYearIterator);
      if (!exists) {
        missing.push({ month: currentMonthIterator, year: currentYearIterator });
      }
      
      currentMonthIterator++;
      if (currentMonthIterator > 12) {
        currentMonthIterator = 1;
        currentYearIterator++;
      }
    }
    
    return { error: null, months: missing };
  };

  // ============================================
  // HANDLE EMPLOYEE SELECTION
  // ============================================
  const handleEmployeeSelect = (e) => {
    const employeeId = e.target.value;
    const employee = employees.find(emp => emp._id === employeeId);
    setSelectedEmployeeData(employee);
    setSalaryForm({
      ...salaryForm,
      employee: employeeId
    });
    setMissingMonths([]);
    setShowMissingMonths(false);
    setError('');
    setIsFormValid(false);
    setNextMonth(null);
    setNextYear(null);

    if (employeeId) {
      // Find next month for salary
      const result = findNextMonthForSalary(employeeId);
      if (result.error) {
        setError(result.error);
        setNextMonth(null);
        setNextYear(null);
        setIsFormValid(false);
      } else if (result.month && result.year) {
        setNextMonth(result.month);
        setNextYear(result.year);
        
        // Find all missing months
        const missingResult = findAllMissingMonths(employeeId);
        if (missingResult.error) {
          setError(missingResult.error);
          setMissingMonths([]);
          setShowMissingMonths(false);
          setIsFormValid(false);
        } else if (missingResult.months.length > 0) {
          setMissingMonths(missingResult.months);
          setShowMissingMonths(true);
          // Check if form is valid (employee selected and salary entered)
          if (salaryForm.basicSalary && parseFloat(salaryForm.basicSalary) > 0) {
            setIsFormValid(true);
          }
        } else {
          setError('No missing months found. All salaries are up to date.');
          setMissingMonths([]);
          setShowMissingMonths(false);
          setIsFormValid(false);
        }
      }
    }
  };

  // ============================================
  // HANDLE SALARY CHANGE
  // ============================================
  const handleSalaryChange = (e) => {
    const value = e.target.value;
    setSalaryForm({...salaryForm, basicSalary: value});
    
    // Check if form is valid
    if (selectedEmployeeData && value && parseFloat(value) > 0 && missingMonths.length > 0) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  };

  // ============================================
  // HANDLE SALARY SUBMIT WITH SMART CREATION
  // ============================================
  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const employee = employees.find(emp => emp._id === salaryForm.employee);
      if (!employee) {
        setError('Please select an employee');
        setLoading(false);
        return;
      }

      // Get all missing months
      const result = findAllMissingMonths(salaryForm.employee);
      
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.months.length === 0) {
        setError('No missing months found');
        setLoading(false);
        return;
      }

      // Create salaries for all missing months
      let createdCount = 0;
      const joinDate = employee.createdAt || employee.joinDate || new Date().toISOString().split('T')[0];

      for (const monthData of result.months) {
        await salaryService.createSalary({
          employee: salaryForm.employee,
          basicSalary: salaryForm.basicSalary,
          month: monthData.month,
          year: monthData.year,
          joinDate: joinDate,
          bonus: 0,
          allowance: 0,
          deductions: 0,
          notes: salaryForm.notes || `Auto-created for ${new Date(monthData.year, monthData.month - 1).toLocaleString('default', { month: 'long' })} ${monthData.year}`
        });
        createdCount++;
      }

      setSuccess(`Successfully created ${createdCount} salary records for ${employee.name}`);
      setShowSalaryModal(false);
      setSalaryForm({
        employee: '',
        basicSalary: '',
        notes: ''
      });
      setMissingMonths([]);
      setShowMissingMonths(false);
      setSelectedEmployeeData(null);
      setIsFormValid(false);
      setNextMonth(null);
      setNextYear(null);
      onRefresh();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create salary records');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await salaryService.processPayment(selectedSalary._id, {
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        reference: paymentReference
      });
      setSuccess(`Payment of ${formatCurrency(parseFloat(paymentAmount))} processed successfully!`);
      setShowPaymentModal(false);
      await onRefresh();
      if (selectedEmployee) {
        await fetchEmployeeSalaries(selectedEmployee._id);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await salaryService.requestAdvance(selectedEmployee._id, {
        amount: parseFloat(advanceAmount),
        reason: advanceReason
      });
      setSuccess(response.message || 'Advance salary approved!');
      setShowAdvanceModal(false);
      await onRefresh();
      if (selectedEmployee) {
        await fetchEmployeeSalaries(selectedEmployee._id);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to request advance salary');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployeeDetails = async (employee) => {
    setSelectedEmployee(employee);
    await fetchEmployeeSalaries(employee._id);
    setShowEmployeeDetails(true);
  };

  const handlePayEmployee = (salary) => {
    setSelectedSalary(salary);
    setPaymentAmount(salary.dueAmount.toString());
    setShowPaymentModal(true);
  };

  const handleRequestAdvance = (employee) => {
    setSelectedEmployee(employee);
    setAdvanceAmount('');
    setAdvanceReason('');
    setShowAdvanceModal(true);
  };

  const handleBulkPay = async (employee) => {
    const unpaidSalaries = employee.totalSalaries.filter(s => s.paymentStatus !== 'Paid');
    
    if (unpaidSalaries.length === 0) {
      setError('No pending salaries for this employee');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const totalDue = unpaidSalaries.reduce((sum, s) => sum + s.dueAmount, 0);
    
    if (!window.confirm(`Pay all pending salaries (Total: ${formatCurrency(totalDue)}) for ${employee.name}?`)) return;

    setLoading(true);
    try {
      for (const salary of unpaidSalaries) {
        await salaryService.processPayment(salary._id, {
          amount: salary.dueAmount,
          method: 'Cash',
          reference: `BULK-${new Date().toISOString().split('T')[0]}`
        });
      }
      
      setSuccess(`All pending salaries paid for ${employee.name}`);
      await onRefresh();
      if (selectedEmployee) {
        await fetchEmployeeSalaries(selectedEmployee._id);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to process bulk payment');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // EMPLOYEE DETAILS MODAL
  // ============================================
  const renderEmployeeDetailsModal = () => {
    if (!selectedEmployee) return null;

    const unpaidSalaries = employeeSalaries.filter(s => s.paymentStatus !== 'Paid');
    const totalDue = unpaidSalaries.reduce((sum, s) => sum + s.dueAmount, 0);

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-[#111118] rounded-2xl p-8 max-w-5xl w-full border border-[#00D4FF]/20 shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {selectedEmployee.profilePicture ? (
                  <img src={selectedEmployee.profilePicture} alt={selectedEmployee.name} className="w-full h-full object-cover" />
                ) : (
                  getUserInitials(selectedEmployee.name)
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedEmployee.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(selectedEmployee.role)}`}>
                    {getRoleIcon(selectedEmployee.role)} {selectedEmployee.role}
                  </span>
                  <span className="text-xs text-gray-400">{selectedEmployee.email}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowEmployeeDetails(false);
                setSelectedEmployee(null);
                setEmployeeSalaries([]);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Total Salary</p>
              <p className="text-lg font-bold text-white">
                {formatCurrency(employeeSalaries.reduce((sum, s) => sum + s.totalSalary, 0))}
              </p>
            </div>
            <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Total Paid</p>
              <p className="text-lg font-bold text-[#06D6A0]">
                {formatCurrency(employeeSalaries.reduce((sum, s) => sum + s.paidAmount, 0))}
              </p>
            </div>
            <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Total Due</p>
              <p className="text-lg font-bold text-[#EF4444]">
                {formatCurrency(employeeSalaries.reduce((sum, s) => sum + s.dueAmount, 0))}
              </p>
            </div>
            <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Advance Remaining</p>
              <p className="text-lg font-bold text-[#F59E0B]">
                {formatCurrency(employeeSalaries.reduce((sum, s) => sum + s.advanceRemaining, 0))}
              </p>
            </div>
          </div>

          {unpaidSalaries.length > 0 && (
            <div className="mb-4 p-3 bg-[#06D6A0]/10 border border-[#06D6A0]/20 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Salaries</p>
                <p className="text-lg font-bold text-[#EF4444]">{formatCurrency(totalDue)}</p>
                <p className="text-xs text-gray-500">{unpaidSalaries.length} months pending</p>
              </div>
              <button
                onClick={() => handleBulkPay(selectedEmployee)}
                disabled={loading}
                className="px-4 py-2 bg-[#06D6A0] text-white rounded-lg hover:bg-[#06D6A0]/80 transition-all"
              >
                <FaMoneyBillWave className="inline mr-2" />
                Pay All ({formatCurrency(totalDue)})
              </button>
            </div>
          )}

          <div className="bg-[#0A0A0F]/50 rounded-xl overflow-hidden">
            <h4 className="text-sm font-medium text-gray-400 p-4 border-b border-[#00D4FF]/10">
              Salary History
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A0A0F]/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Month</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Paid</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Due</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Paid Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#00D4FF]/5">
                  {employeeSalaries.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-6 text-center text-gray-400">
                        No salary records found
                      </td>
                    </tr>
                  ) : (
                    employeeSalaries.map((salary) => (
                      <tr key={salary._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {new Date(salary.year, salary.month - 1).toLocaleString('default', { month: 'long' })} {salary.year}
                        </td>
                        <td className="px-4 py-3 text-sm text-white">{formatCurrency(salary.totalSalary)}</td>
                        <td className="px-4 py-3 text-sm text-[#06D6A0]">{formatCurrency(salary.paidAmount)}</td>
                        <td className="px-4 py-3 text-sm text-[#EF4444]">{formatCurrency(salary.dueAmount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {salary.paymentHistory?.length > 0 
                            ? new Date(salary.paymentHistory[salary.paymentHistory.length - 1].date).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            salary.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-400' :
                            salary.paymentStatus === 'Partial' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {salary.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {salary.paymentStatus !== 'Paid' && (
                            <button
                              onClick={() => {
                                setSelectedSalary(salary);
                                setPaymentAmount(salary.dueAmount.toString());
                                setShowPaymentModal(true);
                              }}
                              className="px-3 py-1 bg-[#06D6A0]/20 text-[#06D6A0] rounded-lg hover:bg-[#06D6A0]/30 transition-all text-xs"
                            >
                              Pay Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {employeeSalaries.some(s => s.paymentHistory?.length > 0) && (
            <div className="mt-4 bg-[#0A0A0F]/50 rounded-xl overflow-hidden">
              <h4 className="text-sm font-medium text-gray-400 p-4 border-b border-[#00D4FF]/10">
                Payment History
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0A0A0F]/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Method</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Reference</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Paid By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00D4FF]/5">
                    {employeeSalaries
                      .filter(s => s.paymentHistory?.length > 0)
                      .flatMap(s => s.paymentHistory.map(p => ({ ...p, month: s.month, year: s.year })))
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((payment, index) => (
                        <tr key={index} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#06D6A0]">{formatCurrency(payment.amount)}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{payment.method}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{payment.reference || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{payment.paidByName || '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  // ============================================
  // ADD SALARY MODAL (SIMPLIFIED)
  // ============================================
  const renderSalaryModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#111118] rounded-2xl p-8 max-w-lg w-full border border-[#00D4FF]/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">Add Salary Records</h3>
            <p className="text-sm text-gray-400">System will automatically find missing months</p>
          </div>
          <button
            onClick={() => {
              setShowSalaryModal(false);
              setMissingMonths([]);
              setShowMissingMonths(false);
              setError('');
              setSelectedEmployeeData(null);
              setIsFormValid(false);
              setNextMonth(null);
              setNextYear(null);
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSalarySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Select Employee *</label>
            <select
              required
              value={salaryForm.employee}
              onChange={handleEmployeeSelect}
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.role}) - Joined: {new Date(emp.createdAt || emp.joinDate || Date.now()).toLocaleDateString()}
                </option>
              ))}
            </select>
            {selectedEmployeeData && (
              <p className="text-xs text-gray-500 mt-1">
                Joined: {new Date(selectedEmployeeData.createdAt || selectedEmployeeData.joinDate || Date.now()).toLocaleDateString()}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Monthly Salary (Rs.) *</label>
            <input
              type="number"
              required
              min="0"
              value={salaryForm.basicSalary}
              onChange={handleSalaryChange}
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              placeholder="50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <textarea
              value={salaryForm.notes}
              onChange={(e) => setSalaryForm({...salaryForm, notes: e.target.value})}
              rows="2"
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              placeholder="Additional notes..."
            />
          </div>

          {/* Next Month Info */}
          {nextMonth && nextYear && (
            <div className="bg-[#00D4FF]/5 border border-[#00D4FF]/20 rounded-lg p-3">
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <FaCalendarAlt className="text-[#00D4FF]" />
                Next salary to create: <span className="text-white font-medium">
                  {new Date(nextYear, nextMonth - 1).toLocaleString('default', { month: 'long' })} {nextYear}
                </span>
              </p>
            </div>
          )}

          {/* Missing Months Display */}
          {showMissingMonths && missingMonths.length > 0 && (
            <div className="bg-[#00D4FF]/5 border border-[#00D4FF]/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-[#00D4FF] mb-2 flex items-center gap-2">
                <FaCalendarCheck className="w-4 h-4" />
                Records to be created:
              </h4>
              <div className="flex flex-wrap gap-2">
                {missingMonths.map((m, index) => (
                  <span key={index} className="text-xs bg-[#0A0A0F] text-gray-300 px-3 py-1 rounded-full border border-[#00D4FF]/10">
                    {new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short' })} {m.year}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Total records: {missingMonths.length} month{missingMonths.length > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <FaExclamationTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !isFormValid || !showMissingMonths || missingMonths.length === 0}
              className={`flex-1 px-6 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                loading || !isFormValid || !showMissingMonths || missingMonths.length === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-[#00D4FF]/20'
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FaArrowRight className="w-4 h-4" />
                  Create {missingMonths.length} Record{missingMonths.length > 1 ? 's' : ''}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSalaryModal(false);
                setMissingMonths([]);
                setShowMissingMonths(false);
                setError('');
                setSelectedEmployeeData(null);
                setIsFormValid(false);
                setNextMonth(null);
                setNextYear(null);
              }}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  // ============================================
  // PAYMENT MODAL
  // ============================================
  const renderPaymentModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#111118] rounded-2xl p-8 max-w-md w-full border border-[#00D4FF]/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Make Payment</h3>
          <button
            onClick={() => {
              setShowPaymentModal(false);
              setSelectedSalary(null);
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-[#0A0A0F]/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-400">Employee</p>
          <p className="text-white font-medium">{selectedSalary?.employeeName}</p>
          <p className="text-sm text-gray-400 mt-2">Due Amount</p>
          <p className="text-2xl font-bold text-[#EF4444]">{formatCurrency(selectedSalary?.dueAmount)}</p>
        </div>

        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Amount *</label>
            <input
              type="number"
              required
              min="1"
              max={selectedSalary?.dueAmount}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="eSewa">eSewa</option>
              <option value="Khalti">Khalti</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Reference (Optional)</label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              placeholder="Transaction ID / Cheque Number"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-[#06D6A0] text-white rounded-lg hover:bg-[#06D6A0]/80 disabled:opacity-50 transition-all"
            >
              {loading ? <FaSpinner className="w-4 h-4 animate-spin inline mr-2" /> : null}
              Process Payment
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedSalary(null);
              }}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  // ============================================
  // ADVANCE SALARY MODAL
  // ============================================
  const renderAdvanceModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#111118] rounded-2xl p-8 max-w-md w-full border border-[#00D4FF]/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Request Advance Salary</h3>
          <button
            onClick={() => {
              setShowAdvanceModal(false);
              setSelectedEmployee(null);
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-[#0A0A0F]/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-400">Employee</p>
          <p className="text-white font-medium">{selectedEmployee?.name}</p>
          <p className="text-sm text-[#F59E0B] mt-2">
            Interest Rate: 3% per annum
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Advance will be deducted in 6 monthly installments
          </p>
          <p className="text-sm text-[#00D4FF] mt-2">
            Max Advance: 3 Months Salary ({formatCurrency(selectedEmployee?.monthlySalary || 0)} × 3 = {formatCurrency((selectedEmployee?.monthlySalary || 0) * 3)})
          </p>
        </div>

        <form onSubmit={handleAdvanceSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Advance Amount *</label>
            <input
              type="number"
              required
              min="1"
              max={(selectedEmployee?.monthlySalary || 0) * 3}
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              placeholder={`Max: ${formatCurrency((selectedEmployee?.monthlySalary || 0) * 3)}`}
            />
            {advanceAmount && parseFloat(advanceAmount) > ((selectedEmployee?.monthlySalary || 0) * 3) && (
              <p className="text-xs text-red-400 mt-1">
                Amount exceeds maximum limit of 3 months salary!
              </p>
            )}
            {advanceAmount && parseFloat(advanceAmount) <= ((selectedEmployee?.monthlySalary || 0) * 3) && (
              <p className="text-xs text-gray-400 mt-1">
                Total with 3% interest: {formatCurrency(parseFloat(advanceAmount) * 1.03)}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Reason</label>
            <textarea
              value={advanceReason}
              onChange={(e) => setAdvanceReason(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              placeholder="Reason for advance salary request..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || (advanceAmount && parseFloat(advanceAmount) > ((selectedEmployee?.monthlySalary || 0) * 3))}
              className="flex-1 px-6 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#F59E0B]/80 disabled:opacity-50 transition-all"
            >
              {loading ? <FaSpinner className="w-4 h-4 animate-spin inline mr-2" /> : null}
              Request Advance
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdvanceModal(false);
                setSelectedEmployee(null);
              }}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaUserCog className="text-[#00D4FF]" />
            Employee Salaries
          </h3>
          <p className="text-sm text-gray-400">Manage employee salaries and advances</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowSalaryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all text-sm"
          >
            <FaPlus className="w-4 h-4" />
            Add Salary
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <FaCheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <FaExclamationTriangle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Employee Cards */}
      {employeeList.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-[#111118]/50 rounded-xl border border-[#00D4FF]/10">
          <FaUsers className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No employees found</p>
          <p className="text-sm">Add employees to manage salaries</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employeeList.map((employee) => (
            <motion.div
              key={employee._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
            >
              {/* Employee Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0">
                  {employee.profilePicture ? (
                    <img src={employee.profilePicture} alt={employee.name} className="w-full h-full object-cover" />
                  ) : (
                    getUserInitials(employee.name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">{employee.name}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(employee.role)}`}>
                      {getRoleIcon(employee.role)} {employee.role}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      employee.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Joined: {new Date(employee.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Salary Summary */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-[#0A0A0F]/50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">Due Amount</p>
                  <p className="text-lg font-bold text-[#EF4444]">{formatCurrency(employee.totalDue || 0)}</p>
                </div>
                <div className="bg-[#0A0A0F]/50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">Total Paid</p>
                  <p className="text-lg font-bold text-[#06D6A0]">{formatCurrency(employee.totalPaid || 0)}</p>
                </div>
                <div className="bg-[#0A0A0F]/50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">Advance Taken</p>
                  <p className="text-lg font-bold text-[#F59E0B]">{formatCurrency(employee.totalAdvance || 0)}</p>
                </div>
                <div className="bg-[#0A0A0F]/50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">Advance Remaining</p>
                  <p className="text-lg font-bold text-[#EF4444]">{formatCurrency(employee.advanceRemaining || 0)}</p>
                </div>
              </div>

              {/* Latest Month Status */}
              {employee.latestSalary && (
                <div className="flex items-center justify-between text-sm bg-[#0A0A0F]/30 rounded-lg p-2 mb-4">
                  <span className="text-gray-400">
                    {new Date(employee.latestSalary.year, employee.latestSalary.month - 1).toLocaleString('default', { month: 'long' })} {employee.latestSalary.year}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    employee.latestSalary.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-400' :
                    employee.latestSalary.paymentStatus === 'Partial' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {employee.latestSalary.paymentStatus}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewEmployeeDetails(employee)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all text-sm"
                >
                  <FaEye className="w-4 h-4" />
                  View Details
                </button>
                {employee.totalDue > 0 && (
                  <button
                    onClick={() => handleBulkPay(employee)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#06D6A0]/10 text-[#06D6A0] rounded-lg hover:bg-[#06D6A0]/20 transition-all text-sm"
                    title={`Pay all pending (${formatCurrency(employee.totalDue)})`}
                  >
                    <FaMoneyBillWave className="w-4 h-4" />
                    Pay All
                  </button>
                )}
                {!employee.hasAdvance && employee.isActive && (
                  <button
                    onClick={() => handleRequestAdvance(employee)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg hover:bg-[#F59E0B]/20 transition-all text-sm"
                  >
                    <FaCoins className="w-4 h-4" />
                    Advance
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showSalaryModal && renderSalaryModal()}
      </AnimatePresence>

      <AnimatePresence>
        {showPaymentModal && renderPaymentModal()}
      </AnimatePresence>

      <AnimatePresence>
        {showAdvanceModal && renderAdvanceModal()}
      </AnimatePresence>

      <AnimatePresence>
        {showEmployeeDetails && renderEmployeeDetailsModal()}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeSalary;