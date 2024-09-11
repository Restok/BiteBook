import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  ColorValue,
} from "react-native";
import { Button, Layout, useTheme } from "@ui-kitten/components";
import { EvaSize } from "@ui-kitten/components/devsupport";
import Text from "./Text";
interface Props {
  tabs?: string[];
  style?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  backgroundTab?: string | ColorValue;
  backgroundTabActive?: string | ColorValue;
  onChangeTab: (index: number) => void;
  tabActive: number;
  uppercase?: boolean;
  capitalize?: boolean;
}
const TabBar = ({
  tabs,
  onChangeTab,
  style,
  tabStyle,
  capitalize,
  uppercase,
  backgroundTab = "#F5F7FA",
  tabActive,
  backgroundTabActive = "#5784E8",
}: Props) => {
  const theme = useTheme();
  const _onChangeTab = React.useCallback(
    (number: number) => {
      onChangeTab(number);
    },
    [onChangeTab]
  );

  return (
    <View style={[styles.container, style, { backgroundColor: backgroundTab }]}>
      {tabs?.map((item, index) => {
        const backgroundColor = {
          backgroundColor:
            tabActive === index ? backgroundTabActive : undefined,
        };
        return (
          <Button
            onPress={() => _onChangeTab(index)}
            key={index}
            size="small"
            style={[styles.tabStyle, backgroundColor, tabStyle]}
          >
            <Text
              capitalize={capitalize}
              uppercase={uppercase}
              status={tabActive === index ? "control" : "placeholder"}
              center
              category="c1"
            >
              {item}
            </Text>
          </Button>
        );
      })}
    </View>
  );
};
export default TabBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 24,
    marginTop: 32,
  },
  tabStyle: {
    height: 32,
    borderRadius: 24,
    justifyContent: "center",
    flex: 1,
    borderWidth: 0,
  },
  noti: {
    position: "absolute",
    right: 9,
    top: 9,
    borderRadius: 50,
  },
});
