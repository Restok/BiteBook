/* eslint-disable react/prop-types */
import { useTheme } from "@ui-kitten/components";
import React, { memo } from "react";
import {
  GestureResponderEvent,
  StyleProp,
  TouchableOpacity,
  ViewProps,
  ViewStyle,
} from "react-native";

export interface HStackProps extends ViewProps {
  padder?: boolean;
  mt?: number;
  style?: StyleProp<ViewStyle>;
  mb?: number;
  mh?: number;
  mv?: number;
  ml?: number;
  mr?: number;
  ph?: number;
  pt?: number;
  pl?: number;
  pv?: number;
  pb?: number;
  maxWidth?: number;
  minWidth?: number;
  padding?: number;
  border?: number;
  margin?: number;
  opacity?: number;
  alignSelfCenter?: boolean;
  itemsCenter?: boolean;
  wrap?: boolean;
  columnGap?: number;
  gap?: number;
  borderStyle?: "solid" | "dotted" | "dashed" | undefined;
  rowGap?: number;
  overflow?: "visible" | "hidden" | "scroll" | undefined;
  onPress?(): void;
  onLongPress?: (event: GestureResponderEvent) => void;
  level?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | string;
  justify?:
    | "center"
    | "space-between"
    | "flex-start"
    | "flex-end"
    | "space-around"
    | "space-evenly"
    | undefined;
}

const HStack: React.FC<HStackProps> = memo(
  ({
    style,
    padder,
    children,
    mt,
    mb,
    pt,
    mh,
    pl,
    mv,
    ml,
    mr,
    ph,
    pv,
    pb,
    padding,
    margin,
    itemsCenter,
    wrap,
    level,
    onLongPress,
    justify = "space-between",
    onPress,
    border,
    maxWidth,
    minWidth,
    opacity,
    alignSelfCenter,
    overflow,
    gap,
    rowGap,
    columnGap,
    ...props
  }) => {
    const theme = useTheme();
    const disabled = !onPress && !onLongPress;
    return (
      <>
        <TouchableOpacity
          onLongPress={onLongPress}
          disabled={disabled}
          activeOpacity={disabled ? 1 : 0.54}
          onPress={onPress}
          style={[
            {
              gap: gap,
              columnGap: columnGap,
              rowGap: rowGap,
              overflow: overflow,
              opacity: opacity,
              borderRadius: border,
              maxWidth: maxWidth,
              minWidth: minWidth,
              alignItems: itemsCenter ? "center" : "flex-start",
              paddingHorizontal: padder ? 24 : ph,
              paddingBottom: pb,
              paddingLeft: pl,
              padding: padding,
              justifyContent: justify,
              marginTop: mt,
              alignSelf: alignSelfCenter ? "center" : undefined,
              marginBottom: mb,
              flexDirection: "row",
              marginLeft: ml,
              marginRight: mr,
              marginHorizontal: mh,
              marginVertical: mv,
              paddingTop: pt,
              flexWrap: wrap ? "wrap" : undefined,
              margin: margin,
              paddingVertical: pv,
              backgroundColor: level
                ? theme[`background-basic-color-${level}`]
                : "transparent",
            },
            style,
          ]}
          {...props}
        >
          {children}
        </TouchableOpacity>
      </>
    );
  }
);
HStack.displayName = "HStack";
export default HStack;
