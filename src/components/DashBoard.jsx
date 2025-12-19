import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { chef } from '../assets/images';

const Dashboard = () => {
  // Dummy data for low stock items
  const [lowStockItems] = useState([
    { id: 1, itemName: 'Olive Oil/16 oz', minQuantity: 1, availableQuantity: 3, inventoryUnit: 'Table spoon', status: 'low' },
    { id: 2, itemName: 'Ketchup/32 oz', minQuantity: 10, availableQuantity: 8, inventoryUnit: '1 Liter', status: 'low' },
    { id: 3, itemName: 'Burger/3.4 oz', minQuantity: 25, availableQuantity: 35, inventoryUnit: 'Ounce', status: 'normal' },
    { id: 4, itemName: 'Lettuce/16 oz', minQuantity: 20, availableQuantity: 15, inventoryUnit: 'Ounce', status: 'low' },
    { id: 5, itemName: 'Tomatoes/case', minQuantity: 5, availableQuantity: 3, inventoryUnit: 'Ounce', status: 'low' },
    { id: 6, itemName: 'Carrots/case', minQuantity: 5, availableQuantity: 4, inventoryUnit: 'Ounce', status: 'low' },
    { id: 7, itemName: 'Red Peppers/case', minQuantity: 5, availableQuantity: 5, inventoryUnit: 'Ounce', status: 'critical' },
    { id: 8, itemName: 'Rich Sauce', minQuantity: 10, availableQuantity: 9, inventoryUnit: 'Ounce', status: 'low' },
  ]);

  // Dummy stats data
  const [dashboardStats] = useState({
    totalItems: 42,
    lowStockCount: 5,
    expiringSoon: 8,
    monthlySavings: 1250,
  });

  // Dummy recent activity
  const [recentActivity] = useState([
    { id: 1, action: 'Added', item: 'Milk', quantity: '2 Liters', time: '2 hours ago' },
    { id: 2, action: 'Used', item: 'Eggs', quantity: '4 pieces', time: '4 hours ago' },
    { id: 3, action: 'Updated', item: 'Rice stock', quantity: '+2 kg', time: 'Yesterday' },
    { id: 4, action: 'Expired', item: 'Bread', quantity: '1 packet', time: '2 days ago' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img 
                src={chef} 
                alt="GruhMate Logo" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-gray-900">GruhMate</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Home
              </Link>
              <Link to="/dashboard" className="text-blue-600 font-medium">
                Dashboard
              </Link>
              
              <Link to="/compare" className="text-gray-700 hover:text-blue-600 font-medium">
                Price Compare
              </Link>
            </nav>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">Welcome, User</p>
                <p className="text-xs text-gray-500">Family Account</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your kitchen inventory and status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats.totalItems}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-blue-600">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{dashboardStats.lowStockCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-red-600">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{dashboardStats.expiringSoon}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-orange-600">⏰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Savings</p>
                <p className="text-2xl font-bold text-green-600 mt-1">₹{dashboardStats.monthlySavings}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-green-600">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Low Stock Items Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Low Stock Items</h2>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Add Item
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Item Name</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Min Quantity</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Available Quantity</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Inventory Unit</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">
                          <div className="font-medium text-gray-900">{item.itemName}</div>
                        </td>
                        <td className="py-3 px-6">
                          <div className="font-medium text-gray-900">{item.minQuantity}</div>
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex items-center">
                            <span className={`font-bold ${
                              item.availableQuantity < item.minQuantity ? 'text-red-600' : 
                              item.availableQuantity === item.minQuantity ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {item.availableQuantity}
                            </span>
                            {item.availableQuantity < item.minQuantity && (
                              <span className="ml-2 text-xs text-red-600">(Low)</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <div className="text-gray-600">{item.inventoryUnit}</div>
                        </td>
                        <td className="py-3 px-6">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === 'critical' ? 'bg-red-100 text-red-800' :
                            item.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.status === 'critical' ? 'Critical' : 
                             item.status === 'low' ? 'Low' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {lowStockItems.length} items
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-blue-50 text-blue-600 border-blue-200">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600">➕</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Add Item</span>
              </button>
              <button className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600">📝</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Update Stock</span>
              </button>
              <button className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600">🛒</span>
                </div>
                <span className="text-sm font-medium text-gray-900">Shopping List</span>
              </button>
              <button className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-orange-600">📊</span>
                </div>
                <span className="text-sm font-medium text-gray-900">View Reports</span>
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.action === 'Added' ? 'bg-green-100' :
                      activity.action === 'Used' ? 'bg-blue-100' :
                      activity.action === 'Updated' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <span className={`text-sm ${
                        activity.action === 'Added' ? 'text-green-600' :
                        activity.action === 'Used' ? 'text-blue-600' :
                        activity.action === 'Updated' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {activity.action === 'Added' ? '+' :
                         activity.action === 'Used' ? '-' :
                         activity.action === 'Updated' ? '↻' : '✕'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">{activity.item}</span>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {activity.action} {activity.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Inventory Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Normal Stock</span>
                    <span className="font-medium text-gray-900">32 items</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Low Stock</span>
                    <span className="font-medium text-gray-900">5 items</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Critical</span>
                    <span className="font-medium text-gray-900">2 items</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Items Added Today</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Items Used Today</span>
                  <span className="font-bold">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Value</span>
                  <span className="font-bold">₹5,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Waste Prevented</span>
                  <span className="font-bold">₹320</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
                <img 
                  src={chef} 
                  alt="GruhMate Logo" 
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold">GruhMate Dashboard</span>
              </div>
              <p className="text-gray-400 mt-2">Smart kitchen management system</p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2026 GruhMate. All rights reserved.</p>
              <p className="text-gray-500 text-sm mt-2">Dashboard v1.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;