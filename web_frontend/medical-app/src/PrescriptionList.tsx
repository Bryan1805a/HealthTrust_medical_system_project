import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "./config";

export function PrescriptionList() {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // 1. Tìm tất cả object là Prescription của user này
  const { data, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::Prescription` },
      options: { showContent: true }, // Quan trọng: Lấy nội dung chi tiết
    },
    { enabled: !!account }
  );

  // Hàm xử lý khi bấm "Mua thuốc"
  const usePrescription = (prescriptionId: string) => {
    const txb = new Transaction();
    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::use_prescription`,
      arguments: [txb.object(prescriptionId)],
    });

    signAndExecuteTransaction(
      { transaction: txb },
      {
        onSuccess: () => {
            alert("Đã mua thuốc thành công!");
            refetch(); // Reload lại danh sách
        },
        onError: (e) => alert(e.message),
      }
    );
  };

  if (!data || data.data.length === 0) return <p><i>Bạn chưa có đơn thuốc nào.</i></p>;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>💊 Đơn thuốc của bạn</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {data.data.map((item: any) => {
            const fields = item.data?.content?.fields;
            if (!fields) return null;

            return (
                <div key={item.data.objectId} style={{ 
                    border: "1px solid #ddd", 
                    padding: 15, 
                    borderRadius: 8,
                    background: fields.is_used ? "#f0f0f0" : "#e6fffa" // Xám nếu đã dùng, Xanh nếu chưa
                }}>
                    <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>
                        {fields.name} {/* Tên thuốc */}
                    </div>
                    <div style={{ fontSize: "0.9em", color: "gray", marginBottom: 10 }}>
                        Bác sĩ kê: {fields.doctor_id.slice(0, 6)}...
                    </div>
                    
                    {fields.is_used ? (
                        <span style={{ color: "gray", fontWeight: "bold" }}>🚫 Đã sử dụng</span>
                    ) : (
                        <button 
                            onClick={() => usePrescription(item.data.objectId)}
                            style={{ background: "green", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}
                        >
                            ✅ Mua thuốc
                        </button>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
}