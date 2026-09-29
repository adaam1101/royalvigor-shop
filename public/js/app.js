// =========================================================
// RoyalVigor Storefront Application Logic
// Bilingual Arabic (RTL) / English (LTR)
// Clean E-Commerce - Pure Normal Prices (No Fake Discounts)
// Number BiDi Isolation - Complete Protection
// =========================================================

// State
let currentLang = localStorage.getItem('rv_lang') || 'ar';
let allProducts = [];
let allWilayas = [];
let storeSettings = {};
let cart = JSON.parse(localStorage.getItem('rv_cart') || '[]');
let activeCategory = 'all';
let checkoutMode = 'cart'; // 'cart' or 'direct'
let directCheckoutItem = null;
let directQty = 1;

// Translations Dictionary
const translations = {
  ar: {
    site_title: "RoyalVigor | متجر الحيوية والعناية الطبيعية",
    brand_tagline: "منتجات الحيوية والعناية الزوجية الطبيعية",
    announcement: "توصيل سريع وسري لـ 58 ولاية — الدفع نقداً عند الاستلام (COD) مع ضمان الخصوصية التامة",
    nav_home: "الرئيسية",
    nav_products: "المنتجات",
    nav_guarantee: "التغليف السري والخصوصية",
    nav_faq: "الأسئلة الشائعة",
    btn_call: "0664 93 61 33",
    btn_whatsapp: "واتساب",
    hero_badge: "منتجات أصلية معتمدة 100%",
    hero_title: "الأداء والنشاط الطبيعي لحياة زوجية ملؤها الحيوية والثقة",
    hero_desc: "أرقى تشكيلة من العسل الملكي النقي والمستخلصات العشبية الفعالة، المصممة خصيصاً لدعم التحمل البدني، تمديد المتعة، واستعادة النشاط اليومي. نضمن لكم سرية تامة 100% في التغليف وتوصيلاً سريعاً مع الدفع نقداً عند الاستلام.",
    hero_cta: "تصفح تشكيلة المنتجات (7)",
    hero_cta_sec: "ضمان السرية والخصوصية التامة",
    badge_discreet: "طرد معتم وسري",
    badge_discreet_sub: "بدون أي كتابة تشير للمحتوى",
    badge_cod: "دفع عند الاستلام",
    badge_cod_sub: "افحص طردك قبل الدفع",
    badge_fast: "توصيل 58 ولاية",
    badge_fast_sub: "لباب المنزل أو المكتب",
    section_products: "كتالوج المنتجات الرسمي",
    section_products_desc: "اختر المنتج المناسب واضغط على طلب سريع لإتمام طلبيتك والدفع نقداً عند الاستلام",
    cat_all: "جميع المنتجات (7)",
    cat_honey: "عسل ومقويات طبيعية (5)",
    cat_tablets: "أقراص الفعالية (1)",
    cat_herbal: "مكملات وأعشاب (1)",
    btn_buy_now: "طلب سريع (COD)",
    btn_add_cart: "أضف للسلة",
    btn_details: "المكونات والتفاصيل",
    in_stock: "متوفر بالمخزون",
    out_of_stock: "نفد المخزون",
    price_unit: "د.ج",
    modal_benefits: "الفوائد والنتائج:",
    modal_ingredients: "المكونات الفعالة:",
    modal_usage: "طريقة الاستعمال:",
    modal_warnings: "تنبيهات وإرشادات:",
    modal_specs: "المواصفات:",
    modal_close: "إغلاق",
    cart_title: "سلة المشتريات",
    cart_empty: "سلتك فارغة حالياً",
    cart_empty_sub: "اختر المنتجات المناسبة من المتجر",
    cart_subtotal: "المجموع الفرعي:",
    cart_shipping: "تكلفة الشحن:",
    cart_total: "الإجمالي للدفع:",
    cart_checkout: "متابعة الطلب والدفع عند الاستلام",
    checkout_title: "معلومات تسجيل الطلبية",
    checkout_sub: "أدخل بياناتك وسنتصل بك هاتفياً لتأكيد الشحن فوراً",
    field_fname: "الاسم *",
    field_lname: "اللقب *",
    field_phone: "رقم الهاتف *",
    field_email: "البريد الإلكتروني (اختياري)",
    field_wilaya: "الولاية (58 ولاية) *",
    field_wilaya_placeholder: "اختر ولايتك...",
    field_address: "العنوان بالتفصيل والبلدية *",
    field_delivery: "طريقة الاستلام المفضلة *",
    delivery_home: "توصيل للعنوان (المنزل)",
    delivery_desk: "مكتب التوصيل (Stop Desk)",
    field_qty: "الكمية المطلوبة:",
    field_notes: "ملاحظات إضافية (اختياري)",
    discreet_promise: "يتم تغليف الطلبية في طرد محايد ومعتم تماماً لحفظ الخصوصية.",
    btn_submit_order: "تأكيد الطلبية (الدفع عند الاستلام)",
    btn_submitting: "جاري تسجيل طلبك...",
    success_title: "تم تسجيل طلبكم بنجاح",
    success_order_id: "رقم الطلبية:",
    success_msg: "شكراً لثقتكم. سيتصل بكم أحد مسؤولي خدمة العملاء هاتفياً خلال ساعات قليلة لتأكيد العنوان وموعد التسليم قبل إرسال الطرد.",
    success_whatsapp: "تأكيد سريع عبر واتساب",
    faq_title: "الأسئلة الشائعة",
    faq_q1: "كيف تضمنون خصوصية الطرد وسرية المعلومات؟",
    faq_a1: "يتم تغليف جميع الطلبيات في أكياس معتمة تماماً أو علب كرتونية محكمة بدون أي ملصق يشير إلى طبيعة المنتجات. حتى شركة التوصيل تتعامل معه كطرد مغلق عادي.",
    faq_q2: "ما هي مدة التوصيل للولايات؟",
    faq_a2: "يستغرق التوصيل بين 24 إلى 48 ساعة لمعظم الولايات الشمالية والوسطى والشرقية والغربية، ومن 48 إلى 72 ساعة لولايات الجنوب.",
    faq_q3: "كيف يتم الدفع؟",
    faq_a3: "الدفع يتم نقداً عند الاستلام (COD) بعد استلام الطرد مباشرة من الموزع إلى باب منزلك أو في مكتب التوصيل.",
    footer_about: "متجر متخصص في توفير أرقى منتجات الحيوية والعناية الزوجية الطبيعية مع ضمان الخصوصية التامة في كافة ولايات الجزائر.",
    footer_rights: "جميع الحقوق محفوظة © 2026 متجر RoyalVigor الجزائر."
  },
  en: {
    site_title: "RoyalVigor | Natural Vitality & Wellness Store",
    brand_tagline: "Premium Natural Vitality for Couples",
    announcement: "Discreet Delivery Across All 58 Wilayas | Cash on Delivery (COD) | 100% Confidential Packaging",
    nav_home: "Home",
    nav_products: "Products",
    nav_guarantee: "Discreet Shipping",
    nav_faq: "FAQ",
    btn_call: "0664 93 61 33",
    btn_whatsapp: "WhatsApp",
    hero_badge: "100% Certified Natural Formulations",
    hero_title: "Natural Vitality and Peak Intimate Wellness for Couples",
    hero_desc: "Carefully curated selection of pure royal honey and potent herbal extracts designed to boost physical endurance and long-lasting vitality. We guarantee 100% tamper-proof discreet packaging, fast delivery across all 58 wilayas, and cash on delivery.",
    hero_cta: "Browse All Products (7)",
    hero_cta_sec: "Discreet Packaging Guarantee",
    badge_discreet: "Discreet Packaging",
    badge_discreet_sub: "Opaque box with zero product markings",
    badge_cod: "Cash on Delivery",
    badge_cod_sub: "Inspect package before payment",
    badge_fast: "58 Wilayas Delivery",
    badge_fast_sub: "Home delivery or stop-desk pickup",
    section_products: "Official Product Catalog",
    section_products_desc: "Choose your product and click Fast Order to register your purchase in under 60 seconds",
    cat_all: "All Products (7)",
    cat_honey: "Vitality Honey (5)",
    cat_tablets: "Potency Tablets (1)",
    cat_herbal: "Herbal Supplements (1)",
    btn_buy_now: "Fast Order (COD)",
    btn_add_cart: "Add to Cart",
    btn_details: "Specs & Ingredients",
    in_stock: "In Stock",
    out_of_stock: "Out of Stock",
    price_unit: "DA",
    modal_benefits: "Key Benefits:",
    modal_ingredients: "Active Ingredients:",
    modal_usage: "Recommended Usage:",
    modal_warnings: "Safety & Cautions:",
    modal_specs: "Specifications:",
    modal_close: "Close",
    cart_title: "Shopping Cart",
    cart_empty: "Your cart is currently empty",
    cart_empty_sub: "Select products from the store to add them here",
    cart_subtotal: "Subtotal:",
    cart_shipping: "Shipping:",
    cart_total: "Total Due on Delivery:",
    cart_checkout: "Proceed to Checkout (COD)",
    checkout_title: "Order Information",
    checkout_sub: "Enter your contact details and we will call you shortly to confirm shipment",
    field_fname: "First Name *",
    field_lname: "Last Name *",
    field_phone: "Phone Number *",
    field_email: "Email (Optional)",
    field_wilaya: "Wilaya (58 Wilayas) *",
    field_wilaya_placeholder: "Select your wilaya...",
    field_address: "Street Address & Municipality *",
    field_delivery: "Delivery Method *",
    delivery_home: "Home Delivery (À domicile)",
    delivery_desk: "Stop Desk Pickup (Bureau)",
    field_qty: "Quantity:",
    field_notes: "Delivery Notes (Optional)",
    discreet_promise: "Your order is packed in a neutral, opaque, tamper-proof bag for total privacy.",
    btn_submit_order: "Confirm Order (Pay on Delivery)",
    btn_submitting: "Submitting order...",
    success_title: "Order Received Successfully",
    success_order_id: "Order Reference:",
    success_msg: "Thank you for your trust. Our customer service team will call you shortly to confirm your delivery address and schedule before shipment.",
    success_whatsapp: "Quick Confirmation via WhatsApp",
    faq_title: "Frequently Asked Questions",
    faq_q1: "How do you guarantee discreet and confidential packaging?",
    faq_a1: "All orders are sealed inside neutral, completely opaque bags or boxes with zero markings of contents or product names. Even the courier does not know what is inside.",
    faq_q2: "What is the delivery delay?",
    faq_a2: "Delivery takes 24 to 48 hours for central, northern, eastern, and western wilayas, and 48 to 72 hours for southern wilayas.",
    faq_q3: "How does payment work?",
    faq_a3: "Payment is made in cash directly to the delivery courier upon receiving your parcel.",
    footer_about: "Specialized in natural vitality and couples wellness with 100% discretion across Algeria.",
    footer_rights: "All rights reserved © 2026 RoyalVigor Algeria."
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupLanguage();
  setupEventListeners();
  await loadStoreData();
  renderProducts();
  updateCartBadge();
  populateWilayasDropdown();
});

// Setup Language
function setupLanguage() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.body.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  applyTranslations();

  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) {
    langToggleBtn.innerHTML = currentLang === 'ar' ? '🇬🇧 English' : '🇩🇿 العربية';
  }
}

function toggleLanguage() {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  localStorage.setItem('rv_lang', currentLang);
  setupLanguage();
  renderProducts();
  populateWilayasDropdown();
  if (!document.getElementById('checkout-modal').classList.contains('hidden')) {
    calculateCheckoutTotals();
  }
  if (!document.getElementById('cart-drawer').classList.contains('-translate-x-full') &&
      !document.getElementById('cart-drawer').classList.contains('translate-x-full')) {
    renderCart();
  }
}

function t(key) {
  const dict = translations[currentLang] || translations.ar;
  return dict[key] || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang] && translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[currentLang] && translations[currentLang][key]) {
      el.setAttribute('placeholder', translations[currentLang][key]);
    }
  });

  document.title = t('site_title');
}

// Fetch Backend Data
async function loadStoreData() {
  try {
    const [prodRes, wilRes, setRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/wilayas'),
      fetch('/api/settings')
    ]);
    allProducts = await prodRes.json();
    allWilayas = await wilRes.json();
    storeSettings = await setRes.json();

    // Update phone & whatsapp in DOM if set
    if (storeSettings.phone) {
      const callLinks = document.querySelectorAll('.store-call-link');
      callLinks.forEach(l => l.href = `tel:${storeSettings.phone_raw || storeSettings.phone}`);
    }
    if (storeSettings.whatsapp) {
      const waLinks = document.querySelectorAll('.store-wa-link');
      waLinks.forEach(l => l.href = `https://wa.me/${storeSettings.whatsapp}?text=${encodeURIComponent(currentLang === 'ar' ? 'السلام عليكم، أود الاستفسار عن منتجات RoyalVigor' : 'Hello, I have an inquiry about RoyalVigor products')}`);
    }
  } catch (err) {
    console.error('Failed to load store data:', err);
  }
}

// Populate Wilayas Dropdown
function populateWilayasDropdown() {
  const select = document.getElementById('checkout-wilaya');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = `<option value="">${t('field_wilaya_placeholder')}</option>`;

  allWilayas.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w.code;
    const name = currentLang === 'ar' 
      ? `${w.code} - ${w.name_ar} (${w.name_fr})` 
      : `${w.code} - ${w.name_fr} (${w.name_ar})`;
    opt.textContent = name;
    select.appendChild(opt);
  });

  if (currentVal) select.value = currentVal;
}

// Render Products Grid (Clean Normal Pricing, Isolated Numbers)
function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const filtered = activeCategory === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === activeCategory);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 text-slate-400">
        <p class="text-base">${currentLang === 'ar' ? 'لا توجد منتجات في هذا التصنيف حالياً' : 'No products found in this category'}</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const name = currentLang === 'ar' ? product.name : (product.name_en || product.name);
    const shortDesc = currentLang === 'ar' ? product.short_desc_ar : (product.short_desc_en || product.short_desc_ar);
    const badge = currentLang === 'ar' ? product.badge_ar : (product.badge_en || product.badge_ar);
    const cleanBadge = badge ? badge.replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, '').trim() : '';
    const category = currentLang === 'ar' ? product.category_ar : (product.category_en || product.category_ar);

    return `
      <div class="luxury-card overflow-hidden flex flex-col justify-between group">
        <!-- Top Media Section -->
        <div class="relative bg-slate-50 aspect-[4/3] overflow-hidden p-4 flex items-center justify-center cursor-pointer border-b border-slate-200" onclick="openProductModal('${product.id}')">
          <img src="${product.image}" alt="${name}" class="w-full h-full object-contain rounded-lg group-hover:scale-103 transition-transform duration-300">
          
          <!-- Badges -->
          <div class="absolute top-3 ${currentLang === 'ar' ? 'right-3' : 'left-3'} flex items-center gap-1.5">
            ${cleanBadge ? `<span class="badge-warm text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">${cleanBadge}</span>` : ''}
          </div>

          <div class="absolute bottom-2.5 ${currentLang === 'ar' ? 'left-2.5' : 'right-2.5'}">
            <span class="bg-white/95 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
              ${category || ''}
            </span>
          </div>
        </div>

        <!-- Content Section -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span class="font-bold text-[10px] uppercase tracking-wider text-emerald-700">${product.brand || 'RoyalVigor'}</span>
              <span class="badge-stock-luxury text-[10px] px-2 py-0.5 rounded-md font-semibold">${t('in_stock')}</span>
            </div>

            <!-- Product Title -->
            <h3 class="text-base font-extrabold text-[#0F172A] group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1.5 cursor-pointer" onclick="openProductModal('${product.id}')">
              ${name}
            </h3>

            <!-- Short Description -->
            <p class="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">
              ${shortDesc}
            </p>
          </div>

          <div>
            <!-- Clean Price Display (Strict LTR isolate) -->
            <div class="flex items-baseline gap-2 mb-3 pt-3 border-t border-slate-100">
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-black text-[#0F172A] font-mono bidi-ltr" dir="ltr">
                  ${product.price.toLocaleString()}
                </span>
                <span class="text-xs font-bold text-slate-700">${t('price_unit')}</span>
              </div>
              ${product.original_price > product.price ? `
                <span class="text-xs text-slate-400 line-through font-mono bidi-ltr" dir="ltr">
                  ${product.original_price.toLocaleString()} ${t('price_unit')}
                </span>
              ` : ''}
            </div>

            <!-- Actions Grid -->
            <div class="space-y-2">
              <button onclick="directBuy('${product.id}')" class="btn-luxury-primary w-full py-2.5 px-3 text-xs font-bold shadow-2xs">
                ${t('btn_buy_now')}
              </button>
              <div class="grid grid-cols-2 gap-2">
                <button onclick="addToCart('${product.id}')" class="btn-luxury-secondary py-2 px-2 text-xs font-semibold">
                  ${t('btn_add_cart')}
                </button>
                <button onclick="openProductModal('${product.id}')" class="btn-luxury-secondary py-2 px-2 text-xs text-slate-500 hover:text-slate-900">
                  ${t('btn_details')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Filter by category
function setCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.cat-pill').forEach(btn => {
    if (btn.getAttribute('data-category') === cat) {
      btn.className = 'cat-pill px-4 py-2 rounded-xl text-xs font-bold transition-all bg-[#0F172A] text-white shadow-2xs';
    } else {
      btn.className = 'cat-pill px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-white text-slate-700 border border-slate-200 hover:bg-slate-50';
    }
  });
  renderProducts();
}

// Open Product Details Modal
function openProductModal(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const modal = document.getElementById('product-details-modal');
  const content = document.getElementById('product-modal-content');
  const name = currentLang === 'ar' ? product.name : (product.name_en || product.name);
  const desc = currentLang === 'ar' ? product.description_ar : (product.description_en || product.description_ar);
  const benefits = currentLang === 'ar' ? product.benefits_ar : (product.benefits_en || product.benefits_ar) || [];
  const ingredients = currentLang === 'ar' ? product.ingredients_ar : (product.ingredients_en || product.ingredients_ar) || [];
  const howToUse = currentLang === 'ar' ? product.how_to_use_ar : (product.how_to_use_en || product.how_to_use_ar);
  const warnings = currentLang === 'ar' ? product.warnings_ar : (product.warnings_en || product.warnings_ar);
  const specs = currentLang === 'ar' ? product.specs_ar : (product.specs_en || product.specs_ar);

  content.innerHTML = `
    <div class="relative bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-2xl p-5 sm:p-7 text-[#0F172A]">
      <!-- Close button -->
      <button onclick="closeProductModal()" class="absolute top-4 ${currentLang === 'ar' ? 'left-4' : 'right-4'} text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 transition-colors font-bold">
        ✕
      </button>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start mb-6">
        <!-- Image Banner -->
        <div class="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 p-4 flex items-center justify-center">
          <img src="${product.image}" alt="${name}" class="w-full h-auto object-contain max-h-64 rounded-lg">
        </div>

        <!-- Overview -->
        <div>
          <span class="text-[10px] uppercase text-emerald-700 font-bold tracking-wider">${product.brand || 'RoyalVigor'}</span>
          <h2 class="text-xl sm:text-2xl font-extrabold text-[#0F172A] mt-1 mb-2 leading-tight">${name}</h2>

          <div class="flex items-baseline gap-2 mb-3">
            <span class="text-2xl font-black text-[#0F172A] font-mono bidi-ltr" dir="ltr">${product.price.toLocaleString()}</span>
            <span class="text-xs font-bold text-slate-700">${t('price_unit')}</span>
            ${product.original_price > product.price ? `
              <span class="text-xs text-slate-400 line-through font-mono bidi-ltr" dir="ltr">${product.original_price.toLocaleString()} ${t('price_unit')}</span>
            ` : ''}
          </div>

          <p class="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
            ${desc}
          </p>

          <div class="space-y-2">
            <button onclick="closeProductModal(); directBuy('${product.id}')" class="btn-luxury-primary w-full py-3 px-4 text-center font-bold text-xs sm:text-sm shadow-xs">
              ${t('btn_buy_now')}
            </button>
            <button onclick="addToCart('${product.id}'); showToast('${currentLang === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart'}');" class="btn-luxury-secondary w-full py-2.5 px-4 text-xs font-semibold">
              ${t('btn_add_cart')}
            </button>
          </div>
        </div>
      </div>

      <!-- Specs & Ingredients Breakdown -->
      <div class="space-y-4 pt-4 border-t border-slate-100 text-xs">
        ${specs ? `
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
            <span class="font-bold text-[#0F172A]">${t('modal_specs')}</span>
            <span class="text-slate-600">${specs}</span>
          </div>
        ` : ''}

        <!-- Benefits -->
        ${benefits.length > 0 ? `
          <div>
            <h4 class="font-bold text-[#0F172A] mb-2">${t('modal_benefits')}</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${benefits.map(b => `
                <div class="flex items-start gap-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-900">
                  <span class="text-emerald-700 font-bold mt-0.5">✓</span>
                  <span class="font-medium">${b}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Ingredients -->
        ${ingredients.length > 0 ? `
          <div>
            <h4 class="font-bold text-[#0F172A] mb-2">${t('modal_ingredients')}</h4>
            <div class="space-y-1.5">
              ${ingredients.map(ing => `
                <div class="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span class="text-emerald-700 font-bold">•</span>
                  <span>${ing}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- How To Use -->
        ${howToUse ? `
          <div class="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
            <h4 class="font-bold text-[#0F172A] mb-1">${t('modal_usage')}</h4>
            <p class="text-slate-600 leading-relaxed">${howToUse}</p>
          </div>
        ` : ''}

        <!-- Warnings -->
        ${warnings ? `
          <div class="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-900">
            <h4 class="font-bold mb-1">${t('modal_warnings')}</h4>
            <p class="leading-relaxed text-rose-800">${warnings}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  const modal = document.getElementById('product-details-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// Shopping Cart Logic
function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.product.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ product, quantity: 1 });
  }

  saveCart();
  updateCartBadge();
  openCart();
  renderCart();
}

function updateCartQuantity(productId, delta) {
  const item = cart.find(i => i.product.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.product.id !== productId);
  }

  saveCart();
  updateCartBadge();
  renderCart();
}

function removeCartItem(productId) {
  cart = cart.filter(i => i.product.id !== productId);
  saveCart();
  updateCartBadge();
  renderCart();
}

function saveCart() {
  localStorage.setItem('rv_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
  }
}

function openCart() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  drawer.classList.remove('translate-x-full', '-translate-x-full');
  backdrop.classList.remove('hidden');
  renderCart();
}

function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (currentLang === 'ar') {
    drawer.classList.add('-translate-x-full');
  } else {
    drawer.classList.add('translate-x-full');
  }
  backdrop.classList.add('hidden');
}

// Render Cart (Normal Clean Prices)
function renderCart() {
  const container = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty-state');
  const footer = document.getElementById('cart-footer');

  const subtotal = cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);

  if (cart.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    footer.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  footer.classList.remove('hidden');

  container.innerHTML = cart.map(item => {
    const name = currentLang === 'ar' ? item.product.name : (item.product.name_en || item.product.name);
    return `
      <div class="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <img src="${item.product.image}" alt="${name}" class="w-14 h-14 object-contain rounded-lg bg-white border border-slate-200 p-1 flex-shrink-0">
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-[#0F172A] truncate">${name}</h4>
          <p class="text-xs font-mono text-slate-500 bidi-ltr" dir="ltr">${item.product.price.toLocaleString()} ${t('price_unit')}</p>
          
          <div class="flex items-center gap-2 mt-1.5">
            <button onclick="updateCartQuantity('${item.product.id}', -1)" class="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 flex items-center justify-center text-xs font-bold select-none">-</button>
            <span class="text-xs font-bold px-1 text-slate-900 font-mono bidi-ltr" dir="ltr">${item.quantity}</span>
            <button onclick="updateCartQuantity('${item.product.id}', 1)" class="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 flex items-center justify-center text-xs font-bold select-none">+</button>
          </div>
        </div>
        <div class="text-right flex flex-col justify-between items-end h-full">
          <button onclick="removeCartItem('${item.product.id}')" class="text-slate-400 hover:text-rose-600 text-xs p-1">✕</button>
          <span class="text-xs font-bold text-[#0F172A] font-mono mt-2 bidi-ltr" dir="ltr">${(item.product.price * item.quantity).toLocaleString()} ${t('price_unit')}</span>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('cart-subtotal-val').innerHTML = `<span dir="ltr" class="bidi-ltr font-mono">${subtotal.toLocaleString()}</span> ${t('price_unit')}`;
  document.getElementById('cart-total-val').innerHTML = `<span dir="ltr" class="bidi-ltr font-mono">${subtotal.toLocaleString()}</span> ${t('price_unit')}`;
}

// Checkout Modal Actions
function startCheckoutFromCart() {
  if (cart.length === 0) return;
  checkoutMode = 'cart';
  directCheckoutItem = null;
  closeCart();
  openCheckoutModal();
}

function directBuy(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  checkoutMode = 'direct';
  directQty = 1;
  directCheckoutItem = { product, quantity: 1 };
  
  const qEl = document.getElementById('direct-qty-num');
  if (qEl) qEl.textContent = '1';

  openCheckoutModal();
}

function adjustDirectQty(delta) {
  directQty = Math.max(1, Math.min(30, directQty + delta));
  const qEl = document.getElementById('direct-qty-num');
  if (qEl) qEl.textContent = directQty;
  if (directCheckoutItem) {
    directCheckoutItem.quantity = directQty;
  }
  calculateCheckoutTotals();
}

function openCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  calculateCheckoutTotals();
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// Calculate totals in Checkout (Pure Normal Prices)
function calculateCheckoutTotals() {
  const items = checkoutMode === 'direct' 
    ? [directCheckoutItem] 
    : cart;

  const subtotal = items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);

  // Delivery calculation
  const wilayaCode = Number(document.getElementById('checkout-wilaya')?.value);
  const deliveryType = document.querySelector('input[name="checkout_delivery_type"]:checked')?.value || 'home';
  const selectedWilaya = allWilayas.find(w => w.code === wilayaCode);

  let shippingFee = 0;
  if (selectedWilaya) {
    shippingFee = deliveryType === 'desk' ? selectedWilaya.desk_price : selectedWilaya.home_price;
  }

  // Update DOM delivery price tags with LTR isolation
  const homeTag = document.getElementById('delivery-home-price');
  const deskTag = document.getElementById('delivery-desk-price');
  if (selectedWilaya) {
    if (homeTag) homeTag.innerHTML = `<span dir="ltr" class="bidi-ltr font-mono">${selectedWilaya.home_price.toLocaleString()}</span> ${t('price_unit')}`;
    if (deskTag) deskTag.innerHTML = `<span dir="ltr" class="bidi-ltr font-mono">${selectedWilaya.desk_price.toLocaleString()}</span> ${t('price_unit')}`;
  } else {
    if (homeTag) homeTag.textContent = currentLang === 'ar' ? 'اختر الولاية أولاً' : 'Select Wilaya';
    if (deskTag) deskTag.textContent = currentLang === 'ar' ? 'اختر الولاية أولاً' : 'Select Wilaya';
  }

  // Summary items in checkout
  const summaryContainer = document.getElementById('checkout-items-summary');
  if (summaryContainer) {
    summaryContainer.innerHTML = items.map(i => {
      const name = currentLang === 'ar' ? i.product.name : (i.product.name_en || i.product.name);
      return `
        <div class="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
          <span class="text-slate-700 font-medium truncate max-w-[200px]">${name} × ${i.quantity}</span>
          <span class="font-mono font-bold text-[#0F172A] bidi-ltr" dir="ltr">${(i.product.price * i.quantity).toLocaleString()} ${t('price_unit')}</span>
        </div>
      `;
    }).join('');
  }

  // Direct quantity selector visibility
  const directQtyBox = document.getElementById('direct-qty-selector');
  if (directQtyBox) {
    if (checkoutMode === 'direct') {
      directQtyBox.classList.remove('hidden');
    } else {
      directQtyBox.classList.add('hidden');
    }
  }

  // Shipping display
  const shippingValEl = document.getElementById('checkout-shipping-val');
  if (shippingValEl) {
    if (selectedWilaya) {
      shippingValEl.innerHTML = `<span dir="ltr" class="bidi-ltr font-mono">${shippingFee.toLocaleString()}</span> ${t('price_unit')}`;
    } else {
      shippingValEl.textContent = '--';
    }
  }

  // Final Total (Normal Price + Shipping)
  const finalTotal = subtotal + (selectedWilaya ? shippingFee : 0);
  const finalTotalEl = document.getElementById('checkout-total-val');
  if (finalTotalEl) {
    finalTotalEl.innerHTML = `<span dir="ltr" class="bidi-ltr font-mono font-black">${finalTotal.toLocaleString()}</span> ${t('price_unit')}`;
  }
}

// Handle Order Submit
async function submitOrder(e) {
  e.preventDefault();

  const fname = document.getElementById('checkout-fname')?.value.trim();
  const lname = document.getElementById('checkout-lname')?.value.trim();
  const phone = document.getElementById('checkout-phone')?.value.trim();
  const email = document.getElementById('checkout-email')?.value.trim();
  const wilaya = document.getElementById('checkout-wilaya')?.value;
  const address = document.getElementById('checkout-address')?.value.trim();
  const deliveryType = document.querySelector('input[name="checkout_delivery_type"]:checked')?.value || 'home';
  const notes = document.getElementById('checkout-notes')?.value.trim();

  // Validation
  if (!fname || !phone || !wilaya || !address) {
    alert(currentLang === 'ar' 
      ? 'يرجى ملء جميع الحقول الإلزامية: الاسم، رقم الهاتف، الولاية، والعنوان.' 
      : 'Please complete all required fields: Name, Phone, Wilaya, and Address.');
    return;
  }

  // Phone validation (Algerian numbers: 05, 06, 07 followed by 8 digits)
  const cleanPhone = phone.replace(/\s+/g, '');
  if (cleanPhone.length < 9) {
    alert(currentLang === 'ar' ? 'يرجى إدخال رقم هاتف صحيح للتواصل معك.' : 'Please enter a valid phone number.');
    return;
  }

  const items = checkoutMode === 'direct' 
    ? [directCheckoutItem] 
    : cart;

  if (items.length === 0) {
    alert(currentLang === 'ar' ? 'السلة فارغة!' : 'Your cart is empty!');
    return;
  }

  const submitBtn = document.getElementById('submit-order-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>⏳</span> <span>${t('btn_submitting')}</span>`;

  try {
    const payload = {
      customer: {
        first_name: fname,
        last_name: lname,
        phone: cleanPhone,
        email: email,
        wilaya_code: wilaya,
        address: address,
        delivery_type: deliveryType,
        notes: notes
      },
      items: items.map(i => ({
        product_id: i.product.id,
        product_name: currentLang === 'ar' ? i.product.name : (i.product.name_en || i.product.name),
        price: i.product.price,
        quantity: i.quantity
      }))
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.success) {
      // Clear Cart if from cart
      if (checkoutMode === 'cart') {
        cart = [];
        saveCart();
        updateCartBadge();
      }

      closeCheckoutModal();
      showSuccessModal(result.order);
      triggerConfetti();
    } else {
      alert(result.error || 'حدث خطأ أثناء تسجيل الطلب. يرجى المحاولة مرة أخرى.');
    }
  } catch (err) {
    console.error('Order submission error:', err);
    alert(currentLang === 'ar' ? 'فشل الاتصال بالخادم، يرجى المحاولة مجدداً.' : 'Server connection failed, please retry.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Show Order Success Modal
function showSuccessModal(order) {
  const modal = document.getElementById('order-success-modal');
  document.getElementById('success-order-id-val').innerHTML = `<span dir="ltr" class="bidi-ltr font-mono">#${order.id}</span>`;
  document.getElementById('success-customer-name').textContent = order.customer.full_name;
  document.getElementById('success-wilaya').textContent = order.customer.wilaya_name;
  document.getElementById('success-total-val').innerHTML = `<span dir="ltr" class="bidi-ltr font-mono font-bold">${order.total.toLocaleString()}</span> ${t('price_unit')}`;
  
  // WhatsApp confirmation quick link
  const waBtn = document.getElementById('success-wa-btn');
  if (waBtn) {
    const waText = currentLang === 'ar'
      ? `مرحباً، قمت للتو بتسجيل الطلب رقم #${order.id} باسم ${order.customer.full_name} في ولاية ${order.customer.wilaya_name}. أود تأكيد الطلب من فضلكم.`
      : `Hello, I just placed order #${order.id} under name ${order.customer.full_name} in ${order.customer.wilaya_name}. I'd like to confirm dispatch please.`;
    waBtn.href = `https://wa.me/${storeSettings.whatsapp || '213664936133'}?text=${encodeURIComponent(waText)}`;
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  document.getElementById('order-success-modal').classList.add('hidden');
  document.body.style.overflow = '';
}


// Toast helper
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-5 right-5 bg-[#0F172A] text-white font-medium px-4 py-2.5 rounded-xl shadow-xl z-50 transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-2 text-xs border border-slate-800';
  toast.innerHTML = `<span class="text-emerald-400 font-bold">✓</span> <span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Simple celebration confetti effect
function triggerConfetti() {
  try {
    for (let i = 0; i < 35; i++) {
      const piece = document.createElement('div');
      piece.style.position = 'fixed';
      piece.style.zIndex = '9999';
      piece.style.width = `${Math.random() * 8 + 4}px`;
      piece.style.height = `${Math.random() * 12 + 6}px`;
      piece.style.backgroundColor = ['#059669', '#10B981', '#0F172A', '#38BDF8', '#FFFFFF'][Math.floor(Math.random() * 5)];
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.top = '-20px';
      piece.style.opacity = '0.9';
      piece.style.borderRadius = '2px';
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      piece.style.transition = `all ${Math.random() * 2 + 1.5}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      document.body.appendChild(piece);

      setTimeout(() => {
        piece.style.top = '100vh';
        piece.style.transform = `rotate(${Math.random() * 720}deg) translateX(${Math.random() * 100 - 50}px)`;
        piece.style.opacity = '0';
      }, 50);

      setTimeout(() => piece.remove(), 3500);
    }
  } catch (e) {
    // Graceful fallback
  }
}

// Event Listeners
function setupEventListeners() {
  // Lang Toggle
  document.getElementById('lang-toggle-btn')?.addEventListener('click', toggleLanguage);

  // Cart Toggle
  document.getElementById('cart-btn')?.addEventListener('click', openCart);
  document.getElementById('cart-close-btn')?.addEventListener('click', closeCart);
  document.getElementById('cart-backdrop')?.addEventListener('click', closeCart);
  document.getElementById('cart-checkout-btn')?.addEventListener('click', startCheckoutFromCart);

  // Checkout Modal
  document.getElementById('checkout-close-btn')?.addEventListener('click', closeCheckoutModal);
  document.getElementById('checkout-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'checkout-modal' || e.target.id === 'checkout-modal-wrapper') closeCheckoutModal();
  });
  document.getElementById('checkout-form')?.addEventListener('submit', submitOrder);

  // Wilaya and Delivery changes in checkout
  document.getElementById('checkout-wilaya')?.addEventListener('change', calculateCheckoutTotals);
  document.querySelectorAll('input[name="checkout_delivery_type"]').forEach(r => {
    r.addEventListener('change', calculateCheckoutTotals);
  });

  // Close details modal on backdrop
  document.getElementById('product-details-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'product-details-modal' || e.target.id === 'product-modal-wrapper') closeProductModal();
  });

  // Close success modal on backdrop
  document.getElementById('order-success-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'order-success-modal' || e.target.id === 'success-modal-wrapper') closeSuccessModal();
  });
}
