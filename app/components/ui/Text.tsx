import * as React from "react";
import { TextStyle } from "react-native";
import { Text, TextProps } from "@ui-kitten/components";
import { EvaStatus } from "@ui-kitten/components/devsupport";

export interface MyTextProps extends TextProps {
  style?: TextStyle;
  category?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "h7"
    | "h8"
    | "body"
    | "callout"
    | "subhead"
    | "footnote"
    | "s1"
    | "s2"
    | "p1"
    | "c1"
    | "c2"
    | "label";

  status?: EvaStatus;

  children?: any;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  marginVertical?: number;
  marginHorizontal?: number;
  opacity?: number;
  maxWidth?: number;
  fontSize?: number;
  lineHeight?: number;
  uppercase?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
  none?: boolean;
  left?: boolean;
  right?: boolean;
  center?: boolean;
  underline?: boolean;
  line_through?: boolean;
  bold?: boolean;
  italic?: boolean;
}

// eslint-disable-next-line react/display-name
export default React.forwardRef(
  (
    {
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      marginVertical,
      marginHorizontal,
      opacity,
      uppercase,
      lowercase,
      capitalize,
      none,
      left,
      right,
      center,
      underline,
      lineHeight,
      line_through,
      bold,
      italic,
      category = "body",
      status,
      children,
      maxWidth,
      style,
      ...rest
    }: MyTextProps,
    ref
  ) => {
    let textAlign: "left" | "center" | "right" | "auto" | "justify" | "left";

    left
      ? (textAlign = "left")
      : right
      ? (textAlign = "right")
      : center
      ? (textAlign = "center")
      : (textAlign = "left");

    let textTransform: "uppercase" | "lowercase" | "capitalize" | "none";

    uppercase
      ? (textTransform = "uppercase")
      : lowercase
      ? (textTransform = "lowercase")
      : capitalize
      ? (textTransform = "capitalize")
      : none
      ? (textTransform = "none")
      : (textTransform = "none");

    let textDecorationLine:
      | "none"
      | "underline"
      | "line-through"
      | "underline line-through";
    underline
      ? (textDecorationLine = "underline")
      : line_through
      ? (textDecorationLine = "line-through")
      : (textDecorationLine = "none");

    let fontStyle: "normal" | "italic";
    italic ? (fontStyle = "italic") : (fontStyle = "normal");

    const getLineHeight = () => {
      switch (category) {
        case "h1":
          return 44;
        case "h2":
          return 40;
        case "h3":
          return 40;
        case "h4":
          return 30;
        case "h5":
          return 28;
        case "h6":
          return 24;
        case "h7":
          return 22;
        case "h8":
          return 24;
        case "callout":
          return 24;
        case "body":
          return 24;
        case "subhead":
          return 20;
        case "footnote":
          return 18;
        case "c1":
          return 16;
        case "c2":
          return 13;
        case "label":
          return 16;
        default:
          return 25;
      }
    };
    return (
      <Text
        {...rest}
        ref={ref as any}
        category={category}
        status={status}
        style={[
          {
            marginLeft: marginLeft,
            marginRight: marginRight,
            marginTop: marginTop,
            marginBottom: marginBottom,
            marginVertical: marginVertical,
            marginHorizontal: marginHorizontal,
            opacity: opacity,
            textAlign: textAlign,
            maxWidth: maxWidth,
            lineHeight: lineHeight ? lineHeight : getLineHeight(),
            textTransform: textTransform,
            textDecorationLine: textDecorationLine,
            fontStyle: fontStyle,
          },
          style,
        ]}
      >
        {children}
      </Text>
    );
  }
);
