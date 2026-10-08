import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import StoreNavbar from '../components/layout/StoreNavbar';
import { useNavigate } from 'react-router-dom';

export default function Storefront() {
  const { products, placeOrder } = useData();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Shopping Cart state
  const [cart, setCart] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Quick View Modal
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Checkout Modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Delivery Form State & Validation
  const [deliveryName, setDeliveryName] = useState(user?.name || '');
  const [deliveryEmail, setDeliveryEmail] = useState(user?.email || '');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [formErrors, setFormErrors] = useState({});

  React.useEffect(() => {
    if (user) {
      if (!deliveryName) setDeliveryName(user.name || '');
      if (!deliveryEmail) setDeliveryEmail(user.email || '');
    }
  }, [user]);

  const categories = ['All', 'Submersible Pump', 'Openwell Pump', 'Monoblock Pump', 'Domestic Pump', 'Self Priming Pump', 'Smart IoT Pump', 'Booster System', 'Solar System'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prevCart, { ...product, quantity }];
    });
    setShowCartDrawer(true);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const validateForm = () => {
    const errors = {};
    if (!deliveryName || !deliveryName.trim()) {
      errors.deliveryName = 'Full Name is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!deliveryEmail || !deliveryEmail.trim()) {
      errors.deliveryEmail = 'Email Address is required';
    } else if (!emailRegex.test(deliveryEmail.trim())) {
      errors.deliveryEmail = 'Please enter a valid email address';
    }

    const phoneClean = deliveryPhone.trim().replace(/[\s\-()]/g, '');
    const indianPhoneRegex = /^(?:(?:\+|00)?91|0)?[6-9]\d{9}$/;
    if (!deliveryPhone || !deliveryPhone.trim()) {
      errors.deliveryPhone = 'Phone Number is required';
    } else if (!indianPhoneRegex.test(phoneClean)) {
      errors.deliveryPhone = 'Please enter a valid 10-digit Indian phone number (e.g. 9876543210)';
    }

    if (!deliveryAddress || !deliveryAddress.trim()) {
      errors.deliveryAddress = 'Delivery Address is required';
    } else if (deliveryAddress.trim().length < 5) {
      errors.deliveryAddress = 'Please enter a complete delivery address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!validateForm()) return;
    if (cart.length === 0) return;

    setPlacingOrder(true);
    const orderItems = cart.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      total: item.price * item.quantity
    }));

    await placeOrder({
      userId: user?.id,
      customerName: deliveryName.trim(),
      customerEmail: deliveryEmail.trim(),
      deliveryPhone: deliveryPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      items: orderItems,
      paymentMethod
    });

    setPlacingOrder(false);
    setCart([]);
    setShowCheckoutModal(false);
    setShowCartDrawer(false);
    navigate('/my-orders');
  };

  return (
    <div className="min-vh-100 bg-body">
      {/* Store Navigation Bar */}
      <StoreNavbar cartCount={cartCount} onOpenCart={() => setShowCartDrawer(true)} />

      {/* Hero Banner */}
      <div className="store-header py-5 position-relative overflow-hidden">
        <div className="container px-4 py-3 position-relative" style={{ zIndex: 2 }}>
          <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold text-uppercase tracking-wider mb-2">
            Enterprise Industrial Grade
          </span>
          <h1 className="display-5 fw-extrabold text-white mb-2">High Efficiency Water Pumps & Motors</h1>
          <p className="text-white-50 lead mx-auto mb-4" style={{ maxWidth: '640px' }}>
            Discover heavy-duty submersible, monoblock, openwell & smart IoT pumping solutions backed by Nessa Enterprise warranty.
          </p>

          {/* Search Box */}
          <div className="mx-auto" style={{ maxWidth: '540px' }}>
            <div className="input-group input-group-lg shadow-lg rounded-pill overflow-hidden bg-white p-1">
              <span className="input-group-text bg-transparent border-0 pe-0 text-muted">
                <i className="bi bi-search ms-2"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 shadow-none text-dark ps-3 fs-6"
                placeholder="Search by pump name, series, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container-fluid px-4 py-4">
        {/* Category Tabs */}
        <div className="d-flex align-items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold text-nowrap transition-all ${selectedCategory === cat ? 'btn-primary shadow-sm' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Catalog Grid */}
        <div className="row g-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
              <div className="product-grid-card h-100">
                <div className="product-img-wrapper" onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => { e.target.src = product.fallback || 'https://cdn.moglix.com/p/Oi6uSoVCV1xCj-large.jpg'; }}
                  />
                  <span className={`product-badge-overlay ${product.stock > 10 ? 'bg-success text-white' : product.stock > 0 ? 'bg-warning text-dark' : 'bg-danger text-white'}`}>
                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Low Stock (${product.stock})` : 'Out of Stock'}
                  </span>
                </div>

                <div className="p-3 d-flex flex-column flex-grow-1">
                  <span className="text-primary fs-8 fw-bold text-uppercase tracking-wider mb-1">{product.category}</span>
                  <h6 className="fw-bold mb-2 text-truncate" style={{ cursor: 'pointer' }} onClick={() => setSelectedProduct(product)} title={product.name}>
                    {product.name}
                  </h6>
                  <p className="text-muted fs-7 line-clamp-2 mb-3 flex-grow-1">{product.description}</p>

                  <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                    <div>
                      <div className="fs-5 fw-extrabold text-primary">₹{(product.price || 0).toLocaleString('en-IN')}</div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm rounded-pill px-3 fw-bold"
                      disabled={product.stock === 0}
                      onClick={() => addToCart(product)}
                    >
                      <i className="bi bi-cart-plus me-1"></i> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted"></i>
              <h5 className="mt-3 fw-bold">No products found</h5>
              <p className="text-muted">Try adjusting your search filter or category selection.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      {showCartDrawer && (
        <>
          <div className="modal-backdrop-custom" onClick={() => setShowCartDrawer(false)}></div>
          <div className="drawer-custom p-4">
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <h5 className="fw-bold mb-0"><i className="bi bi-bag-check text-primary me-2"></i>Shopping Cart ({cartCount})</h5>
              <button className="btn-close" onClick={() => setShowCartDrawer(false)}></button>
            </div>

            <div className="flex-grow-1 overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="d-flex align-items-center justify-content-between p-3 mb-2 rounded-3 bg-light border">
                  <div className="d-flex align-items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => { if (item.fallback) e.target.src = item.fallback; }}
                      />
                    )}
                    <div>
                      <h6 className="fw-bold mb-1 fs-7">{item.name}</h6>
                      <div className="text-primary fw-bold fs-7">₹{item.price.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => updateCartQty(item.id, -1)}>-</button>
                    <span className="fw-bold fs-7">{item.quantity}</span>
                    <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => updateCartQty(item.id, 1)}>+</button>
                    <button className="btn btn-sm text-danger ms-1" onClick={() => removeFromCart(item.id)}><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-cart-x display-4"></i>
                  <p className="mt-2">Your cart is currently empty.</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-3 border-top mt-auto">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-semibold">Subtotal</span>
                  <span className="fs-4 fw-extrabold text-primary">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <button
                  className="btn btn-primary w-100 py-2.5 rounded-pill fw-bold shadow"
                  onClick={() => {
                    if (!isLoggedIn) {
                      navigate('/login');
                    } else {
                      setShowCheckoutModal(true);
                    }
                  }}
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <>
          <div className="modal-backdrop-custom" onClick={() => setShowCheckoutModal(false)}></div>
          <div className="modal show d-block" style={{ zIndex: 1080 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 p-4">
                <div className="modal-header border-0 pb-2">
                  <h5 className="modal-header-title fw-bold fs-4 text-primary">
                    <i className="bi bi-bag-check-fill me-2"></i>Checkout
                  </h5>
                  <button className="btn-close" onClick={() => setShowCheckoutModal(false)}></button>
                </div>
                <form onSubmit={handleCheckoutSubmit} noValidate>
                  <div className="modal-body py-2">
                    {/* 1. ORDER SUMMARY */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary fs-6">
                        <i className="bi bi-receipt me-2"></i>1. Order Summary
                      </h6>
                      <div className="bg-light p-3 rounded-3 border">
                        <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {cart.map(item => (
                            <div key={item.id} className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                              <div className="d-flex align-items-center gap-3">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                                    onError={(e) => { if (item.fallback) e.target.src = item.fallback; }}
                                  />
                                )}
                                <div>
                                  <div className="fw-bold fs-7">{item.name}</div>
                                  <div className="text-muted fs-8">
                                    Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                                  </div>
                                </div>
                              </div>
                              <div className="fw-bold text-primary fs-7 ms-2">
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-1">
                          <div className="d-flex justify-content-between fs-7 mb-1">
                            <span className="text-muted">Subtotal</span>
                            <span className="fw-semibold">₹{cartTotal.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="d-flex justify-content-between fs-7 mb-1">
                            <span className="text-muted">Delivery Charge</span>
                            <span className="text-success fw-bold">FREE</span>
                          </div>
                          <div className="d-flex justify-content-between border-top pt-2 fw-bold fs-5 text-primary">
                            <span>Grand Total</span>
                            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. DELIVERY INFORMATION */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary fs-6">
                        <i className="bi bi-geo-alt-fill me-2"></i>2. Delivery Information
                      </h6>

                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold fs-7 mb-1">Full Name <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            className={`form-control rounded-3 ${formErrors.deliveryName ? 'is-invalid' : ''}`}
                            placeholder="Full Name"
                            value={deliveryName}
                            onChange={(e) => {
                              setDeliveryName(e.target.value);
                              if (formErrors.deliveryName) setFormErrors(prev => ({ ...prev, deliveryName: null }));
                            }}
                            required
                          />
                          {formErrors.deliveryName && <div className="invalid-feedback fs-8">{formErrors.deliveryName}</div>}
                        </div>

                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold fs-7 mb-1">Email Address <span className="text-danger">*</span></label>
                          <input
                            type="email"
                            className={`form-control rounded-3 ${formErrors.deliveryEmail ? 'is-invalid' : ''}`}
                            placeholder="name@domain.com"
                            value={deliveryEmail}
                            onChange={(e) => {
                              setDeliveryEmail(e.target.value);
                              if (formErrors.deliveryEmail) setFormErrors(prev => ({ ...prev, deliveryEmail: null }));
                            }}
                            required
                          />
                          {formErrors.deliveryEmail && <div className="invalid-feedback fs-8">{formErrors.deliveryEmail}</div>}
                        </div>

                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold fs-7 mb-1">Phone Number <span className="text-danger">*</span></label>
                          <input
                            type="tel"
                            className={`form-control rounded-3 ${formErrors.deliveryPhone ? 'is-invalid' : ''}`}
                            placeholder="10-digit Mobile Number (e.g. 9876543210)"
                            value={deliveryPhone}
                            onChange={(e) => {
                              setDeliveryPhone(e.target.value);
                              if (formErrors.deliveryPhone) setFormErrors(prev => ({ ...prev, deliveryPhone: null }));
                            }}
                            required
                          />
                          {formErrors.deliveryPhone && <div className="invalid-feedback fs-8">{formErrors.deliveryPhone}</div>}
                        </div>

                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold fs-7 mb-1">Delivery Address <span className="text-danger">*</span></label>
                          <textarea
                            className={`form-control rounded-3 ${formErrors.deliveryAddress ? 'is-invalid' : ''}`}
                            rows="2"
                            placeholder="Complete street address, house no., city, pincode"
                            value={deliveryAddress}
                            onChange={(e) => {
                              setDeliveryAddress(e.target.value);
                              if (formErrors.deliveryAddress) setFormErrors(prev => ({ ...prev, deliveryAddress: null }));
                            }}
                            required
                          ></textarea>
                          {formErrors.deliveryAddress && <div className="invalid-feedback fs-8">{formErrors.deliveryAddress}</div>}
                        </div>
                      </div>
                    </div>

                    {/* 3. PAYMENT METHOD */}
                    <div className="mb-3">
                      <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary fs-6">
                        <i className="bi bi-credit-card-fill me-2"></i>3. Payment Method
                      </h6>
                      <div className="p-3 border rounded-3 d-flex align-items-center justify-content-between bg-primary-subtle border-primary">
                        <div className="d-flex align-items-center gap-2">
                          <input type="radio" name="payment" checked={paymentMethod === 'COD'} readOnly />
                          <span className="fw-semibold">Cash on Delivery (COD)</span>
                        </div>
                        <i className="bi bi-cash-stack text-success fs-5"></i>
                      </div>
                    </div>
                  </div>

                  {/* 4. CONFIRM ORDER */}
                  <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowCheckoutModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={placingOrder}>
                      {placingOrder ? 'Processing...' : 'Confirm Order'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quick View Product Modal */}
      {selectedProduct && (
        <>
          <div className="modal-backdrop-custom" onClick={() => setSelectedProduct(null)}></div>
          <div className="modal show d-block" style={{ zIndex: 1080 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content rounded-4 border-0 p-4">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">{selectedProduct.name}</h5>
                  <button className="btn-close" onClick={() => setSelectedProduct(null)}></button>
                </div>
                <div className="modal-body py-4">
                  <div className="row g-4">
                    <div className="col-12 col-md-5 text-center bg-light p-3 rounded-4 d-flex align-items-center justify-content-center">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="img-fluid rounded"
                        style={{ maxHeight: 240 }}
                        onError={(e) => { e.target.src = selectedProduct.fallback || 'https://cdn.moglix.com/p/Oi6uSoVCV1xCj-large.jpg'; }}
                      />
                    </div>
                    <div className="col-12 col-md-7 d-flex flex-column">
                      <span className="badge bg-primary-subtle text-primary w-auto align-self-start mb-2 px-3 py-1 rounded-pill">{selectedProduct.category}</span>
                      <h4 className="fw-bold mb-2">₹{(selectedProduct.price || 0).toLocaleString('en-IN')}</h4>
                      <p className="text-muted mb-4">{selectedProduct.description}</p>
                      <div className="mb-4">
                        <strong>Stock Status: </strong>
                        <span className={`badge ${selectedProduct.stock > 0 ? 'bg-success' : 'bg-danger'} ms-2`}>
                          {selectedProduct.stock > 0 ? `${selectedProduct.stock} units available` : 'Out of Stock'}
                        </span>
                      </div>
                      <div className="mt-auto">
                        <button
                          className="btn btn-primary btn-lg rounded-pill px-4 w-100 fw-bold"
                          disabled={selectedProduct.stock === 0}
                          onClick={() => {
                            addToCart(selectedProduct);
                            setSelectedProduct(null);
                          }}
                        >
                          <i className="bi bi-cart-plus me-2"></i> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
