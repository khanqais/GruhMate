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
    if (!currentUser?.teamId) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/stock/team/${currentUser.teamId}`

      );
      setStocks(res.data);
    } catch (err) {
      console.error("Failed to fetch stocks", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStocks();
  }, [currentUser]);

  return (
    <StockContext.Provider value={{ stocks, refreshStocks: fetchStocks, loading }}>
      {children}
    </StockContext.Provider>
  );
};
