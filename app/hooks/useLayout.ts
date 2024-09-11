import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const useLayout = () => {
  const { width, height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  return { width, height, top, bottom };
};

export default useLayout;
