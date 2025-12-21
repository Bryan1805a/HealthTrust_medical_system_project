# Hướng dẫn Deploy Contract và Cấu hình Frontend

## Bước 1: Deploy Contract lên Sui Testnet

1. **Di chuyển vào thư mục contract:**
   ```bash
   cd sui_contracts/medical_system
   ```

2. **Kiểm tra cấu hình Sui CLI:**
   ```bash
   sui client active-address
   sui client active-env
   ```
   Đảm bảo bạn đang ở môi trường `testnet`.

3. **Nếu chưa có testnet, thêm testnet:**
   ```bash
   sui client env add testnet https://fullnode.testnet.sui.io:443
   sui client switch --env testnet
   ```

4. **Lấy testnet SUI tokens (nếu cần):**
   - Truy cập: https://discord.com/channels/916379725201563759/971488439931392010
   - Hoặc faucet: https://docs.sui.io/testnet/faucet

5. **Deploy contract:**
   ```bash
   sui client publish --gas-budget 100000000
   ```

6. **Lưu lại thông tin từ output:**
   - Tìm dòng `Published Objects:` hoặc `PackageID:`
   - Copy `PACKAGE_ID` (sẽ có dạng `0x...`)
   - Tìm `Lobby` object ID trong phần `Created Objects:` (sẽ có dạng `0x...`)

## Bước 2: Cập nhật Config Frontend

1. **Mở file `web_frontend/medical-app/src/config.ts`**

2. **Cập nhật các giá trị:**
   ```typescript
   export const PACKAGE_ID = "0x..."; // Thay bằng PACKAGE_ID từ bước 1
   export const LOBBY_ID = "0x...";   // Thay bằng Lobby object ID từ bước 1
   ```

3. **Lưu file**

## Bước 3: Tìm Lobby Object ID (Nếu chưa có)

Nếu bạn không thấy Lobby ID trong output deploy, có thể tìm bằng cách:

```bash
# Tìm tất cả objects của package
sui client objects --json | grep -i lobby

# Hoặc query trực tiếp
sui client object <YOUR_LOBBY_ID> --json
```

Hoặc trong frontend, bạn có thể query shared objects:
```typescript
// Trong browser console hoặc component
const { data } = useSuiClientQuery("getOwnedObjects", {
  owner: "0x0000000000000000000000000000000000000000000000000000000000000000", // Shared object
  filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::Lobby` }
});
```

## Bước 4: Chạy Frontend

1. **Di chuyển vào thư mục frontend:**
   ```bash
   cd web_frontend/medical-app
   ```

2. **Cài đặt dependencies (nếu chưa có):**
   ```bash
   npm install
   ```

3. **Chạy dev server:**
   ```bash
   npm run dev
   ```

4. **Mở trình duyệt:** http://localhost:5173 (hoặc port được hiển thị)

## Bước 5: Kiểm tra hoạt động

1. **Kết nối ví Sui Wallet** (cần có testnet SUI)
2. **Tạo hồ sơ bệnh nhân** - Kiểm tra xem có tạo được MedicalRecord không
3. **Đăng ký khám** - Kiểm tra hàm `register_for_examination`
4. **Tạo đơn thuốc** (nếu có DoctorCap) - Kiểm tra hàm `create_prescription`

## Troubleshooting

### Lỗi: "Package ID not found"
- Đảm bảo đã deploy contract thành công
- Kiểm tra PACKAGE_ID trong config.ts có đúng không
- Đảm bảo đang kết nối đúng network (testnet)

### Lỗi: "Lobby ID not found"
- Kiểm tra LOBBY_ID trong config.ts
- Đảm bảo Lobby object đã được tạo khi deploy
- Thử query lại Lobby object từ blockchain

### Lỗi: "Insufficient gas"
- Đảm bảo ví có đủ SUI tokens trên testnet
- Lấy thêm từ faucet nếu cần

### Lỗi: "Object not found"
- Kiểm tra object ID có đúng không
- Đảm bảo object thuộc về địa chỉ ví đang kết nối

## Cấu trúc Contract

Contract mới bao gồm:
- `DoctorCap`: Capability cho bác sĩ
- `MedicalRecord`: Hồ sơ bệnh nhân (có `record_data: String`)
- `Prescription`: Đơn thuốc (có `name: String`, `medication_hash: String`)
- `Lobby`: Sảnh chờ (shared object chứa danh sách bệnh nhân)

## Các hàm chính

1. `create_profile()` - Tạo hồ sơ bệnh nhân
2. `register_for_examination(lobby)` - Đăng ký khám
3. `create_prescription(doctor_cap, patient_addr, name, medication_hash)` - Tạo đơn thuốc
4. `use_prescription(prescription)` - Đánh dấu đơn thuốc đã dùng

