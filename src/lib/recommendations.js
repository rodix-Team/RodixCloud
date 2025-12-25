// Smart Recommendation Engine
// Provides personalized product recommendations

export function getProductRecommendations(currentProduct, allProducts, limit = 4) {
    if (!currentProduct || !allProducts) return [];

    const recommendations = [];
    const sameCategory = allProducts.filter(
        (p) => p.id !== currentProduct.id && p.category === currentProduct.category
    );
    recommendations.push(...sameCategory);

    const priceMin = currentProduct.price * 0.7;
    const priceMax = currentProduct.price * 1.3;
    const similarPrice = allProducts.filter(
        (p) =>
            p.id !== currentProduct.id &&
            p.price >= priceMin &&
            p.price <= priceMax &&
            !recommendations.includes(p)
    );
    recommendations.push(...similarPrice);

    const popular = allProducts
        .filter((p) => p.id !== currentProduct.id && !recommendations.includes(p))
        .sort((a, b) => b.rating - a.rating);
    recommendations.push(...popular);

    const unique = [...new Set(recommendations)];
    return unique.slice(0, limit);
}

export function getCustomersAlsoBought(productId, allProducts, limit = 4) {
    const patterns = {
        1: [2, 5, 4],
        2: [1, 3, 5],
        3: [4, 1, 2],
        4: [1, 3, 5],
        5: [1, 2, 6],
        6: [5, 2, 1],
    };

    const relatedIds = patterns[productId] || [];
    return allProducts
        .filter((p) => relatedIds.includes(p.id))
        .slice(0, limit);
}

export function getPersonalizedRecommendations(
    viewedProducts = [],
    cartItems = [],
    allProducts = [],
    limit = 6
) {
    if (!allProducts.length) return [];

    const scores = new Map();

    viewedProducts.forEach((viewedId) => {
        const viewed = allProducts.find((p) => p.id === viewedId);
        if (!viewed) return;

        allProducts.forEach((product) => {
            if (product.id === viewedId) return;

            let score = scores.get(product.id) || 0;

            if (product.category === viewed.category) {
                score += 3;
            }

            const priceDiff = Math.abs(product.price - viewed.price);
            if (priceDiff < 50) {
                score += 2;
            }

            scores.set(product.id, score);
        });
    });

    cartItems.forEach((cartItem) => {
        const inCart = allProducts.find((p) => p.id === cartItem.id);
        if (!inCart) return;

        allProducts.forEach((product) => {
            if (product.id === cartItem.id) return;

            let score = scores.get(product.id) || 0;

            if (product.category !== inCart.category) {
                score += 2;
            }

            scores.set(product.id, score);
        });
    });

    const recommended = Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => allProducts.find((p) => p.id === id))
        .filter(Boolean)
        .slice(0, limit);

    if (recommended.length < limit) {
        const popular = allProducts
            .filter((p) => !recommended.find((r) => r.id === p.id))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit - recommended.length);

        recommended.push(...popular);
    }

    return recommended;
}

export function trackUserBehavior(action, productId) {
    if (typeof window === 'undefined') return;

    try {
        const key = `user_behavior_${action}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');

        const entry = {
            productId,
            timestamp: Date.now(),
        };

        const updated = [entry, ...existing].slice(0, 50);
        localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
        console.error('Error tracking behavior:', error);
    }
}

export function getViewedProducts() {
    if (typeof window === 'undefined') return [];

    try {
        const viewed = JSON.parse(localStorage.getItem('user_behavior_view') || '[]');
        return viewed.map((v) => v.productId);
    } catch {
        return [];
    }
}

export function getCategoryRecommendations(category, allProducts, limit = 4) {
    return allProducts
        .filter((p) => p.category === category)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
}

// Track recently viewed products
export function trackRecentlyViewed(productId) {
    if (typeof window === 'undefined') return;

    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = recent.filter(id => id !== productId);
    const updated = [productId, ...filtered].slice(0, 8);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));

    const views = JSON.parse(localStorage.getItem('productViews') || '{}');
    views[productId] = {
        count: (views[productId]?.count || 0) + 1,
        lastViewed: new Date().toISOString()
    };
    localStorage.setItem('productViews', JSON.stringify(views));
}

// Get recently viewed products
export function getRecentlyViewed(allProducts, limit = 8) {
    if (typeof window === 'undefined') return [];

    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    return allProducts.filter(p => recent.includes(p.id)).slice(0, limit);
}

// Get trending products
export function getTrendingProducts(allProducts, limit = 6) {
    if (typeof window === 'undefined') return allProducts.slice(0, limit);

    const views = JSON.parse(localStorage.getItem('productViews') || '{}');
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    const scored = allProducts.map(product => {
        const viewData = views[product.id];
        if (!viewData) return { ...product, score: 0 };

        const lastViewed = new Date(viewData.lastViewed);
        const isRecent = lastViewed > oneDayAgo;
        const score = viewData.count * (isRecent ? 2 : 1);

        return { ...product, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

