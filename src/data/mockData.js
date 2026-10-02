export const initialShoppers = [
  {
    id: "shp-01",
    name: "Sarah Wijaya",
    username: "@sarah.travels",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    verified: true,
    rating: 4.9,
    reviewsCount: 142,
    subscribersCount: 840,
    isSubscribed: false,
    bio: "Spesialis jastip Tokyo & Osaka. Rutin setiap bulan. Handcarry only!"
  },
  {
    id: "shp-02",
    name: "Andy Lesmana",
    username: "@andyshopper",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    verified: true,
    rating: 4.8,
    reviewsCount: 98,
    subscribersCount: 520,
    isSubscribed: true,
    bio: "Jastip snack Bangkok, Big C, Gentle Woman, drugstores terpercaya."
  },
  {
    id: "shp-03",
    name: "Clara Tan",
    username: "@claratan.kr",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    verified: true,
    rating: 5.0,
    reviewsCount: 210,
    subscribersCount: 1250,
    isSubscribed: false,
    bio: "K-Beauty, Olive Young direct haul, K-Pop merchandise & albums."
  }
];

export const initialKloters = [
  {
    id: "KLT-TYO-01",
    title: "Kloter Tokyo - Autumn Special 🍁",
    shopperId: "shp-01",
    shopperName: "Sarah Wijaya",
    shopperAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    destination: "Tokyo, Japan",
    flag: "🇯🇵",
    startDate: "2026-10-15",
    endDate: "2026-10-20",
    orderDeadline: "2026-10-14 23:59",
    quotaMax: 20,
    quotaUsed: 12,
    currencyRate: 110, // JPY to IDR approx
    rules: [
      "Maksimal berat barang titipan per pesanan 2 kg",
      "Tidak menerima barang pecah belah berukuran besar atau cairan > 100ml yang dilarang kabin",
      "Wajib menyertakan foto & spesifikasi jelas untuk custom request",
      "Pembayaran DP 50% atau Lunas via QRIS otomatis"
    ],
    status: "OPEN", // OPEN, CLOSED, SHOPPING, COMPLETED
    catalog: [
      {
        id: "cat-1",
        name: "Tokyo Banana (Original 8 pcs)",
        category: "Snack",
        price: 245000,
        fee: 35000,
        image: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=300&auto=format&fit=crop&q=80",
        description: "Bolu pisang legendaris khas Tokyo Station, expiry aman."
      },
      {
        id: "cat-2",
        name: "Hada Labo Gokujyun Premium Lotion",
        category: "Skincare",
        price: 185000,
        fee: 30000,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80",
        description: "Versi original formulasi Jepang, jauh lebih melembabkan."
      },
      {
        id: "cat-3",
        name: "Uniqlo Heattech Extra Warm Top",
        category: "Fashion",
        price: 260000,
        fee: 40000,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80",
        description: "Pilihan warna Black/White/Grey. Cantumkan size di catatan."
      }
    ]
  },
  {
    id: "KLT-BKK-02",
    title: "Bangkok Street Haul & Gentle Woman 🇹🇭",
    shopperId: "shp-02",
    shopperName: "Andy Lesmana",
    shopperAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    destination: "Bangkok, Thailand",
    flag: "🇹🇭",
    startDate: "2026-10-18",
    endDate: "2026-10-23",
    orderDeadline: "2026-10-17 18:00",
    quotaMax: 30,
    quotaUsed: 22,
    currencyRate: 460,
    rules: [
      "Khusus snack kemasan pabrik tersegel",
      "Gentle Woman totebag maksimal 2 pcs per orang"
    ],
    status: "OPEN",
    catalog: [
      {
        id: "cat-4",
        name: "Gentle Woman Canvas Tote Bag",
        category: "Fashion",
        price: 380000,
        fee: 50000,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80",
        description: "Original store Siam Square, lengkap tag dan struk."
      },
      {
        id: "cat-5",
        name: "Lay's Truffle Flavor (Family Pack)",
        category: "Snack",
        price: 45000,
        fee: 15000,
        image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop&q=80",
        description: "Snack viral Thailand wangi truffle premium."
      }
    ]
  }
];

export const initialOrders = [
  {
    id: "ORD-202610-001",
    kloterId: "KLT-TYO-01",
    kloterTitle: "Kloter Tokyo - Autumn Special 🍁",
    shopperName: "Sarah Wijaya",
    buyerName: "Dimas Pratama",
    buyerPhone: "081234567890",
    type: "CATALOG",
    items: [
      { name: "Tokyo Banana (Original 8 pcs)", qty: 2, price: 245000, fee: 35000 },
      { name: "Hada Labo Gokujyun Premium Lotion", qty: 1, price: 185000, fee: 30000 }
    ],
    customNotes: "Tolong cari yang expired minimal 3 minggu setelah kedatangan.",
    subtotal: 675000,
    serviceFee: 100000,
    appFee: 5000,
    total: 780000,
    paymentMethod: "QRIS",
    status: "PURCHASED", // PENDING -> PAID -> PURCHASED -> SHIPPED
    createdAt: "2026-10-02 10:15",
    history: [
      { status: "PENDING", time: "2026-10-02 10:15", note: "Pesanan dibuat, QRIS diterbitkan" },
      { status: "PAID", time: "2026-10-02 10:20", note: "Pembayaran terverifikasi otomatis via QRIS Webhook" },
      { status: "PURCHASED", time: "2026-10-02 14:30", note: "Barang berhasil dibeli Shopper di Tokyo Station" }
    ],
    trackingNo: "JP-ID-8829103"
  },
  {
    id: "ORD-202610-002",
    kloterId: "KLT-TYO-01",
    kloterTitle: "Kloter Tokyo - Autumn Special 🍁",
    shopperName: "Sarah Wijaya",
    buyerName: "Nabila Putri",
    buyerPhone: "081987654321",
    type: "CUSTOM",
    items: [
      { name: "Matcha Ceremony Grade - Marukyu Koyamaen (100g)", qty: 1, price: 320000, fee: 50000 }
    ],
    customNotes: "Titip beli di Ippodo Tea Ginza atau Marukyu store. Foto kaleng hijau seperti di gambar.",
    customImageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80",
    subtotal: 320000,
    serviceFee: 50000,
    appFee: 5000,
    total: 375000,
    paymentMethod: "QRIS",
    status: "PAID",
    createdAt: "2026-10-02 11:45",
    history: [
      { status: "PENDING", time: "2026-10-02 11:45", note: "Pesanan dibuat" },
      { status: "PAID", time: "2026-10-02 11:50", note: "Pembayaran QRIS lunas diterima" }
    ],
    trackingNo: ""
  },
  {
    id: "ORD-202610-003",
    kloterId: "KLT-BKK-02",
    kloterTitle: "Bangkok Street Haul & Gentle Woman 🇹🇭",
    shopperName: "Andy Lesmana",
    buyerName: "Rian Hidayat",
    buyerPhone: "087711223344",
    type: "CATALOG",
    items: [
      { name: "Gentle Woman Canvas Tote Bag", qty: 1, price: 380000, fee: 50000 },
      { name: "Lay's Truffle Flavor (Family Pack)", qty: 3, price: 45000, fee: 15000 }
    ],
    customNotes: "Warna totebag canvas natural putih ya kak.",
    subtotal: 515000,
    serviceFee: 95000,
    appFee: 5000,
    total: 615000,
    paymentMethod: "QRIS",
    status: "SHIPPED",
    createdAt: "2026-10-01 16:20",
    history: [
      { status: "PENDING", time: "2026-10-01 16:20", note: "Pesanan masuk" },
      { status: "PAID", time: "2026-10-01 16:25", note: "Lunas via QRIS" },
      { status: "PURCHASED", time: "2026-10-02 09:00", note: "Item lengkap dibeli di Siam Square" },
      { status: "SHIPPED", time: "2026-10-02 13:00", note: "Dikirim via kurir ekspedisi domestik" }
    ],
    trackingNo: "JNE-BKK-990184"
  }
];
