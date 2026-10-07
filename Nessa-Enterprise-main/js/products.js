/**
 * Products Module - Nessa Enterprise Dashboard
 * Product management table with search, filter, sort, pagination
 */

const Products = (() => {
  let allProducts = [];
  let filteredProducts = [];
  let currentPage = 1;
  const perPage = 10;
  let sortField = 'name';
  let sortDir = 'asc';

  async function init() {
    if (!Auth.requireRole(['Admin', 'Manager', 'Staff'])) return;
    Auth.populateUserInfo();
    Dashboard.initTheme();
    Dashboard.initSidebar();

    await ExcelService.loadData();
    allProducts = ExcelService.getProducts();
    filteredProducts = [...allProducts];

    populateCategories();
    render();
    bindEvents();
  }

  function populateCategories() {
    const sel = document.getElementById('categoryFilter');
    if (!sel) return;
    const cats = [...new Set(allProducts.map(p => p.category))].sort();
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
  }

  function bindEvents() {
    document.getElementById('productSearch')?.addEventListener('input', handleFilter);
    document.getElementById('categoryFilter')?.addEventListener('change', handleFilter);
    document.getElementById('sortPrice')?.addEventListener('change', handleSort);
  }

  function handleFilter() {
    const query = (document.getElementById('productSearch')?.value || '').toLowerCase();
    const cat = document.getElementById('categoryFilter')?.value || '';

    filteredProducts = allProducts.filter(p => {
      const matchSearch = !query || p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
      const matchCat = !cat || p.category === cat;
      return matchSearch && matchCat;
    });

    applySort();
    currentPage = 1;
    render();
  }

  function handleSort() {
    const val = document.getElementById('sortPrice')?.value;
    if (val === 'price-asc') { sortField = 'price'; sortDir = 'asc'; }
    else if (val === 'price-desc') { sortField = 'price'; sortDir = 'desc'; }
    else if (val === 'stock-asc') { sortField = 'stock'; sortDir = 'asc'; }
    else if (val === 'stock-desc') { sortField = 'stock'; sortDir = 'desc'; }
    else { sortField = 'name'; sortDir = 'asc'; }

    applySort();
    currentPage = 1;
    render();
  }

  function applySort() {
    filteredProducts.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function render() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    const start = (currentPage - 1) * perPage;
    const pageItems = filteredProducts.slice(start, start + perPage);

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="7" class="text-center py-5 text-muted">
          <i class="bi bi-inbox d-block mb-2" style="font-size:32px;opacity:0.4;"></i>
          No products found
        </td></tr>`;
    } else {
      tbody.innerHTML = pageItems.map(p => {
        const status = p.stock === 0 ? 'out-of-stock' : (p.stock < 10 ? 'low-stock' : 'in-stock');
        const statusLabel = p.stock === 0 ? 'Out of Stock' : (p.stock < 10 ? 'Low Stock' : 'In Stock');
        return `
        <tr class="animate-fadeIn">
          <td>
            <div class="product-cell">
              <div class="product-thumb">
                <img src="${p.image || p.fallback}" 
                     onerror="this.src='${p.fallback}'"
                     alt="${p.name}" 
                     style="width:50px;height:50px;object-fit:cover;border-radius:4px;">
              </div>
              <div class="product-details">
                <div class="product-name">${p.name}</div>
                <div class="product-sku">SKU: NES-${String(p.id).padStart(4, '0')}</div>
              </div>
            </div>
          </td>
          <td><span class="badge bg-light text-dark border" style="font-size:12px;">${p.category}</span></td>
          <td class="fw-semibold">₹${p.price.toLocaleString('en-IN')}</td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-outline-secondary" style="padding:0 5px;" onclick="Products.updateStock(${p.id}, -1)">-</button>
              <span class="fw-semibold" style="min-width:20px; text-align:center;">${p.stock}</span>
              <button class="btn btn-sm btn-outline-secondary" style="padding:0 5px;" onclick="Products.updateStock(${p.id}, 1)">+</button>
              <div class="stock-bar ms-2">
                <div class="stock-fill ${p.stock > 50 ? 'high' : p.stock > 10 ? 'medium' : 'low'}" style="width:${Math.min(100, p.stock / 3)}%"></div>
              </div>
            </div>
          </td>
          <td><span class="status-badge ${status}"><span class="status-dot"></span>${statusLabel}</span></td>
          <td>
            <div class="action-btns">
              <button class="action-btn" title="Edit Price" onclick="Products.editProduct(${p.id})"><i class="bi bi-pencil"></i></button>
              <button class="action-btn delete" title="Delete" onclick="Products.deleteProduct(${p.id})"><i class="bi bi-trash"></i></button>
            </div>
          </td>
        </tr>`;
      }).join('');
    }

    renderPagination();
    updateTableInfo();
  }

  function renderPagination() {
    const container = document.getElementById('productsPagination');
    if (!container) return;

    const totalPages = Math.ceil(filteredProducts.length / perPage);
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = '';
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="Products.goToPage(${currentPage - 1});return false;">‹</a></li>`;

    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i !== 1 && i !== totalPages && Math.abs(i - currentPage) > 1) {
        if (i === currentPage - 2 || i === currentPage + 2) html += `<li class="page-item disabled"><a class="page-link" href="#">…</a></li>`;
        continue;
      }
      html += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" onclick="Products.goToPage(${i});return false;">${i}</a></li>`;
    }

    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="#" onclick="Products.goToPage(${currentPage + 1});return false;">›</a></li>`;
    container.innerHTML = html;
  }

  function updateTableInfo() {
    const el = document.getElementById('productsTableInfo');
    if (!el) return;
    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, filteredProducts.length);
    el.textContent = `Showing ${start}–${end} of ${filteredProducts.length} products`;
  }

  function goToPage(page) {
    const totalPages = Math.ceil(filteredProducts.length / perPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    render();
  }

  async function editProduct(id) {
    const prod = allProducts.find(p => p.id === id);
    if (!prod) return;
    
    // Quick prompt for demo purposes (ideally use a modal)
    const newPrice = prompt(`Edit price for ${prod.name}`, prod.price);
    if (newPrice !== null && !isNaN(newPrice)) {
      try {
        await ExcelService.updateProduct(id, { price: parseFloat(newPrice) });
        allProducts = ExcelService.getProducts(); // refresh local list
        handleFilter(); // re-render
        alert('Product updated successfully!');
      } catch (err) {
        alert('Error updating product: ' + err.message);
      }
    }
  }

  async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await ExcelService.deleteProduct(id);
        allProducts = ExcelService.getProducts(); // refresh local list
        handleFilter(); // re-render
      } catch (err) {
        alert('Error deleting product: ' + err.message);
      }
    }
  }

  async function updateStock(id, change) {
    const prod = allProducts.find(p => p.id === id);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + change);
    if (newStock === prod.stock) return;
    try {
      await ExcelService.updateProduct(id, { stock: newStock });
      allProducts = ExcelService.getProducts();
      handleFilter();
    } catch (err) {
      alert('Error updating stock: ' + err.message);
    }
  }

  async function saveNewProduct() {
    const name = document.getElementById('addProductName').value.trim();
    const category = document.getElementById('addProductCategory').value.trim();
    const price = parseFloat(document.getElementById('addProductPrice').value);
    const stock = parseInt(document.getElementById('addProductStock').value);
    const image = document.getElementById('addProductImage').value.trim();

    if (!name || !category || isNaN(price) || isNaN(stock)) {
      alert('Please fill out all required fields with valid values.');
      return;
    }

    try {
      await ExcelService.addProduct({
        name,
        description: `High quality ${name.toLowerCase()}`,
        category,
        price,
        stock,
        image
      });
      allProducts = ExcelService.getProducts();
      
      // Update categories dropdown if it's a new category
      populateCategories();
      
      const modalEl = document.getElementById('addProductModal');
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
      
      document.getElementById('addProductForm').reset();
      
      // Re-render
      handleFilter();
    } catch (err) {
      alert('Error adding product: ' + err.message);
    }
  }

  async function exportToExcel() {
    try {
      await ExcelService.loadData();
      const wb = XLSX.utils.book_new();
      
      const users = ExcelService.getUsers();
      const products = ExcelService.getProducts();
      const orders = ExcelService.getOrders();
      const reports = ExcelService.getSalesReports();

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(users), 'Users');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(products), 'Products');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orders), 'Orders');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reports), 'SalesReports');

      XLSX.writeFile(wb, `Nessa_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  }

  async function importFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const importedData = {
          users: workbook.Sheets['Users'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Users']) : null,
          products: workbook.Sheets['Products'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Products']) : null,
          orders: workbook.Sheets['Orders'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Orders']) : null,
          salesReports: workbook.Sheets['SalesReports'] ? XLSX.utils.sheet_to_json(workbook.Sheets['SalesReports']) : null
        };

        if (confirm('This will overwrite current data. Continue?')) {
          await ExcelService.bulkImport(importedData);
          allProducts = ExcelService.getProducts();
          handleFilter();
          alert('Data imported successfully!');
        }
      } catch (err) {
        alert('Import failed: ' + err.message);
      } finally {
        event.target.value = ''; // Reset input
      }
    };
    reader.readAsArrayBuffer(file);
  }

  return { init, goToPage, editProduct, deleteProduct, updateStock, saveNewProduct, exportToExcel, importFromExcel };
})();
