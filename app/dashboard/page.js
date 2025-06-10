'use client';

import { useState, useEffect } from 'react';
import { format, isValid } from 'date-fns';
import { Calendar as CalendarIcon, Clock, DollarSign, List, User, Wallet } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

/**
 * Dashboard component for staff management
 * @returns {JSX.Element}
 */
export default function Dashboard() {
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [waitersStats, setWaitersStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/staff-stats?startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.waitersStats) {
          throw new Error('No waitersStats in response');
        }
        setWaitersStats(
          data.waitersStats.sort((a, b) => a.waiter.name.localeCompare(b.waiter.name))
        );
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate && isValid(startDate) && isValid(endDate)) {
      fetchData();
    }
  }, [startDate, endDate]);

  /**
   * Handle hourly rate change for a waiter
   * @param {string} waiterId - Waiter ID
   * @param {string} value - New hourly rate
   */
  const handleHourlyRateChange = (waiterId, value) => {
    const rate = parseFloat(value) || 0;
    setWaitersStats((prev) =>
      prev.map((stat) =>
        stat.waiter.id === waiterId
          ? { ...stat, hourlyRate: rate, grossEarnings: rate * stat.totalHours }
          : stat
      )
    );
  };

  /**
   * Render staff tab content
   * @param {string} role - Staff role (e.g., Waiters, Barmen)
   * @returns {JSX.Element}
   */
  const renderStaffTab = (role) => (
    <div className="p-6  bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">{role} Statistics</h2>
      {role === 'Waiters' ? (
        <>
          <div className="mb-6 flex gap-4">
            <div className="flex items-center gap-2  bg-white rounded-lg">
              <CalendarIcon className="w-5 h-5 text-gray-600" />
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div className="flex items-center gap-2  bg-white rounded-lg">
              <CalendarIcon className="w-5 h-5 text-gray-600" />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>
          {error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {waitersStats.map((stat) => (
                <div
                  key={stat.waiter.id}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-[#ea176b]">
                      {stat.waiter.name} {stat.waiter.surname}
                    </h3>
                  </div>
                  <p className="text-gray-950 mb-2 flex items-center gap-2">
                    <span className="font-medium">ID:</span> {stat.waiter.id}
                  </p>
                  <p className="text-gray-600 mb-2 flex items-center gap-2">
                    <span className="font-medium">Email:</span> {stat.waiter.email}
                  </p>
                  <p className="text-gray-600 mb-4 flex items-center gap-2">
                    <span className="font-medium">Phone:</span> {stat.waiter.phone}
                  </p>
                  <hr className="my-4 border-gray-200" />
                  <p className="text-[#ea176b] font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Total Hours:</span> {stat.totalHours.toFixed(2)}
                  </p>
                  <p className="text-gray-700 mb-2 flex items-center gap-2">
                    <List className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Total Events:</span> {stat.totalEvents}
                  </p>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-blue-600" />
                      <span>Hourly Rate:</span>
                    </label>
                    <input
                      type="number"
                      value={stat.hourlyRate || ''}
                      onChange={(e) => handleHourlyRateChange(stat.waiter.id, e.target.value)}
                      className="border rounded-lg p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter hourly rate"
                   min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-red-700 font-semibold flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-600" />
                    <span>Gross Earnings:</span> R{stat.grossEarnings.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-600">
          No data available for {role}. Please create the respective database collection to view statistics.
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-[#ea176b] mb-8 text-center">
          Staff Management Dashboard
        </h1>
        <Tabs>
          <TabList className="flex flex-wrap justify-center gap-2 mb-6">
            {['Waiters', 'Barmen', 'Chefs', 'Kitchen Staff', 'Security', 'Potters'].map((role) => (
              <Tab
                key={role}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200 focus:outline-none"
                selectedClassName="bg-blue-800"
              >
                {role}
              </Tab>
            ))}
          </TabList>
          {['Waiters', 'Barmen', 'Chefs', 'Kitchen Staff', 'Security', 'Potters'].map((role) => (
            <TabPanel key={role}>{renderStaffTab(role)}</TabPanel>
          ))}
        </Tabs>
      </div>
    </div>
  );
}