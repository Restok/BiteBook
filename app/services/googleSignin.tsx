import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId:
      "821981356816-lhg38426krapk3sh4009d96dbdjrbjv8.apps.googleusercontent.com",
  });
};
