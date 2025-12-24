import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link,useNavigate, useLocation  } from "react-router-dom";
import { chef } from "../assets/images";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";

const BuyList = () => {
  const { currentUser } = useAuth();
  const teamId = currentUser?.teamId;

  const [buyList, setBuyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [detectedItems, setDetectedItems] = useState([]);

  const navigate = useNavigate();
    const location = useLocation(); 
  // Fetch BuyList from backend
  const fetchBuyList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/stock/buylist/${teamId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setBuyList(res.data);
    } catch (err) {
      console.error("Error fetching buylist:", err);
    } finally {
      setLoading(false);
    }
  };
const handleDelete = async (id, itemName) => {
  try {
    console.log(itemName)
    // Confirmation alert before deleting
    const confirmDelete = window.confirm(`Are you sure you want to delete "${itemName}" from BuyList?`);
    if (!confirmDelete) return; // stop if user cancels

    await axios.delete(`http://localhost:5000/api/stock/buylist/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    // Update state
    setBuyList((prev) => prev.filter((item) => item._id !== id));

    // Success alert after deletion
    alert(`"${itemName}" has been deleted from BuyList.`);
  } catch (err) {
    console.error("Delete BuyList error:", err);
    alert("Failed to delete item. Please try again.");
  }
};



  useEffect(() => {
    if (teamId) {
      fetchBuyList();
    }
  }, [teamId]);
  const fileInputRef = useRef(null);

  const openCamera = () => {
    fileInputRef.current.click();
  };
  const onImageSelected = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };
 const scanImage = async () => {
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("teamId", teamId);
      const res = await axios.post(
        "http://localhost:5000/api/scan-stock",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setDetectedItems(res.data);
      // setDetectedItems(res.data.updatedItems); // Gemini output
      console.log("Detected:", res.data);
      console.log(res.data.updatedItems);
      // const items = res.data.updatedItems || res.data;
    setDetectedItems(items);
    
    alert("Scan complete! Please review the items at the bottom of the page.");
    } catch (err) {
      console.error("Scan failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between">
        <div className="flex items-center gap-2">
          <img src={chef} alt="logo" className="w-8 h-8" />
          <span className="font-bold text-xl">GruhMate</span>
        </div>
        <Link
          to="/dashboard"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Dashboard
        </Link>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Buy List</h1>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Items to Buy</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-6">Item Name</th>
                  <th className="text-left py-3 px-6">Unit</th>
                  <th className="text-left py-3 px-6">Brand</th>
                  <th className="text-left py-3 px-6">Added On</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-500">
                      Loading buy list...
                    </td>
                  </tr>
                ) : buyList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-500">
                      No items in BuyList
                    </td>
                  </tr>
                ) : (
                  buyList.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-6">{item.itemName}</td>
                      <td className="py-3 px-6">{item.unit}</td>
                      <td className="py-3 px-6">{item.brand || "-"}</td>
                      <td className="py-3 px-6">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                       <td className="py-3 px-6">
          <button onClick={() => handleDelete(item._id,item.itemName)}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>

        </div>
        <button onClick={openCamera} style={{ cursor: "pointer" }} className="bg-blue-600 text-white px-4 py-2 rounded my-3 mx-2">
          📷 Add Stock via Image
        </button>

        <input
          className="bg-blue-600 text-white px-4 py-2 rounded" style={{ cursor: "pointer" }}
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          hidden
          onChange={onImageSelected}
        />
        {imagePreview && (
          <img
            src={imagePreview}
            style={{ width: 250, marginTop: 16, borderRadius: 8 }}
          />
        )}
        {selectedFile && (
  <button
    style={{ marginTop: 12,cursor:"pointer" }}
    onClick={scanImage}
  >
    🔍 Scan Image
  </button>
)}
{detectedItems.length > 0 && (
  <div className="mt-6 bg-white p-4 rounded shadow border-2 border-blue-100">
    <h3 className="font-bold mb-4 text-lg">Verify Detected Items</h3>
    {detectedItems.map((i, idx) => (
      <div key={idx} className="flex items-center justify-between border-b py-2">
        <div>
          <span className="font-medium">{i.itemName}</span> 
          <span className="text-gray-500 text-sm ml-2">({i.productSize || i.weight})</span>
        </div>
        <div className="bg-blue-50 px-3 py-1 rounded text-blue-700 font-bold">
          {i.quantity} {i.unit || 'packet'}
        </div>
      </div>
    ))}
    <p className="text-xs text-gray-400 mt-4 italic">
      Tip: If the quantity is wrong, check if the scanner is confusing weight (kg) with quantity (1).
    </p>
  </div>
)}

      </main>

      <Footer />
    </div>
  );
};

export default BuyList;
