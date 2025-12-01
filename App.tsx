import 'react-native-gesture-handler';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {pick} from '@react-native-documents/picker';
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import Video from 'react-native-video';
import FastImage from 'react-native-fast-image';

type Post = {
  id: number;
  user: string;
  content: string;
  likes: number;
  comments: string[];
  liked: boolean;
  imageUrl?: string;
  videoUrl?: string;
  documentUrl?: string;
  documentName?: string;
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

  const currentUser = {
    name: 'Grace',
    avatar: avatars['Grace'],
  };

  const initialPosts: Post[] = [
    {id: 1, user: 'Alice', content: 'Just joined Aqualink! Excited to connect with everyone.', likes: 2, comments: ['Welcome Alice!'], liked: false},
    {id: 2, user: 'Bob', content: 'What a beautiful day to share some photos!', likes: 5, comments: ['Nice!', 'Show us more!'], liked: false},
    {id: 3, user: 'Carol', content: 'Loving the new features on Aqualink!', likes: 3, comments: ['Me too!'], liked: false},
  ];

  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [commentText, setCommentText] = useState('');
  const [activePostForComment, setActivePostForComment] = useState<{postId: number} | null>(null);
  const [activeTab, setActiveTab] = useState('Tide');

  // Add new post from CreatePostScreen (instant UI update)
  useEffect(() => {
    if (route.params?.newPost) {
      const {newPost} = route.params;
      setPosts(prev => [newPost, ...prev]);
      if (!avatars[newPost.user]) {
        avatars[newPost.user] = avatars['Grace'];
      }
      navigation.setParams({newPost: undefined});
    }
  }, [route.params?.newPost, navigation]);

  const handleLike = useCallback((postId: number) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId ? {...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked} : p,
      ),
    );
  }, []);

  const handleComment = () => {
    if (!activePostForComment || commentText.trim() === '') return;
    const {postId} = activePostForComment;
    setPosts(prev =>
      prev.map(p => (p.id === postId ? {...p, comments: [...p.comments, commentText]} : p)),
    );
    setCommentText('');
    setActivePostForComment(null);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out Aqualink! A great new app to connect and share waves. #Aqualink',
        url: 'https://aqualink.example.com',
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

  const renderPost = useCallback(({item: post}: {item: Post}) => (
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
          {post.imageUrl && <FastImage source={{uri: post.imageUrl}} style={styles.postImage} resizeMode={FastImage.resizeMode.cover} />}
          {post.videoUrl && (
            <Video
              source={{uri: post.videoUrl}}
              style={styles.postVideo}
              controls
              resizeMode="cover"
              paused
            />
          )}
          {post.documentUrl && (
            <TouchableOpacity style={styles.documentContainer}>
              <Text style={styles.documentIcon}>Doc</Text>
              <Text style={styles.documentName} numberOfLines={1}>
                {post.documentName || 'Attached Document'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.cardBottomSection}>
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={() => handleLike(post.id)} style={styles.actionBtn}>
              <Text style={[styles.actionIcon, {color: post.liked ? '#1877f2' : '#65676b'}]}>❤</Text>
              <Text style={styles.actionText}>{post.likes} Splashes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActivePostForComment({postId: post.id})}
              style={styles.actionBtn}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>{post.comments.length} Echoes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation, avatars, handleLike]);

  return (
    <View style={styles.feedScreen}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{flexGrow: 1, justifyContent: 'space-between', paddingVertical: 8}}
        ItemSeparatorComponent={() => <View style={{height: 12}} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        windowSize={10}
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
                  ? posts.find(p => p.id === activePostForComment.postId)?.comments || []
                  : []
              }
              renderItem={({item}) => <Text style={styles.commentText}>- {item}</Text>}
              keyExtractor={(item, index) => `${item}-${index}`}
              contentContainerStyle={{padding: 16}}
              initialNumToRender={5}
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
            <Text style={[styles.navIcon, activeTab === 'Tide' && styles.navIconActive]}>🌊</Text>
            <Text style={[styles.navText, activeTab === 'Tide' && styles.navTextActive]}>Tide</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'Scan' && styles.navItemActive]}
            onPress={() => handleNavPress('Scan', 'Search')}>
            <Text style={[styles.navIcon, activeTab === 'Scan' && styles.navIconActive]}>🔎</Text>
            <Text style={[styles.navText, activeTab === 'Scan' && styles.navTextActive]}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'Cast' && styles.navItemActive]}
            onPress={() => handleNavPress('Cast', 'CreatePost')}>
            <Text style={[styles.navIcon, activeTab === 'Cast' && styles.navIconActive]}>📤</Text>
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
            <Text style={[styles.navIcon, activeTab === 'Casta wave' && styles.navIconActive]}>🌐</Text>
            <Text style={[styles.navText, activeTab === 'Casta wave' && styles.navTextActive]}>Casta wave</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'Bridge' && styles.navItemActive]}
            onPress={() => handleNavPress('Bridge', 'Settings')}>
            <Text style={[styles.navIcon, activeTab === 'Bridge' && styles.navIconActive]}>⚙</Text>
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

function MessagesScreen({navigation}: any) {
  return (
    <View style={styles.centerScreen}>
      <Text>Messages Screen</Text>
      <Button title="Go back" onPress={() => navigation.goBack()} />
    </View>
  );
}

function CreatePostScreen({navigation, route}: any) {
  const currentUser =
    route?.params?.currentUser || {
      name: 'You',
      avatar: 'https://randomuser.me/api/portraits/women/7.jpg',
    };
  const [postContent, setPostContent] = useState('');
  const [attachment, setAttachment] = useState<any>(null); // Will use image-picker for images/videos
  const [isUploading, setIsUploading] = useState(false);
  const MAX_POST_LENGTH = 280;
  // Remove file.io, use Firebase Storage

  const uploadAttachment = async (file: any, castId: number) => {
    const filename = file.name || 'upload';
    const storagePath = `casts/${castId}/media/${Date.now()}_${filename}`;
    console.log('Uploading attachment to storage path:', storagePath);
    try {
      const ref = storage().ref(storagePath);
      // Prefer the copied file path from the picker to avoid scoped-storage permission errors.
      let uri = file.fileCopyUri || file.uri;
      if (!uri) {
        throw new Error('No file URI returned from picker. Please select the file again.');
      }
      if (uri.startsWith('content://')) {
        const tempPath = RNFS.TemporaryDirectoryPath + '/' + filename;
        await RNFS.copyFile(uri, tempPath);
        uri = tempPath;
      }
      await ref.putFile(uri);
      const url = await ref.getDownloadURL();
      console.log('Upload successful, URL:', url);
      return url;
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Upload error: ' + (error?.message || 'Unable to read the selected file. Please reselect using the file picker.'));
      throw error;
    }
  };

  const handleFilePick = async () => {
    try {
      const res = await pick({
        type: ['image/*', 'video/*', 'application/pdf'],
        copyTo: 'cachesDirectory', // ensure we get a readable fileCopyUri for scoped storage
      });
      if (res && res.length > 0) {
        setAttachment(res[0]);
      }
    } catch (err) {
      console.error('Error picking file:', err);
    }
  };

  const handlePost = async () => {
    if (postContent.trim() === '' && !attachment) return;
    setIsUploading(true);

    try {
      const castId = Date.now();
      const newPost: Post = {
        id: castId,
        user: currentUser.name || 'You',
        content: postContent,
        likes: 0,
        comments: [],
        liked: false,
      };

      if (attachment) {
        try {
          const remoteUrl = await uploadAttachment(attachment, castId);
          const mime = attachment.type || '';
          const name = attachment.name || '';
          if (mime.startsWith('image/')) {
            newPost.imageUrl = remoteUrl;
          } else if (mime.startsWith('video/')) {
            newPost.videoUrl = remoteUrl;
          } else {
            newPost.documentUrl = remoteUrl;
            newPost.documentName = name || 'Attached Document';
          }
        } catch (error) {
          console.error('Upload failed, using local URI:', error);
          alert('Upload failed, using local file. Check Firebase config.');
          const fallbackUrl = attachment.uri;
          const mime = attachment.type || '';
          const name = attachment.name || '';
          if (mime.startsWith('image/')) {
            newPost.imageUrl = fallbackUrl;
          } else if (mime.startsWith('video/')) {
            newPost.videoUrl = fallbackUrl;
          } else {
            newPost.documentUrl = fallbackUrl;
            newPost.documentName = name || 'Attached Document';
          }
        }
      }

      navigation.navigate({name: 'Feed', params: {newPost}, merge: true});
      setPostContent('');
      setAttachment(null);
    } catch (error) {
      console.error('Error uploading attachment:', error);
    } finally {
      setIsUploading(false);
    }
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

      <View style={styles.attachmentSection}>
        <Button title="Attach File" onPress={handleFilePick} />
        {attachment && (
          <Text style={styles.attachmentName} numberOfLines={1}>
            Attached: {attachment.name || 'File'}
          </Text>
        )}
      </View>

      {isUploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffb300" />
          <Text style={{marginTop: 6}}>Casting your wave...</Text>
        </View>
      )}

      <View style={{width: '80%', marginTop: 10}}>
        <Button title="Cast" onPress={handlePost} disabled={isUploading} />
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
    padding: 0,
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
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  documentIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  postImage: {
    width: '100%',
    height: 280,
    borderRadius: 8,
    marginTop: 8,
  },
  postVideo: {
    width: '100%',
    height: 440,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#000',
  },
  cardTopSection: {
    backgroundColor: '#ffb300',
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
    backgroundColor: '#ffb300',
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
  attachmentSection: {
    width: '80%',
    marginVertical: 15,
  },
  attachmentName: {
    marginTop: 8,
    fontSize: 12,
    color: '#65676b',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
});

export default App;
