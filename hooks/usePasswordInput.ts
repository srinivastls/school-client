import { useEffect, useState } from "react";

export const usePasswordInput = () => {
  const [password, setPassword] = useState("");

  const onChangePassword = (text: string) => {
    setPassword(text);
  };

  const [icon, setIcon] = useState<"eye" | "eye-off">("eye");
  const onIconPress = () => {
    setIcon((prevIcon) => {
      if (prevIcon === "eye") {
        return "eye-off";
      }
      return "eye";
    });
  };

  const [secureTextEntry, setSecureTextEntry] = useState(true);
  useEffect(() => {
    setSecureTextEntry(icon === "eye");
  }, [icon]);

  const iconProps = { icon: icon, onPress: onIconPress, size: 20 };

  return { password, onChangePassword, iconProps, secureTextEntry };
};
