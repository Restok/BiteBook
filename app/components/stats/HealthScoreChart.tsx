import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Bar, CartesianChart } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { Colors } from "react-native-ui-lib";
import { Period } from "../../services/getUserHealthScores";

interface HealthScoreChartProps {
  data: any[];
  period: Period;
}

const HealthScoreChart: React.FC<HealthScoreChartProps> = ({ data }) => {
  const font = useFont(Inter_400Regular, 16);
  const formatXLabel = (date: string) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayOfWeek = d.toLocaleDateString([], {
      weekday: "narrow",
    });

    if (dayOfWeek === "M") {
      return d.toLocaleDateString([], {
        month: "numeric",
        day: "2-digit",
      });
    }
    return dayOfWeek;
    // if (!date) return "";
    // return date.split("-").slice(1).join("/");
  };
  return (
    <CartesianChart
      data={data}
      xKey="date"
      yKeys={["score", "target", "i"]}
      domainPadding={{ left: 30, right: 30 }}
      axisOptions={{
        font: font,
        lineColor: Colors.rgba(0, 0, 0, 0),
        tickCount: { x: 7, y: 0 },
        formatXLabel: formatXLabel,
      }}
    >
      {({ points, chartBounds }) => {
        return points.score.map((point, index) => {
          const red = 255 - Math.round(point.yValue * 127.5);
          const green = 155 + Math.round(point.yValue * 100);
          const blue = 30 + Math.round(point.yValue * 64);
          const color = `rgb(${red}, ${green}, ${blue})`;
          return (
            <React.Fragment key={index}>
              <Bar
                points={[points.target[index]]}
                chartBounds={chartBounds}
                barWidth={30}
                color={Colors.grey60}
                roundedCorners={{ topLeft: 10, topRight: 10 }}
              />
              <Bar
                points={[point]}
                chartBounds={chartBounds}
                color={color}
                barWidth={30}
                roundedCorners={{ topLeft: 10, topRight: 10 }}
              />
            </React.Fragment>
          );
        });
      }}
    </CartesianChart>
  );
};

export default HealthScoreChart;
