/**
 * Orders Module - Nessa Enterprise Dashboard
 * Order management table with status updates, search, and filters
 */

const Orders = (() => {
  let allOrders = [];
  let filteredOrders = [];
  let currentPage = 1;
  const perPage = 10;

  async function init() {
    if (!Auth.requireRole(['Admin', 'Manager', 'Staff'])) return;
    Auth.populateUserInfo();
    Dashboard.initTheme();
    Dashboard.initSidebar();

    await ExcelService.loadData();
    allOrders = ExcelService.getOrders().sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
    filteredOrders = [...allOrders];

    render();
    bindEvents();
    renderOrderStats();
  }

  function bindEvents() {
    document.getElementById('orderSearch')?.addEventListener('input', handleFilter);
    document.getElementById('statusFilter')?.addEventListener('change', handleFilter);
  }

  function handleFilter() {
    const query = (document.getElementById('orderSearch')?.value || '').toLowerCase();
    const status = document.getElementById('statusFilter')?.value || '';

    filteredOrders = allOrders.filter(o => {
      const matchSearch = !query ||
        o.customerName.toLowerCase().includes(query) ||
        o.productName.toLowerCase().includes(query) ||
        String(o.id).includes(query);
      const matchStatus = !status || o.status === status;
      return matchSearch && matchStatus;
    });

    currentPage = 1;
    render();
  }

  function render() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    const start = (currentPage - 1) * perPage;
    const pageItems = filteredOrders.slice(start, start + perPage);

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="8" class="text-center py-5 text-muted">
          <i class="bi bi-inbox d-block mb-2" style="font-size:32px;opacity:0.4;"></i>
          No orders found
        </td></tr>`;
    } else {
      tbody.innerHTML = pageItems.map(o => `
        <tr class="animate-fadeIn">
          <td><span class="fw-semibold">#${String(o.id).padStart(4, '0')}</span></td>
          <td>
            <div>
              <div class="fw-semibold">${o.customerName}</div>
              <div class="text-muted" style="font-size:12px;">${o.customerEmail || ''}</div>
            </div>
          </td>
          <td>${o.productName.length > 22 ? o.productName.slice(0, 22) + '…' : o.productName}</td>
          <td class="text-center">${o.quantity}</td>
          <td class="fw-semibold">₹${o.total.toLocaleString('en-IN')}</td>
          <td>
            <select class="form-select form-select-sm status-select" style="width:auto;font-size:12px;border-radius:6px;" onchange="Orders.updateStatus(${o.id}, this.value)" data-order-id="${o.id}">
              <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
              <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>🚚 Shipped</option>
              <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>✅ Delivered</option>
            </select>
          </td>
          <td class="text-muted">${formatDate(o.date)}</td>
          <td>
            <div class="action-btns">
              <button class="action-btn" title="View Details"><i class="bi bi-eye"></i></button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    renderPagination();
    updateTableInfo();
  }

  function renderOrderStats() {
    const pending = allOrders.filter(o => o.status === 'Pending').length;
    const shipped = allOrders.filter(o => o.status === 'Shipped').length;
    const delivered = allOrders.filter(o => o.status === 'Delivered').length;

    setEl('statPending', pending);
    setEl('statShipped', shipped);
    setEl('statDelivered', delivered);
    setEl('statTotal', allOrders.length);
  }

  function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  async function updateStatus(orderId, newStatus) {
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      showToast(`Order #${String(orderId).padStart(4, '0')} updated to "${newStatus}"`);
      
      // Persist via API so customer pages reflect the change
      try {
        await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } catch(e) {
        console.warn('Could not update order status on server:', e);
      }
    }
  }

  function showToast(message) {
    let toast = document.getElementById('nessaToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'nessaToast';
      toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#10b981;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.15);transform:translateY(100px);opacity:0;transition:all 0.3s ease;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, 2500);
  }

  function renderPagination() {
    const container = document.getElementById('ordersPagination');
    if (!container) return;
    const totalPages = Math.ceil(filteredOrders.length / perPage);
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="Orders.goToPage(${currentPage - 1});return false;">‹</a></li>`;
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i !== 1 && i !== totalPages && Math.abs(i - currentPage) > 1) {
        if (i === currentPage - 2 || i === currentPage + 2) html += `<li class="page-item disabled"><a class="page-link" href="#">…</a></li>`;
        continue;
      }
      html += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" onclick="Orders.goToPage(${i});return false;">${i}</a></li>`;
    }
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="#" onclick="Orders.goToPage(${currentPage + 1});return false;">›</a></li>`;
    container.innerHTML = html;
  }

  function updateTableInfo() {
    const el = document.getElementById('ordersTableInfo');
    if (!el) return;
    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, filteredOrders.length);
    el.textContent = `Showing ${start}–${end} of ${filteredOrders.length} orders`;
  }

  function goToPage(page) {
    const totalPages = Math.ceil(filteredOrders.length / perPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    render();
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const hasTime = dateStr && dateStr.includes('T');
    return d.toLocaleString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric',
      ...(hasTime ? { hour: 'numeric', minute: '2-digit' } : {})
    });
  }

  return { init, goToPage, updateStatus };
})();
