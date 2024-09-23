import { Colors } from "react-native-ui-lib";

const mui3Colors = {
  primary: {
    main: "#65558F",
    light: "#D0BCFF",
    dark: "#381E72",
  },
  secondary: {
    main: "#9C27B0",
    light: "#E1BEE7",
    dark: "#6A1B9A",
  },
  error: {
    main: "#B3261E",
    light: "#F9DEDC",
    dark: "#8C1D18",
  },
  warning: {
    main: "#F9A825",
    light: "#FFF0B3",
    dark: "#C67F00",
  },
  info: {
    main: "#2196F3",
    light: "#E3F2FD",
    dark: "#0D47A1",
  },
  success: {
    main: "#2E7D32",
    light: "#E8F5E9",
    dark: "#1B5E20",
  },
  background: {
    default: "#FFFBFE",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#1C1B1F",
    secondary: "#49454F",
    disabled: "#1C1B1F61",
  },
};

// Customize Colors object
Colors.loadColors({
  primary: mui3Colors.primary.main,
  primaryLight: mui3Colors.primary.light,
  primaryDark: mui3Colors.primary.dark,
  secondary: mui3Colors.secondary.main,
  secondaryLight: mui3Colors.secondary.light,
  secondaryDark: mui3Colors.secondary.dark,
  error: mui3Colors.error.main,
  errorLight: mui3Colors.error.light,
  errorDark: mui3Colors.error.dark,
  warning: mui3Colors.warning.main,
  warningLight: mui3Colors.warning.light,
  warningDark: mui3Colors.warning.dark,
  info: mui3Colors.info.main,
  infoLight: mui3Colors.info.light,
  infoDark: mui3Colors.info.dark,
  success: mui3Colors.success.main,
  successLight: mui3Colors.success.light,
  successDark: mui3Colors.success.dark,
  background: mui3Colors.background.default,
  textPrimary: mui3Colors.text.primary,
  textSecondary: mui3Colors.text.secondary,
  textDisabled: mui3Colors.text.disabled,
});

export { mui3Colors };
