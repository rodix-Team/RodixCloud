import { createSlice } from '@reduxjs/toolkit';

// Load orders from localStorage
const loadOrdersFromStorage = () => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('orders');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }
    return MOCK_ORDERS;
};

// Save orders to localStorage
const saveOrdersToStorage = (orders) => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('orders', JSON.stringify(orders));
        } catch (error) {
            console.error('Error saving orders:', error);
        }
    }
};

// Mock orders data
const MOCK_ORDERS = [
    {
        id: 'ORD-001',
        date: '2025-11-20',
        status: 'delivered',
        total: 420,
        items: [
            { id: 1, name: 'عسل الزعتر الجبلي', quantity: 2, price: 150 },
            { id: 4, name: 'عسل السدر الملكي', quantity: 1, price: 280 },
        ],
        shippingAddress: {
            name: 'أحمد محمد',
            phone: '0612345678',
            address: 'حي السلام، شارع 10، الرقم 25',
            city: 'تارودانت',
        },
        timeline: [
            { status: 'placed', date: '2025-11-20 10:30', completed: true },
            { status: 'processing', date: '2025-11-20 11:00', completed: true },
            { status: 'preparing', date: '2025-11-20 14:00', completed: true },
            { status: 'shipped', date: '2025-11-21 09:00', completed: true },
            { status: 'out_for_delivery', date: '2025-11-22 08:00', completed: true },
            { status: 'delivered', date: '2025-11-22 15:30', completed: true },
        ],
    },
    {
        id: 'ORD-002',
        date: '2025-11-22',
        status: 'shipped',
        total: 285,
        items: [
            { id: 5, name: 'عسل الزهور البرية', quantity: 1, price: 135 },
            { id: 2, name: 'عسل الأوكالبتوس الطبيعي', quantity: 1, price: 120 },
        ],
        shippingAddress: {
            name: 'فاطمة الزهراء',
            phone: '0623456789',
            address: 'حي المسيرة، زنقة 5، الرقم 12',
            city: 'أكادير',
        },
        timeline: [
            { status: 'placed', date: '2025-11-22 09:15', completed: true },
            { status: 'processing', date: '2025-11-22 10:00', completed: true },
            { status: 'preparing', date: '2025-11-22 15:30', completed: true },
            { status: 'shipped', date: '2025-11-23 08:00', completed: true },
            { status: 'out_for_delivery', date: null, completed: false },
            { status: 'delivered', date: null, completed: false },
        ],
    },
    {
        id: 'ORD-003',
        date: '2025-11-23',
        status: 'processing',
        total: 165,
        items: [
            { id: 3, name: 'عسل الليمون الفاخر', quantity: 1, price: 165 },
        ],
        shippingAddress: {
            name: 'يوسف العلوي',
            phone: '0634567890',
            address: 'حي النهضة، شارع الحسن الثاني، الرقم 45',
            city: 'مراكش',
        },
        timeline: [
            { status: 'placed', date: '2025-11-23 11:00', completed: true },
            { status: 'processing', date: '2025-11-23 11:30', completed: true },
            { status: 'preparing', date: null, completed: false },
            { status: 'shipped', date: null, completed: false },
            { status: 'out_for_delivery', date: null, completed: false },
            { status: 'delivered', date: null, completed: false },
        ],
    },
];

const ordersSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: loadOrdersFromStorage(),
    },
    reducers: {
        addOrder: (state, action) => {
            const newOrder = {
                ...action.payload,
                id: action.payload.id || `ORD-${Date.now()}`,
                date: action.payload.date || new Date().toLocaleDateString('ar-MA'),
                status: action.payload.status || 'placed',
                timeline: action.payload.timeline || [
                    { status: 'placed', date: new Date().toISOString(), completed: true },
                    { status: 'processing', date: null, completed: false },
                    { status: 'preparing', date: null, completed: false },
                    { status: 'shipped', date: null, completed: false },
                    { status: 'out_for_delivery', date: null, completed: false },
                    { status: 'delivered', date: null, completed: false },
                ],
            };
            state.orders.unshift(newOrder);
            saveOrdersToStorage(state.orders);
        },
    },
});

export const { addOrder } = ordersSlice.actions;

// Selectors
export const selectAllOrders = (state) => state.orders.orders;
export const selectOrderById = (orderId) => (state) =>
    state.orders.orders.find((order) => order.id === orderId);
export const selectUserOrders = (userId) => (state) =>
    state.orders.orders.filter((order) => order.userId === userId);

export default ordersSlice.reducer;
