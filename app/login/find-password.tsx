// app/login/find-password.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/constants/Theme";
import { resetPassword } from "@/api/AuthApi";
import EmailVerification from "@/components/auth/EmailVerification";

type Step = "input" | "verify" | "reset";

export default function FindPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [alreadyVerifiedEmail, setAlreadyVerifiedEmail] = useState<string | null>(null);

  const validateEmail = (text: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(text);
  };

  const validatePassword = (text: string) => {
    // 영문+숫자+특수문자 6~18자
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,18}$/;
    return regex.test(text);
  };

  const onNext = () => {
    if (!email.trim()) {
      Alert.alert("비밀번호 찾기", "이메일을 입력해 주세요.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("비밀번호 찾기", "올바른 이메일 형식을 입력해 주세요.");
      return;
    }

    // 이미 인증 완료 상태면 바로 reset으로 이동
    if (alreadyVerifiedEmail === email) {  
      setStep("reset");
    } else {
      setStep("verify");
    }
  };

  const onVerified = useCallback(() => {
    setAlreadyVerifiedEmail(email);  // 인증 완료된 이메일 저장
    setStep("reset");
  }, [email]);

  const onCancelVerification = () => {
    setStep("input");
  };

  const onResetPassword = async () => {
    if (!newPassword) {
      Alert.alert("비밀번호 재설정", "새 비밀번호를 입력해 주세요.");
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        "비밀번호 재설정",
        "비밀번호는 영문, 숫자, 특수문자를 포함한 6~18자여야 합니다."
      );
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      Alert.alert("비밀번호 재설정", "비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email, newPassword);
      Alert.alert("비밀번호 재설정 완료", "새 비밀번호로 로그인해 주세요.", [
        { text: "확인", onPress: () => router.replace("/login") },
      ]);
    } catch (e: any) {
      const detail = e?.response?.data?.detail || e?.message || "비밀번호 재설정에 실패했습니다.";
      Alert.alert("비밀번호 재설정", detail);
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 재설정 화면
  if (step === "reset") {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formArea}>
            <Text style={styles.description}>
              새로운 비밀번호를 입력해 주세요.
            </Text>

            {/* 새 비밀번호 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>새 비밀번호</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="영문+숫자+특수문자 6~18자"
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.passwordInput]}
                  editable={!loading}
                  returnKeyType="next"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={Theme.colors.gray}
                  />
                </Pressable>
              </View>
            </View>

            {/* 새 비밀번호 확인 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>새 비밀번호 확인</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={newPasswordConfirm}
                  onChangeText={setNewPasswordConfirm}
                  placeholder="비밀번호를 다시 입력해 주세요"
                  secureTextEntry={!showPasswordConfirm}
                  style={[styles.input, styles.passwordInput]}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={onResetPassword}
                />
                <Pressable
                  onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPasswordConfirm ? "eye-off" : "eye"}
                    size={20}
                    color={Theme.colors.gray}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={onResetPassword}
              style={({ pressed }) => [
                styles.resetBtn,
                pressed && { opacity: 0.9 },
                loading && { opacity: 0.6 },
              ]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.resetBtnText}>비밀번호 변경</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // 인증 화면
  if (step === "verify") {
    return (
      <View style={styles.container}>
        <EmailVerification
          email={email}
          purpose="reset_password"
          onVerified={onVerified}
          onCancel={onCancelVerification}
        />
      </View>
    );
  }

  // 입력 화면
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
        <View style={styles.formArea}>
          <Text style={styles.title}>비밀번호 찾기</Text>
          <Text style={styles.description}>
            가입 시 사용한 이메일을 입력해 주세요.{"\n"}
            인증 후 비밀번호를 재설정할 수 있습니다.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="example@modie.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={onNext}
            />
          </View>
        </View>

      {/* 하단 버튼 */}
      <View style={styles.bottomBtns}>
        <Pressable
          onPress={onNext}
          style={({ pressed }) => [
            styles.sendBtn,
            pressed && { opacity: 0.9 },
            loading && { opacity: 0.6 },
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>다음</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    justifyContent: 'space-between',
  },
  scrollContent: {
    padding: Theme.spacing.md,
  },
  formArea: {
    padding: Theme.spacing.md,
  },
  bottomBtns: {
    padding: Theme.spacing.md,
  },
  sendBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: Theme.colors.themeOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: {
    color: "#fff",
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold as any,
  },
  title: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
    marginBottom: Theme.spacing.sm,
  },
  description: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.regular,
    color: Theme.colors.darkGray,
    marginBottom: Theme.spacing.lg,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold as any,
    color: Theme.colors.black,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.fontSizes.base,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: Theme.spacing.xs,
  },
  eyeBtn: {
    position: "absolute",
    right: Theme.spacing.sm,
    height: "100%",           
    justifyContent: "center", 
    alignItems: "center",    
    paddingHorizontal: Theme.spacing.sm,     
  },
  resetBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: Theme.colors.themeOrange,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.lg,
  },
  resetBtnText: {
    color: "#fff",
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold as any,
  },
});