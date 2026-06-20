# Style Notes - Betagen Landing Page

## 1. Mục tiêu

Code landing page giống thiết kế Figma nhất có thể.

Ảnh tham chiếu:

* Full page: `design-reference/pages/home-desktop.png`
* Section 1 Hero: `design-reference/blocks/01-section-hero.png`
* Section 2 Video + Thể lệ: `design-reference/blocks/02-section-video-rule.png`
* Section 3 Giải thưởng + Lưu ý: `design-reference/blocks/03-section-prize-note.png`

Yêu cầu quan trọng:

* Không dùng ảnh full page làm background toàn trang.
* Không cắt nguyên landing page thành 1 ảnh để hiển thị.
* Phải code giao diện thật bằng HTML/CSS với Next.js + Tailwind CSS.
* Bắt buộc dùng asset đã export từ Figma trong `public/images`, `public/icons`.
* Không được tự thay ảnh khác, icon khác, hình minh họa khác nếu asset Figma đã có sẵn.
* Nếu thiếu asset nào thì phải báo rõ asset đó đang thiếu, không tự bịa hoặc lấy ảnh thay thế.
* Giao diện desktop cần giống Figma nhất có thể về bố cục, màu sắc, kích thước, khoảng cách, font, bo góc và vị trí hình ảnh.
* Video template preview dùng link online từ Cloudflare R2, không bắt buộc lưu video vào `public/videos`.

---

## 2. Kích thước thiết kế

* Thiết kế gốc desktop: `1440px` width.

* Mỗi section trong Figma có kích thước khoảng `1440 x 900`.

* Nội dung landing page căn giữa.

* Các section xếp dọc theo đúng thứ tự:

  1. Hero
  2. Video upload + Thể lệ
  3. Giải thưởng + Lưu ý

* Khi code desktop, ưu tiên bám sát kích thước, khoảng cách, padding, margin và vị trí trong ảnh tham chiếu.

* Khi responsive mobile, được phép xếp dọc để không vỡ layout nhưng vẫn giữ đúng tinh thần thiết kế.

---

## 3. Màu sắc lấy từ Figma

Màu sắc được lấy trực tiếp từ Figma theo từng section. Khi code, ưu tiên dùng đúng các mã màu dưới đây.

---

### 3.1. Section 1 - Hero

Tham chiếu: `design-reference/blocks/01-section-hero.png`

Màu lấy từ Figma khi chọn phần nền `Frame 9` trong Section 1:

* Màu đỏ chính: `#EA0029`
* Màu trắng: `#FFFFFF`
* Màu xanh nhạt: `#84D9FB`
* Có sử dụng `Radial gradient`

Radial gradient nền Section 1:

* Stop 0%: `#FFFFFF`
* Stop 100%: `#84D9FB`

Cách dùng:

* Background chính của Hero dùng radial gradient từ `#FFFFFF` sang `#84D9FB`, không dùng màu xanh phẳng đơn thuần.
* Button, menu pill và điểm nhấn dùng màu đỏ `#EA0029`.
* Chữ trên button dùng màu trắng `#FFFFFF`.
* Tiêu đề Hero dùng màu trắng `#FFFFFF`.
* Cụm hình người + chai Betagen + dải sóng trong Hero dùng asset `public/images/01-section-hero/hero-main-visual.png`.
* Logo dùng asset `public/images/01-section-hero/logo-betagen.png`.
* Không cần tạo `wave-hero.png` riêng vì dải sóng đã nằm chung trong `hero-main-visual.png`.
* Nền và hiệu ứng sáng phải tái tạo radial gradient gần giống Figma.

---

### 3.2. Section 2 - Video upload + Thể lệ

Tham chiếu: `design-reference/blocks/02-section-video-rule.png`

Màu lấy từ Figma khi chọn `Section2`:

* Màu trắng: `#FFFFFF`
* Màu đen cho text nhỏ: `#000000`
* Màu xanh navy: `#354A93`
* Màu xanh chính: `#84D9FB`
* Có sử dụng `Image fill`
* Có sử dụng `Linear gradient`

Linear gradient nền Section 2:

* Stop 0%: `#84D9FB`
* Stop 21%: `#BEEBFD`
* Stop 100%: `#FFFFFF`

Cách dùng:

* Background Section 2 cần dùng linear gradient gần giống Figma: từ `#84D9FB` sang `#BEEBFD`, rồi chuyển về `#FFFFFF`.
* Khung video template ở giữa dùng màu xanh nhạt gần tông `#84D9FB`.
* Text mô tả nhỏ dưới nút dùng màu tối/đen `#000000`.
* Card thể lệ dùng nền xanh rất nhạt hoặc trắng xanh, bo góc mềm.
* Button trong thể lệ dùng đỏ `#EA0029`.
* Dải sóng trang trí Section 2 dùng asset `public/images/02-section-video-rule/wave-video-rule.png`.

---

### 3.3. Section 3 - Giải thưởng + Lưu ý

Tham chiếu: `design-reference/blocks/03-section-prize-note.png`

Màu lấy từ Figma khi chọn phần nền `Rectangle 1` trong Section 3:

* Màu trắng: `#FFFFFF`
* Màu xanh nhạt: `#84D9FB`
* Màu xanh navy: `#354A93`
* Màu đỏ chính: `#EA0029`
* Có sử dụng `Radial gradient`

Radial gradient nền Section 3:

* Stop 0%: `#FFFFFF`
* Stop 100%: `#84D9FB`

Cách dùng:

* Background chính của Section 3 dùng radial gradient từ `#FFFFFF` sang `#84D9FB`.
* Tiêu đề “GIẢI THƯỞNG HẤP DẪN” dùng màu xanh navy `#354A93`.
* Số thứ tự 1, 2, 3 dùng màu đỏ `#EA0029`.
* Text mô tả phần thưởng dùng màu xanh navy `#354A93` hoặc màu tối gần giống ảnh Figma.
* Box “LƯU Ý” dùng nền trắng nhẹ, gần `#FFFFFF`, có thể dùng opacity thấp nếu cần giống Figma.
* Dải sóng trang trí góc phải dưới dùng asset `public/images/03-section-prize-note/wave-prize-note.png`.

---

## 4. Font chữ

* Dùng font sans-serif.
* Ưu tiên font bo tròn, hiện đại, vui vẻ, gần giống thiết kế.
* Tiêu đề Hero cần rất đậm, chữ trắng, cỡ lớn.
* Button dùng chữ trắng, font đậm.
* Text phụ nhỏ hơn, dễ đọc.
* Không dùng font serif.
* Cỡ chữ, line-height, font-weight cần bám sát ảnh tham chiếu.
* Nếu không biết chính xác font trong Figma, dùng font gần giống nhất và đảm bảo giao diện nhìn sát thiết kế.

---

## 5. Button

Style button chung:

* Nền đỏ: `#EA0029`
* Chữ trắng: `#FFFFFF`
* Bo tròn dạng pill.
* Font chữ đậm.
* Padding ngang rộng, chiều cao thấp vừa giống Figma.
* Hover nhẹ, không làm khác phong cách gốc.

Các button cần có:

* Menu trên Header:

  * “Tạo video & Thể lệ”
  * “Giải thưởng”
  * “Lưu ý”

* Button Hero:

  * “TẠO VIDEO NGAY”

* Button upload/tạo video ở Section 2.

---

## 6. Section 1 - Hero

Tham chiếu: `design-reference/blocks/01-section-hero.png`

Yêu cầu layout:

* Logo Betagen nằm góc trên bên trái.
* Menu nằm góc trên bên phải, gồm các button đỏ bo tròn.
* Bên trái là cụm hình người + sản phẩm Betagen.
* Bên phải là tiêu đề lớn:

  * “VIVU TỐT BỤNG”
  * “TRÚNG QUÀ CỰC MÊ”
* Dưới tiêu đề có đoạn mô tả nhỏ.
* Có button “TẠO VIDEO NGAY”.
* Dải sóng đỏ / xanh navy / trắng chạy ngang phía dưới.
* Bố cục, kích thước hình, vị trí chữ phải bám sát ảnh Figma.
* Bắt buộc dùng asset thật đã export từ Figma trong `public/images/01-section-hero`.

Asset dùng trong Section 1:

* `public/images/01-section-hero/logo-betagen.png`
* `public/images/01-section-hero/hero-main-visual.png`

---

## 7. Section 2 - Video upload + Thể lệ

Tham chiếu: `design-reference/blocks/02-section-video-rule.png`

Yêu cầu layout:

* Phần trên là vùng video template nằm giữa section.
* Khung video template có nền xanh nhạt, bo góc.
* Đây là vùng người dùng bấm để upload ảnh cá nhân.
* Khi chưa chọn ảnh, hiển thị video template preview từ link R2.
* Icon upload dùng asset thật: `public/icons/upload.svg`.
* Sau khi chọn ảnh, hiển thị preview ảnh trong khung.
* Có nút upload/tạo video nằm dưới khung.
* Dưới nút có text hướng dẫn nhỏ.
* Phần “THỂ LỆ” nằm bên dưới dạng card lớn bo góc.
* Trong card thể lệ có các item nhỏ, button đỏ, text mô tả.
* Dải sóng trang trí Section 2 dùng asset: `public/images/02-section-video-rule/wave-video-rule.png`.
* Bố cục phải bám sát ảnh tham chiếu.

Chức năng:

* Người dùng bấm vào khung video template để chọn ảnh.
* Chỉ cho upload file ảnh: `jpg`, `jpeg`, `png`, `webp`.
* Sau khi chọn ảnh, hiển thị preview.
* Có nút “Tạo video”.
* Khi bấm tạo video, gọi API nội bộ `/api/create-video`.

Asset dùng trong Section 2:

* `public/images/02-section-video-rule/wave-video-rule.png`
* `public/icons/upload.svg`

---

## 8. Section 3 - Giải thưởng + Lưu ý

Tham chiếu: `design-reference/blocks/03-section-prize-note.png`

Yêu cầu layout:

* Tiêu đề “GIẢI THƯỞNG HẤP DẪN” nằm phía trên.
* Hiển thị 3 phần quà theo hàng ngang trên desktop.
* Mỗi phần quà có:

  * Số thứ tự màu đỏ
  * Tên phần quà
  * Ảnh phần thưởng
  * Icon quà nhỏ dùng asset thật: `public/icons/gift.svg`
* Phần “LƯU Ý” nằm cuối trang.
* Box lưu ý có nền trắng mờ nhẹ.
* Dải sóng trang trí góc phải dưới dùng asset: `public/images/03-section-prize-note/wave-prize-note.png`.
* Bố cục cần bám sát ảnh Figma.

Asset dùng trong Section 3:

* `public/images/03-section-prize-note/prize-headphone.png`
* `public/images/03-section-prize-note/prize-rice-cooker.png`
* `public/images/03-section-prize-note/prize-blender.png`
* `public/images/03-section-prize-note/wave-prize-note.png`
* `public/icons/gift.svg`

---

## 9. Asset

Asset thật dùng trong website nằm trong:

* `public/images`
* `public/icons`

Video template dùng link online từ Cloudflare R2, không bắt buộc lưu file video vào `public/videos`.

Cấu trúc asset hiện tại:

### Section 1 - Hero

* `public/images/01-section-hero/logo-betagen.png`
* `public/images/01-section-hero/hero-main-visual.png`

Cách dùng:

* `logo-betagen.png` dùng cho logo ở header.
* `hero-main-visual.png` dùng cho cụm người + chai Betagen + dải sóng ở Hero.
* Không cần `wave-hero.png` riêng vì dải sóng đã nằm trong `hero-main-visual.png`.

### Section 2 - Video upload + Thể lệ

* `public/images/02-section-video-rule/wave-video-rule.png`
* `public/icons/upload.svg`

Cách dùng:

* `wave-video-rule.png` dùng cho dải sóng trang trí Section 2.
* `upload.svg` dùng cho vùng upload ảnh cá nhân.

### Section 3 - Giải thưởng + Lưu ý

* `public/images/03-section-prize-note/prize-headphone.png`
* `public/images/03-section-prize-note/prize-rice-cooker.png`
* `public/images/03-section-prize-note/prize-blender.png`
* `public/images/03-section-prize-note/wave-prize-note.png`
* `public/icons/gift.svg`

Cách dùng:

* `prize-headphone.png` dùng cho phần thưởng tai nghe.
* `prize-rice-cooker.png` dùng cho phần thưởng nồi.
* `prize-blender.png` dùng cho phần thưởng máy xay.
* `wave-prize-note.png` dùng cho dải sóng trang trí góc dưới.
* `gift.svg` dùng cho icon quà nhỏ cạnh phần thưởng.

### Videos

Video template preview đang dùng link online từ Cloudflare R2:

* `https://pub-1952482ddc0e4ce780169f9161b582bb.r2.dev/videopublic/Betagen%205s.mp4`

Quy tắc:

* Không bắt buộc lưu video vào `public/videos` vì video đã được host online trên R2.
* Khi code, dùng link R2 này để hiển thị video template preview trong khung upload.
* Tạo constant `TEMPLATE_VIDEO_URL` trong `lib/constants.ts`.
* Tạo constant `TEMPLATE_ID` trong `lib/constants.ts`.
* Khi người dùng bấm tạo video, gửi `template_id` và nếu cần thì gửi thêm `template_video_url` sang API `/api/create-video`.

Đường dẫn asset trong code dùng dạng:

* `/images/01-section-hero/logo-betagen.png`
* `/images/01-section-hero/hero-main-visual.png`
* `/images/02-section-video-rule/wave-video-rule.png`
* `/images/03-section-prize-note/prize-headphone.png`
* `/images/03-section-prize-note/prize-rice-cooker.png`
* `/images/03-section-prize-note/prize-blender.png`
* `/images/03-section-prize-note/wave-prize-note.png`
* `/icons/upload.svg`
* `/icons/gift.svg`

Quy tắc bắt buộc:

* Bắt buộc dùng asset đã export từ Figma.
* Không tự thay ảnh khác nếu đã có asset trong `public`.
* Không tự lấy ảnh/icon trên mạng để thay thế.
* Nếu thiếu asset nào thì phải báo thiếu asset đó.
* `design-reference/pages` và `design-reference/blocks` chỉ dùng để tham chiếu layout.
* Không dùng ảnh trong `design-reference` làm giao diện chính.

---

## 10. Chức năng upload video và gọi n8n

Luồng chức năng:

1. Người dùng vào landing page.
2. Người dùng bấm vào khung video template.
3. Người dùng upload ảnh cá nhân.
4. Website hiển thị preview ảnh.
5. Người dùng bấm “Tạo video”.
6. Frontend gọi API nội bộ `/api/create-video`.
7. API route trong Next.js gọi webhook n8n từ biến môi trường `N8N_WEBHOOK_URL`.
8. n8n xử lý và trả về JSON có `video_url`.
9. Website hiển thị loading trong lúc chờ.
10. Khi có `video_url`, hiển thị nút “Tải video”.
11. Có thể tự động mở link video hoặc cho người dùng bấm tải.

Yêu cầu kỹ thuật:

* Không gọi trực tiếp webhook n8n từ frontend.
* Không dùng backend Python/FastAPI.
* Tạo API route tại `app/api/create-video/route.ts`.
* Tạo hàm gọi API trong `lib/api.ts`.
* Tạo constant trong `lib/constants.ts`:

```ts
export const TEMPLATE_VIDEO_URL =
  "https://pub-1952482ddc0e4ce780169f9161b582bb.r2.dev/videopublic/Betagen%205s.mp4";

export const TEMPLATE_ID = "betagen-template-01";
```

* API nhận `image`, `template_id` và nếu cần thì nhận thêm `template_video_url`.
* API gọi webhook n8n qua biến môi trường `N8N_WEBHOOK_URL`.
* API trả về JSON dạng:

```json
{
  "success": true,
  "video_url": "https://example.com/result-video.mp4"
}
```

---

## 11. Responsive

Desktop:

* Phải giống Figma nhất có thể.
* Bám sát ảnh tham chiếu `design-reference/pages/home-desktop.png`.
* Bám sát 3 ảnh section trong `design-reference/blocks`.

Mobile:

* Cho phép các phần xếp dọc.
* Không vỡ layout.
* Text dễ đọc.
* Khung video upload vẫn nổi bật.
* Ảnh sản phẩm và ảnh giải thưởng co giãn hợp lý.
* Button dễ bấm.

---

## 12. Lưu ý khi code

* Không hardcode webhook n8n trong frontend.
* Webhook n8n chỉ nằm trong `.env.local` với biến `N8N_WEBHOOK_URL`.
* Không dùng ảnh full page làm giao diện chính.
* Không bỏ qua section nào trong thiết kế.
* Không tự đổi phong cách thiết kế.
* Không tự thay asset Figma bằng ảnh khác.
* Không cần lưu file video template vào `public/videos` vì đã có link online R2.
* Ưu tiên giống Figma hơn là tự sáng tạo giao diện mới.
* Nếu cần tạo thêm component, vẫn phải giữ đúng layout theo Figma.
