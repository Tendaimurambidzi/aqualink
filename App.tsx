/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Text, Button, TextInput, TouchableOpacity, FlatList, Image, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Feed" component={FeedScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Messages" component={MessagesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function LoginScreen({ navigation }: any) {
  // Simple visible login screen
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome to Aqualink</Text>
      <Button title="Go to Feed" onPress={() => navigation.replace('Feed')} />
    </View>
  );
}

function FeedScreen({ navigation }: any) {
  // Navigation bar buttons
  const navButtons = [
    { label: 'Home', onPress: () => {}, icon: '🏠' },
    { label: 'Friends', onPress: () => {}, icon: '👥' },
    { label: 'Inbox', onPress: () => navigation.navigate('Messages'), icon: '✉️' },
    { label: 'Reels', onPress: () => {}, icon: '🎬' },
    { label: 'Notifications', onPress: () => {}, icon: '🔔' },
    { label: 'Search', onPress: () => {}, icon: '🔍' },
    { label: 'Settings', onPress: () => {}, icon: '⚙️' },
  ];
  // ...existing code for avatars, feedPages, state, handlers, renderers, and return...
  const avatars = {
    Alice: 'https://randomuser.me/api/portraits/women/1.jpg',
    Bob: 'https://randomuser.me/api/portraits/men/2.jpg',
    Carol: 'https://randomuser.me/api/portraits/women/3.jpg',
    Dave: 'https://randomuser.me/api/portraits/men/4.jpg',
    Eve: 'https://randomuser.me/api/portraits/women/5.jpg',
    Frank: 'https://randomuser.me/api/portraits/men/6.jpg',
    Grace: 'https://randomuser.me/api/portraits/women/7.jpg',
    Henry: 'https://randomuser.me/api/portraits/men/8.jpg',
    Ivy: 'https://randomuser.me/api/portraits/women/9.jpg',
    Jack: 'https://randomuser.me/api/portraits/men/10.jpg',
    Kate: 'https://randomuser.me/api/portraits/women/11.jpg',
  };

  // 6 pages of feeds, each with different posts
  const feedPages = [
    [
      { id: 1, user: 'Alice', content: 'Just joined Aqualink! Excited to connect with everyone.', likes: 2, comments: ['Welcome Alice!'], liked: false },
      { id: 2, user: 'Bob', content: 'What a beautiful day to share some photos!', likes: 5, comments: ['Nice!', 'Show us more!'], liked: false },
    ],
    [
      { id: 1, user: 'Carol', content: 'Loving the new features on Aqualink!', likes: 3, comments: ['Me too!'], liked: false },
      { id: 2, user: 'Dave', content: 'Anyone up for a meetup this weekend?', likes: 1, comments: ['I am!'], liked: false },
    ],
    [
      { id: 1, user: 'Eve', content: 'Check out my latest blog post!', likes: 4, comments: ['Great read!'], liked: false },
      { id: 2, user: 'Frank', content: 'Just finished a marathon!', likes: 6, comments: ['Congrats!'], liked: false },
    ],
    [
      { id: 1, user: 'Grace', content: 'Aqualink is the best!', likes: 7, comments: ['Absolutely!'], liked: false },
      { id: 2, user: 'Henry', content: 'Looking for book recommendations.', likes: 2, comments: ['Try "1984"!'], liked: false },
    ],
    [
      { id: 1, user: 'Ivy', content: 'Just adopted a puppy!', likes: 8, comments: ['So cute!'], liked: false },
      { id: 2, user: 'Jack', content: 'Who wants to play chess?', likes: 3, comments: ['I do!'], liked: false },
    ],
    [
      { id: 1, user: 'Kate', content: 'Started a new job today!', likes: 5, comments: ['Congrats!'], liked: false },
      { id: 2, user: 'Alice', content: 'Enjoying a sunny day at the park.', likes: 2, comments: ['Nice!'], liked: false },
    ],
  ];

  // State for all pages
  const [pages, setPages] = useState(feedPages);
  const [commentText, setCommentText] = useState('');
  const [activePost, setActivePost] = useState<{ pageIdx: number; postId: number } | null>(null);

  // Like handler for a post in a page
  const handleLike = (pageIdx: number, postId: number) => {
    setPages(pages =>
      pages.map((posts, idx) =>
        idx === pageIdx
          ? posts.map(post =>
              post.id === postId
                ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked }
                : post
            )
          : posts
      )
    );
  };

  // Comment handler for a post in a page
  const handleComment = (pageIdx: number, postId: number) => {
    if (commentText.trim() === '') return;
    setPages(pages =>
      pages.map((posts, idx) =>
        idx === pageIdx
          ? posts.map(post =>
              post.id === postId
                ? { ...post, comments: [...post.comments, commentText] }
                : post
            )
          : posts
      )
    );
    setCommentText('');
    setActivePost(null);
  };

  // Render a single post
  const renderPost = (pageIdx: number) => ({ item: post }: any) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Image source={{ uri: avatars[post.user] || avatars['Alice'] }} style={styles.avatar} />
        <Text style={styles.username}>{post.user}</Text>
      </View>
      <Text style={styles.content}>{post.content}</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={() => handleLike(pageIdx, post.id)} style={styles.actionBtn}>
          <Text style={{ color: post.liked ? '#1877f2' : '#333', fontWeight: 'bold' }}>👍 {post.liked ? 'Unlike' : 'Like'} ({post.likes})</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActivePost({ pageIdx, postId: post.id })} style={styles.actionBtn}>
          <Text style={{ color: '#333', fontWeight: 'bold' }}>💬 Comment</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 8 }}>
        <Text style={styles.commentsTitle}>Comments:</Text>
        {post.comments.map((c, i) => (
          <Text key={i} style={styles.commentText}>- {c}</Text>
        ))}
        {activePost && activePost.pageIdx === pageIdx && activePost.postId === post.id && (
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
            />
            <Button title="Post" onPress={() => handleComment(pageIdx, post.id)} />
          </View>
        )}
      </View>
    </View>
  );

  // Render a single feed page (vertical feed)
  const { width } = useWindowDimensions();
  const renderFeedPage = ({ item: posts, index: pageIdx }: any) => (
    <View style={{ width, flex: 1, paddingTop: 8 }}>
      <FlatList
        data={posts}
        renderItem={renderPost(pageIdx)}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingBottom: 16,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', margin: 16 }}>News Feed</Text>
      <FlatList
        data={pages}
        renderItem={renderFeedPage}
        keyExtractor={(_, idx) => idx.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      {/* Professional Navigation Bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 10, borderTopWidth: 1, borderColor: '#e0e0e0', elevation: 10 }}>
        {navButtons.map(btn => (
          <TouchableOpacity key={btn.label} onPress={btn.onPress} style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 22 }}>{btn.icon}</Text>
            <Text style={{ fontSize: 12, color: '#333', marginTop: 2 }}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ProfileScreen({ navigation }: any) {
  // Placeholder profile screen
  return (
    <></>
  );
}

function MessagesScreen({ navigation }: any) {
  // Placeholder messages screen
  return (
    <></>
  );
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  content: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  actionBtn: {
    marginRight: 18,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  commentsTitle: {
    fontWeight: 'bold',
    marginTop: 4,
    color: '#1877f2',
  },
  commentText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 13,
    marginTop: 2,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 4,
    marginRight: 8,
    fontSize: 14,
    backgroundColor: '#fafbfc',
  },
});

export default App;
