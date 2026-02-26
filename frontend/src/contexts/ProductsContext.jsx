import React, { createContext, useState, useEffect } from 'react';
import { MOCK_MENU } from '../data/menu';

export const ProductsContext = createContext(null);

export const ProductsProvider = ({ children }) => {
    const [products, setProducts] = useState(() => {
        try {
            const raw = localStorage.getItem('products_v1');
            return raw ? JSON.parse(raw) : MOCK_MENU.slice();
        } catch (e) {
            return MOCK_MENU.slice();
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('products_v1', JSON.stringify(products));
        } catch (e) {
            // ignore
        }
    }, [products]);

    const addProduct = (p) => {
        setProducts((prev) => {
            const next = [{ ...p, id: Date.now() }, ...prev];
            return next;
        });
    };

    const updateProduct = (id, patch) => {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    };

    const removeProduct = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));

    return (
        <ProductsContext.Provider value={{ products, setProducts, addProduct, updateProduct, removeProduct }}>
            {children}
        </ProductsContext.Provider>
    );
};

export default ProductsProvider;
