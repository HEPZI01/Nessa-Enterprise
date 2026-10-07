import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import StoreNavbar from '../components/layout/StoreNavbar';

export default function MyOrders() {
  const { orders } = useData();
  const { user } = useAuth();

  const myOrdersList = orders.filter(o =>
    o.userId === user?.id || (user?.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase())
  ).reverse();

  return (
    <div className="min-vh-100 bg-body">
      <StoreNavbar cartCount={0} onOpenCart={() => {}} />

      <div className="container px-4 py-5" style={{ maxWidth: 900 }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="fw-bold mb-1">My Orders</h2>
            <p className="text-muted fs-7 mb-0">Track your order statuses and purchase history in real time.</p>
          </div>
        </div>

        {myOrdersList.map(order => {
          const isPending = order.status === 'Pending';
          const isShipped = order.status === 'Shipped';
          const isDelivered = order.status === 'Delivered';

          return (
            <div key={order.id} className="card border-0 shadow-sm rounded-4 mb-4 p-4 bg-surface">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 border-bottom pb-3 mb-3">
                <div>
                  <span className="fw-bold fs-5 text-primary">Order #{order.id}</span>
                  <span className="text-muted fs-7 ms-2">Placed on {order.date}</span>
                </div>
                <span className={`status-badge ${order.status ? order.status.toLowerCase() : 'pending'}`}>
                  <span className="status-dot"></span>
                  {order.status || 'Pending'}
                </span>
              </div>

              {/* Progress Stepper */}
              <div className="py-3 px-2 mb-3 bg-light rounded-3">
                <div className="d-flex justify-content-between position-relative">
                  <div className="text-center flex-fill">
                    <div className={`rounded-circle mx-auto mb-1 d-flex align-items-center justify-content-center ${isPending || isShipped || isDelivered ? 'bg-primary text-white' : 'bg-secondary text-white'}`} style={{ width: 32, height: 32 }}>
                      <i className="bi bi-cart-check"></i>
                    </div>
                    <span className="fs-8 fw-semibold">Order Placed</span>
                  </div>

                  <div className="text-center flex-fill">
                    <div className={`rounded-circle mx-auto mb-1 d-flex align-items-center justify-content-center ${isShipped || isDelivered ? 'bg-primary text-white' : 'bg-secondary text-white'}`} style={{ width: 32, height: 32 }}>
                      <i className="bi bi-truck"></i>
                    </div>
                    <span className="fs-8 fw-semibold">Shipped</span>
                  </div>

                  <div className="text-center flex-fill">
                    <div className={`rounded-circle mx-auto mb-1 d-flex align-items-center justify-content-center ${isDelivered ? 'bg-success text-white' : 'bg-secondary text-white'}`} style={{ width: 32, height: 32 }}>
                      <i className="bi bi-house-check"></i>
                    </div>
                    <span className="fs-8 fw-semibold">Delivered</span>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold mb-1">{order.productName || `Product #${order.productId}`}</h6>
                  <div className="text-muted fs-7">Quantity: {order.quantity} | Payment: {order.paymentMethod || 'COD'}</div>
                </div>
                <div className="fs-4 fw-extrabold text-primary">
                  ₹{(order.total || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          );
        })}

        {myOrdersList.length === 0 && (
          <div className="text-center py-5 card border-0 shadow-sm rounded-4 p-5 bg-surface">
            <i className="bi bi-bag-x display-1 text-muted mb-3"></i>
            <h5 className="fw-bold">No orders found</h5>
            <p className="text-muted">You haven't placed any orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
