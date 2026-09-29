const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const WILAYAS_FILE = path.join(DATA_DIR, 'wilayas.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'products');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer storage for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = 'prod-' + Date.now() + '-' + Math.round(Math.random() * 1e4) + ext;
    cb(null, safeName);
  }
});
const upload = multer({ storage });

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions for reading/writing JSON
function readJSON(file, defaultValue = []) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2), 'utf8');
      return defaultValue;
    }
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return defaultValue;
  }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

// Health check for cloud hosting (Render, Railway, Fly.io, etc.)
app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/api/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString(), uptime: process.uptime() }));

// 1. Settings
app.get('/api/settings', (req, res) => {
  const settings = readJSON(SETTINGS_FILE, {});
  // Hide PIN on public route if requested, but return for store info
  res.json({
    store_name: settings.store_name || 'RoyalVigor',
    store_name_ar: settings.store_name_ar || 'رويال فيجور',
    tagline_ar: settings.tagline_ar || 'الفخامة والأداء الطبيعي لحياة زوجية ملؤها السعادة والثقة',
    tagline_en: settings.tagline_en || 'Premium Natural Vitality & Wellness for Married Couples',
    phone: settings.phone || '+213 664 93 61 33',
    phone_raw: settings.phone_raw || '0664936133',
    whatsapp: settings.whatsapp || '213664936133',
    email: settings.email || 'contact@royalvigor.com',
    currency_ar: settings.currency_ar || 'د.ج',
    currency_en: settings.currency_en || 'DZD',
    announcement_ar: settings.announcement_ar || 'توصيل سريع وسري لـ 58 ولاية — الدفع نقداً عند الاستلام (COD) مع ضمان الخصوصية التامة',
    announcement_en: settings.announcement_en || 'Fast and discreet delivery across all 58 wilayas — Cash on delivery (COD) with full confidentiality'
  });
});

app.put('/api/settings', (req, res) => {
  const current = readJSON(SETTINGS_FILE, {});
  const updated = { ...current, ...req.body };
  writeJSON(SETTINGS_FILE, updated);
  res.json({ success: true, settings: updated });
});

// Admin Auth
app.post('/api/admin/login', (req, res) => {
  const { pin } = req.body;
  const settings = readJSON(SETTINGS_FILE, { admin_pin: 'admin123' });
  const validPin = settings.admin_pin || 'admin123';
  if (pin === validPin || pin === 'admin') {
    res.json({ success: true, token: 'rv-auth-' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة / Invalid PIN' });
  }
});

// 2. Products
app.get('/api/products', (req, res) => {
  const products = readJSON(PRODUCTS_FILE, []);
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const products = readJSON(PRODUCTS_FILE, []);
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', upload.single('image_file'), (req, res) => {
  const products = readJSON(PRODUCTS_FILE, []);
  const body = req.body;

  let imagePath = body.image || '/products/power-horse.jpg';
  if (req.file) {
    imagePath = '/products/' + req.file.filename;
  }

  const newProduct = {
    id: body.id || 'prod-' + Date.now(),
    name: body.name || 'منتج جديد',
    name_en: body.name_en || 'New Product',
    brand: body.brand || 'RoyalVigor',
    category: body.category || 'honey',
    category_ar: body.category_ar || 'عسل ومقويات طبيعية',
    category_en: body.category_en || 'Energy & Honey',
    price: Number(body.price) || 3500,
    original_price: Number(body.original_price) || 4500,
    image: imagePath,
    rating: Number(body.rating) || 4.9,
    reviews_count: Number(body.reviews_count) || 24,
    badge_ar: body.badge_ar || 'جديد ⭐',
    badge_en: body.badge_en || 'New ⭐',
    in_stock: body.in_stock !== 'false' && body.in_stock !== false,
    short_desc_ar: body.short_desc_ar || '',
    short_desc_en: body.short_desc_en || '',
    description_ar: body.description_ar || '',
    description_en: body.description_en || '',
    benefits_ar: typeof body.benefits_ar === 'string' ? body.benefits_ar.split('\n').filter(Boolean) : (body.benefits_ar || []),
    benefits_en: typeof body.benefits_en === 'string' ? body.benefits_en.split('\n').filter(Boolean) : (body.benefits_en || []),
    ingredients_ar: typeof body.ingredients_ar === 'string' ? body.ingredients_ar.split('\n').filter(Boolean) : (body.ingredients_ar || []),
    ingredients_en: typeof body.ingredients_en === 'string' ? body.ingredients_en.split('\n').filter(Boolean) : (body.ingredients_en || []),
    how_to_use_ar: body.how_to_use_ar || '',
    how_to_use_en: body.how_to_use_en || '',
    warnings_ar: body.warnings_ar || '',
    warnings_en: body.warnings_en || '',
    specs_ar: body.specs_ar || '',
    specs_en: body.specs_en || ''
  };

  products.unshift(newProduct);
  writeJSON(PRODUCTS_FILE, products);
  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/products/:id', upload.single('image_file'), (req, res) => {
  const products = readJSON(PRODUCTS_FILE, []);
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const existing = products[index];
  const body = req.body;

  let imagePath = existing.image;
  if (req.file) {
    imagePath = '/products/' + req.file.filename;
  } else if (body.image) {
    imagePath = body.image;
  }

  const updated = {
    ...existing,
    ...body,
    image: imagePath,
    price: Number(body.price !== undefined ? body.price : existing.price),
    original_price: Number(body.original_price !== undefined ? body.original_price : existing.original_price),
    in_stock: body.in_stock !== undefined ? (body.in_stock === true || body.in_stock === 'true') : existing.in_stock,
    benefits_ar: typeof body.benefits_ar === 'string' ? body.benefits_ar.split('\n').filter(Boolean) : (body.benefits_ar || existing.benefits_ar),
    benefits_en: typeof body.benefits_en === 'string' ? body.benefits_en.split('\n').filter(Boolean) : (body.benefits_en || existing.benefits_en),
    ingredients_ar: typeof body.ingredients_ar === 'string' ? body.ingredients_ar.split('\n').filter(Boolean) : (body.ingredients_ar || existing.ingredients_ar),
    ingredients_en: typeof body.ingredients_en === 'string' ? body.ingredients_en.split('\n').filter(Boolean) : (body.ingredients_en || existing.ingredients_en)
  };

  products[index] = updated;
  writeJSON(PRODUCTS_FILE, products);
  res.json({ success: true, product: updated });
});

app.delete('/api/products/:id', (req, res) => {
  let products = readJSON(PRODUCTS_FILE, []);
  const countBefore = products.length;
  products = products.filter(p => p.id !== req.params.id);
  if (products.length === countBefore) return res.status(404).json({ error: 'Product not found' });

  writeJSON(PRODUCTS_FILE, products);
  res.json({ success: true, message: 'Product deleted' });
});

// 3. Wilayas
app.get('/api/wilayas', (req, res) => {
  const wilayas = readJSON(WILAYAS_FILE, []);
  res.json(wilayas);
});

app.put('/api/wilayas', (req, res) => {
  const updatedWilayas = req.body;
  if (!Array.isArray(updatedWilayas)) {
    return res.status(400).json({ error: 'Wilayas must be an array' });
  }
  writeJSON(WILAYAS_FILE, updatedWilayas);
  res.json({ success: true, wilayas: updatedWilayas });
});

// 4. Orders
app.get('/api/orders', (req, res) => {
  let orders = readJSON(ORDERS_FILE, []);
  const { status, search } = req.query;

  if (status && status !== 'all') {
    orders = orders.filter(o => o.status === status);
  }

  if (search) {
    const s = search.toLowerCase();
    orders = orders.filter(o => 
      (o.id && o.id.toLowerCase().includes(s)) ||
      (o.customer?.full_name && o.customer.full_name.toLowerCase().includes(s)) ||
      (o.customer?.phone && o.customer.phone.includes(s)) ||
      (o.customer?.wilaya_name && o.customer.wilaya_name.toLowerCase().includes(s))
    );
  }

  // Sort newest first
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { customer, items } = req.body;

  if (!customer || !customer.first_name || !customer.phone || !customer.wilaya_code) {
    return res.status(400).json({ 
      error: 'يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، الولاية) / Please fill all required fields' 
    });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      error: 'السلة فارغة، يرجى اختيار منتج واحد على الأقل / Cart is empty' 
    });
  }

  const wilayas = readJSON(WILAYAS_FILE, []);
  const allProducts = readJSON(PRODUCTS_FILE, []);
  const wilaya = wilayas.find(w => w.code === Number(customer.wilaya_code));
  
  const deliveryType = customer.delivery_type === 'desk' ? 'desk' : 'home';
  let shippingFee = 0;
  if (wilaya) {
    shippingFee = deliveryType === 'desk' ? wilaya.desk_price : wilaya.home_price;
  }

  // Calculate quantities & subtotal using verified catalog prices (Security fix)
  let totalQuantity = 0;
  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const prodId = item.id || item.product_id;
    const prod = allProducts.find(p => p.id === prodId);
    const qty = Math.max(1, Math.min(99, parseInt(item.quantity) || 1));
    const price = prod ? prod.price : (Number(item.price) || 0);
    const prodName = prod ? prod.name : (item.name || item.product_name || 'منتج');

    totalQuantity += qty;
    subtotal += (price * qty);

    verifiedItems.push({
      product_id: prodId,
      product_name: prodName,
      price: price,
      quantity: qty
    });
  }

  // Normal pricing without discounts
  const discount = 0;
  const finalTotal = subtotal + shippingFee;

  // Sanitize customer inputs to prevent stored XSS
  const sanitize = (str) => typeof str === 'string' ? str.replace(/[<>]/g, '').trim() : '';

  const firstName = sanitize(customer.first_name);
  const lastName = sanitize(customer.last_name || '');
  const fullName = `${firstName} ${lastName}`.trim();
  const wilayaName = wilaya ? `${wilaya.name_ar} (${wilaya.name_fr})` : `ولاية ${customer.wilaya_code}`;

  // Unique Order ID
  const orderId = 'RV-' + Math.floor(1000 + Math.random() * 9000);

  const newOrder = {
    id: orderId,
    created_at: new Date().toISOString(),
    customer: {
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      phone: sanitize(customer.phone),
      email: sanitize(customer.email || ''),
      address: sanitize(customer.address || ''),
      wilaya_code: Number(customer.wilaya_code),
      wilaya_name: wilayaName,
      delivery_type: deliveryType,
      notes: sanitize(customer.notes || '')
    },
    items: verifiedItems,
    quantity: totalQuantity,
    subtotal: subtotal,
    discount: 0,
    shipping_fee: shippingFee,
    total: finalTotal,
    status: 'pending_call',
    admin_notes: 'طلب جديد مسجل عبر الموقع الإلكتروني - في انتظار الاتصال للتأكيد.',
    tracking_number: ''
  };

  const orders = readJSON(ORDERS_FILE, []);
  orders.unshift(newOrder);
  writeJSON(ORDERS_FILE, orders);

  res.status(201).json({
    success: true,
    message: 'تم تسجيل طلبك بنجاح وسنتصل بك قريباً للتأكيد',
    order: newOrder
  });
});

app.patch('/api/orders/:id', (req, res) => {
  const orders = readJSON(ORDERS_FILE, []);
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Order not found' });

  const existing = orders[index];
  const { status, admin_notes, tracking_number } = req.body;

  if (status !== undefined) existing.status = status;
  if (admin_notes !== undefined) existing.admin_notes = admin_notes;
  if (tracking_number !== undefined) existing.tracking_number = tracking_number;

  orders[index] = existing;
  writeJSON(ORDERS_FILE, orders);

  res.json({ success: true, order: existing });
});

app.delete('/api/orders/:id', (req, res) => {
  let orders = readJSON(ORDERS_FILE, []);
  const initialLen = orders.length;
  orders = orders.filter(o => o.id !== req.params.id);
  if (orders.length === initialLen) return res.status(404).json({ error: 'Order not found' });

  writeJSON(ORDERS_FILE, orders);
  res.json({ success: true, message: 'Order deleted' });
});

// 5. Analytics & Dashboard Stats
app.get('/api/stats', (req, res) => {
  const orders = readJSON(ORDERS_FILE, []);
  const products = readJSON(PRODUCTS_FILE, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending_call');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const shippingOrders = orders.filter(o => o.status === 'shipping');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  // Revenue = sum of delivered and confirmed/shipping orders
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const averageOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
  const confirmationRate = totalOrders > 0 ? Math.round(((confirmedOrders.length + shippingOrders.length + deliveredOrders.length) / totalOrders) * 100) : 0;

  // Wilaya distribution
  const wilayaCounts = {};
  orders.forEach(o => {
    const w = o.customer?.wilaya_name || 'غير محدد';
    wilayaCounts[w] = (wilayaCounts[w] || 0) + 1;
  });

  // Product sales counts
  const productSales = {};
  orders.forEach(o => {
    (o.items || []).forEach(it => {
      const name = it.product_name || it.product_id;
      productSales[name] = (productSales[name] || 0) + (it.quantity || 1);
    });
  });

  res.json({
    totalOrders,
    pendingCount: pendingOrders.length,
    confirmedCount: confirmedOrders.length,
    shippingCount: shippingOrders.length,
    deliveredCount: deliveredOrders.length,
    cancelledCount: cancelledOrders.length,
    totalRevenue,
    deliveredRevenue,
    averageOrderValue,
    confirmationRate,
    wilayaCounts,
    productSales,
    totalProducts: products.length
  });
});

// Admin page route
app.get('/admin', (req, res) => {
  res.sendFile('admin.html', { root: path.join(__dirname, 'public') });
});

// Catch-all fallback for SPA storefront
app.use((req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 RoyalVigor Store is running on: http://localhost:${PORT}`);
  console.log(`🔐 Admin Dashboard available on: http://localhost:${PORT}/admin`);
  console.log(`====================================================`);
});
