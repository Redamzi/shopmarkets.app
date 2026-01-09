import React, { useEffect, useState } from 'react';
import { ProductList } from './ProductList';
import { productService } from '../services/productService';
import { connectionService, Connection } from '../services/connectionService';
import { Product } from '../types';
import { AddProductWizardModal } from './AddProductWizardModal';
import { useAuthStore } from '../store/authStore';

export const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);

    // Auth Store Access
    const { user } = useAuthStore();

    // Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [mockCredits, setMockCredits] = useState(100); // TODO: Fetch real credits via billingService

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

    const handleSaveProduct = async (productData: Product) => {
        if (!user) {
            alert('Fehler: Nicht eingeloggt!');
            return;
        }

        try {
            console.log('Current User:', user);
            if (!user.id) {
                alert('CRITICAL ERROR: User object has no ID!');
                return;
            }

            const productToSave = {
                ...productData,
                userId: user.id
            };

            console.log('Sending Product:', productToSave);

            if (editingProduct) {
                // UPDATE existing product
                await productService.updateProduct(editingProduct.id, productToSave);
                alert('Produkt erfolgreich aktualisiert!');
            } else {
                // CREATE new product
                await productService.createProduct(productToSave);
                alert('Produkt erfolgreich angelegt!');
            }

            await loadData(); // Reload list
            setIsWizardOpen(false);
            setEditingProduct(null);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error || error.message || 'Unbekannter Fehler';
            alert(`Fehler beim Speichern: ${msg}`);
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
        <div className="p-6 lg:p-10 w-full mx-auto">
            <h1 className="text-2xl font-bold font-serif-display mb-6">Meine Produkte</h1>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 mb-4">Noch keine Produkte vorhanden.</p>
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setIsWizardOpen(true);
                        }}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                    >
                        Erstes Produkt anlegen
                    </button>
                </div>
            ) : (
                <ProductList
                    products={products}
                    onAddProduct={() => {
                        setEditingProduct(null);
                        setIsWizardOpen(true);
                    }}
                    onEditProduct={(p) => {
                        setEditingProduct(p);
                        setIsWizardOpen(true);
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
                    onDuplicateProduct={async (product) => {
                        try {
                            await productService.duplicateProduct(product);
                            await loadData();
                            alert('Produkt dupliziert!');
                        } catch (e: any) {
                            alert('Fehler beim Duplizieren: ' + (e.message || 'Unbekannt'));
                        }
                    }}
                />
            )}

            {isWizardOpen && (
                <AddProductWizardModal
                    isOpen={isWizardOpen}
                    onClose={() => {
                        setIsWizardOpen(false);
                        setEditingProduct(null);
                    }}
                    onSave={handleSaveProduct}
                    credits={mockCredits}
                    setCredits={setMockCredits}
                    initialProduct={editingProduct}
                    connections={connections}
                />
            )}
        </div>
    );
};
