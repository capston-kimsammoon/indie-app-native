// components/auth/EmailVerification.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import Theme from "@/constants/Theme";
import { sendVerificationCode, verifyEmailCode } from "@/api/AuthApi";

interface EmailVerificationProps {
  email: string;
  purpose: "signup" | "reset_password";
  onVerified: () => void;
  onCancel?: () => void;
}

export default function EmailVerification({
  email,
  purpose,
  onVerified,
  onCancel,
}: EmailVerificationProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10분
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false);

  // 타이머
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // 초기 코드 발송
  useEffect(() => {
    sendInitialCode();
  }, []);

  const sendInitialCode = async () => {
    try {
      setLoading(true);
      await sendVerificationCode(email, purpose);
    } catch (e: any) {
      Alert.alert("오류", e?.response?.data?.detail || "인증 코드 발송에 실패했습니다.");
      onCancel?.();
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!canResend) return;

    try {
      setResending(true);
      // 기존 코드 무효화하고 새로운 코드 발송
      await sendVerificationCode(email, purpose);
      Alert.alert("재전송 완료", "새로운 인증 코드를 전송했습니다.");
      setTimeLeft(600);
      setCanResend(false);
      setCode("");
      setVerified(false);
    } catch (e: any) {
      Alert.alert("오류", e?.response?.data?.detail || "인증 코드 재전송에 실패했습니다.");
    } finally {
      setResending(false);
    }
  };

  const onVerify = async () => {
    if (!code.trim() || code.length !== 6) {
      Alert.alert("인증 코드 확인", "6자리 인증 코드를 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      await verifyEmailCode(email, code);
      setVerified(true);
      setLoading(false);  
      
      // 즉시 콜백 실행 
      onVerified();
      
    } catch (e: any) {
      setLoading(false);  
      Alert.alert("인증 실패", e?.response?.data?.detail || "인증 코드가 올바르지 않습니다.");
      setVerified(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>이메일 인증</Text>
      <Text style={styles.description}>
        {email}로{"\n"}
        인증 코드를 전송했습니다.
      </Text>

      <View style={styles.inputGroup}>
        <TextInput
          value={code}
          onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ""))}
          placeholder="6자리 인증 코드"
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
          editable={!loading && !verified}
          returnKeyType="done"
          onSubmitEditing={onVerify}
        />
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      </View>

      <Pressable
        onPress={onVerify}
        style={({ pressed }) => [
          styles.verifyBtn,
          pressed && { opacity: 0.9 },
          (loading || verified) && { opacity: 0.6 },
        ]}
        disabled={loading || verified} 
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.verifyBtnText}>
            {verified ? "인증 완료" : "인증하기"}
          </Text>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>인증 코드를 받지 못하셨나요?</Text>
        <TouchableOpacity
          onPress={onResend}
          disabled={!canResend || resending || verified}
          style={({ pressed }) => [
            styles.resendBtn,
            pressed && { opacity: 0.7 },
            (!canResend || resending || verified) && { opacity: 0.4 },
          ]}
        >
          {resending ? (
            <ActivityIndicator size="small" color={Theme.colors.themeOrange} />
          ) : (
            <Text
              style={[
                styles.resendText,
                (!canResend || verified) && { color: Theme.colors.gray },
              ]}
            >
              재전송
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {onCancel && !verified && (
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} disabled={loading}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: Theme.fontWeights.semibold,
    color: Theme.colors.black,
    marginBottom: Theme.spacing.sm,
  },
  description: {
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.darkGray,
    marginBottom: Theme.spacing.lg,
    lineHeight: 22,
  },
  inputGroup: {
    position: "relative",
    marginBottom: Theme.spacing.md,
  },
  input: {
    height: 48,  
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.lightGray,
    paddingHorizontal: 16,
    fontSize: Theme.fontSizes.lg,  
    letterSpacing: 4,  
    textAlign: "left",  
    backgroundColor: "#fff",
  },
  timer: {
    position: "absolute",
    right: 16,
    top: 14,  
    fontSize: Theme.fontSizes.base,
    color: Theme.colors.themeOrange,
    fontWeight: Theme.fontWeights.semibold as any,
  },
  verifyBtn: {
    height: 48, 
    borderRadius: 12,
    backgroundColor: Theme.colors.themeOrange,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.lg,
  },
  verifyBtnText: {
    color: "#fff",
    fontSize: Theme.fontSizes.base,
    fontWeight: Theme.fontWeights.semibold as any,
  },
  processingText: {  
    textAlign: "center",
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.themeOrange,
    marginBottom: Theme.spacing.md,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: Theme.spacing.md,
  },
  footerText: {
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.gray,
  },
  resendBtn: {
    padding: 4,
  },
  resendText: {
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.themeOrange,
    fontWeight: Theme.fontWeights.semibold as any,
    textDecorationLine: "underline",
  },
  cancelBtn: {
    alignSelf: "center",
    padding: Theme.spacing.sm,
  },
  cancelText: {
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.gray,
    textDecorationLine: "underline",
  },
});