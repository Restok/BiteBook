import * as ImageManipulator from "expo-image-manipulator";

const MAX_DIMENSION = 1080; // Maximum width or height

export async function compressImage(uri: string): Promise<string> {
  // Get the original image dimensions
  const { width, height } = await ImageManipulator.manipulateAsync(uri, [], {
    base64: false,
  });

  let scaleFactor = 1;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    scaleFactor = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
  }

  if (scaleFactor < 1) {
    const newWidth = Math.round(width * scaleFactor);
    const newHeight = Math.round(height * scaleFactor);

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: newWidth, height: newHeight } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  }

  return uri;
}
