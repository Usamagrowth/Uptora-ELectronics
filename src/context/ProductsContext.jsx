import { createContext, useContext } from "react";
import { useProducts } from "../hooks/useProducts";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const productsState = useProducts();
  return (
    <ProductsContext.Provider value={productsState}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProductsContext() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProductsContext must be used inside a ProductsProvider");
  }
  return context;
}
