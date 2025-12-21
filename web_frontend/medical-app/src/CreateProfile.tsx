import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions"; 
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "./config";
import toast from 'react-hot-toast';
import { UserPlus, Loader2 } from "lucide-react";

export function CreateProfile({ onCreated }: { onCreated: () => void }) {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [isCreating, setIsCreating] = useState(false);

  const createRecord = () => {
    if (!account) {
      toast.error("Vui lòng kết nối ví để tạo hồ sơ");
      return;
    }

    if (!PACKAGE_ID || PACKAGE_ID === "YOUR_PACKAGE_ID_HERE") {
      toast.error("Chưa cấu hình PACKAGE_ID. Vui lòng cập nhật trong config.ts");
      return;
    }

    setIsCreating(true);
    const loadingToast = toast.loading("Đang tạo hồ sơ bệnh án...");

    const txb = new Transaction(); 
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
          toast.success("Đã tạo hồ sơ bệnh án thành công!", { id: loadingToast });
          setIsCreating(false);
          onCreated(); 
        },
        onError: (err) => {
          console.error("Lỗi:", err);
          toast.error("Có lỗi xảy ra: " + err.message, { id: loadingToast });
          setIsCreating(false);
        },
      }
    );
  };

  if (!account) {
    return (
      <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '40px' }}>
        <p className="text-muted">Vui lòng kết nối ví để tạo hồ sơ</p>
      </div>
    );
  }

  return (
    <div className="glass-card fade-in" style={{ maxWidth: 500, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <UserPlus size={48} color="var(--primary-color)" style={{ marginBottom: 16 }} />
        <h2 className="text-highlight" style={{ marginBottom: 10 }}>Tạo hồ sơ y tế mới</h2>
        <p className="text-muted">
          Bạn chưa có hồ sơ bệnh án trên hệ thống. Hãy tạo một hồ sơ mới để bắt đầu sử dụng dịch vụ.
        </p>
      </div>

      <button 
        className="btn-primary"
        onClick={createRecord}
        disabled={isCreating}
        style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
      >
        {isCreating ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Đang tạo hồ sơ...
          </>
        ) : (
          <>
            <UserPlus size={20} />
            Tạo Hồ Sơ Bệnh Án Mới
          </>
        )}
      </button>

      <p className="text-muted" style={{ marginTop: 20, fontSize: '0.85em', textAlign: 'center' }}>
        ⚠️ Lưu ý: Hồ sơ sẽ được lưu trữ trên blockchain Sui và thuộc quyền sở hữu của bạn.
      </p>
    </div>
  );
}