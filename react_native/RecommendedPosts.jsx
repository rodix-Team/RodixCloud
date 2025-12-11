// React Native - Recommended Posts Component
// src/components/RecommendedPosts.jsx

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { getRecommendations, trackView } from '../api/recommendations';

export default function RecommendedPosts({
    userId,
    limit = 10,
    onPostPress,
    category = null,
}) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (userId) {
            loadRecommendations();
        }
    }, [userId, category]);

    const loadRecommendations = async () => {
        try {
            setLoading(true);
            const recommendations = await getRecommendations(userId, limit, category);
            setPosts(recommendations);
        } catch (error) {
            console.error('Error loading recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRecommendations();
        setRefreshing(false);
    };

    const handlePostPress = async (post) => {
        // Track view
        await trackView(userId, post.id);

        // Navigate or call parent callback
        if (onPostPress) {
            onPostPress(post);
        }
    };

    const renderPost = ({ item }) => (
        <TouchableOpacity
            style={styles.postCard}
            onPress={() => handlePostPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>

            {item.description && (
                <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                </Text>
            )}

            <View style={styles.tagsContainer}>
                {item.tags && item.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                ))}
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>جاري تحميل التوصيات...</Text>
            </View>
        );
    }

    if (posts.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>لا توجد توصيات حالياً</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>✨ مقالات موصى بها لك</Text>
            </View>

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPost}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#667eea']}
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    postCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#667eea',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#667eea',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    categoryText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    tag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 12,
        color: '#666',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});
