/**
 * Dashboard Module - Nessa Enterprise Dashboard
 * Handles KPI cards, overview charts, recent orders/alerts
 */

const Dashboard = (() => {

  async function init() {
    try {
      // 1. Initialize UI Elements first so features like Logout/Theme always work
      initTheme();
      initSidebar(); 

      // 2. Security Check (Move this after UI init so logout is active)
      if (!Auth.requireRole(['Admin', 'Manager', 'Staff'])) return;
      
      Auth.populateUserInfo();
      console.log("Dashboard initializing for Management Access...");

      // 3. Data Loading
      try {
        await ExcelService.loadData();
      } catch (dataErr) {
        console.warn("Recoverable data load error:", dataErr);
      }

      // 4. Rendering
      renderKPIs();
      renderCharts();
      renderRecentOrders();
      renderAlerts();
      
      console.log("Dashboard rendering complete.");
    } catch (err) {
      console.error("Critical Dashboard Init Error:", err);
    }
  }

  /* ---------- Theme Toggle ---------- */
  function initTheme() {
    const saved = localStorage.getItem('nessa_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('nessa_theme', next);
        // Re-render charts for theme change
        renderCharts();
      });
    });
  }

  /* ---------- Sidebar ---------- */
  function initSidebar() {
    const sidebar = document.querySelector('.nessa-sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const overlay = document.querySelector('.sidebar-overlay');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const topbar = document.querySelector('.nessa-topbar');
        const main = document.querySelector('.nessa-main');
        if (sidebar.classList.contains('collapsed')) {
          topbar.style.left = 'var(--sidebar-collapsed-width)';
          main.style.marginLeft = 'var(--sidebar-collapsed-width)';
        } else {
          topbar.style.left = 'var(--sidebar-width)';
          main.style.marginLeft = 'var(--sidebar-width)';
        }
      });
    }

    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('show');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('show');
      });
    }

    // Logout
    document.querySelectorAll('.logout-link').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
      });
    });
  }

  /* ---------- KPI Cards ---------- */
  function renderKPIs() {
    const totalRevenue = ExcelService.getTotalRevenue();
    const totalOrders = ExcelService.getTotalOrders();
    const totalProducts = ExcelService.getTotalProducts();
    const lowStockCount = ExcelService.getLowStockItems().length;
    const monthlyGrowth = ExcelService.getMonthlyGrowth();

    setKPI('kpiRevenue', formatCurrency(totalRevenue));
    setKPI('kpiOrders', totalOrders.toLocaleString());
    setKPI('kpiProducts', totalProducts.toLocaleString());
    setKPI('kpiLowStock', lowStockCount.toString());
    setKPI('kpiGrowth', monthlyGrowth + '%');

    // Set change indicators
    setChange('kpiRevenueChange', 12.5, true);
    setChange('kpiOrdersChange', 8.3, true);
    setChange('kpiProductsChange', 3, true);
    setChange('kpiLowStockChange', lowStockCount > 5 ? -lowStockCount : 2, lowStockCount <= 5);
    setChange('kpiGrowthChange', monthlyGrowth, monthlyGrowth >= 0);
  }

  function setKPI(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setChange(id, value, isPositive) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = 'kpi-change ' + (isPositive ? 'positive' : 'negative');
    el.innerHTML = `<i class="bi bi-arrow-${isPositive ? 'up' : 'down'}-short"></i>${Math.abs(value)}%`;
  }

  function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  /* ---------- Dashboard Charts ---------- */
  let charts = {};

  function renderCharts() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    // Destroy existing charts
    Object.values(charts).forEach(c => c.destroy());
    charts = {};

    const salesReports = ExcelService.getSalesReports();
    const months = salesReports.map(r => r.month);
    const revenues = salesReports.map(r => r.revenue);
    const orderCounts = salesReports.map(r => r.orders);

    // 1. Revenue Trend Line Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
      const gradient = revenueCtx.getContext('2d').createLinearGradient(0, 0, 0, 280);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

      charts.revenue = new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Revenue (₹)',
            data: revenues,
            borderColor: '#6366f1',
            backgroundColor: gradient,
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? '#1e293b' : '#fff',
              titleColor: isDark ? '#e2e8f0' : '#0f172a',
              bodyColor: isDark ? '#94a3b8' : '#475569',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                label: ctx => `Revenue: ₹${ctx.raw.toLocaleString('en-IN')}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 12 } }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { size: 12 },
                callback: v => '₹' + (v / 1000).toFixed(0) + 'k'
              },
              border: { display: false }
            }
          }
        }
      });
    }

    // 2. Orders Bar Chart
    const ordersCtx = document.getElementById('ordersChart');
    if (ordersCtx) {
      charts.orders = new Chart(ordersCtx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: 'Orders',
            data: orderCounts,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 0,
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 24,
            hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? '#1e293b' : '#fff',
              titleColor: isDark ? '#e2e8f0' : '#0f172a',
              bodyColor: isDark ? '#94a3b8' : '#475569',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              displayColors: false
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 12 } }
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 12 } },
              border: { display: false }
            }
          }
        }
      });
    }

    // 3. Top Selling Products (Horizontal Bar)
    const topCtx = document.getElementById('topProductsChart');
    if (topCtx) {
      const topProducts = ExcelService.getTopSellingProducts(5);
      charts.topProducts = new Chart(topCtx, {
        type: 'bar',
        data: {
          labels: topProducts.map(p => p.name.length > 22 ? p.name.slice(0, 22) + '…' : p.name),
          datasets: [{
            label: 'Units Sold',
            data: topProducts.map(p => p.quantity),
            backgroundColor: [
              'rgba(99, 102, 241, 0.75)',
              'rgba(139, 92, 246, 0.75)',
              'rgba(59, 130, 246, 0.75)',
              'rgba(16, 185, 129, 0.75)',
              'rgba(245, 158, 11, 0.75)'
            ],
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 20
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? '#1e293b' : '#fff',
              titleColor: isDark ? '#e2e8f0' : '#0f172a',
              bodyColor: isDark ? '#94a3b8' : '#475569',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              displayColors: false
            }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 12 } },
              border: { display: false }
            },
            y: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 11 } }
            }
          }
        }
      });
    }

    // 4. Stock Distribution Doughnut
    const stockCtx = document.getElementById('stockChart');
    if (stockCtx) {
      const dist = ExcelService.getCategoryStockDistribution();
      const labels = Object.keys(dist);
      const data = Object.values(dist);
      const colors = [
        '#6366f1', '#8b5cf6', '#3b82f6', '#10b981',
        '#f59e0b', '#ef4444', '#ec4899'
      ];

      charts.stock = new Chart(stockCtx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: textColor,
                padding: 12,
                usePointStyle: true,
                pointStyleWidth: 10,
                font: { size: 12 }
              }
            },
            tooltip: {
              backgroundColor: isDark ? '#1e293b' : '#fff',
              titleColor: isDark ? '#e2e8f0' : '#0f172a',
              bodyColor: isDark ? '#94a3b8' : '#475569',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8
            }
          }
        }
      });
    }
  }

  /* ---------- Recent Orders ---------- */
  function renderRecentOrders() {
    const tbody = document.getElementById('recentOrdersBody');
    if (!tbody) return;

    const orders = ExcelService.getOrders()
      .sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)
      .slice(0, 5);

    tbody.innerHTML = orders.map(order => `
      <tr>
        <td><span class="fw-semibold">#${String(order.id).padStart(4, '0')}</span></td>
        <td>${order.customerName}</td>
        <td>${order.productName.length > 25 ? order.productName.slice(0, 25) + '…' : order.productName}</td>
        <td class="fw-semibold">₹${order.total.toLocaleString('en-IN')}</td>
        <td><span class="status-badge ${order.status.toLowerCase()}"><span class="status-dot"></span>${order.status}</span></td>
        <td class="text-muted">${formatDate(order.date)}</td>
      </tr>
    `).join('');
  }

  /* ---------- Low Stock Alerts ---------- */
  function renderAlerts() {
    const container = document.getElementById('lowStockAlerts');
    if (!container) return;

    const lowItems = ExcelService.getLowStockItems().slice(0, 5);

    if (lowItems.length === 0) {
      container.innerHTML = '<div class="text-muted text-center py-3">All stock levels are healthy</div>';
      return;
    }

    container.innerHTML = lowItems.map(item => {
      const safeName = item.name ? item.name.replace(/"/g, '&quot;') : 'Product';
      const imgSrc = `<img src="${item.image || ''}" 
                        onerror="this.src='https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop'"
                        alt="${safeName}" 
                        style="width:100%;height:100%;object-fit:cover;">`;

      return `
      <div class="d-flex align-items-center justify-content-between py-2 px-1 border-bottom" style="border-color: var(--border-color) !important;">
        <div class="d-flex align-items-center gap-2">
          <span class="product-thumb d-flex align-items-center justify-content-center" style="width:36px;height:36px;font-size:16px;border-radius:6px;overflow:hidden;flex-shrink:0;">${imgSrc}</span>
          <div>
            <div class="fw-semibold" style="font-size:13px;" title="${item.name}">${item.name.length > 20 ? item.name.slice(0, 20) + '…' : item.name}</div>
            <div class="text-muted" style="font-size:12px;">${item.category}</div>
          </div>
        </div>
        <span class="status-badge ${item.stock === 0 ? 'out-of-stock' : 'low-stock'}" style="font-size:11px;">
          <span class="status-dot"></span>${item.stock === 0 ? 'Out of Stock' : item.stock + ' left'}
        </span>
      </div>
      `;
    }).join('');
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const hasTime = dateStr && dateStr.includes('T');
    return d.toLocaleString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric',
      ...(hasTime ? { hour: 'numeric', minute: '2-digit' } : {})
    });
  }

  return { init, initTheme, initSidebar, formatCurrency };
})();
