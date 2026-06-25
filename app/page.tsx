"use client";

import Image from "next/image";
import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";
import HeroSection from "@/components/HeroSection";
import VideoTemplateBox from "@/components/VideoTemplateBox";
import PrizeSection from "@/components/PrizeSection";
import NoteSection from "@/components/NoteSection";
import RuleSection from "@/components/RuleSection";
import LoadingOverlay from "@/components/LoadingOverlay";
import ResultModal from "@/components/ResultModal";
import { TEMPLATE_VIDEO_URL } from "@/lib/constants";
import {
  checkVideo,
  createVideo,
  releaseVideoLock,
  uploadImageToFreeImage,
} from "@/lib/api";
import {
  IMAGE_UPLOAD_ACCEPT,
  isAcceptedImageUpload,
} from "@/lib/image-upload";

const INITIAL_POLLING_DELAY_MS = 100_000;
const POLLING_INTERVAL_MS = 10_000;
const MAX_POLLING_ATTEMPTS = 20;
const VIDEO_BUSY_MESSAGE =
  "Đang có người tạo video, xin vui lòng đợi và thử lại.";
const SYSTEM_UPGRADE_MESSAGE = "Hệ thống đang nâng cấp, xin vui lòng thử lại sau";
const ACTIVE_VIDEO_JOB_STORAGE_KEY = "betagen:active-video-job";
const MAX_STORED_VIDEO_JOB_AGE_MS = 30 * 60 * 1000;

type ActiveVideoJob = {
  taskId: string;
  lockId?: string;
  createdAt: number;
  nextCheckAt: number;
  attempts: number;
};

function waitForNextPoll(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, ms);

    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeoutId);
        reject(signal.reason);
      },
      { once: true }
    );
  });
}

function isActiveVideoJob(value: unknown): value is ActiveVideoJob {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const job = value as Partial<ActiveVideoJob>;

  return (
    typeof job.taskId === "string" &&
    (typeof job.lockId === "undefined" || typeof job.lockId === "string") &&
    typeof job.createdAt === "number" &&
    typeof job.nextCheckAt === "number" &&
    typeof job.attempts === "number"
  );
}

function readStoredVideoJob() {
  try {
    const rawJob = window.localStorage.getItem(ACTIVE_VIDEO_JOB_STORAGE_KEY);

    if (!rawJob) {
      return null;
    }

    const job = JSON.parse(rawJob) as unknown;

    if (!isActiveVideoJob(job)) {
      window.localStorage.removeItem(ACTIVE_VIDEO_JOB_STORAGE_KEY);
      return null;
    }

    if (
      Date.now() - job.createdAt > MAX_STORED_VIDEO_JOB_AGE_MS ||
      job.attempts >= MAX_POLLING_ATTEMPTS
    ) {
      window.localStorage.removeItem(ACTIVE_VIDEO_JOB_STORAGE_KEY);
      return null;
    }

    return job;
  } catch {
    return null;
  }
}

function saveStoredVideoJob(job: ActiveVideoJob) {
  try {
    window.localStorage.setItem(
      ACTIVE_VIDEO_JOB_STORAGE_KEY,
      JSON.stringify(job)
    );
  } catch {
    // The in-memory polling still works if localStorage is unavailable.
  }
}

function clearStoredVideoJob() {
  try {
    window.localStorage.removeItem(ACTIVE_VIDEO_JOB_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}

function createActiveVideoJob(taskId: string, lockId?: string): ActiveVideoJob {
  const now = Date.now();

  return {
    taskId,
    lockId,
    createdAt: now,
    nextCheckAt: now + INITIAL_POLLING_DELAY_MS,
    attempts: 0,
  };
}

function StatusMessage({
  type,
  children,
  className = "",
}: {
  type: "success" | "error";
  children: ReactNode;
  className?: string;
}) {
  const colorClass =
    type === "success"
      ? "border-green-200 bg-green-50/95 text-[#1f7a43]"
      : "border-red-200 bg-white/95 text-[#EA0029]";

  return (
    <div
      className={`status-message ${colorClass} ${className}`}
      role={type === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const videoSectionRef = useRef<HTMLElement>(null);
  const prizeSectionRef = useRef<HTMLElement>(null);
  const noteSectionRef = useRef<HTMLDivElement>(null);
  const responsiveVideoSectionRef = useRef<HTMLElement>(null);
  const responsivePrizeSectionRef = useRef<HTMLElement>(null);
  const responsiveNoteSectionRef = useRef<HTMLDivElement>(null);
  const pollingAbortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clean up object URL when component unmounts or when a new preview is set
  useEffect(() => {
    return () => {
      if (selectedImage && selectedImage.startsWith("blob:")) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  const stopPolling = useCallback(() => {
    if (pollingAbortRef.current) {
      pollingAbortRef.current.abort();
      pollingAbortRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleFileSelected = useCallback(
    (file: File) => {
      stopPolling();
      requestIdRef.current += 1;
      setIsLoading(false);
      setResultVideoUrl(null);
      setSelectedFile(file);
      setErrorMessage(null);
      setSuccessMessage(null);
      setSelectedImage((prev) => {
        if (prev && prev.startsWith("blob:")) {
          URL.revokeObjectURL(prev);
        }
        return URL.createObjectURL(file);
      });
    },
    [stopPolling]
  );

  const handleUploadFile = useCallback(
    (file?: File | null) => {
      if (!file) return;
      if (!isAcceptedImageUpload(file)) return;
      handleFileSelected(file);
    },
    [handleFileSelected],
  );

  const handleUploadInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleUploadFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const scrollToVideo = () => {
    const target =
      window.innerWidth < 900
        ? responsiveVideoSectionRef.current
        : videoSectionRef.current;

    target?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPrize = () => {
    const target =
      window.innerWidth < 900
        ? responsivePrizeSectionRef.current
        : prizeSectionRef.current;

    target?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToNote = () => {
    const target =
      window.innerWidth < 900
        ? responsiveNoteSectionRef.current
        : noteSectionRef.current;

    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pollVideoResult = useCallback(async (initialJob: ActiveVideoJob) => {
    stopPolling();
    saveStoredVideoJob(initialJob);

    const controller = new AbortController();
    pollingAbortRef.current = controller;
    let currentJob = initialJob;

    try {
      while (currentJob.attempts < MAX_POLLING_ATTEMPTS) {
        await waitForNextPoll(
          Math.max(currentJob.nextCheckAt - Date.now(), 0),
          controller.signal
        );

        const completedAttempts = currentJob.attempts + 1;
        let result;

        try {
          result = await checkVideo(
            currentJob.taskId,
            currentJob.lockId,
            controller.signal
          );
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }

          console.warn("[Check Video] Retrying after network error:", error);
          currentJob = {
            ...currentJob,
            attempts: completedAttempts,
            nextCheckAt: Date.now() + POLLING_INTERVAL_MS,
          };
          saveStoredVideoJob(currentJob);
          continue;
        }

        const status =
          typeof result.status === "string" ? result.status.toUpperCase() : "";

        if (status === "COMPLETED" && result.video_url) {
          clearStoredVideoJob();
          setResultVideoUrl(result.video_url);
          setSuccessMessage("Video đã tạo xong, bạn có thể tải video.");
          return;
        }

        if (result.success === false) {
          console.warn("[Check Video] Retrying after API error:", result);
          currentJob = {
            ...currentJob,
            attempts: completedAttempts,
            nextCheckAt: Date.now() + POLLING_INTERVAL_MS,
          };
          saveStoredVideoJob(currentJob);
          continue;
        }

        if (status === "ERROR") {
          clearStoredVideoJob();
          setErrorMessage(
            result.error || "Không thể tạo video. Vui lòng thử lại."
          );
          return;
        }

        currentJob = {
          ...currentJob,
          attempts: completedAttempts,
          nextCheckAt: Date.now() + POLLING_INTERVAL_MS,
        };
        saveStoredVideoJob(currentJob);
      }

      clearStoredVideoJob();
      setErrorMessage("Không tạo được video, vui lòng thử lại sau.");
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      console.error("[Check Video] Connection/Network error:", error);
      setErrorMessage("Đã xảy ra lỗi kết nối với API.");
    } finally {
      if (!controller.signal.aborted && pollingAbortRef.current === controller) {
        if (currentJob.lockId) {
          try {
            await releaseVideoLock(currentJob.lockId);
          } catch (error) {
            console.warn("[Video Lock] Unable to release lock:", error);
          }
        }

        pollingAbortRef.current = null;
        setIsLoading(false);
      }
    }
  }, [stopPolling]);

  useEffect(() => {
    const resumeStoredVideoJob = () => {
      const storedJob = readStoredVideoJob();

      if (!storedJob) {
        return;
      }

      requestIdRef.current += 1;
      setIsLoading(true);
      setResultVideoUrl(null);
      setErrorMessage(null);
      setSuccessMessage(null);
      void pollVideoResult(storedJob);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resumeStoredVideoJob();
      }
    };

    resumeStoredVideoJob();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", resumeStoredVideoJob);
    window.addEventListener("pageshow", resumeStoredVideoJob);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", resumeStoredVideoJob);
      window.removeEventListener("pageshow", resumeStoredVideoJob);
    };
  }, [pollVideoResult]);

  const handleCreateVideo = async () => {
    if (!selectedFile || isLoading) return;

    stopPolling();
    clearStoredVideoJob();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setResultVideoUrl(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let imageUrl: string;

      try {
        imageUrl = await uploadImageToFreeImage(selectedFile);
        console.log("uploaded image_url", imageUrl);
      } catch (error) {
        if (requestIdRef.current !== requestId) {
          return;
        }

        console.error("[FreeImage Upload] Upload error:", error);
        setErrorMessage("Không upload được ảnh, vui lòng thử lại.");
        setIsLoading(false);
        return;
      }

      if (requestIdRef.current !== requestId) {
        return;
      }

      const result = await createVideo({
        image_url: imageUrl,
      });
      console.log("n8n create response", result);

      if (requestIdRef.current !== requestId) {
        return;
      }

      const taskId =
        result.task_id ||
        (typeof result.request_id === "string" ? result.request_id : undefined);
      const lockId =
        typeof result.lock_id === "string" ? result.lock_id : undefined;

      if (taskId) {
        void pollVideoResult(createActiveVideoJob(taskId, lockId));
        return;
      }

      console.error("[Create Video] API error response:", result);
      setErrorMessage(
        result.status === "busy"
          ? VIDEO_BUSY_MESSAGE
          : result.error || "API tạo task thành công nhưng chưa trả về request_id."
      );
      setIsLoading(false);
    } catch (error) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      console.error("[Create Video] Connection/Network error:", error);
      setErrorMessage(SYSTEM_UPGRADE_MESSAGE);
      setIsLoading(false);
    }
  };

  const handleUploadButtonClick = () => {
    if (selectedFile) {
      void handleCreateVideo();
      return;
    }

    uploadInputRef.current?.click();
  };

  const handleCloseResult = () => {
    setResultVideoUrl(null);
  };

  useEffect(() => {
    const maxDesktopCanvasWidth = 2160;

    const updateCanvasScale = () => {
      setCanvasScale(Math.min(window.innerWidth, maxDesktopCanvasWidth) / 1440);
    };

    updateCanvasScale();
    window.addEventListener("resize", updateCanvasScale);

    return () => window.removeEventListener("resize", updateCanvasScale);
  }, []);

  return (
    <div className="min-h-screen">
      <input
        ref={uploadInputRef}
        type="file"
        accept={IMAGE_UPLOAD_ACCEPT}
        className="hidden"
        onChange={handleUploadInputChange}
      />

      {isLoading && <LoadingOverlay />}
      {resultVideoUrl && (
        <ResultModal videoUrl={resultVideoUrl} onClose={handleCloseResult} />
      )}

      {/* ─── Main 1440px wrapper ─── */}
      <div
        className="desktop-canvas page-canvas"
        style={{ "--canvas-scale": canvasScale } as CSSProperties}
      >

        {/* ─── Section 1: Hero ─── */}
        <HeroSection
          onCreateVideo={scrollToVideo}
          onViewPrize={scrollToPrize}
          onViewNote={scrollToNote}
        />

        {/* ─── Section 2: Video Upload + Thể lệ ─── */}
        <section
          ref={videoSectionRef}
          id="video-section"
          className="design-section section2-desktop"
        >
          <div className="design-stage section2-stage">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #84D9FB 0%, #BEEBFD 16%, #EAF8FE 36%, #C9EFFD 66%, #84D9FB 100%)",
            }}
          />

          <Image
            src="/images/02-section-video-rule/wave-video-rule.png?v=2"
            alt=""
            width={1440}
            height={900}
            unoptimized
            className="section2-wave absolute pointer-events-none z-[1] object-contain"
            style={{
              left: "0",
              top: "185px",
              width: "1440px",
              height: "auto",
              opacity: 0.9,
            }}
            aria-hidden="true"
          />

          <div
            className="absolute z-20"
            style={{
              left: "50%",
              top: "65px",
              transform: "translateX(-50%)",
              width: "637px",
            }}
          >
            <VideoTemplateBox
              templateVideoUrl={TEMPLATE_VIDEO_URL}
              onFileSelected={handleFileSelected}
              previewUrl={selectedImage}
            />
          </div>

          <div
            className="absolute z-20 flex flex-col items-center"
            style={{
              left: "50%",
              top: "452px",
              transform: "translateX(-50%)",
            }}
          >
            <button
              onClick={handleUploadButtonClick}
              disabled={isLoading}
              className="flex h-[43px] w-[235px] items-center justify-center gap-2 rounded-full bg-[#EA0029] font-bold text-white transition-all hover:scale-105 hover:bg-[#c90024] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 active:scale-95"
              style={{ fontSize: "16px" }}
            >
              {!selectedImage && (
                <Image
                  src="/icons/upload.svg"
                  alt=""
                  width={18}
                  height={18}
                  style={{
                    width: "18px",
                    height: "18px",
                    filter: "brightness(0) invert(1)",
                  }}
                />
              )}
              {selectedImage ? "Bắt đầu tạo video" : "Tải lên hình ảnh của bạn"}
            </button>
          </div>

          {(successMessage || errorMessage) && (
            <div
              className="absolute z-50 flex justify-center"
              style={{
                left: "50%",
                top: "506px",
                transform: "translateX(-50%)",
                width: "720px",
              }}
            >
              {successMessage && (
                <StatusMessage type="success">{successMessage}</StatusMessage>
              )}
              {errorMessage && (
                <StatusMessage type="error">{errorMessage}</StatusMessage>
              )}
            </div>
          )}

          <div
            className="absolute z-30 text-center"
            style={{
              left: "50%",
              top: "500px",
              transform: "translateX(-50%)",
              width: "680px",
              padding: "9px 18px 11px",
              background: "rgba(235, 249, 255, 0.68)",
              border: "1px solid rgba(255, 255, 255, 0.54)",
              borderRadius: "18px",
              boxShadow: "0 12px 28px rgba(53, 74, 147, 0.08)",
            }}
          >
            <p className="leading-tight text-black" style={{ fontSize: "22px" }}>
              *Hình ảnh tải lên là hình ảnh chân dung, rõ nét
            </p>
            <p className="leading-tight text-black" style={{ fontSize: "22px" }}>
              *Mỗi user chỉ được <strong>tối đa 2 lần</strong> tải lên hình ảnh
            </p>
          </div>

          <div
            className="absolute z-20"
            style={{
              left: "138px",
              top: "610px",
              width: "1088px",
            }}
          >
            <RuleSection />
          </div>
          </div>
        </section>

        {/* ─── Section 3: Giải thưởng + Lưu ý ─── */}
        <section
          ref={prizeSectionRef}
          id="prize-section"
          className="design-section"
        >
          <div className="design-stage">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 760px 560px at 53% 45%, rgba(247, 253, 255, 0.96) 0%, rgba(190, 235, 253, 0.72) 46%, rgba(132, 217, 251, 0) 76%), linear-gradient(180deg, #84D9FB 0%, #A9E4FA 18%, #BEEBFD 54%, #84D9FB 100%)",
            }}
          />

          <div
            className="absolute z-20"
            style={{ left: "89px", top: "76px" }}
          >
            <h2
              className="font-black leading-none text-[#354A93]"
              style={{ fontSize: "34px" }}
            >
              GIẢI THƯỞNG HẤP DẪN
            </h2>
          </div>

          <div
            ref={noteSectionRef}
            className="absolute z-20"
            style={{
              left: "80px",
              top: "180px",
              width: "1280px",
              height: "270px",
            }}
          >
            <PrizeSection />
          </div>

          <div
            className="absolute z-20"
            style={{
              left: "80px",
              top: "531px",
              width: "780px",
            }}
          >
            <NoteSection />
          </div>

          <Image
            src="/images/03-section-prize-note/wave-prize-note.png"
            alt=""
            width={702}
            height={500}
            className="prize-wave pointer-events-none absolute bottom-0 right-0 z-[1] h-auto object-contain"
            style={{ width: "702px" }}
            aria-hidden="true"
          />
          </div>
        </section>

        {/* Footer */}
        <footer
          className="relative bg-[#354A93] py-4 text-center shadow-[0_-10px_28px_rgba(53,74,147,0.12)]"
          style={{ zIndex: 30 }}
        >
          <p className="text-sm font-medium tracking-[0.01em] text-white/85">
            © 2026 Betagen. Chương trình VIVU Tốt Bụng 2026.
          </p>
        </footer>
      </div>

      <div className="responsive-layout">
        <section className="responsive-section responsive-hero">
          <div className="responsive-topbar">
            <Image
              src="/images/01-section-hero/logo-betagen.png"
              alt="Betagen Logo"
              width={151}
              height={44}
              className="responsive-logo"
              priority
            />
            <nav className="responsive-nav">
              <button onClick={scrollToVideo}>Tạo video</button>
              <button onClick={scrollToPrize}>Giải thưởng</button>
              <button onClick={scrollToNote}>Lưu ý</button>
            </nav>
          </div>

          <Image
            src="/images/01-section-hero/hero-main-visual.png"
            alt="Betagen campaign visual"
            width={1440}
            height={838}
            className="responsive-hero-visual"
            priority
          />

          <div className="responsive-hero-copy">
            <h1>
              VIVU TỐT BỤNG
              <br />
              TRÚNG QUÀ CỰC MÊ
            </h1>
            <p>
              Tải ảnh chân dung, tạo video VIVU Tốt Bụng của riêng bạn và tham
              gia chương trình nhận quà hấp dẫn từ Betagen trong năm 2026.
            </p>
            <button onClick={scrollToVideo}>TẠO VIDEO NGAY</button>
          </div>
        </section>

        <section
          ref={responsiveVideoSectionRef}
          id="video-section-responsive"
          className="responsive-section responsive-video"
        >
          <Image
            src="/images/02-section-video-rule/wave-video-rule.png?v=2"
            alt=""
            width={1440}
            height={900}
            unoptimized
            className="responsive-section2-wave"
            aria-hidden="true"
          />

          <div className="responsive-video-box">
            <VideoTemplateBox
              templateVideoUrl={TEMPLATE_VIDEO_URL}
              onFileSelected={handleFileSelected}
              previewUrl={selectedImage}
            />
          </div>

          <button
            onClick={handleUploadButtonClick}
            disabled={isLoading}
            className="responsive-upload-button"
          >
            {!selectedImage && (
              <Image
                src="/icons/upload.svg"
                alt=""
                width={18}
                height={18}
                aria-hidden="true"
              />
            )}
            {selectedImage ? "Bắt đầu tạo video" : "Tải lên hình ảnh của bạn"}
          </button>

          {successMessage && (
            <StatusMessage type="success" className="responsive-status-message">
              {successMessage}
            </StatusMessage>
          )}

          {errorMessage && (
            <StatusMessage type="error" className="responsive-status-message">
              {errorMessage}
            </StatusMessage>
          )}

          <div className="responsive-video-note">
            <p>*Hình ảnh tải lên là hình ảnh chân dung, rõ nét</p>
            <p>
              *Mỗi user chỉ được <strong>tối đa 2 lần</strong> tải lên hình ảnh
            </p>
          </div>

          <div className="responsive-rule-card">
            <h2>THỂ LỆ</h2>
            <div className="responsive-rule-grid">
              {[
                [
                  "BƯỚC 1",
                  'Nhấn chọn "Tải lên hình ảnh của bạn" & tải lên hình chân dung phù hợp.',
                ],
                ["BƯỚC 2", 'Sau khi có video, bấm chọn "Tải xuống".'],
                [
                  "BƯỚC 3",
                  "Đăng video lên Facebook cá nhân, kèm #Betagen #MenTaMeLaBetagen.",
                ],
                [
                  "BƯỚC 4",
                  "Bình luận link video tại bài đăng Minigame trên Fanpage Betagen.",
                ],
              ].map(([step, text]) => (
                <div key={step} className="responsive-rule-item">
                  <span>{step}</span>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={responsivePrizeSectionRef}
          className="responsive-section responsive-prize"
        >
          <Image
            src="/images/03-section-prize-note/wave-prize-note.png"
            alt=""
            width={702}
            height={500}
            className="responsive-prize-wave"
            aria-hidden="true"
          />

          <h2>GIẢI THƯỞNG HẤP DẪN</h2>
          <div className="responsive-prize-grid">
            {[
              [
                "1",
                "Tai nghe Bluetooth chụp tai Beats Solo 4",
                "/images/03-section-prize-note/prize-headphone.png",
              ],
              [
                "1",
                "Nồi chiên không dầu Philips",
                "/images/03-section-prize-note/prize-rice-cooker.png",
              ],
              [
                "3",
                "Máy xay sinh tố cầm tay Bear",
                "/images/03-section-prize-note/prize-blender.png",
              ],
            ].map(([count, name, image]) => (
              <article key={name} className="responsive-prize-card">
                <div>
                  <span>{count}</span>
                  <p>{name}</p>
                  <Image
                    src="/icons/gift.svg"
                    alt=""
                    width={34}
                    height={34}
                    aria-hidden="true"
                  />
                </div>
                <Image
                  src={image}
                  alt={name}
                  width={220}
                  height={280}
                  className="responsive-prize-image"
                />
              </article>
            ))}
          </div>

          <div ref={responsiveNoteSectionRef} className="responsive-note">
            <h2>LƯU Ý</h2>
            <div>
              <p>*Hình ảnh tải lên là hình ảnh chân dung, rõ nét</p>
              <p>*Mỗi user chỉ được tối đa 2 lần tải lên hình ảnh</p>
              <p>
                *Để video có hình ảnh đẹp, hình ảnh chân dung vui lòng mặc trang
                phục lịch sự, màu sắc phù hợp với video ban đầu
              </p>
            </div>
          </div>
        </section>

        <footer className="responsive-footer">
          © 2026 Betagen. Chương trình VIVU Tốt Bụng 2026.
        </footer>
      </div>
    </div>
  );
}
