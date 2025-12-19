import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chef } from '../assets/images';

const AddInventoryItem = () => {
  const [formData, setFormData] = useState({
    name: '',
    expiryDate: '',
    quantity: '',
    unit: 'kg',
    consumptionRate: '',
    brand: ''
  });

  const [errors, setErrors] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  // Consumption rate options
  const consumptionRateOptions = [
    { value: 'low', label: 'Low (Used rarely)' },
    { value: 'medium', label: 'Medium (Used regularly)' },
    { value: 'high', label: 'High (Used daily)' },
    { value: 'very_high', label: 'Very High (Used multiple times daily)' }
  ];

  // Unit options
  const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'litre', label: 'Litre (L)' },
    { value: 'ml', label: 'Millilitre (ml)' },
    { value: 'piece', label: 'Piece' },
    { value: 'packet', label: 'Packet' },
    { value: 'bottle', label: 'Bottle' },
    { value: 'box', label: 'Box' }
  ];

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calendar functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Initialize selected date from form data
  useEffect(() => {
    if (formData.expiryDate) {
      const parsedDate = parseDate(formData.expiryDate);
      if (parsedDate) {
        setSelectedDate(parsedDate);
        setCurrentDate(parsedDate);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Update selected date if expiryDate changes
    if (name === 'expiryDate' && value) {
      const parsedDate = parseDate(value);
      if (parsedDate) {
        setSelectedDate(parsedDate);
        setCurrentDate(parsedDate);
      }
    }
  };

  const handleDateSelect = (day) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(selected);
    
    const formattedDate = formatDate(selected);
    setFormData({
      ...formData,
      expiryDate: formattedDate
    });
    
    setShowCalendar(false);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateYear = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + direction);
    setCurrentDate(newDate);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
    
    const formattedDate = formatDate(today);
    setFormData({
      ...formData,
      expiryDate: formattedDate
    });
  };

  const handleClearDate = () => {
    setSelectedDate(null);
    setFormData({
      ...formData,
      expiryDate: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    
    if (!formData.consumptionRate) {
      newErrors.consumptionRate = 'Consumption rate is required';
    }
    
    setErrors(newErrors);
    
    // If no errors, submit form
    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
      // Here you would typically make an API call
      alert('Item added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        expiryDate: '',
        quantity: '',
        unit: 'kg',
        consumptionRate: '',
        brand: ''
      });
      setSelectedDate(null);
    }
  };

  // Render calendar
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = formatDate(date) === formatDate(new Date());
      const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
            isSelected
              ? 'bg-blue-600 text-white'
              : isToday
              ? 'bg-blue-100 text-blue-600'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return (
      <div ref={calendarRef} className="absolute top-full right-0 mt-1 z-50">
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => navigateYear(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ⟨⟨
              </button>
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ⟨
              </button>
            </div>
            
            <div className="font-medium">
              {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => navigateMonth(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ⟩
              </button>
              <button
                type="button"
                onClick={() => navigateYear(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ⟩⟩
              </button>
            </div>
          </div>
          
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
          
          {/* Calendar Footer */}
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleTodayClick}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleClearDate}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    );
  };

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
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              
              <Link to="/add-item" className="text-blue-600 font-medium">
                Add Item
              </Link>
            </nav>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Inventory Item</h1>
          <p className="text-gray-600 mt-2">Track your kitchen items with details</p>
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Item Name (Required) */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Rice, Milk, Olive Oil"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                )}
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quantity (Required) */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-900 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="e.g., 2.5"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.quantity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm mt-2">{errors.quantity}</p>
                  )}
                </div>

                {/* Unit Selection */}
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-900 mb-2">
                    Unit *
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {unitOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Consumption Rate (Required) */}
              <div>
                <label htmlFor="consumptionRate" className="block text-sm font-medium text-gray-900 mb-2">
                  Consumption Rate *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {consumptionRateOptions.map((option) => (
                    <label 
                      key={option.value} 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.consumptionRate === option.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="consumptionRate"
                        value={option.value}
                        checked={formData.consumptionRate === option.value}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.consumptionRate && (
                  <p className="text-red-500 text-sm mt-2">{errors.consumptionRate}</p>
                )}
              </div>

              {/* Expiry Date (Optional) with Calendar Dropdown */}
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-900 mb-2">
                  Expiry Date (Optional)
                </label>
                <div className="relative">
                  <div className="flex">
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="YYYY-MM-DD"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="px-4 py-3 border border-gray-300 border-l-0 rounded-r-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      📅
                    </button>
                  </div>
                  
                  {/* Calendar Dropdown */}
                  {showCalendar && renderCalendar()}
                  
                  <p className="text-gray-500 text-sm mt-2">
                    Leave empty for non-perishable items. Click the calendar icon to select a date.
                  </p>
                </div>
              </div>

              {/* Brand (Optional) */}
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-900 mb-2">
                  Brand (Optional)
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g., Amul, Fortune, Local"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add to Inventory
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: '',
                      expiryDate: '',
                      quantity: '',
                      unit: 'kg',
                      consumptionRate: '',
                      brand: ''
                    });
                    setErrors({});
                    setSelectedDate(null);
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset Form
                </button>
                <Link
                  to="/dashboard"
                  className="flex-1 py-3 text-center border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
              </div>

              {/* Required Fields Note */}
              <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
                <p>* Required fields</p>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">How to fill this form?</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Consumption Rate:</strong> Helps predict when you'll need to restock</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Expiry Date:</strong> Click the calendar icon to select a date for perishable items</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Brand:</strong> Useful for price comparison across different brands</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                <span className="text-xl font-bold">GruhMate Inventory</span>
              </div>
              <p className="text-gray-400 mt-2">Smart kitchen management system</p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2026 GruhMate. All rights reserved.</p>
              <p className="text-gray-500 text-sm mt-2">Add Item Form</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AddInventoryItem;