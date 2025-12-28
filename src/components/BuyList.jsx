import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { chef } from "../assets/images";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";

const BuyList = () => {
  const { currentUser } = useAuth();
  const teamId = currentUser?.team; 

  const [buyList, setBuyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [detectedItems, setDetectedItems] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchBuyList = async () => {
    try {
      setLoading(true);
      
      if (!teamId) {
        console.log("No team assigned");
        setBuyList([]);
        setLoading(false);
        return;
      }

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
      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${itemName}" from BuyList?`
      );
      if (!confirmDelete) return;

      await axios.delete(`http://localhost:5000/api/stock/buylist/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        data: { userName: currentUser?.name }, 
      });

      setBuyList((prev) => prev.filter((item) => item._id !== id));

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
      console.log("Detected:", res.data);

      alert("Scan complete! Please review the items at the bottom of the page.");
    } catch (err) {
      console.error("Scan failed", err);
      alert("Image scan failed. Please try again.");
    }
  };

  // ✅ Show message if no team
  if (!teamId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Team Assigned</h2>
          <p className="text-gray-600 mb-6">You need to create or join a team first</p>
          <Link
            to="/teams"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
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
                  <th className="text-left py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">
                      Loading buy list...
                    </td>
                  </tr>
                ) : buyList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">
                      No items in BuyList
                    </td>
                  </tr>
                ) : (
                  buyList.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-6 font-medium">{item.itemName}</td>
                      <td className="py-3 px-6">{item.unit}</td>
                      <td className="py-3 px-6">{item.brand || "-"}</td>
                      <td className="py-3 px-6">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-6">
                        <button
                          onClick={() => handleDelete(item._id, item.itemName)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
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

        <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold text-lg mb-4">📷 Add Stock via Image</h3>

          <button
            onClick={openCamera}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Upload Image
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            hidden
            onChange={onImageSelected}
          />

          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-64 rounded-lg border shadow-sm"
              />
            </div>
          )}

          {selectedFile && (
            <button
              onClick={scanImage}
              className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition cursor-pointer"
            >
              🔍 Scan Image
            </button>
          )}
        </div>

        {detectedItems.length > 0 && (
          <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border-2 border-blue-200">
            <h3 className="font-bold mb-4 text-lg">✅ Verify Detected Items</h3>
            {detectedItems.map((i, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b py-3 hover:bg-gray-50"
              >
                <div>
                  <span className="font-medium text-lg">{i.itemName}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({i.productSize || i.weight})
                  </span>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-bold">
                  {i.quantity} {i.unit || "packet"}
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-4 italic">
              💡 Tip: If the quantity is wrong, check if the scanner is confusing
              weight (kg) with quantity (1).
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BuyList;
