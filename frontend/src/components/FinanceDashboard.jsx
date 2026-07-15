// components/FinanceDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaMoneyBillWave,
  FaChartLine,
  FaUsers,
  FaWallet,
  FaHandHoldingUsd,
  FaBuilding,
  FaUserCog,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaRupeeSign,
  FaPercentage,
  FaChartPie,
  FaFileInvoice,
  FaCalendarAlt
} from 'react-icons/fa';
import { financeService } from '../services/financeService';

const FinanceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [salaryBreakdown, setSalaryBreakdown] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const [overviewRes, salaryRes] = await Promise.all([
        financeService.getOverview(),
        financeService.getSalaryBreakdown()
      ]);
      setOverview(overviewRes.data);
      setSalaryBreakdown(salaryRes.data);
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
      setError('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <FaSpinner className="w-12 h-12 text-[#00D4FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#00D4FF]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Earnings</p>
              <p className="text-2xl font-bold text-[#00D4FF]">{formatCurrency(overview?.totalEarnings)}</p>
            </div>
            <div className="w-12 h-12 bg-[#00D4FF]/10 rounded-xl flex items-center justify-center">
              <FaMoneyBillWave className="w-6 h-6 text-[#00D4FF]" />
            </div>
          </div>
        </div>

        <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#EF4444]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-[#EF4444]">{formatCurrency(overview?.totalExpenses)}</p>
            </div>
            <div className="w-12 h-12 bg-[#EF4444]/10 rounded-xl flex items-center justify-center">
              <FaWallet className="w-6 h-6 text-[#EF4444]" />
            </div>
          </div>
        </div>

        <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#06D6A0]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Net Profit</p>
              <p className={`text-2xl font-bold ${overview?.netProfit >= 0 ? 'text-[#06D6A0]' : 'text-[#EF4444]'}`}>
                {formatCurrency(overview?.netProfit)}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#06D6A0]/10 rounded-xl flex items-center justify-center">
              <FaChartLine className="w-6 h-6 text-[#06D6A0]" />
            </div>
          </div>
        </div>

        <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-4 border border-[#7C3AED]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Share Value</p>
              <p className="text-2xl font-bold text-[#7C3AED]">{formatCurrency(overview?.totalShareValue)}</p>
            </div>
            <div className="w-12 h-12 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center">
              <FaPercentage className="w-6 h-6 text-[#7C3AED]" />
            </div>
          </div>
        </div>
      </div>

      {/* Shareholders Section */}
      <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaUsers className="text-[#00D4FF]" />
          Shareholders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overview?.shareholders?.map((shareholder, index) => (
            <div key={index} className="bg-[#0A0A0F]/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{shareholder.name}</p>
                  <p className="text-sm text-gray-400">{shareholder.shares} Shares</p>
                </div>
                <div className="text-right">
                  <p className="text-[#00D4FF] font-bold">{formatCurrency(shareholder.shareValue)}</p>
                  <p className="text-xs text-gray-400">{shareholder.percentage?.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[#00D4FF]/10 flex justify-between text-sm text-gray-400">
          <span>Total Shares: {overview?.totalShares}</span>
          <span>Share Price: {formatCurrency(overview?.sharePrice)}</span>
        </div>
      </div>

      {/* Salary Breakdown */}
      {salaryBreakdown && (
        <div className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaUserCog className="text-[#00D4FF]" />
            Salary Breakdown
          </h3>
          
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Total Salary</p>
              <p className="text-lg font-bold text-white">{formatCurrency(salaryBreakdown.total)}</p>
            </div>
            <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Paid</p>
              <p className="text-lg font-bold text-[#06D6A0]">{formatCurrency(salaryBreakdown.paid)}</p>
            </div>
            <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Due</p>
              <p className="text-lg font-bold text-[#EF4444]">{formatCurrency(salaryBreakdown.due)}</p>
            </div>
          </div>

          {/* By Role */}
          <div className="space-y-2">
            {Object.entries(salaryBreakdown.byRole || {}).map(([role, data]) => (
              <div key={role} className="bg-[#0A0A0F]/30 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium capitalize">{role}</p>
                    <p className="text-xs text-gray-400">{data.count} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">Total: {formatCurrency(data.total)}</p>
                    <div className="flex gap-3 text-xs">
                      <span className="text-[#06D6A0]">Paid: {formatCurrency(data.paid)}</span>
                      <span className="text-[#EF4444]">Due: {formatCurrency(data.due)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceDashboard;