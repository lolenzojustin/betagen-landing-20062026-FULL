betagen-landing/
│
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   │
│   └── api/
│       └── create-video/
│           └── route.ts
│
├── components/
│   ├── Header.tsx
│   ├── HeroSection.tsx
│   ├── VideoTemplateBox.tsx
│   ├── UploadModal.tsx
│   ├── LoadingOverlay.tsx
│   ├── ResultModal.tsx
│   ├── PrizeSection.tsx
│   └── Footer.tsx
│
├── lib/
│   ├── api.ts
│   └── constants.ts
│
├── public/
│   ├── images/
│   │   ├── logo.png
│   │   ├── hero-bg.png
│   │   ├── product.png
│   │   └── prizes/
│   │
│   ├── icons/
│   │   └── upload.svg
│   │
│   └── videos/
│       └── template-preview.mp4
│
├── design-reference/
│   ├── figma-full-page.png
│   └── figma-assets/
│
├── .env.local
├── package.json
├── tsconfig.json
└── README.md

# Luồng chạy đúng
Khách vào landing page
→ Upload ảnh
→ Bấm Tạo video
→ Frontend gọi /api/create-video
→ route.ts gọi webhook n8n
→ n8n trả video_url
→ frontend cho khách tải video

# .env.local
N8N_WEBHOOK_URL=https://domain-n8n-cua-ban.com/webhook/create-video
N8N_SECRET_KEY=your_secret_key

# Chú thích
Bỏ hẳn folder backend/ nếu bạn không dùng FastAPI.
- Frontend Next.js + Backend Python FastAPI: Nếu làm vậy thì thường bạn phải deploy thêm backend riêng, ví dụ VPS/Render/Railway. Nhưng case của bạn không cần FastAPI.Next.js có thể tạo API nội bộ bằng app/api/.../route.ts, gọi là Route Handler. Nó nằm trong project Next.js luôn, nên deploy Vercel là chạy được API luôn.