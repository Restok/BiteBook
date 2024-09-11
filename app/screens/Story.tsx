import * as React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLayout } from "hooks";
import {
  StyleService,
  useStyleSheet,
  useTheme,
  Icon,
  Avatar,
} from "@ui-kitten/components";

import { Container, Content, Text, VStack, HStack } from "components";
import Images from "assets/images";
import Carousel from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import Dots from "../elements/Dots";

const Social05 = React.memo(() => {
  const theme = useTheme();
  const { goBack } = useNavigation();
  const { height, width, top, bottom } = useLayout();
  const styles = useStyleSheet(themedStyles);

  const width_img = 343 * (width / 375);
  const height_img = 580 * (height / 812) - 24;
  const [activeIndex, setActiveIndex] = React.useState(0);

  const progress = useSharedValue(0);
  return (
    <Container style={styles.container}>
      <Content>
        <Dots
          translationValue={progress}
          data={data}
          widthInterpolate={width / data.length - 2 * (data.length - 1) - 12}
          widthDot={width / data.length - 2 * (data.length - 1) - 12}
          style={styles.progress}
        />
        <VStack itemsCenter mt={8}>
          <Carousel
            style={{
              width: width,
              height: height_img + 24,
              alignItems: "center",
              justifyContent: "center",
            }}
            modeConfig={{
              snapDirection: "left",
              stackInterval: 18,
            }}
            customConfig={() => ({
              type: "positive",
              viewCount: data.length - 1,
            })}
            onProgressChange={(_, absoluteProgress) => {
              _ >= 0 ? (progress.value = _) : (progress.value = _ * -1);
            }}
            data={data}
            defaultIndex={activeIndex}
            onSnapToItem={(i) => setActiveIndex(i)}
            windowSize={width}
            mode="vertical-stack"
            width={width}
            height={height_img + 24}
            renderItem={({ item, index }) => {
              return (
                <View key={index}>
                  <HStack style={styles.avatar}>
                    <Avatar source={item.user.avatar} />
                    <Icon pack="assets" name="eye_glass" />
                  </HStack>
                  <Image
                    source={item.image}
                    borderRadius={12}
                    style={{
                      width: width_img,
                      height: height_img,
                      marginHorizontal: 16,
                    }}
                  />
                </View>
              );
            }}
          />
        </VStack>
        <VStack mh={24}>
          <HStack justify="flex-start" itemsCenter mt={24} mb={12}>
            <Icon pack="assets" name="link" style={styles.link} />
            <Text category="subhead" status="primary" marginLeft={8}>
              direct link here
            </Text>
          </HStack>
          <HStack itemsCenter>
            <HStack justify="flex-start" itemsCenter>
              {Emoji.map((item, i) => {
                return (
                  <Text category="h3" key={i}>
                    {item}{" "}
                  </Text>
                );
              })}
            </HStack>
            <HStack justify="flex-start" itemsCenter mt={24} mb={12}>
              <TouchableOpacity style={styles.upload} onPress={goBack}>
                <Icon pack="assets" name="upload" />
              </TouchableOpacity>
              <TouchableOpacity onPress={goBack}>
                <Icon pack="assets" name="message" />
              </TouchableOpacity>
            </HStack>
          </HStack>
        </VStack>
      </Content>
    </Container>
  );
});

export default Social05;

const themedStyles = StyleService.create({
  container: {
    flex: 1,
  },
  progress: {
    marginHorizontal: 24,
  },
  link: {
    width: 16,
    height: 16,
  },
  upload: {
    marginRight: 24,
  },
  avatar: {
    position: "absolute",
    top: 16,
    left: 32,
    right: 32,
    zIndex: 10,
    alignItems: "center",
  },
});
const data = [
  {
    user: {
      avatar: Images.avatar.avatar01,
    },
    image: Images.social.photo02,
  },
  {
    user: {
      avatar: Images.avatar.avatar02,
    },
    image: Images.social.photo03,
  },
  {
    user: {
      avatar: Images.avatar.avatar03,
    },
    image: Images.social.photo04,
  },
  {
    user: {
      avatar: Images.avatar.avatar04,
    },
    image: Images.social.photo05,
  },
];
const Emoji = ["😛", "😍", "😂", "😀"];
