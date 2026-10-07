/**
 * Analytics Module - Nessa Enterprise Dashboard
 * Advanced analytics with interactive Chart.js visualizations
 */

const Analytics = (() => {
  let charts = {};

  async function init() {
    if (!Auth.requireRole(['Admin', 'Manager', 'Staff'])) return;
    Auth.populateUserInfo();
    Dashboard.initTheme();
    Dashboard.initSidebar();

    await ExcelService.loadData();
    renderAnalyticsKPIs();
    renderCharts();
    renderTopProducts();
    renderCategoryPerformance();

    // Theme change listener
    const observer = new MutationObserver(() => renderCharts());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function renderAnalyticsKPIs() {
    const totalRevenue = ExcelService.getTotalRevenue();
    const totalOrders = ExcelService.getTotalOrders();
    const avgOrderValue = ExcelService.getAverageOrderValue();
    const growth = ExcelService.getMonthlyGrowth();

    setEl('analyticRevenue', '₹' + totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 }));
    setEl('analyticOrders', totalOrders.toLocaleString());
    setEl('analyticAOV', '₹' + avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 }));
    setEl('analyticGrowth', growth + '%');
  }

  function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function renderCharts() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    Object.values(charts).forEach(c => c.destroy());
    charts = {};

    const salesReports = ExcelService.getSalesReports();
    const months = salesReports.map(r => r.month);
    const revenues = salesReports.map(r => r.revenue);
    const orderCounts = salesReports.map(r => r.orders);

    // 1. Revenue Trend (Line + Area)
    const revCtx = document.getElementById('analyticsRevenueChart');
    if (revCtx) {
      const gradient = revCtx.getContext('2d').createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

      charts.revenue = new Chart(revCtx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Revenue (₹)',
              data: revenues,
              borderColor: '#6366f1',
              backgroundColor: gradient,
              borderWidth: 2.5,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#6366f1',
              pointBorderColor: isDark ? '#1a2332' : '#fff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 7
            },
            {
              label: 'Avg Revenue',
              data: Array(months.length).fill(revenues.reduce((a, b) => a + b, 0) / months.length),
              borderColor: isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(100, 116, 139, 0.3)',
              borderWidth: 1.5,
              borderDash: [6, 4],
              fill: false,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: {
              labels: { color: textColor, usePointStyle: true, font: { size: 12 } }
            },
            tooltip: {
              backgroundColor: isDark ? '#1e293b' : '#fff',
              titleColor: isDark ? '#e2e8f0' : '#0f172a',
              bodyColor: isDark ? '#94a3b8' : '#475569',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderWidth: 1,
              padding: 14,
              cornerRadius: 8,
              callbacks: {
                label: ctx => `${ctx.dataset.label}: ₹${ctx.raw.toLocaleString('en-IN')}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor } },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor, callback: v => '₹' + (v / 1000).toFixed(0) + 'k' },
              border: { display: false }
            }
          }
        }
      });
    }

    // 2. Orders Growth (Bar)
    const ordCtx = document.getElementById('analyticsOrdersChart');
    if (ordCtx) {
      charts.ordersGrowth = new Chart(ordCtx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: 'Orders',
            data: orderCounts,
            backgroundColor: months.map((_, i) => {
              const prev = i > 0 ? orderCounts[i - 1] : orderCounts[i];
              return orderCounts[i] >= prev ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)';
            }),
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 24
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
            x: { grid: { display: false }, ticks: { color: textColor } },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor },
              border: { display: false }
            }
          }
        }
      });
    }

    // 3. Category Revenue (Polar Area)
    const catCtx = document.getElementById('analyticsCategoryChart');
    if (catCtx) {
      const orders = ExcelService.getOrders();
      const products = ExcelService.getProducts();
      const catRevenue = {};
      orders.forEach(o => {
        const prod = products.find(p => p.id === o.productId);
        if (prod) {
          if (!catRevenue[prod.category]) catRevenue[prod.category] = 0;
          catRevenue[prod.category] += o.total;
        }
      });

      const catLabels = Object.keys(catRevenue);
      const catData = Object.values(catRevenue);
      const catColors = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

      charts.category = new Chart(catCtx, {
        type: 'polarArea',
        data: {
          labels: catLabels,
          datasets: [{
            data: catData,
            backgroundColor: catColors.slice(0, catLabels.length).map(c => c + 'cc'),
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: textColor, padding: 10, usePointStyle: true, font: { size: 12 } }
            },
            tooltip: {
              backgroundColor: isDark ? '#1e293b' : '#fff',
              titleColor: isDark ? '#e2e8f0' : '#0f172a',
              bodyColor: isDark ? '#94a3b8' : '#475569',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: ctx => `${ctx.label}: ₹${ctx.raw.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              }
            }
          },
          scales: {
            r: {
              grid: { color: gridColor },
              ticks: { display: false }
            }
          }
        }
      });
    }

    // 4. Revenue vs Orders Comparison (Dual Axis)
    const compCtx = document.getElementById('analyticsCompareChart');
    if (compCtx) {
      charts.compare = new Chart(compCtx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              type: 'line',
              label: 'Revenue (₹)',
              data: revenues,
              borderColor: '#6366f1',
              backgroundColor: 'transparent',
              borderWidth: 2.5,
              tension: 0.4,
              pointRadius: 3,
              yAxisID: 'y'
            },
            {
              type: 'bar',
              label: 'Orders',
              data: orderCounts,
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderRadius: 4,
              borderSkipped: false,
              barThickness: 20,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: {
              labels: { color: textColor, usePointStyle: true, font: { size: 12 } }
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
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor } },
            y: {
              position: 'left',
              grid: { color: gridColor },
              ticks: { color: textColor, callback: v => '₹' + (v / 1000).toFixed(0) + 'k' },
              border: { display: false }
            },
            y1: {
              position: 'right',
              grid: { display: false },
              ticks: { color: textColor },
              border: { display: false }
            }
          }
        }
      });
    }
  }

  function renderTopProducts() {
    const container = document.getElementById('topProductsList');
    if (!container) return;

    const topProducts = ExcelService.getTopSellingProducts(8);
    const maxQty = topProducts.length ? topProducts[0].quantity : 1;

    container.innerHTML = topProducts.map((p, i) => `
      <div class="d-flex align-items-center gap-3 py-2 ${i < topProducts.length - 1 ? 'border-bottom' : ''}" style="border-color: var(--border-color) !important;">
        <span class="fw-bold text-muted" style="width:20px;font-size:13px;">${i + 1}</span>
        <div class="flex-grow-1">
          <div class="fw-semibold" style="font-size:13px;">${p.name.length > 28 ? p.name.slice(0, 28) + '…' : p.name}</div>
          <div class="progress mt-1" style="height:4px;border-radius:2px;">
            <div class="progress-bar" style="width:${(p.quantity / maxQty) * 100}%;background:var(--primary-500);border-radius:2px;"></div>
          </div>
        </div>
        <span class="fw-semibold" style="font-size:13px;">${p.quantity} sold</span>
      </div>
    `).join('');
  }

  function renderCategoryPerformance() {
    const container = document.getElementById('categoryPerformance');
    if (!container) return;

    const orders = ExcelService.getOrders();
    const products = ExcelService.getProducts();
    const catData = {};

    orders.forEach(o => {
      const prod = products.find(p => p.id === o.productId);
      if (prod) {
        if (!catData[prod.category]) catData[prod.category] = { revenue: 0, orders: 0 };
        catData[prod.category].revenue += o.total;
        catData[prod.category].orders++;
      }
    });

    const sorted = Object.entries(catData).sort((a, b) => b[1].revenue - a[1].revenue);
    const totalRevenue = sorted.reduce((s, [, d]) => s + d.revenue, 0);

    container.innerHTML = `
      <table class="table nessa-table mb-0">
        <thead>
          <tr>
            <th>Category</th>
            <th>Revenue</th>
            <th>Orders</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(([cat, data]) => {
            const share = ((data.revenue / totalRevenue) * 100).toFixed(1);
            return `
            <tr>
              <td class="fw-semibold">${cat}</td>
              <td>₹${data.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
              <td>${data.orders}</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="progress flex-grow-1" style="height:6px;border-radius:3px;">
                    <div class="progress-bar" style="width:${share}%;background:var(--primary-500);border-radius:3px;"></div>
                  </div>
                  <span class="text-muted" style="font-size:12px;min-width:40px;">${share}%</span>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  return { init };
})();
