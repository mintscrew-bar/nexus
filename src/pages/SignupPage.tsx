import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  MdCheckCircle,
  MdEmail,
  MdHome,
  MdLock,
  MdPerson,
  MdPhone,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AddressSearch from "../components/common/AddressSearch";
import Logo from "../components/common/Logo";
import "../styles/SignupPage.css";

const fakeExistingUsernames = ["admin", "test", "nexus", "user1"];
const phoneRegex = /^\d{9,15}$/;

function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 비밀번호 규칙 체크 함수 추가
function checkPasswordRules(password: string) {
  const rules = [
    /[A-Z]/, // 대문자
    /[a-z]/, // 소문자
    /[0-9]/, // 숫자
    /[^A-Za-z0-9]/, // 특수문자
  ];
  let count = 0;
  rules.forEach((rule) => {
    if (rule.test(password)) count++;
  });
  return password.length >= 8 && count >= 3;
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // step 0: 약관 동의, step 1: 기존 폼
  // 약관 동의 상태
  const [termsChecked, setTermsChecked] = useState(false); // 이용약관(필수)
  const [privacyChecked, setPrivacyChecked] = useState(false); // 개인정보(필수)
  const [marketingChecked, setMarketingChecked] = useState(false); // 마케팅(선택)
  const allChecked = termsChecked && privacyChecked && marketingChecked;
  const allRequiredChecked = termsChecked && privacyChecked;

  const handleAllCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setTermsChecked(checked);
    setPrivacyChecked(checked);
    setMarketingChecked(checked);
  };
  const handleTermsCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermsChecked(e.target.checked);
  };
  const handlePrivacyCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrivacyChecked(e.target.checked);
  };
  const handleMarketingCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarketingChecked(e.target.checked);
  };
  const goToNextStep = () => setStep(1);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    emailVerified: false,
    emailCode: "",
    phone: "",
    postcode: "",
    address: "",
    detailAddress: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    password: "",
    confirmPassword: "",
    agreeToMarketing: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCodeError, setEmailCodeError] = useState("");
  const [emailCodeSuccess, setEmailCodeSuccess] = useState(false);
  const [emailCodeTimer, setEmailCodeTimer] = useState(0); // 초 단위
  const [sentEmailCode, setSentEmailCode] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const emailCodeInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  // showPostcodeSearch, setShowPostcodeSearch 상태 선언 제거

  const [signupComplete, setSignupComplete] = useState(false);

  // 타이머 효과
  useEffect(() => {
    let timer: number | null = null;
    if (emailCodeSent && emailCodeTimer > 0) {
      timer = window.setTimeout(
        () => setEmailCodeTimer(emailCodeTimer - 1),
        1000
      );
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [emailCodeSent, emailCodeTimer]);

  // 입력값 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: unknown = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      newValue = e.target.checked;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "username") setUsernameChecked(false);
    if (name === "emailCode") {
      setEmailCodeError("");
      // 인증번호 6자리가 입력되면 자동 확인
      if (value.length === 6) {
        setTimeout(() => {
          handleVerifyEmailCode(value);
        }, 100);
      }
    }
  };

  // 사용자명 중복확인 (임시 로컬 체크)
  const handleUsernameCheck = () => {
    setCheckingUsername(true);
    setTimeout(() => {
      if (!formData.username.trim()) {
        setErrors((prev) => ({
          ...prev,
          username: "사용자명을 입력해주세요.",
        }));
        setUsernameChecked(false);
      } else if (formData.username.length < 2) {
        setErrors((prev) => ({ ...prev, username: "2자 이상 입력해주세요." }));
        setUsernameChecked(false);
      } else if (formData.username.length > 20) {
        setErrors((prev) => ({
          ...prev,
          username: "20자 이내로 입력해주세요.",
        }));
        setUsernameChecked(false);
      } else if (
        fakeExistingUsernames.includes(formData.username.trim().toLowerCase())
      ) {
        setErrors((prev) => ({
          ...prev,
          username: "이미 사용 중인 사용자명입니다.",
        }));
        setUsernameChecked(false);
      } else {
        setErrors((prev) => ({ ...prev, username: "" }));
        setUsernameChecked(true);
        setTimeout(() => {
          emailInputRef.current?.focus();
        }, 100);
      }
      setCheckingUsername(false);
    }, 700);
  };

  // 이메일 검증
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: "이메일을 입력해주세요." }));
      return false;
    } else if (!emailRegex.test(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "올바른 이메일 형식을 입력해주세요.",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  // 이메일 인증 요청
  const handleSendEmailCode = async () => {
    if (!validateEmail()) return;
    setIsSendingEmail(true);
    const code = generateRandomCode();
    setSentEmailCode(code);
    setEmailCodeSent(true);
    setEmailCodeError("");
    setEmailCodeSuccess(false);
    setFormData((prev) => ({ ...prev, emailCode: "" }));
    setEmailCodeTimer(180); // 3분
    try {
      // 실제 이메일 발송 API 호출
      const response = await fetch(
        "http://localhost:4000/api/send-email-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, code }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "이메일 발송에 실패했습니다.");
      }

      console.log("인증번호 발송 성공:", result.message);
    } catch (error) {
      console.error("이메일 발송 오류:", error);
      const errorMessage =
        error instanceof Error ? error.message : "이메일 발송에 실패했습니다.";
      alert(`이메일 발송에 실패했습니다: ${errorMessage}`);
      setEmailCodeSent(false);
      setIsSendingEmail(false);
      return;
    }
    setTimeout(() => {
      emailCodeInputRef.current?.focus();
      setIsSendingEmail(false);
    }, 100);
  };

  // 인증번호 다시 보내기
  const handleResendEmailCode = async () => {
    if (!validateEmail()) return;
    setIsResendingEmail(true);
    const code = generateRandomCode();
    setSentEmailCode(code);
    setEmailCodeError("");
    setEmailCodeSuccess(false);
    setFormData((prev) => ({ ...prev, emailCode: "" }));
    setEmailCodeTimer(180); // 3분
    try {
      // 실제 이메일 발송 API 호출
      await fetch("http://localhost:4000/api/send-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code }),
      });
      alert("인증번호가 다시 발송되었습니다.");
    } catch {
      alert("이메일 발송에 실패했습니다. 다시 시도해주세요.");
      setIsResendingEmail(false);
      return;
    }
    setTimeout(() => {
      emailCodeInputRef.current?.focus();
      setIsResendingEmail(false);
    }, 100);
  };

  // 주소 검색 완료 핸들러
  const handleAddressComplete = (addressData: {
    address: string;
    zonecode: string;
    roadAddress: string;
    jibunAddress: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      postcode: addressData.zonecode,
      address: addressData.address,
    }));
    setErrors((prev) => ({ ...prev, address: "" }));
    // 상세주소 입력란으로 포커스 이동
    setTimeout(() => {
      const detailAddressInput = document.querySelector(
        'input[name="detailAddress"]'
      ) as HTMLInputElement;
      detailAddressInput?.focus();
    }, 100);
  };

  // 이메일 인증 확인
  const handleVerifyEmailCode = (inputCode?: string) => {
    const codeToCheck = inputCode ?? formData.emailCode;
    if (emailCodeTimer === 0) {
      setEmailCodeError("인증 시간이 만료되었습니다. 다시 요청해주세요.");
      setEmailCodeSuccess(false);
      return;
    }
    if (codeToCheck === sentEmailCode) {
      setEmailCodeSuccess(true);
      setFormData((prev) => ({ ...prev, emailVerified: true }));
      setEmailCodeError("");
      // 이메일 인증 성공 시 2단계로 이동
      setTimeout(() => {
        setStep(2);
        setTimeout(() => {
          phoneInputRef.current?.focus();
        }, 100);
      }, 500);
    } else {
      setEmailCodeError("인증번호가 올바르지 않습니다.");
      setEmailCodeSuccess(false);
    }
  };

  // 인적사항 검증
  const validatePhone = useCallback(() => {
    if (!formData.phone.trim()) {
      setErrors((prev) => ({ ...prev, phone: "전화번호를 입력해주세요." }));
      return false;
    } else if (!phoneRegex.test(formData.phone)) {
      setErrors((prev) => ({
        ...prev,
        phone: "숫자만 입력, 9~15자리로 입력해주세요.",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, phone: "" }));
    return true;
  }, [formData.phone]);

  const validateAddress = useCallback(() => {
    if (!formData.postcode.trim()) {
      setErrors((prev) => ({ ...prev, postcode: "우편번호를 검색해주세요." }));
      return false;
    }
    if (!formData.address.trim()) {
      setErrors((prev) => ({ ...prev, address: "주소를 입력해주세요." }));
      return false;
    }
    setErrors((prev) => ({ ...prev, postcode: "", address: "" }));
    return true;
  }, [formData.postcode, formData.address]);

  // 나이 입력란 대신 생년월일 셀렉트 박스 렌더링
  const validateBirth = useCallback(() => {
    const { birthYear, birthMonth, birthDay } = formData;
    if (!birthYear || !birthMonth || !birthDay) {
      setErrors((prev) => ({
        ...prev,
        birth: "생년월일을 모두 선택해주세요.",
      }));
      return false;
    }
    const birthDate = new Date(`${birthYear}-${birthMonth}-${birthDay}`);
    if (
      isNaN(birthDate.getTime()) ||
      birthDate > new Date() ||
      birthYear.length !== 4
    ) {
      setErrors((prev) => ({
        ...prev,
        birth: "올바른 생년월일을 선택해주세요.",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, birth: "" }));
    return true;
  }, [formData.birthYear, formData.birthMonth, formData.birthDay]);

  const validatePassword = useCallback(() => {
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "비밀번호를 입력해주세요." }));
      return false;
    } else if (formData.password.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "비밀번호는 8자 이상이어야 합니다.",
      }));
      return false;
    } else if (!checkPasswordRules(formData.password)) {
      setErrors((prev) => ({
        ...prev,
        password:
          "대문자, 소문자, 숫자, 특수문자 중 3종류 이상을 포함해야 합니다.",
      }));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "비밀번호가 일치하지 않습니다.",
      }));
      return false;
    }
    setErrors((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
    }));
    return true;
  }, [formData.password, formData.confirmPassword]);

  // 약관 동의 검증
  const validateTerms = () => {
    return true;
  };

  // 자동 스텝/입력 이동 효과
  useEffect(() => {
    if (
      usernameChecked &&
      !errors.username &&
      formData.username.trim() !== ""
    ) {
      emailInputRef.current?.focus();
    }
  }, [usernameChecked, errors.username, formData.username]);

  // 이메일 인증 성공 시 2단계로 자동 이동 보장
  useEffect(() => {
    if (formData.emailVerified && step === 1) {
      setTimeout(() => {
        setStep(2);
        setTimeout(() => phoneInputRef.current?.focus(), 100);
      }, 500);
    }
  }, [formData.emailVerified, step]);

  // 기본정보 각 항목 유효성
  const isUsernameValid =
    usernameChecked && !errors.username && formData.username.trim() !== "";
  const isEmailValid =
    !errors.email &&
    formData.email.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  // 인적사항 각 항목 유효성
  const isPhoneValid = !errors.phone && phoneRegex.test(formData.phone);

  // 다음 단계로 이동
  const handleNext = () => {
    if (step === 1) {
      if (!usernameChecked) {
        setErrors((prev) => ({ ...prev, username: "중복확인을 해주세요." }));
        return;
      }
      if (!validateEmail()) return;
      if (!formData.emailVerified) {
        setErrors((prev) => ({
          ...prev,
          email: "이메일 인증을 완료해주세요.",
        }));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (validatePhone() && validateAddress() && validateBirth()) setStep(3);
    } else if (step === 3) {
      if (validatePassword()) setStep(4);
    } else if (step === 4) {
      // 최종 제출
      handleSubmit({} as React.FormEvent);
    }
  };

  // 이전 단계로 이동
  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  // 최종 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTerms()) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSignupComplete(true);
      // alert("회원가입이 완료되었습니다!\n로그인 페이지로 이동합니다.");
      // navigate("/login");
    } catch {
      alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <Logo text="NEXUS" to="/" showIcon={true} />
          <h1>회원가입</h1>
          <p>NEXUS에 가입하고 내전을 즐겨보세요!</p>
        </div>
        {signupComplete ? (
          <div className="signup-complete-box">
            <h2>회원가입이 완료되었습니다!</h2>
            <p>이제 로그인하여 서비스를 이용하실 수 있습니다.</p>
            <button className="signup-btn" onClick={() => navigate("/login")}>
              로그인 페이지로 이동
            </button>
          </div>
        ) : (
          <>
            {step === 0 && (
              <div className="terms-agree-step">
                <h2>약관 동의</h2>
                <div className="terms-check-group">
                  <label className="checkbox-label all">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={handleAllCheck}
                    />
                    전체 동의하기
                  </label>
                  <div className="terms-box">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={termsChecked}
                        onChange={handleTermsCheck}
                      />
                      <span>
                        [필수] 이용약관 동의
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="terms-link"
                        >
                          전문보기
                        </a>
                      </span>
                    </label>
                  </div>
                  <div className="terms-box">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={privacyChecked}
                        onChange={handlePrivacyCheck}
                      />
                      <span>
                        [필수] 개인정보 수집 및 이용 동의
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="terms-link"
                        >
                          전문보기
                        </a>
                      </span>
                    </label>
                  </div>
                  <div className="terms-box">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={marketingChecked}
                        onChange={handleMarketingCheck}
                      />
                      <span>[선택] 마케팅 정보 수신 동의</span>
                    </label>
                  </div>
                </div>
                <button
                  className="next-btn"
                  disabled={!allRequiredChecked}
                  onClick={goToNextStep}
                  style={{ marginTop: 32, width: "100%" }}
                >
                  다음
                </button>
              </div>
            )}
            {step >= 1 && (
              <form onSubmit={handleSubmit} className="signup-form">
                {/* 스텝 진행 표시 */}
                <div className="step-indicator">
                  <span className={step === 1 ? "active" : ""}>1</span>
                  <span className={step === 2 ? "active" : ""}>2</span>
                  <span className={step === 3 ? "active" : ""}>3</span>
                  <span className={step === 4 ? "active" : ""}>4</span>
                </div>

                {/* 단계별 입력 분기 */}
                {step === 1 && (
                  <>
                    {/* 사용자명 */}
                    <div className="form-group">
                      <label htmlFor="username">사용자명 *</label>
                      <div className="input-container">
                        <MdPerson className="input-icon" />
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="사용자명을 입력하세요"
                          className={errors.username ? "error" : ""}
                          disabled={checkingUsername}
                          autoComplete="username"
                        />
                        {usernameChecked && !errors.username && (
                          <MdCheckCircle
                            className="input-check"
                            color="#4caf50"
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        className="check-btn"
                        onClick={handleUsernameCheck}
                        disabled={checkingUsername || !formData.username.trim()}
                      >
                        {checkingUsername ? "확인 중..." : "중복확인"}
                      </button>
                      {errors.username && (
                        <span className="error-message">{errors.username}</span>
                      )}
                    </div>

                    {/* 이메일 */}
                    {isUsernameValid && (
                      <div className="form-group">
                        <label htmlFor="email">이메일 *</label>
                        <div className="input-container">
                          <MdEmail className="input-icon" />
                          <input
                            ref={emailInputRef}
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="이메일을 입력하세요"
                            className={errors.email ? "error" : ""}
                            disabled={formData.emailVerified}
                            autoComplete="email"
                          />
                        </div>
                        {!formData.emailVerified && (
                          <button
                            type="button"
                            className="check-btn"
                            onClick={handleSendEmailCode}
                            disabled={
                              !isEmailValid || emailCodeSent || isSendingEmail
                            }
                          >
                            {isSendingEmail ? "발송 중..." : "인증번호 요청"}
                          </button>
                        )}
                        {errors.email && (
                          <span className="error-message">{errors.email}</span>
                        )}
                      </div>
                    )}
                    {/* 인증번호 입력란 */}
                    {emailCodeSent && !formData.emailVerified && (
                      <div className="form-group">
                        <label htmlFor="emailCode">
                          이메일 인증번호 입력 *
                        </label>
                        <div className="input-container">
                          <input
                            ref={emailCodeInputRef}
                            type="text"
                            id="emailCode"
                            name="emailCode"
                            value={formData.emailCode}
                            onChange={handleInputChange}
                            placeholder="인증번호 6자리"
                            maxLength={6}
                            className={emailCodeError ? "error" : ""}
                            disabled={emailCodeTimer === 0}
                          />
                        </div>
                        <div className="button-group">
                          <button
                            type="button"
                            className="check-btn"
                            onClick={() =>
                              handleVerifyEmailCode(formData.emailCode)
                            }
                            disabled={
                              formData.emailCode.length !== 6 ||
                              emailCodeTimer === 0
                            }
                          >
                            확인
                          </button>
                          <button
                            type="button"
                            className="resend-btn"
                            onClick={handleResendEmailCode}
                            disabled={isResendingEmail || emailCodeTimer > 0}
                          >
                            {isResendingEmail ? "재발송 중..." : "다시 보내기"}
                          </button>
                        </div>
                        <div className="info-message">
                          {emailCodeTimer > 0
                            ? `남은 시간: ${Math.floor(emailCodeTimer / 60)}:${(
                                emailCodeTimer % 60
                              )
                                .toString()
                                .padStart(2, "0")}`
                            : "인증 시간이 만료되었습니다. 다시 요청해주세요."}
                        </div>
                        {emailCodeError && (
                          <span className="error-message">
                            {emailCodeError}
                          </span>
                        )}
                        {emailCodeSuccess && (
                          <span className="success-message">인증 성공!</span>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* 2단계: 인적사항 (전화번호, 주소, 나이) */}
                {step >= 2 && (
                  <>
                    {/* 전화번호 */}
                    <div className="form-group">
                      <label htmlFor="phone">전화번호 *</label>
                      <div className="input-container">
                        <MdPhone className="input-icon" />
                        <input
                          ref={phoneInputRef}
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="숫자만 입력 (예: 01012345678)"
                          className={errors.phone ? "error" : ""}
                          autoComplete="tel"
                        />
                      </div>
                      {errors.phone && (
                        <span className="error-message">{errors.phone}</span>
                      )}
                    </div>
                    {/* 주소 */}
                    {isPhoneValid && (
                      <div className="form-group">
                        <label htmlFor="address">주소 *</label>
                        <div className="address-group-box">
                          <input
                            type="text"
                            id="postcode"
                            name="postcode"
                            value={formData.postcode}
                            placeholder="우편번호"
                            className={`postcode-input ${
                              errors.postcode ? "error" : ""
                            }`}
                            readOnly
                            autoComplete="postal-code"
                          />
                          <AddressSearch
                            onComplete={handleAddressComplete}
                            className="postcode-btn"
                          >
                            우편번호 검색
                          </AddressSearch>
                        </div>
                        <div className="input-container">
                          <MdHome className="input-icon" />
                          <input
                            ref={addressInputRef}
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            placeholder="기본주소"
                            className={`address-input ${
                              errors.address ? "error" : ""
                            }`}
                            readOnly
                            autoComplete="street-address"
                          />
                        </div>
                        <div className="input-container">
                          <MdHome className="input-icon" />
                          <input
                            type="text"
                            id="detailAddress"
                            name="detailAddress"
                            value={formData.detailAddress}
                            onChange={handleInputChange}
                            placeholder="상세주소 (선택사항)"
                            className={errors.detailAddress ? "error" : ""}
                            autoComplete="address-line2"
                          />
                        </div>
                        {errors.address && (
                          <span className="error-message">
                            {errors.address}
                          </span>
                        )}
                        {errors.postcode && (
                          <span className="error-message">
                            {errors.postcode}
                          </span>
                        )}
                      </div>
                    )}
                    {/* 나이 */}
                    {isPhoneValid && (
                      <div className="form-group">
                        <label htmlFor="birth">생년월일 *</label>
                        <div
                          className="birth-select-group"
                          style={{ display: "flex", gap: "8px" }}
                        >
                          <select
                            id="birthYear"
                            name="birthYear"
                            value={formData.birthYear}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">연도</option>
                            {Array.from(
                              { length: 100 },
                              (_, i) => new Date().getFullYear() - i
                            ).map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                          <select
                            id="birthMonth"
                            name="birthMonth"
                            value={formData.birthMonth}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">월</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              (month) => (
                                <option
                                  key={month}
                                  value={month < 10 ? `0${month}` : `${month}`}
                                >
                                  {month}
                                </option>
                              )
                            )}
                          </select>
                          <select
                            id="birthDay"
                            name="birthDay"
                            value={formData.birthDay}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">일</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <option
                                  key={day}
                                  value={day < 10 ? `0${day}` : `${day}`}
                                >
                                  {day}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        {errors.birth && (
                          <span className="error-message">{errors.birth}</span>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* 3단계: 비밀번호 */}
                {step === 3 && (
                  <>
                    <div className="form-group">
                      <label htmlFor="password">비밀번호 *</label>
                      <div className="input-box-with-icon">
                        <MdLock className="input-icon" />
                        <input
                          ref={passwordInputRef}
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="비밀번호를 입력하세요"
                          className={errors.password ? "error" : ""}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="toggle-password-btn large"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <MdVisibility color="#7f8c8d" size={22} />
                          ) : (
                            <MdVisibilityOff color="#7f8c8d" size={22} />
                          )}
                        </button>
                      </div>
                      <div className="password-rule-guide">
                        8자 이상, <b>대문자</b>, <b>소문자</b>, <b>숫자</b>,{" "}
                        <b>특수문자</b> 중 3종류 이상 포함
                      </div>
                      {formData.password &&
                        (checkPasswordRules(formData.password) ? (
                          <div className="password-rule-success">
                            비밀번호 규칙을 만족합니다.
                          </div>
                        ) : (
                          <div className="password-rule-error">
                            비밀번호가 규칙에 맞지 않습니다.
                          </div>
                        ))}
                      {errors.password && (
                        <span className="error-message">{errors.password}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">비밀번호 확인 *</label>
                      <div className="input-box-with-icon">
                        <MdLock className="input-icon" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="비밀번호를 다시 입력하세요"
                          className={errors.confirmPassword ? "error" : ""}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="toggle-password-btn large"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <MdVisibility color="#7f8c8d" size={22} />
                          ) : (
                            <MdVisibilityOff color="#7f8c8d" size={22} />
                          )}
                        </button>
                      </div>
                      {formData.confirmPassword &&
                        (formData.password === formData.confirmPassword ? (
                          <div className="password-match-success">
                            비밀번호가 일치합니다.
                          </div>
                        ) : (
                          <div className="password-match-error">
                            비밀번호가 일치하지 않습니다.
                          </div>
                        ))}
                      {errors.confirmPassword && (
                        <span className="error-message">
                          {errors.confirmPassword}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {/* 버튼 그룹 */}
                <div
                  className="button-group"
                  style={{ justifyContent: "flex-end" }}
                >
                  {step > 1 && (
                    <button
                      type="button"
                      className="prev-btn"
                      onClick={handlePrev}
                      disabled={isSubmitting}
                    >
                      이전
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      type="button"
                      className="signup-btn"
                      onClick={handleNext}
                      disabled={isSubmitting}
                    >
                      다음
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="signup-btn"
                      disabled={isSubmitting}
                    >
                      가입하기
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
