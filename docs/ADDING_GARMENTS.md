# Hướng Dẫn Thêm & Đồng Bộ Ảnh Trang Phục Vào VIỆT PHỤC REMIX
*(Curated Garment Image Integration Guide)*

Tài liệu này hướng dẫn cách bổ sung ảnh thật cho các trang phục và phụ kiện truyền thống trong Thư viện Di sản của ứng dụng **VIỆT PHỤC REMIX**.

Dữ liệu di sản gồm 77 trang phục chuẩn hóa được lưu trữ tập trung tại:
```text
src/data/viet_phuc_remix_normalized_catalog_v2.json
```
Bạn **không cần** thêm thủ công đối tượng vào mã nguồn `mockHeritageData.ts`. Quy trình nạp ảnh diễn ra tự động thông qua script đồng bộ.

---

## 1. Nơi Đặt Tệp Hình Ảnh (Image Location)

Đặt tất cả các tệp hình ảnh vào thư mục công khai:

```text
public/assets/garments/
```

- Định dạng hỗ trợ: `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`.
- Ảnh trang phục nên có nền sáng ngà (`#FBF9F4` hoặc `#F5F4EF`) hoặc nền trong suốt (PNG/SVG/WEBP) với phom dáng chuẩn mực, tỉ lệ cân đối.
- URL phục vụ tương ứng trên trình duyệt: `/assets/garments/<tên-file>`.

---

## 2. Quy Chuẩn Đặt Tên Tệp (File Naming Convention)

Tên tệp hình ảnh (phần trước phần mở rộng) **bắt buộc phải trùng khớp chính xác với `item.id`** của trang phục trong catalog:

```text
<item.id>.<ext>
```

### Ví dụ minh họa:
- `item-ao-ngu-than.png` (khớp với trang phục `item-ao-ngu-than`)
- `item-quan-dai-ngu-than.jpg` (khớp với trang phục `item-quan-dai-ngu-than`)
- `item-khan-dong.webp` (khớp với trang phục `item-khan-dong`)
- `item-ao-tu-than.png` (khớp với trang phục `item-ao-tu-than`)
- `item-yem-bac-bo.svg` (khớp với trang phục `item-yem-bac-bo`)

*Gợi ý:* Bạn có thể tham khảo danh sách tên tệp gợi ý trong mảng `imageImportTemplate` nằm ở cuối tệp `src/data/viet_phuc_remix_normalized_catalog_v2.json`.

---

## 3. Quy Trình Đồng Bộ Ảnh (Sync Workflow)

Sau khi đưa ảnh vào thư mục, thực hiện quy trình sau:

1. **Bước 1 — Bỏ ảnh vào thư mục:**
   Sao chép các file ảnh đã đặt tên đúng quy ước vào `public/assets/garments/`.

2. **Bước 2 — Chạy lệnh đồng bộ:**
   Chạy lệnh sau tại thư mục gốc dự án:
   ```bash
   npm run sync-images
   ```

3. **Bước 3 — Kiểm tra kết quả:**
   Script `scripts/sync-garment-images.mjs` sẽ:
   - Quét thư mục `public/assets/garments/`.
   - Ghép tên file (bỏ đuôi) với `item.id` trong `src/data/viet_phuc_remix_normalized_catalog_v2.json`.
   - Nếu khớp: cập nhật `image_path = imageUrl = "/assets/garments/<file>"` cho item và cập nhật `imageImportTemplate`.
   - Nếu không có ảnh: đặt `image_path = null` (ứng dụng sẽ tự động hiển thị placeholder SVG nhã nhặn).
   - In ra thông báo: `Gắn ảnh cho X/77 item` và liệt kê các tệp trong thư mục không khớp với bất kỳ `item.id` nào.

4. **Bước 4 — Hiển thị trên ứng dụng:**
   Trong `src/data/mockHeritageData.ts`, khi `item.image_path` là đường dẫn hợp lệ, hệ thống sẽ ưu tiên hiển thị ảnh thật của trang phục trên toàn bộ giao diện: Thư viện (Heritage Library), Phòng thử đồ (Styling Studio), Sàn diễn (Runway), và Chi tiết văn hóa.

---

## 4. Quy Chuẩn Đạo Đức Văn Hóa & Kiểm Chứng (Cultural Confidence)

- **Trường `source_verification`:** Mọi trang phục đều gắn liền với tư liệu lịch sử hoặc bảo tàng đã được khảo cứu.
- **Khi chưa đủ nguồn kiểm chứng:** Giữ nguyên trạng thái `Chưa có thông tin xác minh`, không tự ý thêm các khẳng định văn hóa chưa được đối chiếu.
- **Tính chuẩn mực trang phục:** Ảnh phục dựng hoặc ảnh chụp hiện vật cần tôn trọng kiểu dáng, hoa văn truyền thống của từng tộc người / thời kỳ lịch sử.
