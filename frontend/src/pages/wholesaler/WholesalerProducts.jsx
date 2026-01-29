import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';

const WholesalerProducts = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');

  const { data: productsData, isLoading } = useQuery(
    ['products', searchTerm, categoryFilter],
    () => productService.getProducts({
      search: searchTerm,
      category: categoryFilter,
      isActive: true,
      limit: 100
    })
  );

  const { data: categoriesData } = useQuery('categories', () => productService.getCategories());

  const placeOrderMutation = useMutation(
    (orderData) => orderService.placeOrder(orderData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myOrders');
        toast.success('Order placed successfully! Waiting for admin approval.');
        setCart([]);
        setShowCartModal(false);
        setShippingAddress('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to place order');
      }
    }
  );

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.info('Quantity updated in cart');
    } else {
      setCart([...cart, { product, quantity: 1 }]);
      toast.success('Added to cart');
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.product._id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
    toast.info('Removed from cart');
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.basePrice * item.quantity), 0);
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const orderData = {
      items: cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        unitPrice: item.product.basePrice
      })),
      shippingAddress: shippingAddress || undefined
    };

    placeOrderMutation.mutate(orderData);
  };

  const categoryOptions = categoriesData?.data?.data?.categories?.map(cat => ({
    value: cat,
    label: cat
  })) || [];

  const products = productsData?.data?.data?.products || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Browse Products</h1>
        <Button
          variant="primary"
          onClick={() => setShowCartModal(true)}
          disabled={cart.length === 0}
        >
          🛒 Cart ({cart.length})
        </Button>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '150px'
            }}
          >
            <option value="">All Categories</option>
            {categoryOptions.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p>Loading products...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {products.map(product => (
              <div
                key={product._id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <img 
                  src={product.image ? `http://localhost:5000${product.image}` : '/placeholder-product.png'} 
                  alt={product.name}
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover',
                    backgroundColor: '#f5f5f5'
                  }}
                  onError={(e) => { e.target.src = '/placeholder-product.png'; }}
                />
                
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>{product.name}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      SKU: {product.sku}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <Badge variant="info">{product.category}</Badge>
                      {product.brand && (
                        <Badge variant="default" style={{ marginLeft: '8px' }}>{product.brand}</Badge>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {product.description || 'No description available'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        ${product.basePrice?.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        per {product.unit}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                </div>
              </div>
                    {product.inStock ? (
                      <>
                        <Badge variant="success">
                          {product.inventory?.availableQuantity} {product.unit}s available
                        </Badge>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      </>
                    ) : (
                      <Badge variant="danger">Out of Stock</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            No products found
          </p>
        )}
      </Card>

      {/* Cart Modal */}
      <Modal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        title={`Shopping Cart (${cart.length} items)`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCartModal(false)}>
              Continue Shopping
            </Button>
            <Button
              variant="primary"
              onClick={handlePlaceOrder}
              disabled={placeOrderMutation.isLoading || cart.length === 0}
            >
              Place Order - ${calculateTotal().toFixed(2)}
            </Button>
          </>
        }
      >
        <div>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
              Your cart is empty
            </p>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                {cart.map((item) => (
                  <div
                    key={item.product._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <strong>{item.product.name}</strong>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        ${item.product.basePrice?.toFixed(2)} per {item.product.unit}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          style={{
                            padding: '4px 8px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value) || 0)}
                          style={{
                            width: '60px',
                            padding: '4px 8px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            textAlign: 'center'
                          }}
                          min="1"
                        />
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          style={{
                            padding: '4px 8px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: 'bold' }}>
                        ${(item.product.basePrice * item.quantity).toFixed(2)}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        style={{
                          padding: '4px 8px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--danger-color)',
                          cursor: 'pointer',
                          fontSize: '18px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <FormInput
                label="Shipping Address (Optional)"
                name="shippingAddress"
                type="textarea"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter delivery address if different from registered address"
              />

              <div
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <strong>Total Amount:</strong>
                <strong style={{ fontSize: '20px', color: 'var(--primary-color)' }}>
                  ${calculateTotal().toFixed(2)}
                </strong>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default WholesalerProducts;
