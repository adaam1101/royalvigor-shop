// =========================================================
// RoyalVigor Admin Dashboard Application Logic
// Orders Pipeline, Real-Time Stats, WhatsApp/Call Actions
// Clean, Professional SaaS Design with XSS Sanitization
// =========================================================

let adminToken = sessionStorage.getItem('rv_admin_token') || null;
let currentTab = 'orders';
let orderFilter = 'all';
let ordersList = [];
let productsList = [];
let wilayasList = [];
let storeSettings = {};
let currentEditingOrder = null;

// Security: XSS Sanitization Helper
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupAdminListeners();
});

// Authentication
function checkAuth() {
  const modal = document.getElementById('admin-login-modal');
  if (!adminToken) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  } else {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    loadAdminData();
  }
}

async function loginAdmin(e) {
  e.preventDefault();
  const pin = document.getElementById('admin-pin-input').value.trim();
  const errorEl = document.getElementById('admin-login-error');

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();

    if (data.success) {
      adminToken = data.token;
      sessionStorage.setItem('rv_admin_token', adminToken);
      document.getElementById('admin-login-modal').classList.add('hidden');
      document.getElementById('admin-login-modal').classList.remove('flex');
      loadAdminData();
    } else {
      errorEl.textContent = data.message || 'رمز الدخول غير صحيح';
      errorEl.classList.remove('hidden');
    }
  } catch (err) {
    errorEl.textContent = 'تعذر الاتصال بالخادم';
    errorEl.classList.remove('hidden');
  }
}

function logoutAdmin() {
  sessionStorage.removeItem('rv_admin_token');
  adminToken = null;
  location.reload();
}

// Load All Admin Data
async function loadAdminData() {
  await Promise.all([
    fetchOrders(),
    fetchStats(),
    fetchProducts(),
    fetchWilayas(),
    fetchSettings()
  ]);
}

// Switch Tabs
function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('bg-slate-900', 'text-white', 'font-bold', 'shadow-2xs');
      btn.classList.remove('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100', 'font-medium');
    } else {
      btn.classList.remove('bg-slate-900', 'text-white', 'font-bold', 'shadow-2xs');
      btn.classList.add('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100', 'font-medium');
    }
  });

  document.querySelectorAll('.admin-tab-pane').forEach(pane => {
    pane.classList.add('hidden');
  });

  const activePane = document.getElementById(`tab-pane-${tabId}`);
  if (activePane) activePane.classList.remove('hidden');

  if (tabId === 'wilayas') renderWilayasTable();
  if (tabId === 'products') renderProductsManager();
  if (tabId === 'settings') populateSettingsForm();
}

// ================= ORDERS TAB =================
async function fetchOrders() {
  try {
    const searchVal = document.getElementById('orders-search')?.value || '';
    const res = await fetch(`/api/orders?status=${orderFilter}&search=${encodeURIComponent(searchVal)}`);
    ordersList = await res.json();
    renderOrdersTable();
  } catch (err) {
    console.error('Failed to fetch orders:', err);
  }
}

async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const stats = await res.json();

    document.getElementById('stat-total-orders').textContent = stats.totalOrders || 0;
    document.getElementById('stat-pending').textContent = stats.pendingCount || 0;
    document.getElementById('stat-confirmed').textContent = stats.confirmedCount || 0;
    document.getElementById('stat-delivered').textContent = stats.deliveredCount || 0;
    document.getElementById('stat-revenue').innerHTML = `<span dir="ltr" class="bidi-ltr font-mono">${(stats.totalRevenue || 0).toLocaleString()}</span> د.ج`;
    document.getElementById('stat-conv-rate').textContent = `${stats.confirmationRate || 0}%`;

    // Highlight pending badge if any
    const pendingPill = document.getElementById('pending-alert-pill');
    if (pendingPill) {
      if (stats.pendingCount > 0) {
        pendingPill.textContent = `${stats.pendingCount} جديد`;
        pendingPill.classList.remove('hidden');
      } else {
        pendingPill.classList.add('hidden');
      }
    }
  } catch (err) {
    console.error('Failed to fetch stats:', err);
  }
}

function setOrderFilter(filter) {
  orderFilter = filter;
  document.querySelectorAll('.filter-pill').forEach(btn => {
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('bg-slate-900', 'text-white', 'font-bold');
      btn.classList.remove('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200', 'font-medium');
    } else {
      btn.classList.remove('bg-slate-900', 'text-white', 'font-bold');
      btn.classList.add('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200', 'font-medium');
    }
  });
  fetchOrders();
}

function renderOrdersTable() {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  if (ordersList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-16 text-slate-500 text-sm">
          <div class="flex flex-col items-center justify-center gap-2">
            <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">✓</div>
            <span class="text-slate-800 font-bold text-base">لا توجد طلبيات مسجلة حالياً</span>
            <span class="text-xs text-slate-500 max-w-md">المتجر متصل وجاهز لاستقبال طلبات الزبائن مباشرة. أي طلب جديد مسجل في المتجر سيصل إلى هنا فوراً بحالة "بحاجة للاتصال".</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = ordersList.map(order => {
    const dateFormatted = new Date(order.created_at).toLocaleDateString('ar-DZ', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const statusBadge = getStatusBadgeHTML(order.status);
    const deliveryBadge = order.customer.delivery_type === 'desk' 
      ? '<span class="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">استلام مكتب (Stop Desk)</span>'
      : '<span class="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">توصيل لباب المنزل</span>';

    // WhatsApp prefilled confirmation text
    const itemsSummary = (order.items || []).map(i => `${escapeHTML(i.product_name)} (×${i.quantity})`).join(' + ');
    const waMessage = `السلام عليكم ورحمة الله أخي ${order.customer.full_name}،
معك متجر RoyalVigor بخصوص طلبيتك رقم #${order.id}:
📦 المنتجات: ${itemsSummary}
💰 المبلغ الإجمالي: ${order.total.toLocaleString()} د.ج (الدفع عند الاستلام)
📍 العنوان: ${order.customer.wilaya_name} - ${order.customer.address} (${order.customer.delivery_type === 'desk' ? 'استلام من المكتب' : 'توصيل للمنزل'})

هل تؤكد شحن الطلبية لحضرتك؟`;

    // Clean phone number for WhatsApp
    let cleanWaPhone = (order.customer.phone || '').replace(/\D/g, '');
    if (cleanWaPhone.startsWith('0')) cleanWaPhone = '213' + cleanWaPhone.slice(1);
    if (!cleanWaPhone.startsWith('213')) cleanWaPhone = '213' + cleanWaPhone;

    return `
      <tr class="hover:bg-slate-50/70 transition-colors">
        <!-- Order ID & Date -->
        <td class="py-4 px-4 align-top">
          <div class="font-mono font-bold text-slate-900 text-sm cursor-pointer hover:text-slate-600 hover:underline bidi-ltr" dir="ltr" onclick="viewOrderDetails('${escapeHTML(order.id)}')">#${escapeHTML(order.id)}</div>
          <div class="text-xs text-slate-400 mt-0.5">${dateFormatted}</div>
        </td>

        <!-- Customer Info -->
        <td class="py-4 px-4 align-top">
          <div class="font-semibold text-slate-900 text-sm">${escapeHTML(order.customer.full_name)}</div>
          <div class="text-xs text-slate-600 font-medium">${escapeHTML(order.customer.wilaya_name)}</div>
          <div class="text-xs text-slate-500 truncate max-w-[180px] mt-0.5">${escapeHTML(order.customer.address || '')}</div>
          <div class="mt-1.5">${deliveryBadge}</div>
        </td>

        <!-- Phone & Quick Actions -->
        <td class="py-4 px-4 align-top">
          <div class="font-mono text-xs font-semibold text-slate-800 mb-2 bidi-ltr" dir="ltr">${escapeHTML(order.customer.phone)}</div>
          <div class="flex items-center gap-1.5">
            <!-- Direct Phone Dial Button -->
            <a href="tel:${escapeHTML(order.customer.phone)}" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 shadow-2xs transition-all active:scale-95" title="اتصال مباشر بالزبون">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              <span>اتصال</span>
            </a>
            <!-- Direct WhatsApp Message Button -->
            <a href="https://wa.me/${cleanWaPhone}?text=${encodeURIComponent(waMessage)}" target="_blank" class="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 shadow-2xs transition-all active:scale-95" title="مراسلة عبر واتساب">
              <span>واتساب</span>
            </a>
          </div>
        </td>

        <!-- Items & Total -->
        <td class="py-4 px-4 align-top">
          <div class="text-xs text-slate-700 font-normal line-clamp-2 max-w-[200px]">
            ${itemsSummary}
          </div>
          <div class="mt-1.5 flex items-baseline gap-2">
            <span class="font-mono font-bold text-slate-900 text-sm bidi-ltr" dir="ltr">${order.total.toLocaleString()} د.ج</span>
          </div>
        </td>

        <!-- Status Dropdown -->
        <td class="py-4 px-4 align-top">
          <select onchange="updateOrderStatus('${escapeHTML(order.id)}', this.value)" class="bg-white text-slate-800 text-xs rounded-lg px-2.5 py-1.5 border border-slate-300 focus:outline-none focus:border-slate-800 cursor-pointer shadow-2xs">
            <option value="pending_call" ${order.status === 'pending_call' ? 'selected' : ''}>بحاجة للاتصال</option>
            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>تم التأكيد هاتفياً</option>
            <option value="shipping" ${order.status === 'shipping' ? 'selected' : ''}>قيد الشحن</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>تم التسليم والقبض</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
          </select>
          <div class="mt-1.5">${statusBadge}</div>
        </td>

        <!-- Notes -->
        <td class="py-4 px-4 align-top">
          <div class="text-xs text-slate-500 italic max-w-[150px] truncate" title="${escapeHTML(order.admin_notes || '')}">
            ${escapeHTML(order.admin_notes || 'لا توجد ملاحظات')}
          </div>
          ${order.tracking_number ? `<div class="text-xs text-slate-700 font-mono mt-1 font-semibold bidi-ltr" dir="ltr">تتبع: ${escapeHTML(order.tracking_number)}</div>` : ''}
        </td>

        <!-- Actions -->
        <td class="py-4 px-4 text-left align-top">
          <div class="flex items-center gap-1.5 justify-end">
            <button onclick="viewOrderDetails('${escapeHTML(order.id)}')" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold" title="عرض التفاصيل الكاملة">
              عرض
            </button>
            <button onclick="printOrderSlip('${escapeHTML(order.id)}')" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold" title="طباعة وصل التوصيل (Bon de livraison)">
              طباعة
            </button>
            <button onclick="deleteOrderPrompt('${escapeHTML(order.id)}')" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold" title="حذف الطلب">
              حذف
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getStatusBadgeHTML(status) {
  switch (status) {
    case 'pending_call':
      return '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">بحاجة للاتصال</span>';
    case 'confirmed':
      return '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">مؤكد هاتفياً</span>';
    case 'shipping':
      return '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">قيد الشحن والتوصيل</span>';
    case 'delivered':
      return '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">تم التسليم والقبض</span>';
    case 'cancelled':
      return '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">ملغي</span>';
    default:
      return '';
  }
}

// Update Order Status API
async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      await fetchStats();
      const order = ordersList.find(o => o.id === orderId);
      if (order) order.status = newStatus;
      renderOrdersTable();
    }
  } catch (err) {
    console.error('Failed to update status:', err);
  }
}

// Order Details Modal
function viewOrderDetails(orderId) {
  const order = ordersList.find(o => o.id === orderId);
  if (!order) return;
  currentEditingOrder = order;

  document.getElementById('modal-order-id-title').innerHTML = `<span dir="ltr" class="bidi-ltr font-mono">#${escapeHTML(order.id)}</span>`;
  document.getElementById('modal-order-status-select').value = order.status;
  document.getElementById('modal-order-customer-name').textContent = order.customer.full_name;
  document.getElementById('modal-order-customer-phone').innerHTML = `<span dir="ltr" class="bidi-ltr font-mono">${escapeHTML(order.customer.phone)}</span>`;
  document.getElementById('modal-order-customer-email').textContent = order.customer.email || 'غير مسجل';
  document.getElementById('modal-order-customer-wilaya').textContent = order.customer.wilaya_name;
  document.getElementById('modal-order-customer-address').textContent = order.customer.address;
  document.getElementById('modal-order-delivery-mode').textContent = order.customer.delivery_type === 'desk' ? 'استلام من المكتب (Stop Desk)' : 'توصيل لباب المنزل';
  document.getElementById('modal-order-notes-input').value = order.admin_notes || '';
  document.getElementById('modal-order-tracking-input').value = order.tracking_number || '';
  document.getElementById('modal-order-cust-notes').textContent = order.customer.notes || 'لا توجد ملاحظات من الزبون';

  // Items table in modal
  const itemsContainer = document.getElementById('modal-order-items-list');
  itemsContainer.innerHTML = (order.items || []).map(i => `
    <div class="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
      <span class="text-slate-900 font-medium">${escapeHTML(i.product_name)} <span class="text-slate-400">× ${i.quantity}</span></span>
      <span class="font-mono font-bold text-slate-900 bidi-ltr" dir="ltr">${(i.price * i.quantity).toLocaleString()} د.ج</span>
    </div>
  `).join('');

  document.getElementById('modal-order-subtotal').innerHTML = `<span dir="ltr" class="bidi-ltr font-mono">${(order.subtotal || 0).toLocaleString()}</span> د.ج`;
  document.getElementById('modal-order-discount').textContent = `0 د.ج`;
  document.getElementById('modal-order-shipping').innerHTML = `<span dir="ltr" class="bidi-ltr font-mono">${(order.shipping_fee || 0).toLocaleString()}</span> د.ج`;
  document.getElementById('modal-order-total').innerHTML = `<span dir="ltr" class="bidi-ltr font-mono font-bold">${order.total.toLocaleString()}</span> د.ج`;

  // Direct phone link
  const callBtn = document.getElementById('modal-order-call-btn');
  callBtn.href = `tel:${order.customer.phone}`;

  const modal = document.getElementById('order-detail-modal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeOrderDetailModal() {
  document.getElementById('order-detail-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

async function saveOrderDetailChanges() {
  if (!currentEditingOrder) return;
  const status = document.getElementById('modal-order-status-select').value;
  const notes = document.getElementById('modal-order-notes-input').value;
  const tracking = document.getElementById('modal-order-tracking-input').value;

  try {
    const res = await fetch(`/api/orders/${currentEditingOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        admin_notes: notes,
        tracking_number: tracking
      })
    });
    if (res.ok) {
      closeOrderDetailModal();
      await fetchOrders();
      await fetchStats();
    }
  } catch (err) {
    alert('حدث خطأ أثناء حفظ التعديلات');
  }
}

async function deleteOrderPrompt(orderId) {
  if (!confirm(`هل أنت متأكد من رغبتك في حذف الطلب #${orderId} نهائياً؟`)) return;

  try {
    const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchOrders();
      await fetchStats();
    }
  } catch (err) {
    alert('حدث خطأ أثناء حذف الطلب');
  }
}

// Print Shipping Slip (Bon de livraison)
function printOrderSlip(orderId) {
  const order = ordersList.find(o => o.id === orderId);
  if (!order) return;

  const slipContainer = document.getElementById('print-slip-area');
  const itemsText = (order.items || []).map(i => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:right;">${escapeHTML(i.product_name)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:left;font-family:monospace;" dir="ltr">${(i.price * i.quantity).toLocaleString()} DZD</td>
    </tr>
  `).join('');

  slipContainer.innerHTML = `
    <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;max-width:600px;margin:0 auto;border:1px solid #cbd5e1;padding:24px;border-radius:8px;direction:rtl;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0f172a;padding-bottom:12px;margin-bottom:16px">
        <div>
          <h2 style="margin:0;font-size:22px;font-weight:800;letter-spacing:0.5px;color:#0f172a;">RoyalVigor</h2>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b">وصل تسليم — Bon de Livraison</p>
        </div>
        <div style="text-align:left">
          <h3 style="margin:0;font-size:16px;font-family:monospace;font-weight:700;color:#0f172a;" dir="ltr">#${escapeHTML(order.id)}</h3>
          <span style="font-size:11px;color:#64748b">${new Date(order.created_at).toLocaleDateString('ar-DZ')}</span>
        </div>
      </div>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:14px;border-radius:6px;margin-bottom:16px;">
        <h4 style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;color:#475569;font-weight:700;">معلومات المستلم:</h4>
        <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4px;">${escapeHTML(order.customer.full_name)}</div>
        <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:4px;font-family:monospace;" dir="ltr">الهاتف: ${escapeHTML(order.customer.phone)}</div>
        <div style="font-size:13px;color:#334155;margin-bottom:2px;">الولاية: <strong>${escapeHTML(order.customer.wilaya_name)}</strong></div>
        <div style="font-size:13px;color:#334155;margin-bottom:2px;">العنوان: ${escapeHTML(order.customer.address)}</div>
        <div style="font-size:13px;color:#0f172a;margin-top:6px;font-weight:600;">طريقة الاستلام: ${order.customer.delivery_type === 'desk' ? 'استلام من مكتب التوصيل (Stop Desk)' : 'توصيل لباب المنزل'}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px">
        <thead>
          <tr style="background:#f1f5f9;border-bottom:1px solid #cbd5e1;">
            <th style="padding:8px 10px;text-align:right;font-weight:600;color:#334155;">المنتج</th>
            <th style="padding:8px 10px;text-align:center;font-weight:600;color:#334155;">الكمية</th>
            <th style="padding:8px 10px;text-align:left;font-weight:600;color:#334155;">المبلغ</th>
          </tr>
        </thead>
        <tbody>
          ${itemsText}
        </tbody>
      </table>

      <div style="border-top:2px solid #0f172a;padding-top:10px;display:flex;justify-content:space-between;font-weight:700;font-size:15px">
        <span>المبلغ الإجمالي للدفع عند الاستلام:</span>
        <span style="font-family:monospace;font-size:17px;color:#0f172a;" dir="ltr">${order.total.toLocaleString()} DZD</span>
      </div>

      <div style="margin-top:20px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px dashed #cbd5e1;padding-top:10px">
        متجر RoyalVigor الجزائر — هاتف التأكيد: 0664936133
      </div>
    </div>
  `;

  window.print();
}

// Export CSV
function exportOrdersToCSV() {
  if (ordersList.length === 0) {
    alert('لا توجد طلبات لتصديرها');
    return;
  }

  const headers = ['رقم الطلب', 'التاريخ', 'اسم الزبون', 'الهاتف', 'الولاية', 'العنوان', 'طريقة الاستلام', 'المبلغ الإجمالي', 'الحالة', 'المنتجات'];
  const rows = ordersList.map(o => [
    o.id,
    new Date(o.created_at).toISOString().split('T')[0],
    `"${(o.customer.full_name || '').replace(/"/g, '""')}"`,
    `"${o.customer.phone}"`,
    `"${(o.customer.wilaya_name || '').replace(/"/g, '""')}"`,
    `"${(o.customer.address || '').replace(/"/g, '""')}"`,
    o.customer.delivery_type === 'desk' ? 'مكتب' : 'منزل',
    o.total,
    o.status,
    `"${(o.items || []).map(i => `${i.product_name} (${i.quantity})`).join(' + ').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `royalvigor-orders-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ================= PRODUCTS TAB =================
async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    productsList = await res.json();
    renderProductsManager();
  } catch (err) {
    console.error('Failed to fetch products:', err);
  }
}

function renderProductsManager() {
  const container = document.getElementById('admin-products-grid');
  if (!container) return;

  container.innerHTML = productsList.map(p => `
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
      <div class="p-4 flex items-center gap-3 border-b border-slate-100 bg-slate-50">
        <img src="${p.image}" alt="${p.name}" class="w-16 h-16 object-contain rounded-lg bg-white border border-slate-200 p-1">
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-sm text-slate-900 truncate">${p.name}</h4>
          <span class="text-xs text-slate-500 font-mono">${p.id}</span>
          <div class="flex items-center gap-2 mt-1">
            <span class="font-mono font-bold text-slate-900 text-sm bidi-ltr" dir="ltr">${p.price.toLocaleString()} د.ج</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded font-semibold ${p.in_stock ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}">
              ${p.in_stock ? 'متوفر' : 'غير متوفر'}
            </span>
          </div>
        </div>
      </div>
      <div class="p-3 bg-white flex items-center justify-between text-xs">
        <span class="text-slate-500 truncate max-w-[150px]">${p.category_ar || ''}</span>
        <button onclick="openEditProductModal('${p.id}')" class="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-2xs">
          تعديل السعر والمخزون
        </button>
      </div>
    </div>
  `).join('');
}

function openEditProductModal(id) {
  const p = productsList.find(item => item.id === id);
  if (!p) return;

  document.getElementById('edit-product-id').value = p.id;
  document.getElementById('edit-product-name').value = p.name;
  document.getElementById('edit-product-price').value = p.price;
  document.getElementById('edit-product-original-price').value = p.original_price || p.price;
  document.getElementById('edit-product-instock').checked = p.in_stock !== false;
  document.getElementById('edit-product-badge').value = p.badge_ar || '';
  document.getElementById('edit-product-short-desc').value = p.short_desc_ar || '';

  const modal = document.getElementById('edit-product-modal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeEditProductModal() {
  document.getElementById('edit-product-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

async function saveProductEdits(e) {
  e.preventDefault();
  const id = document.getElementById('edit-product-id').value;
  const price = Number(document.getElementById('edit-product-price').value);
  const original_price = Number(document.getElementById('edit-product-original-price').value);
  const in_stock = document.getElementById('edit-product-instock').checked;
  const badge_ar = document.getElementById('edit-product-badge').value;
  const short_desc_ar = document.getElementById('edit-product-short-desc').value;

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price,
        original_price,
        in_stock,
        badge_ar,
        short_desc_ar
      })
    });
    if (res.ok) {
      closeEditProductModal();
      await fetchProducts();
    }
  } catch (err) {
    alert('حدث خطأ أثناء حفظ التعديل');
  }
}

// ================= WILAYAS TAB =================
async function fetchWilayas() {
  try {
    const res = await fetch('/api/wilayas');
    wilayasList = await res.json();
  } catch (err) {
    console.error('Failed to fetch wilayas:', err);
  }
}

function renderWilayasTable() {
  const tbody = document.getElementById('wilayas-table-body');
  if (!tbody) return;

  tbody.innerHTML = wilayasList.map(w => `
    <tr class="hover:bg-slate-50/50 transition-colors">
      <td class="py-3 px-4 font-mono font-bold text-slate-800 bidi-ltr" dir="ltr">${w.code}</td>
      <td class="py-3 px-4 font-semibold text-slate-900">${w.name_ar}</td>
      <td class="py-3 px-4 text-slate-600 font-['Plus_Jakarta_Sans']">${w.name_fr}</td>
      <td class="py-3 px-4">
        <input type="number" value="${w.home_price}" onchange="updateWilayaPrice(${w.code}, 'home', this.value)" class="w-24 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-800 text-center focus:border-slate-800 focus:outline-none">
        <span class="text-xs text-slate-500 mr-1">د.ج</span>
      </td>
      <td class="py-3 px-4">
        <input type="number" value="${w.desk_price}" onchange="updateWilayaPrice(${w.code}, 'desk', this.value)" class="w-24 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-800 text-center focus:border-slate-800 focus:outline-none">
        <span class="text-xs text-slate-500 mr-1">د.ج</span>
      </td>
    </tr>
  `).join('');
}

function updateWilayaPrice(code, type, val) {
  const w = wilayasList.find(item => item.code === code);
  if (!w) return;
  if (type === 'home') w.home_price = Number(val);
  if (type === 'desk') w.desk_price = Number(val);
}

async function saveAllWilayas() {
  try {
    const res = await fetch('/api/wilayas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wilayasList)
    });
    if (res.ok) {
      alert('تم حفظ أسعار التوصيل لجميع الولايات بنجاح! ✅');
    }
  } catch (err) {
    alert('حدث خطأ أثناء حفظ أسعار الولايات');
  }
}

// ================= SETTINGS TAB =================
async function fetchSettings() {
  try {
    const res = await fetch('/api/settings');
    storeSettings = await res.json();
  } catch (err) {
    console.error('Failed to fetch settings:', err);
  }
}

function populateSettingsForm() {
  document.getElementById('settings-store-name').value = storeSettings.store_name || 'RoyalVigor';
  document.getElementById('settings-store-name-ar').value = storeSettings.store_name_ar || 'رويال فيجور';
  document.getElementById('settings-phone').value = storeSettings.phone || '';
  document.getElementById('settings-whatsapp').value = storeSettings.whatsapp || '';
  document.getElementById('settings-announcement-ar').value = storeSettings.announcement_ar || '';
  document.getElementById('settings-announcement-en').value = storeSettings.announcement_en || '';
}

async function saveStoreSettings(e) {
  e.preventDefault();
  const payload = {
    store_name: document.getElementById('settings-store-name').value,
    store_name_ar: document.getElementById('settings-store-name-ar').value,
    phone: document.getElementById('settings-phone').value,
    phone_raw: document.getElementById('settings-phone').value.replace(/\D/g, ''),
    whatsapp: document.getElementById('settings-whatsapp').value.replace(/\D/g, ''),
    announcement_ar: document.getElementById('settings-announcement-ar').value,
    announcement_en: document.getElementById('settings-announcement-en').value
  };

  const newPin = document.getElementById('settings-admin-pin').value.trim();
  if (newPin) payload.admin_pin = newPin;

  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      storeSettings = await res.json();
      alert('تم تحديث إعدادات المتجر بنجاح! ✅');
    }
  } catch (err) {
    alert('حدث خطأ أثناء حفظ الإعدادات');
  }
}

// Setup Event Listeners
function setupAdminListeners() {
  document.getElementById('admin-login-form')?.addEventListener('submit', loginAdmin);
  document.getElementById('orders-search')?.addEventListener('input', fetchOrders);
  document.getElementById('edit-product-form')?.addEventListener('submit', saveProductEdits);
  document.getElementById('store-settings-form')?.addEventListener('submit', saveStoreSettings);

  document.getElementById('order-detail-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'order-detail-modal' || e.target.id === 'order-detail-wrapper') closeOrderDetailModal();
  });
  document.getElementById('edit-product-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'edit-product-modal' || e.target.id === 'edit-product-wrapper') closeEditProductModal();
  });
}
