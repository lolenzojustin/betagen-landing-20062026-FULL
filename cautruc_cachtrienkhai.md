betagen-landing/
│
├── app/
│   ├── page.tsx                 // Trang landing page chính
│   ├── layout.tsx               // Layout chung
│   ├── globals.css              // CSS global
│   │
│   └── api/
│       └── create-video/
│           └── route.ts         // API nội bộ gọi sang n8n
│
├── components/
│   ├── Header.tsx               // Logo + menu
│   ├── HeroSection.tsx          // Phần đầu landing page
│   ├── VideoTemplateBox.tsx     // Khung video template / upload ảnh
│   ├── RuleSection.tsx          // Thể lệ
│   ├── PrizeSection.tsx         // Giải thưởng
│   ├── NoteSection.tsx          // Lưu ý
│   ├── LoadingOverlay.tsx       // Loading khi đang tạo video
│   └── ResultModal.tsx          // Hiện link tải video
│
├── lib/
│   ├── api.ts                   // Hàm gọi /api/create-video
│   └── constants.ts             // Text, cấu hình, template_id
│
├── public/
│   ├── images/
│   │   ├── logo.png
│   │   ├── hero-bg.png
│   │   ├── product.png
│   │   ├── prize-1.png
│   │   ├── prize-2.png
│   │   └── prize-3.png
│   │
│   ├── icons/
│   │   └── upload.svg
│   │
│   └── videos/
│       └── template-preview.mp4
│
├── design-reference/
│   ├── figma-full-page.png      // Ảnh full thiết kế Figma
│   └── figma-assets/            // Nếu có asset export thêm từ Figma
│
├── .env.local
├── package.json
├── tsconfig.json
└── README.md

# không cần backend Python/FastAPI, chỉ dùng: Next.js + Vercel + API route nội bộ + n8n webhook

# Luồng hoạt động
Khách vào landing page
→ Bấm vào khung video template
→ Upload ảnh cá nhân
→ Bấm “Tạo video”
→ Frontend gọi /api/create-video
→ route.ts gọi webhook n8n
→ n8n xử lý video
→ n8n trả về video_url
→ Website hiện nút tải video / tự tải video

# Cách triển khai từng bước
## Bước 1: Export asset từ Figma
Từ Figma, bạn cần lấy:

- Ảnh full landing page để làm mẫu code
- Logo Betagen
- Ảnh sản phẩm
- Ảnh người / hero
- Ảnh giải thưởng
- Icon nếu có
- Video preview nếu có

Cho ảnh full thiết kế vào:

design-reference/figma-full-page.png

Cho ảnh/logo/sản phẩm vào:

public/images/

Cho icon vào:

public/icons/

Cho video template vào:

public/videos/template-preview.mp4

## Bước 2: Đưa prompt cho Claude Code
Hãy code landing page Next.js + TypeScript + Tailwind CSS theo thiết kế Figma trong folder design-reference.

Yêu cầu:
- Code giao diện giống ảnh design-reference/figma-full-page.png.
- Dùng App Router của Next.js.
- Landing page gồm các phần: Header, HeroSection, VideoTemplateBox, RuleSection, PrizeSection, NoteSection.
- Phần khung màu xanh ở giữa trang là video template.
- Người dùng bấm vào khung video template để upload ảnh cá nhân.
- Sau khi upload ảnh, người dùng bấm nút “Tạo video”.
- Frontend gọi API nội bộ /api/create-video.
- Tạo API route tại app/api/create-video/route.ts.
- API route nhận image và template_id từ frontend.
- API route gọi webhook n8n từ biến môi trường N8N_WEBHOOK_URL.
- n8n trả về JSON có video_url.
- API route trả video_url về frontend.
- Frontend hiển thị loading khi đang tạo video.
- Khi có video_url, hiển thị nút “Tải video” và tự động mở/tải video cho người dùng.
- Không gọi trực tiếp webhook n8n từ frontend.
- Không dùng backend Python/FastAPI.
- Tạo đầy đủ component, lib/api.ts, constants.ts và README hướng dẫn chạy local + deploy Vercel.

## Bước 3: Test local
Chạy:

npm run dev

Mở:

http://localhost:3000

Test thử:

Upload ảnh → bấm Tạo video → gọi n8n → nhận video_url

## Bước 4: Deploy Vercel
Đẩy project lên GitHub, sau đó vào Vercel import repo.

Trong Vercel thêm biến môi trường:

N8N_WEBHOOK_URL=https://domain-n8n-cua-ban.com/webhook/create-video

Sau đó bấm Redeploy.

Kết luận

Cấu trúc hiện tại trong VSCode của bạn đang đúng hướng. Việc tiếp theo là: cho asset Figma vào đúng folder rồi đưa prompt cho Claude Code code giao diện + API /api/create-video.