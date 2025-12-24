import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import axios from "axios";
import { chef } from "../assets/images";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => { 

  const { currentUser } = useAuth();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  // const [stocks, setStocks] = useState([]);
const [buyList, setBuyList] = useState([]);


  //  REAL STOCK DATA
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  //  NEW: refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);
  const teamId = localStorage.getItem("teamId");



  //  Fetch stock from backend
  const fetchStocks = async () => {
    try {
      setLoading(true);
      // const teamId = localStorage.getItem("teamId");
      // const { currentUser } = useAuth();
      const teamId = currentUser?.teamId;

      const res = await axios.get(
        // `http://localhost:5000/api/stocks/team/${teamId}`
         `http://localhost:5000/api/stock/team/${teamId}`,{
           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
         }
      );
      setStocks(res.data);
    } catch (err) {
      console.error("Error fetching stocks", err);
    } finally {
      setLoading(false);
    }
  };

  //  Runs on first load AND whenever refreshKey changes
  useEffect(() => {
    fetchStocks();
  }, [refreshKey]);

  //  Detect navigation from StockForm
  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [location.state]);

  // Status logic
  const getStatus = (quantity, requiredQuantity) => {
    if (quantity <= requiredQuantity * 0.3) return "critical";
    if (quantity <= requiredQuantity) return "low";
    return "normal";
  };

  // Dashboard stats (derived)
  const dashboardStats = {
    totalItems: stocks.length,
    lowStockCount: stocks.filter(
      (s) => getStatus(s.quantity, s.requiredQuantity) !== "normal"
    ).length,
    expiringSoon: stocks.filter(
      (s) => s.note && s.note.toLowerCase().includes("day")
    ).length,
    monthlySavings: 1250,
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

const handleDecrease = async (id,name) => {
  try {
     const confirmDelete = window.confirm(`Are you sure you want to delete "${name}" from BuyList?`);
    const res = await axios.patch(
      `http://localhost:5000/api/stock/${id}/decrement`,
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    const updatedStock = res.data.stock;

    setStocks((prev) =>
      prev.map((s) =>
        s._id === id ? { ...s, quantity: updatedStock.quantity } : s
      )
    );

    if (res.data.buyItem) {
      alert(res.data.message);
      navigate("/buylist"); // redirect to BuyList.jsx
    }
  } catch (err) {
    console.error("Decrease error:", err);
  }
};
// const handleDecrease = async (id) => {
//   try {
//     console.log("aayi handleDecrease mein")
//     const res = await axios.patch(
//       `http://localhost:5000/api/stock/${id}/decrement`,
//       {},
//       { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//     );
//     console.log(res)

//     const updatedStock = res.data.stock;

//     setStocks((prev) => {
//       if (res.data.remove) {
//         // remove item completely
//         return prev.filter((s) => s._id !== id);
//       } else {
//         // just update quantity
//         return prev.map((s) =>
//           s._id === id ? { ...s, quantity: updatedStock.quantity } : s
//         );
//       }
//     });

//     if (res.data.buyItem) {
//       // add to buyList state
//       setBuyList((prev) => [...prev, res.data.buyItem]);
//       alert(res.data.message);
//     }
//   } catch (err) {
//     console.error("Decrease error:", err);
//   }
// };


const handleIncrease = async (id) => {
  try {
    const res = await axios.patch(
      `http://localhost:5000/api/stock/${id}/increment`,
      {}, // no body needed, backend increments itself
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    const updatedStock = res.data.stock;

    setStocks((prev) =>
      prev.map((s) =>
        s._id === id ? { ...s, quantity: updatedStock.quantity } : s
      )
    );
  } catch (err) {
    console.error("Increase error:", err);
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img src={chef} alt="GruhMate Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">GruhMate</span>
            </div>

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
              <Link to="/teams" className="text-gray-700 hover:text-blue-600 font-medium">
                Teams Page
              </Link>
              <Link to="/stockform" className="text-gray-700 hover:text-blue-600 font-medium">
                Stock Form
              </Link>
                <Link to="/buylist" className="text-gray-700 hover:text-blue-600 font-medium">
                BuyList
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">Welcome, User</p>
                <p className="text-xs text-gray-500">Family Account</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">U</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of your kitchen inventory and status
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            ["Total Items", dashboardStats.totalItems, "📦"],
            ["Low Stock Items", dashboardStats.lowStockCount, "⚠️"],
            ["Expiring Soon", dashboardStats.expiringSoon, "⏰"],
            ["Monthly Savings", `₹${dashboardStats.monthlySavings}`, "💰"],
          ].map(([title, value, icon], i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">{title}</p>
                  <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <div className="text-2xl">{icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stock Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Low Stock Items</h2>
            <Link
              to="/stockform"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Add Item
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-6">Item Name</th>
                  <th className="text-left py-3 px-6">Min Quantity</th>
                  <th className="text-left py-3 px-6">Available Quantity</th>
                  <th className="text-left py-3 px-6">Inventory Unit</th>
                  <th className="text-left py-3 px-6">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">
                      Loading stock...
                    </td>
                  </tr>
                ) : stocks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">
                      No stock items added yet
                    </td>
                  </tr>
                ) : (
                  stocks.map((item) => {
                    const status = getStatus(
                      item.quantity,
                      item.requiredQuantity
                    );

                    return (
                      <tr key={item._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-6">
                          <div className="font-medium">{item.name}</div>
                          {item.note && (
                            <div className="text-xs text-gray-500">
                              {item.note}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-6">{item.requiredQuantity}</td>
                        <td className="py-3 px-6 font-bold">{item.quantity}</td>
                        <td className="py-3 px-6">{item.unit}</td>
                        <td className="py-3 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              status === "critical"
                                ? "bg-red-100 text-red-800"
                                : status === "low"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {status.toUpperCase()}
                          </span>
                        </td>
                       
                         <td className="py-3 px-6">
          <button 
          // onClick={() => handleDecrease(item._id,item.quantity)}
          onClick={() => handleDecrease(item._id,item.name)}

            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </td>
 <td className="py-3 px-6">
          <button onClick={() => handleIncrease(item._id, item.quantity)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            add
          </button>
        </td>        

                        {/* <button>delete stock</button> */}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 text-sm text-gray-600">
            Showing {stocks.length} items
           
          </div>
        </div>
        <div>
  {/* Stock Table */}
 

  {/* BuyList Section */}
  {buyList.length > 0 && (
    <div style={{ marginTop: "2rem" }}>
      <h3>🛒 BuyList</h3>
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Unit</th>
            <th>Brand</th>
          </tr>
        </thead>
        <tbody>
          {buyList.map((item) => (
            <tr key={item._id}>
              <td>{item.itemName}</td>
              <td>{item.unit}</td>
              <td>{item.brand}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
