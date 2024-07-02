import { useState, useRef } from "react";
import {
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Image,
  Animated,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { icons } from "../constants";
import { Video, ResizeMode } from "expo-av";
import Pagination from "./pagination";

const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1.1,
  },
};
const zoomOut = {
  0: {
    scale: 1.1,
  },
  1: {
    scale: 0.9,
  },
};

const TrendingItem = ({ activeItem, item }) => {
  const [play, setPlay] = useState(false);

  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}>
      {play ? (
        <Video
          source={{ uri: item.video }}
          className="w-52 h-72 rounded-[33px] mt-3 bg-white/10"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          className="relative justify-center items-center"
          activeOpacity={0.7}
          onPress={() => setPlay(true)}>
          <ImageBackground
            source={{ uri: item.thumbnail }}
            className="w-52 h-72 rounded-[33px] my-5 overflow-hidden shadow-lg shadow-black/40"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

const Trending = ({ posts }) => {
  const [activeItem, setActiveItem] = useState(posts[0]);
  const scrollX = useRef(new Animated.Value(0)).current; // Use Animated.Value

  const viewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].item);
    }
  };

  return (
    <>
      <Animated.FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TrendingItem activeItem={activeItem.$id} item={item} />
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false } // Set to true if not using layout props in animations
        )}
        scrollEventThrottle={16}
      />
      <Pagination data={posts ?? []} activeItem={activeItem} />
    </>
  );
};

export default Trending;
