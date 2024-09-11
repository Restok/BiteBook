import React, { memo } from "react";
import {
  ColorValue,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useTheme, Icon, TopNavigationAction } from "@ui-kitten/components";
import { useNavigation } from "@react-navigation/native";

import Text from "./Text";

import { EvaStatus } from "@ui-kitten/components/devsupport";

interface NavigationActionProps {
  icon?: string;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginVertical?: number;
  onPress?: () => void;
  title?: string;
  titleStatus?: EvaStatus | "body" | "white";
  size?: "giant" | "large" | "medium" | "small"; // giant-58-icon-24 large-48-icon-24  medium-40-icon-24  small-32-icon-16
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  status?:
    | "basic"
    | "dark"
    | "white"
    | "black"
    | "primary"
    | "placeholder"
    | "light-salmon"
    | "transparent";
  backgroundColor?: string | ColorValue;
  tintColor?: string | ColorValue;
}

const NavigationAction = memo(
  ({
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginVertical,
    onPress,
    icon,
    title,
    size = "large",
    titleStatus,
    disabled,
    style,
    status = "basic",
    backgroundColor,
    tintColor,
  }: NavigationActionProps) => {
    const themes = useTheme();

    const { goBack } = useNavigation();
    const _onPress = React.useCallback(() => {
      if (onPress) {
        onPress();
      } else {
        goBack();
      }
    }, [onPress, goBack]);

    const getStatus = React.useCallback(() => {
      switch (status) {
        case "basic":
          return themes["text-white-color"];
        case "dark":
          return themes["text-basic-color"];
        case "black":
          return themes["text-basic-color"];
        case "primary":
          return themes["text-primary-color"];
        case "white":
          return themes["text-white-color"];
        case "placeholder":
          return themes["text-primary-color"];
        case "transparent":
          return themes["text-white-color"];
        case "light-salmon":
          return "#8247E5";
        default:
          return themes["text-basic-color"];
      }
    }, [status]);
    const getBackground = React.useCallback(() => {
      switch (status) {
        case "basic":
          return themes["background-button-color"];
        case "primary":
          return "transparent";
        case "black":
          return "transparent";
        case "white":
          return themes["text-primary-color"];
        case "placeholder":
          return "#FFFFFF50";
        case "light-salmon":
          return themes["color-light-100"];
        case "transparent":
          return "transparent";
        default:
          return themes["text-basic-color"];
      }
    }, [status]);
    const getSizeIcon = (
      size: "giant" | "large" | "medium" | "small"
    ): number => {
      switch (size) {
        case "giant":
          return 24;
        case "large":
          return 24;
        case "medium":
          return 20;
        case "small":
          return 16;
        default:
          return 24;
      }
    };
    const getSize = (size: "giant" | "large" | "medium" | "small"): number => {
      switch (size) {
        case "giant":
          return 48;
        case "large":
          return 40;
        case "medium":
          return 32;
        case "small":
          return 24;
        default:
          return 24;
      }
    };
    return title ? (
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.7}
        onPress={_onPress}
      >
        <Text category="body" status={titleStatus}>
          {title}
        </Text>
      </TouchableOpacity>
    ) : (
      <TopNavigationAction
        onPress={_onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={[
          styles.container,
          {
            marginBottom: marginBottom,
            marginTop: marginTop,
            marginLeft: marginLeft,
            marginRight: marginRight,
            marginVertical: marginVertical,
            backgroundColor: backgroundColor
              ? backgroundColor
              : getBackground(),
            borderRadius: 99,
            height: getSize(size),
            width: getSize(size),
          },
          style,
        ]}
        icon={(props) => (
          <Icon
            {...props}
            name={icon || "arrow_left"}
            style={[
              {
                height: getSizeIcon(size),
                width: getSizeIcon(size),
                tintColor: tintColor ? tintColor : getStatus(),
              },
            ]}
          />
        )}
      />
    );
  }
);

NavigationAction.displayName = "NavigationAction";
export default NavigationAction;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 99,
    width: 48,
    height: 48,
  },
});
