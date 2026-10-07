import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import * as XLSX from 'xlsx';

export default function Settings() {
  const { user } = useAuth();
  const { loadData, showToast, users, products, orders } = useData();

  const [name, setName] = useState(user?.name || 'Admin User');
  const [email, setEmail] = useState(user?.email || 'admin@nessa.com');
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        const importedUsers = XLSX.utils.sheet_to_json(wb.Sheets['Users'] || wb.Sheets[wb.SheetNames[0]] || []);
        const importedProducts = XLSX.utils.sheet_to_json(wb.Sheets['Products'] || wb.Sheets[wb.SheetNames[1]] || []);

        if (importedProducts.length > 0) {
          localStorage.setItem('nessa_offline_db', JSON.stringify({
            users: importedUsers.length ? importedUsers : users,
            products: importedProducts,
            orders,
            salesReports: []
          }));
          loadData();
          showToast('Database imported from Excel successfully!', 'success');
        } else {
          showToast('No valid product data found in Excel sheet.', 'error');
        }
      } catch (err) {
        showToast('Error reading Excel file.', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb nessa-breadcrumb mb-1">
              <li className="breadcrumb-item"><a href="#!">Dashboard</a></li>
              <li className="breadcrumb-item active" aria-current="page">Settings</li>
            </ol>
          </nav>
          <h1 className="h3 mb-0">System Settings</h1>
          <p className="page-subtitle mb-0">Manage user accounts, system configuration, and Excel database imports.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-surface h-100">
            <h5 className="fw-bold mb-3"><i className="bi bi-person-gear text-primary me-2"></i>Account Profile</h5>
            <div className="mb-3">
              <label className="form-label fw-semibold fs-7">Full Name</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold fs-7">Email Address</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold fs-7">Assigned Role</label>
              <input type="text" className="form-control bg-light" value={user?.role || 'Admin'} disabled />
            </div>
            <button className="btn btn-primary rounded-pill px-4 fw-bold mt-2" onClick={() => showToast('Profile updated!', 'success')}>
              Save Profile
            </button>
          </div>
        </div>

        {/* Database & Sync Card */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-surface h-100">
            <h5 className="fw-bold mb-3"><i className="bi bi-database-gear text-success me-2"></i>Database & Integration</h5>
            <p className="text-muted fs-7">Import existing product & order lists directly from `.xlsx` spreadsheets into your React database.</p>

            <div className="mb-4">
              <label className="form-label fw-semibold fs-7">Import Excel Spreadsheet (.xlsx)</label>
              <input type="file" className="form-control" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </div>

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="notifSwitch"
                checked={notifEnabled}
                onChange={() => setNotifEnabled(!notifEnabled)}
              />
              <label className="form-check-label fw-semibold fs-7" htmlFor="notifSwitch">
                Enable Socket.IO Live Audio/Toast Alerts
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
