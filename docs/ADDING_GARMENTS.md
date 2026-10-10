# Hướng Dẫn Thêm Ảnh Trang Phục Vào VIỆT PHỤC REMIX
*(Curated Garment Image Integration Guide)*

Tài liệu này hướng dẫn cách bổ sung ảnh thật cho các trang phục và phụ kiện truyền thống trong Thư viện Di sản của ứng dụng **VIỆT PHỤC REMIX** (Việt Phục 5.0).

Hệ thống sử dụng cơ chế **tự động nhận diện ảnh (Auto-Detection Vite Plugin)**, người dùng chỉ cần bỏ ảnh vào đúng thư mục và đặt tên theo quy chuẩn là ảnh sẽ tự động hiển thị ngay trên ứng dụng mà **không cần chạy bất kỳ câu lệnh nào**.

Dữ liệu di sản gồm 77 trang phục chuẩn hóa được lưu trữ tập trung tại:
```text
src/data/viet_phuc_remix_normalized_catalog_v2.json
```

---

## 1. Nơi Đặt Tệp Hình Ảnh (Image Location)

Đặt tất cả các tệp hình ảnh vào thư mục công khai:

```text
public/assets/garments/
```

- **Định dạng hỗ trợ:** `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`.
- **Quy cách khuyến nghị:** Ảnh trang phục nên có nền sáng ngà (`#FBF9F4` hoặc `#F5F4EF`) hoặc nền trong suốt (PNG/WEBP/SVG) với phom dáng chuẩn mực, tỉ lệ cân đối, chi tiết hoa văn sắc nét.
- URL phục vụ tương ứng trên trình duyệt: `/assets/garments/<tên-file>`.

---

## 2. Quy Chuẩn Đặt Tên Tệp (File Naming Convention)

Tên tệp hình ảnh (phần trước phần mở rộng) **bắt buộc phải trùng khớp chính xác với `item.id`** của trang phục trong catalog:

```text
<item.id>.<ext>
```

### Ví dụ minh họa:
- `item-ao-ngu-than.png` (khớp với trang phục `item-ao-ngu-than`)
- `item-quan-dai-ngu-than.png` (khớp với trang phục `item-quan-dai-ngu-than`)
- `item-khan-dong.png` (khớp với trang phục `item-khan-dong`)
- `item-khan-van-ngu-than.png` (khớp với trang phục `item-khan-van-ngu-than`)
- `item-ao-tu-than.png` (khớp với trang phục `item-ao-tu-than`)
- `item-yem-bac-bo.webp` (khớp với trang phục `item-yem-bac-bo`)

*Gợi ý:* Bạn có thể tra cứu nhanh danh sách `item.id` và tên file gợi ý trong mảng `imageImportTemplate` nằm ở cuối tệp `src/data/viet_phuc_remix_normalized_catalog_v2.json`.

---

## 3. Quy Trình Thêm Ảnh (Hoàn Toàn Tự Động)

Quy trình nạp ảnh diễn ra tự động 100%:

1. **Bước 1:** Chuẩn bị file ảnh trang phục hoặc hiện vật khảo cứu.
2. **Bước 2:** Đổi tên file theo đúng `item.id` (ví dụ `item-ao-ngu-than.png`).
3. **Bước 3:** Thả file ảnh vào thư mục `public/assets/garments/`.
4. **Kết quả:**
   - **Tự động nhận diện:** Vite plugin (`garmentImagesPlugin`) thông qua virtual module `virtual:garment-images` sẽ tự động quét thư mục và ánh xạ ảnh tới trang phục tương ứng.
   - **Tự động cập nhật:** Ở chế độ dev, watcher theo dõi thư mục `public/assets/garments/` và tự động gửi tín hiệu full-reload cho trình duyệt ngay khi bạn thêm, xoá hoặc đổi tên file ảnh — không cần khởi động lại server.
   - **Không cần chạy lệnh:** Không cần chạy `sync-images` hay bất kỳ lệnh nào.
   - **Cảnh báo lỗi chính tả:** Nếu tên file ảnh không khớp với bất kỳ `item.id` nào trong catalog, console dev sẽ tự động in cảnh báo (warning) để bạn phát hiện kịp thời.

---

## 4. Thứ Tự Ưu Tiên Hiển Thị Ảnh (Image Fallback Strategy)

Trong `src/data/mockHeritageData.ts`, hệ thống áp dụng thứ tự ưu tiên 3 cấp:

1. **Ưu tiên 1:** Ảnh tìm thấy từ virtual module `virtual:garment-images` (khớp theo tên file trong `public/assets/garments/`).
2. **Ưu tiên 2:** Đường dẫn `item.image_path` nếu có khai báo trong JSON.
3. **Ưu tiên 3:** SVG Placeholder trung tính, mỹ thuật di sản Việt Nam (`createNeutralPlaceholder`) được tự động sinh dựa trên nhóm trang phục và hoa văn đặc trưng.

---

## 5. Quy Chuẩn Đạo Đức Văn Hóa & Kiểm Chứng (Cultural Confidence)

- **Trường `source_verification`:** Mọi trang phục đều gắn liền với tư liệu lịch sử hoặc bảo tàng đã được khảo cứu.
- **Khi chưa đủ nguồn kiểm chứng:** Giữ nguyên trạng thái `Chưa có thông tin xác minh`, không tự ý thêm các khẳng định văn hóa chưa được đối chiếu.
- **Tính chuẩn mực trang phục:** Ảnh phục dựng hoặc ảnh chụp hiện vật cần tôn trọng kiểu dáng, hoa văn truyền thống của từng tộc người / thời kỳ lịch sử.
