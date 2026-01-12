import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductList } from './ProductList';
import { productService } from '../services/productService';
import { connectionService, Connection } from '../services/connectionService';
import { Product } from '../types';
import { useAuthStore } from '../store/authStore';

export const ProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);

    // Auth Store Access
    const { user } = useAuthStore();

    const loadData = async () => {
        setLoading(true);
        try {
            const [prodData, connData] = await Promise.all([
                productService.getProducts(),
                connectionService.getConnections()
            ]);
            setProducts(prodData);
            setConnections(connData);
        } catch (err: any) {
            console.error(err);
            // If it's a 403/401, the authService listener should have triggered logout.
            // But if it's another error, show an alert or set error state.
            if (err.response?.status !== 401 && err.response?.status !== 403) {
                alert(`Fehler beim Laden der Produkte: ${err.message}`);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);



    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-slate-500">Lade Daten...</span>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 w-full mx-auto">
            <h1 className="text-2xl font-bold font-serif-display mb-6">Meine Produkte</h1>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 mb-4">Noch keine Produkte vorhanden.</p>
                    <button
                        onClick={() => navigate('/products/new')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                    >
                        Erstes Produkt anlegen
                    </button>
                </div>
            ) : (
                <ProductList
                    products={products}
                    onAddProduct={() => navigate('/products/new')}
                    onEditProduct={(p) => {
                        // TODO: Implement edit mode in ProductWizard
                        console.log('Edit product:', p);
                        navigate('/products/new');
                    }}
                    onDeleteProduct={async (id) => {
                        try {
                            await productService.deleteProduct(id);
                            await loadData();
                        } catch (e: any) {
                            alert('Fehler beim Löschen: ' + (e.message || 'Unbekannt'));
                        }
                    }}
                    onIncrementStock={async (id) => {
                        try {
                            const product = products.find(p => p.id === id);
                            if (product) {
                                await productService.updateProduct(id, { stock: product.stock + 1 });
                                await loadData();
                            }
                        } catch (e: any) {
                            alert('Fehler beim Aktualisieren: ' + (e.message || 'Unbekannt'));
                        }
                    }}
                />
            )}


        </div>
    );
};
