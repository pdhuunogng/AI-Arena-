# Hướng Dẫn Thêm Trang Phục Mới Vào VIỆT PHỤC REMIX
*(Curated Garment Asset Integration Guide)*

Tài liệu này hướng dẫn cách bổ sung trang phục và phụ kiện truyền thống vào Thư viện Di sản (Heritage Library) của ứng dụng **VIỆT PHỤC REMIX** mà không cần sửa đổi mã nguồn giao diện React.

---

## 1. Nơi Đặt Tệp Hình Ảnh (Image Location)

Đặt các tệp hình ảnh hoặc đồ họa trang phục vào thư mục công khai:

```text
public/assets/garments/
```

- Định dạng hỗ trợ: `.svg`, `.png`, `.jpg`, `.webp`.
- Ảnh trang phục nên có nền sáng ngà (`#FBF9F4` hoặc `#F5F4EF`) hoặc nền trong suốt (PNG/SVG) với phom dáng chuẩn mực, tỉ lệ cân đối.

---

## 2. Quy Chuẩn Đặt Tên Tệp (File Naming Convention)

Tên tệp phải tuân theo cú pháp kebab-case mô tả:
`[dân-tộc-hoặc-triều-đại]-[tiểu-nhóm]-[tên-món]-[số-thứ-tự].[ext]`

**Ví dụ:**
- `thai-trang-ao-com-001.svg`
- `kinh-hat-non-ba-tam-001.svg`
- `hmong-hoa-vay-lanh-002.png`
- `cham-aw-cam-trang-001.webp`

---

## 3. Khai Báo Bản Ghi Dữ Liệu (Metadata Record)

Mở tệp:
```text
src/data/mockHeritageData.ts
```

Thêm một đối tượng `CostumeItem` vào mảng `MOCK_HERITAGE_ITEMS`:

```typescript
{
  id: 'thai-trang-ao-com-001',
  name: 'Áo cóm cổ tim hàng khuy bướm bạc',
  image_url: '/assets/garments/thai-trang-ao-com-001.svg',
  slot: 'top',
  category: 'Áo', // Một trong 8 phân loại: 'Áo' | 'Quần' | 'Váy' | 'Khăn' | 'Mũ' | 'Giày' | 'Trang sức' | 'Phụ kiện'
  ethnic_group: 'Thái',
  subgroup: 'Thái Trắng',
  period_or_region: 'Tây Bắc (Sơn La, Điện Biên)',
  color_hex: '#F5F0E8',
  material: 'Lụa dệt tự nhiên, hàng khuy bạc chạm khắc hình bướm',
  pattern_description: 'Cổ tim khoét thanh thoát, hàng khuy bướm bạc đính dọc nẹp áo tượng trưng cho sự sinh sôi.',
  cultural_significance: 'Y phục duyên dáng của phụ nữ Thái vùng Tây Bắc, ôm sát tôn nét thon thả và sự tinh tế.',
  source_verification: 'Bảo tàng Dân tộc học Việt Nam & Di sản Văn hóa Thái',
  ritual_level: 'festive', // 'daily' | 'festive' | 'sacred_ritual'
  cross_cultural_flag: true, // true nếu cho phép phối giao thoa / cách tân
  gender_affinity: 'nu' // 'nu' | 'nam' | 'all'
}
```

---

## 4. Cách Thư Viện Tự Động Nhận Diện & Hiển Thị (Auto-Discovery)

Khi bạn lưu tệp dữ liệu:
1. **Phân loại tự động theo 8 danh mục:** Món đồ tự động xuất hiện trong thẻ **Items** tương ứng (`Áo`, `Quần`, `Váy`, `Khăn`, `Mũ`, `Giày`, `Trang sức`, `Phụ kiện`) trên màn hình Thư viện Di sản.
2. **Bộ phối Studio:** Khi người dùng nhấn vào ô slot tương ứng trong **Styling Studio**, ngăn kéo chọn đồ sẽ tự động lọc và gợi ý món đồ mới này.
3. **Bộ lọc văn hóa & tìm kiếm:** Bộ lọc dân tộc, vùng miền và thanh tìm kiếm tự động lập chỉ mục cho món đồ mới.
4. **AI Cố vấn:** Cả công cụ AI (Gemini) và engine quy tắc di sản nội tại đều tự động đưa món đồ vào kho tri thức để gợi ý phối đồ.

---

## 5. Quy Chuẩn Đạo Đức Văn Hóa & Kiểm Chứng (Cultural Confidence)

- **Trường `source_verification`:** Chỉ ghi tên tài liệu/bảo tàng khi thông tin đã được khảo cứu chính xác (ví dụ: *Ngàn Năm Áo Mũ*, *Khâm Định Đại Nam Hội Điển Sự Lệ*, *Bảo tàng Dân tộc học Việt Nam*).
- **Khi chưa đủ nguồn kiểm chứng:** BẮT BUỘC ghi rõ cụm từ:
  ```typescript
  source_verification: "Chưa có thông tin xác minh"
  ```
- **Trang phục tế tự (`ritual_level: 'sacred_ritual'`):** Chỉ áp dụng cho y phục thiêng liêng (như Khăn chầu áo ngự Tam Phủ, áo tế tự...). Hệ thống sẽ tự động kích hoạt **Hard Constraint** ngăn cản việc đem món đồ này đi phối đồ dạo phố/thế tục.
