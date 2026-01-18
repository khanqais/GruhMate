// import { createContext, useContext, useState } from "react";

// const StockContext = createContext();

// export const useStock = () => useContext(StockContext);

// export const StockProvider = ({ children }) => {
//   const [stocks, setStocks] = useState([]);

//   return (
//     <StockContext.Provider value={{ stocks, setStocks }}>
//       {children}
//     </StockContext.Provider>
//   );
// };
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const StockContext = createContext(null);

export const useStock = () => useContext(StockContext);

export const StockProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchStocks() {
    console.log("🔍 StockContext: currentUser =", currentUser);
    const teamId = currentUser?.team || currentUser?.teamId;
    console.log("🔍 StockContext: extracted teamId =", teamId);
    
    if (!teamId) {
      console.log("⚠️ No team ID found, skipping stock fetch");
      setStocks([]);
      setLoading(false);
      return;
    }

    try {
      console.log("📡 Fetching stocks for team:", teamId);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/stock/team/${teamId}`
      );
      console.log("✅ Stocks fetched successfully:", res.data);
      console.log("✅ Number of stocks:", res.data?.length);
      setStocks(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch stocks:", err);
      console.error("❌ Error response:", err.response?.data);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log("🔄 StockContext useEffect triggered, currentUser:", currentUser);
    fetchStocks();
  }, [currentUser]);

  return (
    <StockContext.Provider value={{ stocks, refreshStocks: fetchStocks, loading }}>
      {children}
    </StockContext.Provider>
  );
};
