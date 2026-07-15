// components/Finance/SharesOverview.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaMoneyBillWave,
  FaWallet,
  FaChartLine,
  FaBuilding,
  FaPercentage,
  FaRupeeSign,
  FaArrowUp,
  FaArrowDown,
  FaCoins,
  FaChartPie,
  FaCalculator,
  FaInfoCircle,
  FaCrown,
  FaMedal,
  FaTrophy,
  FaStar,
  FaEye,
  FaEyeSlash,
  FaExpand,
  FaCompress,
  FaDownload,
  FaPrint,
  FaCalendarAlt,
  FaClock,
  FaLongArrowAltUp,   // Replacing FaTrendUp
  FaLongArrowAltDown  // Replacing FaTrendDown
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const SharesOverview = ({ overview, loading }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4">Loading financial data...</p>
      </div>
    );
  }

  // Calculations
  const initialSharePrice = 15;
  const currentSharePrice = overview?.sharePrice || 15;
  const shareGrowth = ((currentSharePrice - initialSharePrice) / initialSharePrice) * 100;
  const totalInvestment = overview?.shareholders?.reduce((sum, s) => sum + s.investment, 0) || 15000;
  const totalShares = overview?.totalShares || 1000;
  const companyValue = overview?.companyValue || 15000;

  // Prepare chart data for share price history
  const sharePriceHistory = {
    labels: ['Initial', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Current'],
    datasets: [
      {
        label: 'Share Price (NPR)',
        data: [
          15,
          15 + (shareGrowth * 0.1),
          15 + (shareGrowth * 0.2),
          15 + (shareGrowth * 0.4),
          15 + (shareGrowth * 0.6),
          15 + (shareGrowth * 0.8),
          currentSharePrice
        ],
        borderColor: '#00D4FF',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#00D4FF',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  // Doughnut chart data for shareholder distribution
  const shareholderData = {
    labels: overview?.shareholders?.map(s => s.name) || [],
    datasets: [
      {
        data: overview?.shareholders?.map(s => s.shares) || [],
        backgroundColor: ['#00D4FF', '#7C3AED', '#06D6A0', '#F59E0B', '#EF4444', '#EC4899'],
        borderColor: ['#00D4FF', '#7C3AED', '#06D6A0', '#F59E0B', '#EF4444', '#EC4899'],
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  // Bar chart data for shareholder comparison
  const shareholderComparisonData = {
    labels: overview?.shareholders?.map(s => s.name) || [],
    datasets: [
      {
        label: 'Shares',
        data: overview?.shareholders?.map(s => s.shares) || [],
        backgroundColor: ['#00D4FF', '#7C3AED'],
        borderColor: ['#00D4FF', '#7C3AED'],
        borderWidth: 2,
        borderRadius: 8
      },
      {
        label: 'Investment (NPR)',
        data: overview?.shareholders?.map(s => s.investment) || [],
        backgroundColor: ['#06D6A0', '#F59E0B'],
        borderColor: ['#06D6A0', '#F59E0B'],
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9CA3AF',
          font: {
            size: 12,
            family: 'Inter'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 17, 24, 0.95)',
        borderColor: '#00D4FF',
        borderWidth: 1,
        titleColor: '#FFFFFF',
        bodyColor: '#D1D5DB'
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#9CA3AF'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#D1D5DB',
          font: {
            size: 13,
            family: 'Inter'
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 17, 24, 0.95)',
        borderColor: '#00D4FF',
        borderWidth: 1,
        titleColor: '#FFFFFF',
        bodyColor: '#D1D5DB',
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} shares (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* TOP STATS CARDS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#111118] to-[#1a1a2e] backdrop-blur-sm rounded-xl p-5 border border-[#00D4FF]/20 hover:border-[#00D4FF]/40 transition-all shadow-lg shadow-[#00D4FF]/5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <FaBuilding className="text-[#00D4FF]" />
                Company Value
              </p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(companyValue)}</p>
              <p className="text-xs text-gray-500 mt-1">
                ↑ {shareGrowth > 0 ? '+' : ''}{shareGrowth.toFixed(1)}% from initial
              </p>
            </div>
            <div className="w-12 h-12 bg-[#00D4FF]/10 rounded-xl flex items-center justify-center border border-[#00D4FF]/20">
              <FaBuilding className="w-6 h-6 text-[#00D4FF]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#111118] to-[#1a1a2e] backdrop-blur-sm rounded-xl p-5 border border-[#06D6A0]/20 hover:border-[#06D6A0]/40 transition-all shadow-lg shadow-[#06D6A0]/5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <FaCoins className="text-[#06D6A0]" />
                Share Price
              </p>
              <p className="text-2xl font-bold text-[#06D6A0] mt-1">Rs. {currentSharePrice.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  shareGrowth > 0 ? 'bg-[#06D6A0]/20 text-[#06D6A0]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                }`}>
                  {shareGrowth > 0 ? <FaArrowUp className="inline mr-1" /> : <FaArrowDown className="inline mr-1" />}
                  {Math.abs(shareGrowth).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500">from Rs. 15.00</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-[#06D6A0]/10 rounded-xl flex items-center justify-center border border-[#06D6A0]/20">
              <FaCoins className="w-6 h-6 text-[#06D6A0]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#111118] to-[#1a1a2e] backdrop-blur-sm rounded-xl p-5 border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 transition-all shadow-lg shadow-[#F59E0B]/5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <FaMoneyBillWave className="text-[#F59E0B]" />
                Total Investment
              </p>
              <p className="text-2xl font-bold text-[#F59E0B] mt-1">{formatCurrency(totalInvestment)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {totalShares} shares × Rs. 15.00
              </p>
            </div>
            <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center border border-[#F59E0B]/20">
              <FaMoneyBillWave className="w-6 h-6 text-[#F59E0B]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#111118] to-[#1a1a2e] backdrop-blur-sm rounded-xl p-5 border border-[#7C3AED]/20 hover:border-[#7C3AED]/40 transition-all shadow-lg shadow-[#7C3AED]/5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <FaChartLine className="text-[#7C3AED]" />
                Net Profit
              </p>
              <p className={`text-2xl font-bold mt-1 ${overview?.netProfit >= 0 ? 'text-[#06D6A0]' : 'text-[#EF4444]'}`}>
                {formatCurrency(overview?.netProfit)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {overview?.netProfit >= 0 ? 'Profitable' : 'In Loss'}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center border border-[#7C3AED]/20">
              <FaChartLine className="w-6 h-6 text-[#7C3AED]" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* SHARE PRICE GROWTH CHART */}
      {/* ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaArrowUp className="text-[#00D4FF]" />
              Share Price Growth
            </h3>
            <p className="text-sm text-gray-400">Historical share price performance</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              {showDetails ? <FaEyeSlash /> : <FaEye />}
              {showDetails ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        </div>
        
        <div className="h-64">
          <Line 
            data={sharePriceHistory} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  ...chartOptions.plugins.legend,
                  display: false
                }
              }
            }} 
          />
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-[#00D4FF]/10"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
                  <p className="text-gray-400">Initial Price</p>
                  <p className="text-white font-bold">Rs. 15.00</p>
                </div>
                <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
                  <p className="text-gray-400">Current Price</p>
                  <p className="text-[#00D4FF] font-bold">Rs. {currentSharePrice.toFixed(2)}</p>
                </div>
                <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
                  <p className="text-gray-400">Total Growth</p>
                  <p className={`font-bold ${shareGrowth >= 0 ? 'text-[#06D6A0]' : 'text-[#EF4444]'}`}>
                    {shareGrowth >= 0 ? '+' : ''}{shareGrowth.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-[#0A0A0F]/50 rounded-lg p-3 text-center">
                  <p className="text-gray-400">Value Increase</p>
                  <p className={`font-bold ${shareGrowth >= 0 ? 'text-[#06D6A0]' : 'text-[#EF4444]'}`}>
                    {formatCurrency((currentSharePrice - 15) * totalShares)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ============================================ */}
      {/* SHAREHOLDER DISTRIBUTION & COMPARISON */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doughnut Chart - Share Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaChartPie className="text-[#00D4FF]" />
            Share Distribution
          </h3>
          <div className="h-72">
            <Doughnut data={shareholderData} options={doughnutOptions} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {overview?.shareholders?.map((s, index) => (
              <div key={index} className="flex items-center justify-between bg-[#0A0A0F]/50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ 
                    backgroundColor: ['#00D4FF', '#7C3AED', '#06D6A0', '#F59E0B'][index % 4] 
                  }} />
                  <span className="text-gray-300">{s.name}</span>
                </div>
                <span className="text-white font-medium">{s.percentage?.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bar Chart - Shareholder Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaCalculator className="text-[#00D4FF]" />
            Shareholder Comparison
          </h3>
          <div className="h-72">
            <Bar data={shareholderComparisonData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  ...chartOptions.plugins.legend,
                  position: 'top'
                }
              },
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  beginAtZero: true
                }
              }
            }} />
          </div>
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* SHAREHOLDER DETAIL CARDS */}
      {/* ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-[#111118]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00D4FF]/10"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaUsers className="text-[#00D4FF]" />
          Shareholder Details
          <span className="text-sm text-gray-400 ml-2">
            (Total: {formatNumber(totalShares)} shares)
          </span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overview?.shareholders?.map((shareholder, index) => {
            const shareValue = shareholder.shares * currentSharePrice;
            const initialShareValue = shareholder.shares * 15;
            const valueGrowth = ((shareValue - initialShareValue) / initialShareValue) * 100;
            const isMajority = shareholder.percentage > 50;
            
            return (
              <div 
                key={index} 
                className={`bg-[#0A0A0F]/50 rounded-xl p-5 border transition-all ${
                  isMajority ? 'border-[#F59E0B]/30 hover:border-[#F59E0B]/50' : 'border-[#00D4FF]/20 hover:border-[#00D4FF]/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold text-white">{shareholder.name}</h4>
                      {isMajority && (
                        <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FaCrown className="w-3 h-3" />
                          Majority
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-400">Shares</p>
                        <p className="text-sm font-medium text-white">{formatNumber(shareholder.shares)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Percentage</p>
                        <p className="text-sm font-medium text-[#00D4FF]">{shareholder.percentage?.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Investment</p>
                        <p className="text-sm font-medium text-[#F59E0B]">{formatCurrency(shareholder.investment)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Current Value</p>
                        <p className="text-sm font-medium text-[#06D6A0]">{formatCurrency(shareValue)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${valueGrowth >= 0 ? 'text-[#06D6A0]' : 'text-[#EF4444]'}`}>
                      {valueGrowth >= 0 ? '+' : ''}{valueGrowth.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-400">Value Growth</p>
                    <div className="mt-1 flex items-center gap-1 justify-end">
                      {valueGrowth >= 0 ? (
                        <FaArrowUp className="text-[#06D6A0] w-3 h-3" />
                      ) : (
                        <FaArrowDown className="text-[#EF4444] w-3 h-3" />
                      )}
                      <span className={`text-xs ${valueGrowth >= 0 ? 'text-[#06D6A0]' : 'text-[#EF4444]'}`}>
                        from Rs. {initialShareValue.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 w-full bg-[#0A0A0F] rounded-full h-2">
                  <div
                    className={`rounded-full h-2 transition-all duration-500 ${
                      isMajority ? 'bg-gradient-to-r from-[#F59E0B] to-[#F59E0B]/50' : 'bg-gradient-to-r from-[#00D4FF] to-[#7C3AED]'
                    }`}
                    style={{ width: `${shareholder.percentage || 0}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ============================================ */}
      {/* COMPANY SUMMARY */}
      {/* ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-[#111118] to-[#1a1a2e] rounded-xl p-6 border border-[#00D4FF]/10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">Initial Investment</p>
            <p className="text-lg font-bold text-white">Rs. 15,000</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Total Shares</p>
            <p className="text-lg font-bold text-white">1,000</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Shareholders</p>
            <p className="text-lg font-bold text-white">{overview?.shareholders?.length || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Share Price</p>
            <p className="text-lg font-bold text-[#00D4FF]">Rs. {currentSharePrice.toFixed(2)}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SharesOverview;