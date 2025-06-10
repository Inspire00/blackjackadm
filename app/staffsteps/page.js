'use client';

import { useState, useEffect } from 'react';
import { format, isValid } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar as CalendarIcon, Clock, Footprints, List, User } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

/**
 * Steps Tracking Dashboard component for staff step analysis
 * @returns {JSX.Element}
 */
export default function StepsDashboard() {
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [staffStats, setStaffStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEfficiencyBoard, setShowEfficiencyBoard] = useState(false);
  const roles = ['Waiters', 'Barmen', 'Chefs', 'Kitchen Staff', 'Security', 'Potters'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const stats = {};
        for (const role of roles) {
          const response = await fetch(
            `/api/steps-stats?role=${role.toLowerCase()}&startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error for ${role}! Status: ${response.status}`);
          }
          const data = await response.json();
          if (!data.staffStats) {
            throw new Error(`No staffStats for ${role} in response`);
          }
          stats[role] = data.staffStats.sort((a, b) => a.staff.name.localeCompare(b.staff.name));
        }
        setStaffStats(stats);
      } catch (error) {
        console.error('Error fetching steps stats:', error);
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
   * Render staff tab content
   * @param {string} role - Staff role (e.g., Waiters, Barmen)
   * @returns {JSX.Element}
   */
  const renderStaffTab = (role) => {
    const stats = staffStats[role] || [];
    const totalSteps = stats.reduce((sum, stat) => sum + stat.totalSteps, 0);
    const totalEvents = stats.reduce((sum, stat) => sum + stat.totalEvents, 0);
    const stepAverage = totalEvents > 0 ? (totalSteps / totalEvents).toFixed(2) : 0;

    const chartData = stats.map((stat) => ({
      name: `${stat.staff.name} ${stat.staff.surname}`,
      steps: stat.totalSteps,
    }));

    return (
      <div className="p-6 bg-gray-900 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">{role} Steps Statistics</h2>
        <div className="mb-6 flex gap-4">
          <div className="flex items-center gap-2 bg-white rounded-lg">
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
          <div className="flex items-center gap-2 bg-white rounded-lg">
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.staff.id}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-[#ea176b]">
                      {stat.staff.name} {stat.staff.surname}
                    </h3>
                  </div>
                  <p className="text-gray-950 mb-2 flex items-center gap-2">
                    <span className="font-medium">ID:</span> {stat.staff.id}
                  </p>
                  <p className="text-gray-600 mb-2 flex items-center gap-2">
                    <span className="font-medium">Email:</span> {stat.staff.email}
                  </p>
                  <p className="text-gray-600 mb-4 flex items-center gap-2">
                    <span className="font-medium">Phone:</span> {stat.staff.phone}
                  </p>
                  <hr className="my-4 border-gray-200" />
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Steps Chart</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[chartData.find((d) => d.name === `${stat.staff.name} ${stat.staff.surname}`)]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="steps" fill="#ea176b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[#ea176b] font-semibold mb-2 flex items-center gap-2">
                    <Footprints className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Total Steps:</span> {stat.totalSteps}
                  </p>
                  <p className="text-gray-700 mb-2 flex items-center gap-2">
                    <List className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Total Events:</span> {stat.totalEvents}
                  </p>
                  <p className="text-gray-700 font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Step Average:</span> {(stat.totalSteps / (stat.totalEvents || 1)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Period Summary</h3>
              <p className="text-[#ea176b] font-semibold mb-2 flex items-center gap-2">
                <Footprints className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Total Steps:</span> {totalSteps}
              </p>
              <p className="text-gray-700 mb-2 flex items-center gap-2">
                <List className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Total Events:</span> {totalEvents}
              </p>
              <p className="text-gray-700 font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Step Average:</span> {stepAverage}
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  /**
   * Render Efficiency Board
   * @returns {JSX.Element}
   */
  const renderEfficiencyBoard = () => {
    const efficiencyData = roles.flatMap((role) =>
      (staffStats[role] || []).map((stat) => ({
        name: `${stat.staff.name} ${stat.staff.surname}`,
        stepAverage: (stat.totalSteps / (stat.totalEvents || 1)).toFixed(2),
        role,
      }))
    ).sort((a, b) => b.stepAverage - a.stepAverage);

    return (
      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-[#104845]">Efficiency Board</h2>
        <ResponsiveContainer width="100%" height={efficiencyData.length * 50 + 100}>
          <BarChart data={efficiencyData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="stepAverage" fill="#ea176b" name="Step Average" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-[#ea176b] mb-8 text-center">
          Steps Tracking Dashboard
        </h1>
        <Tabs>
          <TabList className="flex flex-wrap justify-center gap-2 mb-6">
            {roles.map((role) => (
              <Tab
                key={role}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200 focus:outline-none"
                selectedClassName="bg-blue-800"
              >
                {role}
              </Tab>
            ))}
          </TabList>
          {roles.map((role) => (
            <TabPanel key={role}>{renderStaffTab(role)}</TabPanel>
          ))}
        </Tabs>
        <div
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200 text-center"
          onClick={() => setShowEfficiencyBoard(!showEfficiencyBoard)}
        >
          {showEfficiencyBoard ? 'Hide Efficiency Board' : 'Show Efficiency Board'}
        </div>
        {showEfficiencyBoard && renderEfficiencyBoard()}
      </div>
    </div>
  );
}