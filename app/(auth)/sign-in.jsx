import { View, Text, ScrollView, Image, Alert } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import FormField from "../../components/formField";
import CustomButton from "../../components/customButton";
import { Link, router } from "expo-router";
import { getCurrentUser, signIn } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignIn = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();
  const [form, setform] = useState({
    email: "",
    password: "",
  });

  const [isSubmiting, setIsSubmiting] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
    }

    setIsSubmiting(true);

    try {
      await signIn(form.email, form.password);

      const result = await getCurrentUser();

      setUser(result);
      setIsLoggedIn(true);

      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[83vh] px-4 my-6">
          <Image
            source={images.logo}
            className="w-[115px] h-[35px]"
            resizeMode="contain"
          />
          <Text className="text-2xl text-white font-psemibold mt-10">
            Log in to Aora
          </Text>
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setform({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setform({ ...form, password: e })}
            otherStyles="mt-7"
          />
          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmiting}
          />
          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary">
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
