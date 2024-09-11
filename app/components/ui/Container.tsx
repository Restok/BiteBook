import * as React from "react";
import { Layout, LayoutProps } from "@ui-kitten/components";
import useLayout from "../../hooks/useLayout";

interface ContainerProps extends LayoutProps {
  useSafeArea?: boolean;
  level?: "1" | "2" | "3" | "4" | string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  style,
  useSafeArea = true,
  level = "1",
  ...props
}) => {
  const { top, bottom } = useLayout();
  return (
    <Layout
      {...props}
      level={level}
      style={[
        { flex: 1 },
        useSafeArea && { paddingTop: top, paddingBottom: bottom },
        style,
      ]}
    >
      {children}
    </Layout>
  );
};

export default Container;
