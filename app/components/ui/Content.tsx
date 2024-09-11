import * as React from "react";
import { ScrollView, ScrollViewProps } from "react-native";
import { useTheme } from "@ui-kitten/components";

interface ContentProps extends ScrollViewProps {
  isPadding?: boolean;
  level?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | string;
}

const Content: React.FC<ContentProps> = ({
  style,
  contentContainerStyle,
  children,
  isPadding = false,
  level,
  ...props
}) => {
  const theme = useTheme();
  return (
    <ScrollView
      {...props}
      style={[
        { backgroundColor: level && theme[`background-basic-color-${level}`] },
        style,
      ]}
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        contentContainerStyle,
        isPadding && { paddingHorizontal: 24 },
      ]}
    >
      {children}
    </ScrollView>
  );
};

export default Content;
