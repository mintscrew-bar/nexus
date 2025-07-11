import React, { useRef, useState } from "react";
import {
  MdAttachFile,
  MdChat,
  MdCheckCircle,
  MdCloudUpload,
  MdDelete,
  MdEmail,
  MdError,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "../styles/ContactPage.css";

interface AttachmentFile {
  file: File;
  status: "uploading" | "completed" | "error";
  progress: number;
  error?: string;
}

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
    agreeToTerms: false,
  });

  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const simulateFileUpload = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }

        setAttachments((prev) =>
          prev.map((att) =>
            att.file === file
              ? { ...att, progress: Math.min(progress, 100) }
              : att
          )
        );
      }, 200);
    });
  };

  const processFiles = async (files: FileList) => {
    const fileArray = Array.from(files);

    // 파일 크기 제한 (500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    const validFiles = fileArray.filter((file) => file.size <= maxSize);

    if (validFiles.length !== fileArray.length) {
      alert("일부 파일이 용량 제한(500MB)을 초과하여 제외되었습니다.");
    }

    // 총 파일 개수 제한 (5개)
    if (attachments.length + validFiles.length > 5) {
      alert("첨부파일은 최대 5개까지 가능합니다.");
      return;
    }

    // 새 파일들을 업로드 중 상태로 추가
    const newAttachments: AttachmentFile[] = validFiles.map((file) => ({
      file,
      status: "uploading",
      progress: 0,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);

    // 각 파일의 업로드 시뮬레이션
    for (const attachment of newAttachments) {
      try {
        await simulateFileUpload(attachment.file);
        setAttachments((prev) =>
          prev.map((att) =>
            att.file === attachment.file
              ? { ...att, status: "completed", progress: 100 }
              : att
          )
        );
      } catch {
        setAttachments((prev) =>
          prev.map((att) =>
            att.file === attachment.file
              ? { ...att, status: "error", progress: 0, error: "업로드 실패" }
              : att
          )
        );
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmitClick = () => {
    console.log("=== 문의하기 버튼 직접 클릭됨 ===");
    console.log("현재 폼 데이터:", formData);

    // 폼 유효성 검사
    if (!formData.nickname.trim()) {
      alert("사용자(명)을 입력해주세요.");
      return;
    }
    if (!formData.email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    if (!formData.subject.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.message.trim()) {
      alert("문의 내용을 입력해주세요.");
      return;
    }
    if (!formData.agreeToTerms) {
      alert("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }

    console.log("폼 유효성 검사 통과");
    console.log("문의 내용:", formData);
    console.log(
      "첨부파일:",
      attachments.map((att) => att.file)
    );

    // 즉시 성공 메시지 표시
    setIsSubmitted(true);
    console.log("isSubmitted가 true로 설정됨");

    // 3초 후 메인화면으로 이동
    setTimeout(() => {
      console.log("타이머 실행됨 - 메인화면으로 이동");
      // 문의 완료 알림 표시
      alert(
        "문의가 성공적으로 접수되었습니다!\n빠른 시일 내에 답변을 드리겠습니다."
      );

      // 메인화면으로 이동
      navigate("/");
    }, 3000);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("초기화 버튼 클릭됨");

    // 폼 데이터 초기화
    setFormData({
      nickname: "",
      email: "",
      category: "general",
      subject: "",
      message: "",
      agreeToTerms: false,
    });

    // 첨부파일 초기화
    setAttachments([]);

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    console.log("폼이 초기화되었습니다.");
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>문의하기</h1>
        <p className="contact-intro">
          NEXUS 서비스 이용 중 궁금한 점이나 문제가 있으시면 언제든지 문의해
          주세요. 빠르고 정확한 답변을 드리도록 하겠습니다.
        </p>

        {isSubmitted ? (
          <div className="success-message">
            <h2>문의 접수 완료</h2>
            <p>빠른 시일 내에 답변을 드리겠습니다.</p>
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          </div>
        ) : (
          <div className="contact-content">
            <div className="contact-info-section">
              <h2>연락처 정보</h2>
              <div className="contact-info-list">
                <div className="contact-info-item horizontal">
                  <div className="contact-icon large">
                    <MdEmail />
                  </div>
                  <div className="contact-info-text">
                    <h3>이메일</h3>
                    <p>nexuscshelper@gmail.com</p>
                    <p className="response-time">24시간 내 답변</p>
                  </div>
                </div>
                <div className="contact-info-item horizontal">
                  <div className="contact-icon large">
                    <MdChat />
                  </div>
                  <div className="contact-info-text">
                    <h3>실시간 채팅</h3>
                    <p>Discord</p>
                    <p className="response-time">24시간 응답</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="faq-section">
              <h2>자주 묻는 질문</h2>
              <div className="faq-grid">
                <div className="faq-item">
                  <h3>Q: 계정을 잊어버렸어요. 어떻게 해야 하나요?</h3>
                  <p>
                    A: 로그인 페이지의 "비밀번호 찾기" 기능을 이용하시거나,
                    nexuscshelper@gmail.com으로 이메일을 보내주시면 도움을
                    드리겠습니다.
                  </p>
                </div>
                <div className="faq-item">
                  <h3>Q: 내전 매칭이 안 돼요. 어떻게 해야 하나요?</h3>
                  <p>
                    A: 현재 접속 중인 유저 수를 확인해 주시고, 잠시 후 다시
                    시도해 보세요. 매칭 대기 시간은 보통 1-3분 정도 소요됩니다.
                    문제가 지속되면 문의해 주세요.
                  </p>
                </div>
                <div className="faq-item">
                  <h3>Q: 부정행위 신고는 어떻게 하나요?</h3>
                  <p>
                    A: 게임 내 신고 기능을 이용하시거나, 이메일로 구체적인
                    증거(스크린샷, 녹화 영상 등)와 함께 신고해 주시면 검토 후
                    조치하겠습니다.
                  </p>
                </div>
                <div className="faq-item">
                  <h3>Q: 랭킹 점수가 잘못 계산된 것 같아요.</h3>
                  <p>
                    A: 게임 결과와 함께 구체적인 상황을 설명해 주시면 확인 후
                    수정해 드리겠습니다. 랭킹 점수는 게임 결과, 팀 밸런스,
                    상대팀 실력 등을 종합적으로 고려하여 계산됩니다.
                  </p>
                </div>
                <div className="faq-item">
                  <h3>Q: 서비스 이용 중 오류가 발생했어요.</h3>
                  <p>
                    A: 브라우저 캐시를 삭제하고 다시 시도해 보세요. 문제가
                    지속되면 오류 화면을 캡처하여 문의해 주세요. 지원 브라우저는
                    Chrome, Firefox, Safari, Edge 최신 버전입니다.
                  </p>
                </div>
                <div className="faq-item">
                  <h3>Q: 개인정보 수정은 어떻게 하나요?</h3>
                  <p>
                    A: 마이페이지 &gt; 개인정보 관리에서 직접 수정하실 수
                    있습니다. 수정이 불가능한 항목은 문의해 주세요. 닉네임
                    변경은 한 달에 한 번만 가능합니다.
                  </p>
                </div>
                <div className="faq-item">
                  <h3>Q: 팀 밸런스는 어떻게 조정되나요?</h3>
                  <p>
                    A: 팀 밸런스는 각 팀원의 랭킹 점수를 기반으로 자동으로
                    조정됩니다. 높은 랭킹을 가진 플레이어와 낮은 랭킹을 가진
                    플레이어가 균등하게 배치되어 공정한 게임을 보장합니다.
                  </p>
                </div>
                <div className="faq-item">
                  <h3>Q: 서비스 이용 시간에 제한이 있나요?</h3>
                  <p>
                    A: NEXUS는 24시간 서비스를 제공합니다. 다만, 새벽 시간대에는
                    접속 유저가 적어 매칭 시간이 길어질 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="contact-form-section">
              <h2>문의 양식</h2>
              <form className="contact-form">
                <div className="form-group">
                  <label htmlFor="nickname">사용자(명) *</label>
                  <input
                    type="text"
                    id="nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    required
                    placeholder="닉네임을 입력해 주세요"
                    style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}
                    maxLength={20}
                    autoComplete="nickname"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">이메일 *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="답변을 받을 이메일을 입력해 주세요"
                    style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}
                    maxLength={40}
                    autoComplete="email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">문의 유형 *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}
                    autoComplete="off"
                  >
                    <option value="general">일반 문의</option>
                    <option value="technical">기술적 문제</option>
                    <option value="account">계정 관련</option>
                    <option value="matching">매칭 문제</option>
                    <option value="ranking">랭킹/점수 문제</option>
                    <option value="report">부정행위 신고</option>
                    <option value="bug">버그 신고</option>
                    <option value="suggestion">건의사항</option>
                    <option value="partnership">파트너십 문의</option>
                    <option value="other">기타</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="subject">제목 *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="문의 제목을 간단히 입력해 주세요"
                    style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}
                    maxLength={40}
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">문의 내용 *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={8}
                    cols={40}
                    placeholder="구체적인 문의 내용을 자세히 작성해 주세요. 문제가 발생한 상황, 오류 메시지, 스크린샷 등을 포함해 주시면 더 빠른 답변이 가능합니다."
                    style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}
                    maxLength={2000}
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="attachments">첨부파일</label>
                  <div
                    className={`file-upload-container ${
                      isDragOver ? "drag-over" : ""
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="attachments"
                      multiple
                      onChange={handleFileChange}
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                      className="file-input"
                    />
                    <div
                      className="file-upload-area"
                      onClick={handleFileUploadClick}
                    >
                      <div className="upload-icon">
                        {isDragOver ? <MdCloudUpload /> : <MdAttachFile />}
                      </div>
                      <div className="upload-text">
                        파일을 드래그하거나 클릭하여 첨부 (최대 5개, 500MB/개)
                      </div>
                    </div>
                  </div>

                  {attachments.length > 0 && (
                    <div className="attachments-list">
                      <h4>첨부된 파일 ({attachments.length}/5)</h4>
                      {attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className={`attachment-item ${attachment.status}`}
                        >
                          <div className="attachment-info">
                            <span className="file-name">
                              {attachment.file.name}
                            </span>
                            <span className="file-size">
                              {formatFileSize(attachment.file.size)}
                            </span>
                            {attachment.status === "uploading" && (
                              <div className="upload-progress">
                                <div className="progress-bar">
                                  <div
                                    className="progress-fill"
                                    style={{ width: `${attachment.progress}%` }}
                                  ></div>
                                </div>
                                <span className="progress-text">
                                  {Math.round(attachment.progress)}%
                                </span>
                              </div>
                            )}
                            {attachment.status === "error" && (
                              <span className="error-message">
                                {attachment.error}
                              </span>
                            )}
                          </div>
                          <div className="attachment-actions">
                            {attachment.status === "uploading" && (
                              <div className="uploading-indicator">
                                <div className="spinner"></div>
                              </div>
                            )}
                            {attachment.status === "completed" && (
                              <div className="completed-indicator">
                                <MdCheckCircle />
                              </div>
                            )}
                            {attachment.status === "error" && (
                              <div className="error-indicator">
                                <MdError />
                              </div>
                            )}
                            {(attachment.status === "completed" ||
                              attachment.status === "error") && (
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="remove-file-btn"
                              >
                                <MdDelete />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required
                    />
                    개인정보 수집 및 이용에 동의합니다. *
                  </label>
                  <p className="privacy-notice">
                    수집된 개인정보는 문의 접수 및 답변 목적으로만 사용되며,
                    <a href="/privacy">개인정보처리방침</a>에 따라 안전하게
                    관리됩니다.
                  </p>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="submit-btn"
                    onClick={handleSubmitClick}
                  >
                    문의하기
                  </button>
                  <button
                    type="reset"
                    className="reset-btn"
                    onClick={handleReset}
                  >
                    초기화
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
