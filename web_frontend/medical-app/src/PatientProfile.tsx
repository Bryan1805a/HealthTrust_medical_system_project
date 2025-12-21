import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "./config";

export function PatientProfile() {
  const account = useCurrentAccount();

  // 1. Tự động tìm object MedicalRecord trong ví user
  const { data, isLoading, error, refetch } = useSuiClientQuery(
    "getOwnedObjects", // Tên hàm API của SUI
    {
      owner: account?.address as string,
      filter: {
        // Chỉ tìm đúng loại object MedicalRecord của project mình
        StructType: `${PACKAGE_ID}::${MODULE_NAME}::MedicalRecord`,
      },
      options: {
        showContent: true, // Lấy cả nội dung bên trong
      },
    },
    {
      enabled: !!account, // Chỉ chạy khi đã kết nối ví
    }
  );

  if (!account) return null;
  if (isLoading) return <div>Đang tải hồ sơ...</div>;
  if (error) return <div>Lỗi: {error.message}</div>;

  // 2. Kiểm tra xem có tìm thấy cái nào không
  if (!data || data.data.length === 0) {
    return <div style={{ color: "gray" }}>Chưa tìm thấy hồ sơ nào.</div>;
  }

  // Lấy object đầu tiên tìm được
  const record = data.data[0];
  const recordId = record.data?.objectId;

  return (
    <div style={{ padding: 20, border: "1px solid green", marginTop: 20, borderRadius: 8 }}>
      <h3 style={{ color: "green" }}>✅ Hồ sơ bệnh nhân hợp lệ</h3>
      <p><strong>Mã hồ sơ (ID):</strong> {recordId}</p>
      <p><strong>Chủ sở hữu:</strong> Bạn (Ví {account.address.slice(0, 6)}...)</p>
      
      {/* Nút refresh để reload dữ liệu nếu cần */}
      <button onClick={() => refetch()} style={{ marginTop: 10 }}>
        Cập nhật dữ liệu
      </button>
    </div>
  );
}