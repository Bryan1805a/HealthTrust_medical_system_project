// Dòng 1: Đổi thư viện import (Dùng 'Transaction' thay vì 'TransactionBlock')
import { Transaction } from "@mysten/sui/transactions"; 
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "./config";

export function CreateProfile({ onCreated }: { onCreated: () => void }) {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const createRecord = () => {
    if (!account) return;

    // Dòng 12: Đổi tên class khởi tạo
    const txb = new Transaction(); 

    // Các phần dưới giữ nguyên
    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_profile`,
      arguments: [], 
    });

    signAndExecuteTransaction(
      {
        transaction: txb,
      },
      {
        onSuccess: (result) => {
          console.log("Thành công!", result);
          alert("Đã tạo hồ sơ bệnh án thành công!");
          onCreated(); 
        },
        onError: (err) => {
          console.error("Lỗi:", err);
          alert("Có lỗi xảy ra: " + err.message);
        },
      }
    );
  };

  if (!account) return <div>Vui lòng kết nối ví để tạo hồ sơ</div>;

  return (
    <div style={{ padding: 20, border: "1px solid #ccc", marginTop: 20 }}>
      <h3>Bạn chưa có hồ sơ y tế?</h3>
      <button 
        onClick={createRecord}
        style={{ padding: "10px 20px", background: "#007bff", color: "white", border: "none", cursor: "pointer" }}
      >
        Tạo Hồ Sơ Bệnh Án Mới
      </button>
    </div>
  );
}