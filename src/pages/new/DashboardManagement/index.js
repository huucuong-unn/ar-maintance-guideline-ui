import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import DashboardAPI from '../../../API/DashboardAPI'; // Adjust the import path as needed

const AdminDashboard = () => {
    // State for dashboard data
    const [dashboardData, setDashboardData] = useState({
        numberOfActiveGuidelines: 0,
        numberOfInactiveGuidelines: 0,
        numberOfActiveAccount: 0,
        numberOfInactiveAccount: 0,
        numberOfActiveModels: 0,
        numberOfInactiveModels: 0,
        totalRevenue: 0,
        top3Company: [],
        monthRevenueList: [],
        pointOptionRevenueList: [],
        top3Guidelines: [],
    });

    // State for loading and error handling
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dashboard data on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const response = await DashboardAPI.getDashboardAdmin();

                // Assuming the API returns the data directly in response.data
                if (response.code === 1000 && response.result) {
                    setDashboardData(response.result);
                } else {
                    throw new Error('Failed to fetch dashboard data');
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // Loading state component
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    // Error state component
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-red-50">
                <div className="text-xl text-red-600">
                    Error: {error}
                    <button
                        onClick={() => window.location.reload()}
                        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Guidelines Card */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Guidelines</h2>
                        <div className="flex justify-between">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                                Active: {dashboardData.numberOfActiveGuidelines}
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
                                Inactive: {dashboardData.numberOfInactiveGuidelines}
                            </span>
                        </div>
                    </div>

                    {/* Accounts Card */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Accounts</h2>
                        <div className="flex justify-between">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                                Active: {dashboardData.numberOfActiveAccount}
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
                                Inactive: {dashboardData.numberOfInactiveAccount}
                            </span>
                        </div>
                    </div>

                    {/* Models Card */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Models</h2>
                        <div className="flex justify-between">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                                Active: {dashboardData.numberOfActiveModels}
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
                                Inactive: {dashboardData.numberOfInactiveModels}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Revenue and Guidelines Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Monthly Revenue */}
                    <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
                        <div className="w-full h-96">
                            <BarChart
                                width={500}
                                height={300}
                                data={dashboardData.monthRevenueList}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#8884d8" />
                            </BarChart>
                        </div>
                    </div>

                    {/* Point Option Revenue */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Revenue by Point Option</h2>
                        <div className="w-full h-96">
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={dashboardData.pointOptionRevenueList}
                                    cx={200}
                                    cy={200}
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="revenue"
                                >
                                    {dashboardData.pointOptionRevenueList.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </div>
                    </div>

                    {/* Top 3 Companies and Top Guidelines in one line */}
                    <div className="col-span-full grid grid-cols-2 gap-6">
                        {/* Top 3 Companies */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Top 3 Companies</h2>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 text-left">Company Name</th>
                                        <th className="p-2 text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.top3Company.map((company, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-2">{company.name}</td>
                                            <td className="p-2 text-right">${company.revenue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Top Guidelines */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Top Guidelines</h2>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 text-left">Guideline Name</th>
                                        <th className="p-2 text-right">Scan Times</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.top3Guidelines.map((guideline, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-2">{guideline.name}</td>
                                            <td className="p-2 text-right">{guideline.scanTimes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
