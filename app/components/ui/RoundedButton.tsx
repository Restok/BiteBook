import * as React from "react";
import { TouchableOpacity, Image } from "react-native";
import { StyleService, useTheme, Icon } from "@ui-kitten/components";
import Images from "assets/images";

interface IRoundedButtonProps {
  onPress?(): void;
  backgroundColor?: string;
  status?: "basic" | "placeholder";
  icon?: string;
  size?: number;
  activeOpacity?: number;
}

const RoundedButton = React.memo(
  ({
    onPress,
    status = "placeholder",
    icon = "arrow_circle_right",
    backgroundColor,
    size = 56,
    activeOpacity = 0.7,
  }: IRoundedButtonProps) => {
    const theme = useTheme();

    const getColor = () => {
      switch (status) {
        case "basic":
          return theme["color-primary-100"];
        case "placeholder":
          return `${theme["color-primary-100"]}30`;
      }
    };
    const getTintColor = () => {
      switch (status) {
        case "basic":
          return theme["color-basic-1100"];
        case "placeholder":
          return theme["color-primary-100"];
      }
    };
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onPress}
        style={{
          width: size,
          height: size,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={Images.rounded}
          style={{
            width: size,
            height: size,
            tintColor: getColor(),
            zIndex: -10,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        />
        <Icon
          pack="assets"
          name={icon}
          style={{
            width: 20,
            height: 20,
            zIndex: 100,
            tintColor: getTintColor(),
          }}
        />
      </TouchableOpacity>
    );
  }
);
RoundedButton.displayName = "RoundedButton";
export default RoundedButton;

const themedStyles = StyleService.create({
  container: {
    flex: 1,
  },
});
