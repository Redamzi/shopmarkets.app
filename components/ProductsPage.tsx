import React, { useEffect, useState } from 'react';
import { ProductList } from './ProductList';
import { productService } from '../services/productService';
import { connectionService, Connection } from '../services/connectionService';
import { Product } from '../types';
import { AddProductWizardModal } from './AddProductWizardModal';

export const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);

    // Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [mockCredits, setMockCredits] = useState(100); // TODO: Fetch real credits via billingService

    const loadData = async () => {
        setLoading(true);
        const [prodData, connData] = await Promise.all([
            productService.getProducts(),
            connectionService.getConnections()
        ]);
        setProducts(prodData);
        setConnections(connData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveProduct = async (newProduct: Product) => {
        try {
            await productService.createProduct(newProduct);
            await loadData(); // Reload list
            setIsWizardOpen(false);
        } catch (error) {
            console.error(error);
            alert('Fehler beim Speichern');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-slate-500">Lade Daten...</span>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10">
            <h1 className="text-2xl font-bold font-serif-display mb-6">Meine Produkte</h1>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 mb-4">Noch keine Produkte vorhanden.</p>
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                    >
                        Erstes Produkt anlegen
                    </button>
                </div>
            ) : (
                <ProductList
                    products={products}
                    onAddProduct={() => setIsWizardOpen(true)}
                    onEditProduct={(p) => console.log('Edit', p)}
                    onDeleteProduct={(id) => console.log('Delete', id)}
                />
            )}

            {isWizardOpen && (
                <AddProductWizardModal
                    isOpen={isWizardOpen}
                    onClose={() => setIsWizardOpen(false)}
                    onSave={handleSaveProduct}
                    credits={mockCredits}
                    setCredits={setMockCredits}
                    connections={connections}
                />
            )}
        </div>
    );
};
