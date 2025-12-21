import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "./config";

// Component nhận vào ID của DoctorCap (Chứng minh thư bác sĩ)
export function DoctorDashboard({ doctorCapId }: { doctorCapId: string }) {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // State lưu dữ liệu form
  const [patientId, setPatientId] = useState("");
  const [medName, setMedName] = useState("");
  const [ipfsHash, setIpfsHash] = useState("QmDemoHash..."); // Giả lập Hash IPFS

  const createPrescription = () => {
    if (!account || !patientId || !medName) {
      alert("Vui lòng nhập đủ thông tin!");
      return;
    }

    const txb = new Transaction();

    // --- KỸ THUẬT CHUYỂN ĐỔI DỮ LIỆU ---
    // Move nhận vector<u8>, nên ta phải encode chuỗi String sang mảng số
    const nameBytes = new TextEncoder().encode(medName);
    const ipfsBytes = new TextEncoder().encode(ipfsHash);

    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_prescription`,
      arguments: [
        txb.object(doctorCapId),     // 1. Phải đưa thẻ bác sĩ ra check
        txb.pure.address(patientId), // 2. Địa chỉ bệnh nhân
        txb.pure.vector("u8", nameBytes), // 3. Tên thuốc (đã convert)
        txb.pure.vector("u8", ipfsBytes), // 4. Hash (đã convert)
      ],
    });

    signAndExecuteTransaction(
      { transaction: txb },
      {
        onSuccess: (result) => {
          console.log("Kê đơn thành công:", result);
          alert("Đã gửi đơn thuốc cho bệnh nhân!");
          // Reset form
          setMedName("");
        },
        onError: (err) => {
          console.error(err);
          alert("Lỗi: " + err.message);
        },
      }
    );
  };

  return (
    <div style={{ padding: 20, border: "2px solid #007bff", borderRadius: 8, background: "#f0f8ff" }}>
      <h2 style={{ color: "#007bff" }}>👨‍⚕️ Bàn làm việc Bác sĩ</h2>
      <p><i>Đang đăng nhập bằng thẻ hành nghề: {doctorCapId.slice(0, 10)}...</i></p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 400 }}>
        <input 
          placeholder="Địa chỉ ví bệnh nhân (0x...)" 
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          style={{ padding: 10 }}
        />
        
        <input 
          placeholder="Tên đơn thuốc (VD: Thuốc trị cảm)" 
          value={medName}
          onChange={(e) => setMedName(e.target.value)}
          style={{ padding: 10 }}
        />

        <input 
          placeholder="Mã IPFS (Tạm thời điền gì cũng được)" 
          value={ipfsHash}
          onChange={(e) => setIpfsHash(e.target.value)}
          style={{ padding: 10 }}
        />

        <button 
          onClick={createPrescription}
          style={{ padding: 10, background: "#007bff", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" }}
        >
          ✍️ Ký & Gửi Đơn Thuốc
        </button>
      </div>
    </div>
  );
}