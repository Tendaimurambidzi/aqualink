/**
 * Simplified feed app with horizontal paged feeds and comment modal.
 */
import React, {useRef, useState, useEffect} from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  useWindowDimensions,
  Modal,
  ScrollView,
  Share,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

type Post = {
  id: number;
  user: string;
  content: string;
  likes: number;
  comments: string[];
  liked: boolean;
  imageUrl?: string;
  videoUrl?: string;
};

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{headerShown: false}}>
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Feed" component={FeedScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Messages" component={MessagesScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Group>
          <Stack.Group screenOptions={{presentation: 'modal'}}>
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function LoginScreen({navigation}: any) {
  return (
    <View style={styles.centerScreen}>
      <Text style={styles.loginTitle}>Welcome to Aqualink</Text>
      <Button title="Go to Feed" onPress={() => navigation.replace('Feed')} />
    </View>
  );
}

function FeedScreen({navigation, route}: any) {
  const avatars: Record<string, string> = {
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

  // Let's assume 'Grace' is our logged-in user for this session.
  const currentUser = {
    name: 'Grace',
    avatar: avatars['Grace'],
  };

  const feedPages: Post[][] = [
    [
      {
        id: 1,
        user: 'Alice',
        content: 'Look at this beautiful forest I visited today!',
        likes: 12,
        comments: ['Stunning!', 'So peaceful.'],
        liked: false,
        imageUrl: 'https://images.pexels.com/photos/302804/pexels-photo-302804.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      },
      {
        id: 2,
        user: 'Bob',
        content: 'Caught this amazing sunset on video!',
        likes: 25, comments: ['Wow!', 'Incredible colors!'], liked: false,
        videoUrl: 'https://images.pexels.com/photos/36744/sunset-sun-red-sky-setting-sun.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      },
      {id: 3, user: 'Carol', content: 'Just a regular text post here. Loving the new features on Aqualink!', likes: 3, comments: ['Me too!'], liked: false},
    ],
    [
      {id: 1, user: 'Dave', content: 'Anyone up for a meetup this weekend?', likes: 1, comments: ['I am!'], liked: false},
      {id: 2, user: 'Eve', content: 'Check out my latest blog post!', likes: 4, comments: ['Great read!'], liked: false},
      {id: 3, user: 'Frank', content: 'Just finished a marathon!', likes: 6, comments: ['Congrats!'], liked: false},
    ],
    [
      {id: 1, user: 'Grace', content: 'Aqualink is the best!', likes: 7, comments: ['Absolutely!'], liked: false},
      {id: 2, user: 'Henry', content: 'Looking for book recommendations.', likes: 2, comments: ['Try "1984"!'], liked: false},
      {id: 3, user: 'Ivy', content: 'Just adopted a puppy!', likes: 8, comments: ['So cute!'], liked: false},
    ],
    [
      {id: 1, user: 'Jack', content: 'Who wants to play chess?', likes: 3, comments: ['I do!'], liked: false},
      {id: 2, user: 'Kate', content: 'Started a new job today!', likes: 5, comments: ['Congrats!'], liked: false},
      {id: 3, user: 'Alice', content: 'Enjoying a sunny day at the park.', likes: 2, comments: ['Nice!'], liked: false},
    ],
    [
      {id: 1, user: 'Bob', content: 'Back to sharing photos!', likes: 5, comments: [], liked: false},
      {id: 2, user: 'Carol', content: 'The features keep getting better.', likes: 4, comments: [], liked: false},
      {id: 3, user: 'Dave', content: 'Meetup was a success!', likes: 9, comments: [], liked: false},
    ],
    [
      {id: 1, user: 'Eve', content: 'New blog post is live!', likes: 6, comments: [], liked: false},
      {id: 2, user: 'Frank', content: 'Training for the next marathon.', likes: 8, comments: [], liked: false},
      {id: 3, user: 'Grace', content: 'Still the best app.', likes: 10, comments: [], liked: false},
    ],
  ];

  const [pages, setPages] = useState<Post[][]>(feedPages);
  const [commentText, setCommentText] = useState('');
  const [activePostForComment, setActivePostForComment] = useState<{pageIdx: number; postId: number} | null>(null);
  const feedListRef = useRef<FlatList<Post[]> | null>(null);
  const {width} = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('Tide');

  useEffect(() => {
    if (route.params?.newPost) {
      const {newPost} = route.params;
      setPages(prevPages => {
        const newPages = [...prevPages];
        // Add the new post to the first page of the feed.
        // Also, add the new user's avatar to our avatars list if they don't exist.
        if (!avatars[newPost.user]) {
          avatars[newPost.user] = 'https://randomuser.me/api/portraits/women/7.jpg'; // Defaulting to Grace's avatar for 'You'
        }
        newPages[0] = [newPost, ...newPages[0]];
        return newPages;
      });
      // Reset the param to avoid re-adding the post on re-render
      navigation.setParams({newPost: undefined});
      // Scroll the horizontal feed back to the first page to see the new post
      feedListRef.current?.scrollToIndex({index: 0, animated: true});
    }
  }, [route.params?.newPost, navigation]);


  const handleLike = (pageIdx: number, postId: number) => {
    setPages(prev =>
      prev.map((posts, idx) =>
        idx === pageIdx
          ? posts.map(p =>
              p.id === postId ? {...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked} : p,
            )
          : posts,
      ),
    );
  };

  const handleComment = () => {
    if (!activePostForComment || commentText.trim() === '') return;
    const {pageIdx, postId} = activePostForComment;
    setPages(prev =>
      prev.map((posts, idx) =>
        idx === pageIdx
          ? posts.map(p => (p.id === postId ? {...p, comments: [...p.comments, commentText]} : p))
          : posts,
      ),
    );
    setCommentText('');
    setActivePostForComment(null);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out Aqualink! A great new app to connect and share waves. #Aqualink',
        url: 'https://aqualink.example.com', // Replace with your app's actual URL
        title: 'Join me on Aqualink!',
      });
    } catch (error: any) {
      console.error('Error sharing:', error.message);
    }
  };

  const handleNavPress = (tabName: string, screen?: string, action?: () => void) => {
    setActiveTab(tabName);
    if (screen) navigation.navigate(screen, tabName === 'CreatePost' ? {currentUser} : {});
    if (action) action();
  };

  const renderPost = (pageIdx: number) => ({item: post}: {item: Post}) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate('PostDetail', {
          post,
          avatar: avatars[post.user] || avatars['Alice'],
        })
      }>
      <View style={styles.card}>
        <View style={styles.cardTopSection}>
          <View style={styles.cardHeader}>
            <Image source={{uri: avatars[post.user] || avatars['Alice']}} style={styles.avatar} />
            <Text style={[styles.username, styles.textWhite]}>{post.user}</Text>
          </View>
          <Text style={[styles.content, styles.textWhite]}>{post.content}</Text>
          {post.imageUrl && (
            <Image source={{uri: post.imageUrl}} style={styles.postImage} />
          )}
          {post.videoUrl && (
            <View style={styles.videoContainer}>
              <Image source={{uri: post.videoUrl}} style={styles.postImage} />
              <View style={styles.playButtonOverlay} />
              <Text style={styles.playButtonIcon}>▶</Text>
            </View>
          )}
        </View>
        <View style={styles.cardBottomSection}>
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={() => handleLike(pageIdx, post.id)} style={styles.actionBtn}>
              <Text style={[styles.actionIcon, {color: post.liked ? '#1877f2' : '#65676b'}]}>💧</Text>
              <Text style={styles.actionText}>{post.likes} Splashes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActivePostForComment({pageIdx, postId: post.id})}
              style={styles.actionBtn}>
              <Text style={styles.actionIcon}>📢</Text>
              <Text style={styles.actionText}>{post.comments.length} Echoes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeedPage = ({item: posts, index: pageIdx}: {item: Post[]; index: number}) => (
    <View style={{width, flex: 1, paddingTop: 8}}>
      <FlatList
        data={posts}
        renderItem={renderPost(pageIdx)}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{flexGrow: 1, justifyContent: 'space-between', paddingVertical: 8}}
        ItemSeparatorComponent={() => <View style={{height: 12}} />}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{height: 8}} />}
      />
    </View>
  );

  return (
    <View style={styles.feedScreen}>
      <FlatList
        ref={feedListRef}
        data={pages}
        renderItem={renderFeedPage}
        keyExtractor={(_, idx) => idx.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={false}
        visible={activePostForComment !== null}
        onRequestClose={() => setActivePostForComment(null)}>
        <SafeAreaProvider>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Echoes</Text>
              <Button title="Close" onPress={() => setActivePostForComment(null)} />
            </View>
            <FlatList
              data={
                activePostForComment
                  ? pages[activePostForComment.pageIdx].find(p => p.id === activePostForComment.postId)?.comments || []
                  : []
              }
              renderItem={({item}) => <Text style={styles.commentText}>- {item}</Text>}
              keyExtractor={(item, index) => `${item}-${index}`}
              contentContainerStyle={{padding: 16}}
            />
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add an echo..."
                value={commentText}
                onChangeText={setCommentText}
              />
              <Button title="Cast" onPress={handleComment} />
            </View>
          </View>
        </SafeAreaProvider>
      </Modal>

      <View style={styles.bottomNavContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bottomNav}>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'Tide' && styles.navItemActive]}
            onPress={() => handleNavPress('Tide', 'Feed')}>
            <Text style={[styles.navIcon, activeTab === 'Tide' && styles.navIconActive]}>🗼</Text>
            <Text style={[styles.navText, activeTab === 'Tide' && styles.navTextActive]}>Tide</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'Scan' && styles.navItemActive]}
            onPress={() => handleNavPress('Scan', 'Search')}>
            <Text style={[styles.navIcon, activeTab === 'Scan' && styles.navIconActive]}>🔭</Text>
            <Text style={[styles.navText, activeTab === 'Scan' && styles.navTextActive]}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'Cast' && styles.navItemActive]}
            onPress={() => handleNavPress('Cast', 'CreatePost')}>
            <Text style={[styles.navIcon, activeTab === 'Cast' && styles.navIconActive]}>🌊</Text>
            <Text style={[styles.navText, activeTab === 'Cast' && styles.navTextActive]}>Cast</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'Activity' && styles.navItemActive]}
            onPress={() => handleNavPress('Activity', 'Notifications')}>
            <Text style={[styles.navIcon, activeTab === 'Activity' && styles.navIconActive]}>🔔</Text>
            <Text style={[styles.navText, activeTab === 'Activity' && styles.navTextActive]}>Activity</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'Harbour' && styles.navItemActive]}
            onPress={() => handleNavPress('Harbour', 'Profile')}>
            <Text style={[styles.navIcon, activeTab === 'Harbour' && styles.navIconActive]}>⚓</Text>
            <Text style={[styles.navText, activeTab === 'Harbour' && styles.navTextActive]}>Harbour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'Casta wave' && styles.navItemActive]}
            onPress={() => handleNavPress('Casta wave', undefined, handleShare)}>
            <Text style={[styles.navIcon, activeTab === 'Casta wave' && styles.navIconActive]}>📡</Text>
            <Text style={[styles.navText, activeTab === 'Casta wave' && styles.navTextActive]}>Casta wave</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'Bridge' && styles.navItemActive]}
            onPress={() => handleNavPress('Bridge', 'Settings')}>
            <Text style={[styles.navIcon, activeTab === 'Bridge' && styles.navIconActive]}>⚙️</Text>
            <Text style={[styles.navText, activeTab === 'Bridge' && styles.navTextActive]}>Bridge</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

function PostDetailScreen({route}: any) {
  const {post, avatar} = route.params;
  return (
    <View style={{flex: 1, backgroundColor: '#fff', paddingTop: 20}}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Image source={{uri: avatar}} style={styles.avatar} />
          <Text style={styles.username}>{post.user}</Text>
        </View>
        <Text style={styles.content}>{post.content}</Text>
      </View>
    </View>
  );
}

function SearchScreen() {
  return (
    <View style={styles.centerScreen}>
      <Text>Search Screen</Text>
    </View>
  );
}

function NotificationsScreen() {
  return (
    <View style={styles.centerScreen}>
      <Text>Notifications Screen</Text>
    </View>
  );
}

function SettingsScreen({navigation}: any) {
  return (
    <View style={styles.centerScreen}>
      <Text>Settings Screen</Text>
      <Button title="Go back" onPress={() => navigation.goBack()} />
    </View>
  );
}

function ProfileScreen({navigation}: any) {
  return (
    <View style={styles.centerScreen}>
      <Text>Profile Screen</Text>
      <Button title="Go back" onPress={() => navigation.goBack()} />
    </View>
  );
}

function CreatePostScreen({navigation, route}: any) {
  const {currentUser} = route.params;
  const [postContent, setPostContent] = useState('');
  const MAX_POST_LENGTH = 280;

  const handlePost = () => {
    if (postContent.trim() === '') return;

    const newPost: Post = {
      id: Date.now(), // Use timestamp for a unique ID
      user: currentUser.name,
      content: postContent,
      likes: 0,
      comments: [],
      liked: false,
    };

    // Navigate back to Feed and pass the new post as a parameter
    navigation.navigate({name: 'Feed', params: {newPost}, merge: true});
  };


  return (
    <View style={styles.centerScreen}>
      <Text style={styles.loginTitle}>Create a Wave</Text>
      <TextInput
        style={styles.postInput}
        placeholder="What's happening?"
        value={postContent}
        onChangeText={setPostContent}
        maxLength={MAX_POST_LENGTH}
        multiline
      />
      <Text style={styles.charCounter}>
        {postContent.length} / {MAX_POST_LENGTH}
      </Text>
      <View style={{width: '80%', marginTop: 10}}>
        <Button title="Cast" onPress={handlePost} />
        <View style={{marginTop: 12}}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            color="#ff6347"
          />
        </View>
      </View>
    </View>
  );
}

function MessagesScreen({navigation}: any) {
  return (
    <View style={styles.centerScreen}>
      <Text>Messages Screen</Text>
      <Button title="Go back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  feedScreen: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  textWhite: {
    color: '#fff',
  },
  content: {
    fontSize: 15,
    color: '#333',
    paddingBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  playButtonIcon: {
    position: 'absolute',
    fontSize: 48,
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  cardTopSection: {
    backgroundColor: '#dc3545',
    padding: 16,
  },
  cardBottomSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  actionIcon: {
    fontSize: 18,
    color: '#65676b',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#65676b',
    fontWeight: '600',
  },
  modalView: {
    flex: 1,
    marginTop: 22,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 14,
    backgroundColor: '#fafbfc',
  },
  commentText: {
    fontSize: 15,
    color: '#333',
    paddingVertical: 8,
  },
  bottomNavContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 70,
    borderRadius: 16,
  },
  navItemActive: {
    backgroundColor: '#1877f2',
  },
  navIcon: {
    fontSize: 24,
    color: '#65676b',
  },
  navIconActive: {
    color: '#fff',
  },
  navText: {
    fontSize: 11,
    color: '#65676b',
    textAlign: 'center',
  },
  navTextActive: {
    color: '#1877f2',
    color: '#fff',
  },
  postInput: {
    width: '80%',
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  charCounter: {
    width: '80%',
    textAlign: 'right',
    fontSize: 12,
    color: '#65676b',
  },
});

export default App;
