import * as React from "react";
import { Divider, DividerProps } from "@ui-kitten/components";
import { ViewStyle } from "react-native";
interface IDividerProps extends DividerProps {
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  margin?: number;
  appearance?: "dot" | "primary" | "default";
  style?: ViewStyle;
}
const IDivider = ({
  margin,
  marginBottom,
  marginHorizontal,
  marginLeft,
  marginRight,
  marginTop,
  appearance = "default",
  marginVertical,
  style,
  ...rest
}: IDividerProps) => {
  return (
    <Divider
      {...rest}
      appearance={appearance}
      style={{
        margin: margin,
        marginLeft: marginLeft,
        marginRight: marginRight,
        marginTop: marginTop,
        marginBottom: marginBottom,
        marginHorizontal: marginHorizontal,
        marginVertical: marginVertical,
        ...style,
      }}
    />
  );
};
export default IDivider;
