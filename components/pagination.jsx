import React from "react";
import { StyleSheet, View } from "react-native";
import * as Animatable from "react-native-animatable";

const Pagination = ({ data, activeItem }) => {
  return (
    <View className="absolute bottom-0 flex-row w-full items-center justify-center">
      {data.map((item, idx) => {
        const isActive = item.$id === activeItem.$id;
        return (
          <Animatable.View
            key={idx.toString()}
            transition={["width", "backgroundColor", "opacity"]}
            className="w-2 h-2 rounded-full mx-1"
            style={[isActive ? styles.dotActive : styles.dotInactive]}
          />
        );
      })}
    </View>
  );
};

export default Pagination;

const styles = StyleSheet.create({
  dotActive: {
    width: 18,
    backgroundColor: "#FF9C01",
    opacity: 1,
  },
  dotInactive: {
    backgroundColor: "#FF9C01",
    opacity: 0.2,
  },
});
