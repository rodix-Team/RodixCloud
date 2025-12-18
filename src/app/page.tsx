"use client";

import { useEffect, useState } from "react";
import { http, getFullImageUrl } from "@/lib/http";
import {
  ShoppingCart, Plus, Minus, Trash2, X, Package,
  CreditCard, Truck, Check, Loader2, ChevronRight
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: string;
  image_url: string | null;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function TestStorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: cart, 1: shipping, 2: payment, 3: confirm
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Customer info
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await http.get("/products");
        setProducts(res.data.data || []);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Add to cart
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Update quantity
  const updateQuantity = (id: number, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  // Remove from cart
  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit order
  const submitOrder = async () => {
    // Validate before submit
    if (!customerInfo.email) {
      alert("يرجى إدخال البريد الإلكتروني");
      return;
    }
    if (cart.length === 0) {
      alert("السلة فارغة");
      return;
    }

    setProcessing(true);
    try {
      // Use Guest Checkout endpoint (no auth required)
      const orderData = {
        guest_email: customerInfo.email,
        shipping_address: customerInfo.address || null,
        total_price: total,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      console.log("Submitting order:", orderData);
      const res = await http.post("/guest/orders", orderData);
      setOrderNumber(res.data.order_id ? `ORD-${res.data.order_id}` : `ORD-${Date.now()}`);
      setOrderComplete(true);
      setCart([]);
    } catch (err: any) {
      console.error("Order failed:", err?.response?.data || err);

      // Show validation errors if 422
      if (err?.response?.status === 422) {
        const errors = err?.response?.data?.errors;
        if (errors) {
          const errorMsg = Object.values(errors).flat().join('\n');
          alert(`خطأ في البيانات:\n${errorMsg}`);
        } else {
          alert("خطأ في البيانات المدخلة");
        }
        return;
      }

      // Show error message if guest checkout not enabled
      if (err?.response?.status === 404) {
        alert("Guest Checkout غير مفعّل. يرجى تفعيله من الباك إند.");
      } else if (err?.response?.status === 401) {
        alert("يجب تسجيل الدخول للشراء. Guest Checkout غير مفعّل.");
      } else {
        alert("حدث خطأ أثناء إرسال الطلب");
      }
    } finally {
      setProcessing(false);
    }
  };

  // Reset checkout
  const resetCheckout = () => {
    setCheckoutStep(0);
    setOrderComplete(false);
    setShowCart(false);
    setCustomerInfo({ name: "", email: "", phone: "", address: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-500">🍯 Honey Store</h1>
          <button
            onClick={() => setShowCart(true)}
            className="relative p-3 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-6 w-6 bg-amber-500 text-neutral-900 text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">منتجاتنا</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden group hover:border-amber-500/50 transition-colors"
            >
              <div className="aspect-square bg-neutral-800 relative overflow-hidden">
                {product.image_url ? (
                  <img
                    src={getFullImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-neutral-700" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">${product.price}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="p-2 bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => !checkoutStep && setShowCart(false)} />
          <div className="relative w-full max-w-md bg-neutral-900 h-full overflow-y-auto">
            {/* Cart Header */}
            <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {orderComplete ? "✅ Order Complete" : checkoutStep === 0 ? "سلة التسوق" : checkoutStep === 1 ? "معلومات الشحن" : "تأكيد الطلب"}
              </h2>
              <button onClick={() => !processing && resetCheckout()} className="p-2 hover:bg-neutral-800 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Order Complete */}
            {orderComplete ? (
              <div className="p-6 text-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">شكراً لطلبك!</h3>
                <p className="text-neutral-400 mb-4">رقم الطلب: {orderNumber}</p>
                <button
                  onClick={resetCheckout}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-medium rounded-xl"
                >
                  العودة للتسوق
                </button>
              </div>
            ) : checkoutStep === 0 ? (
              /* Cart Items */
              <div className="p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-neutral-700 mx-auto mb-4" />
                    <p className="text-neutral-400">السلة فارغة</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map(item => (
                        <div key={item.id} className="flex gap-3 p-3 bg-neutral-800 rounded-xl">
                          <div className="w-16 h-16 bg-neutral-700 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image_url ? (
                              <img src={getFullImageUrl(item.image_url)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-neutral-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-amber-400 text-sm">${item.price}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-neutral-700 rounded">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-sm w-8 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-neutral-700 rounded">
                                <Plus className="h-3 w-3" />
                              </button>
                              <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-400 hover:bg-red-500/10 rounded ml-auto">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-neutral-800 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">المجموع الفرعي</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">الشحن</span>
                        <span>{shipping === 0 ? "مجاني" : `$${shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">الضريبة (10%)</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-800">
                        <span>الإجمالي</span>
                        <span className="text-amber-400">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setCheckoutStep(1)}
                      className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-medium rounded-xl flex items-center justify-center gap-2"
                    >
                      متابعة الدفع
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            ) : checkoutStep === 1 ? (
              /* Shipping Form */
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={e => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500"
                    placeholder="أحمد محمد"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={e => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500"
                    placeholder="ahmed@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={e => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500"
                    placeholder="+965 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">عنوان الشحن</label>
                  <textarea
                    value={customerInfo.address}
                    onChange={e => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 resize-none"
                    placeholder="المدينة، المنطقة، الشارع..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setCheckoutStep(0)}
                    className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl"
                  >
                    رجوع
                  </button>
                  <button
                    onClick={() => setCheckoutStep(2)}
                    disabled={!customerInfo.name || !customerInfo.email}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-900 font-medium rounded-xl"
                  >
                    تأكيد
                  </button>
                </div>
              </div>
            ) : (
              /* Order Confirmation */
              <div className="p-4">
                <div className="bg-neutral-800 rounded-xl p-4 mb-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-amber-400" />
                    معلومات الشحن
                  </h3>
                  <p className="text-sm text-neutral-300">{customerInfo.name}</p>
                  <p className="text-sm text-neutral-400">{customerInfo.email}</p>
                  <p className="text-sm text-neutral-400">{customerInfo.phone}</p>
                  <p className="text-sm text-neutral-400 mt-2">{customerInfo.address}</p>
                </div>

                <div className="bg-neutral-800 rounded-xl p-4 mb-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-amber-400" />
                    المنتجات ({cart.length})
                  </h3>
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span className="text-neutral-300">{item.name} x{item.quantity}</span>
                      <span className="text-neutral-400">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span>الإجمالي</span>
                    <span className="text-amber-400">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCheckoutStep(1)}
                    disabled={processing}
                    className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl"
                  >
                    رجوع
                  </button>
                  <button
                    onClick={submitOrder}
                    disabled={processing}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        تأكيد الطلب
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Notice */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <p className="text-amber-400 text-sm">
          ⚠️ <strong>صفحة تجريبية</strong> - للاختبار فقط
        </p>
      </div>
    </div>
  );
}
