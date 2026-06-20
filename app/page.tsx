"use client";

import Image from "next/image";
import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import HeroSection from "@/components/HeroSection";
import VideoTemplateBox from "@/components/VideoTemplateBox";
import PrizeSection from "@/components/PrizeSection";
import NoteSection from "@/components/NoteSection";
import RuleSection from "@/components/RuleSection";
import LoadingOverlay from "@/components/LoadingOverlay";
import ResultModal from "@/components/ResultModal";
import { TEMPLATE_VIDEO_URL, TEMPLATE_ID } from "@/lib/constants";
import { createVideo } from "@/lib/api";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const videoSectionRef = useRef<HTMLElement>(null);
  const responsiveVideoSectionRef = useRef<HTMLElement>(null);
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

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setSuccessMessage(null);
    setSelectedImage((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return URL.createObjectURL(file);
    });
  }, []);

  const handleUploadFile = useCallback(
    (file?: File | null) => {
      if (!file) return;
      if (file.type && !file.type.startsWith("image/")) return;
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

  const getVideoDownloadUrl = (videoUrl: string) =>
    `/api/download-video?url=${encodeURIComponent(videoUrl)}`;

  const triggerVideoDownload = (videoUrl: string) => {
    const link = document.createElement("a");
    link.href = getVideoDownloadUrl(videoUrl);
    link.download = "betagen-video.mp4";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCreateVideo = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("template_id", TEMPLATE_ID);
      formData.append("template_video_url", TEMPLATE_VIDEO_URL);

      const result = await createVideo(formData);
      if (result.success) {
        if (!result.video_url) {
          setErrorMessage("API đã xử lý xong nhưng chưa trả về link video.");
          return;
        }
        triggerVideoDownload(result.video_url);
        setResultVideoUrl(result.video_url);
        setSuccessMessage("Video đã tạo xong, trình duyệt đang tải video về thiết bị.");
      } else {
        console.error("[Create Video] API error response:", result);
        setErrorMessage(result.error || "Không thể tạo video. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("[Create Video] Connection/Network error:", error);
      setErrorMessage("Đã xảy ra lỗi kết nối với API.");
    } finally {
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
        accept="image/jpeg,image/png,image/webp"
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
        <HeroSection onCreateVideo={scrollToVideo} />

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
            {successMessage && (
              <div className="mt-2 text-xs font-semibold text-[#1f7a43] bg-green-50/95 px-3 py-1.5 rounded-full border border-green-200 text-center shadow-sm whitespace-nowrap">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mt-2 text-xs font-semibold text-red-600 bg-red-50/90 px-3 py-1.5 rounded-full border border-red-200 text-center shadow-sm whitespace-nowrap">
                Lỗi: {errorMessage}
              </div>
            )}
          </div>

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
              style={{ fontSize: "41px" }}
            >
              GIẢI THƯỞNG HẤP DẪN
            </h2>
          </div>

          <div
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
              width: "870px",
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
          className="relative bg-[#354A93] py-4 text-center"
          style={{ zIndex: 30 }}
        >
          <p className="text-sm text-white/80">
            © 2025 Betagen. Chương trình VIVU Tốt Bụng.
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
              <button>Giải thưởng</button>
              <button>Lưu ý</button>
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
              Lorem ipsum dictum gravida tempor varius elementum augue feugiat
              curabitur nam gravida nunc amet egestas morbi scelerisque turpis.
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
            <div className="mt-2 text-xs font-semibold text-[#1f7a43] bg-green-50/95 px-3 py-1.5 rounded-full border border-green-200 text-center shadow-sm max-w-[340px] mx-auto">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mt-2 text-xs font-semibold text-red-600 bg-red-50/90 px-3 py-1.5 rounded-full border border-red-200 text-center shadow-sm max-w-[280px] mx-auto">
              Lỗi: {errorMessage}
            </div>
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

        <section className="responsive-section responsive-prize">
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

          <div className="responsive-note">
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
          © 2025 Betagen. Chương trình VIVU Tốt Bụng.
        </footer>
      </div>
    </div>
  );
}
