import { View, Text, FlatList, RefreshControl } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchInput from "../../components/searchInput";
import EmptyState from "../../components/emptyState";
import { getUserSavedPosts } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import VideoCard from "../../components/videoCard";
import { useLocalSearchParams } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";

const Bookmark = () => {
  const { query } = useLocalSearchParams();
  const { user } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(() =>
    getUserSavedPosts(user.$id)
  );

  console.log(posts);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();

    setRefreshing(false);
  };

  const handleVideoCardAction = async () => {
    await onRefresh();
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard video={item} onLiked={handleVideoCardAction} />
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4">
            <Text className="font-psemibold text-2xl text-white">
              Saved Videos
            </Text>
            <View className="mt-6 mb-8">
              <SearchInput initialQuery={query} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No Videos found for this Search"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Bookmark;
