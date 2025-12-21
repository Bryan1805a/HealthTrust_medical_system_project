import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME, LOBBY_ID } from "./config";
import toast from 'react-hot-toast';
import { Calendar, RefreshCw } from "lucide-react";

export function PatientProfile() {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [isRegistering, setIsRegistering] = useState(false);

  // 1. Tự động tìm object MedicalRecord trong ví user
  const { data, isLoading, error, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
      filter: {
        StructType: `${PACKAGE_ID}::${MODULE_NAME}::MedicalRecord`,
      },
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!account,
    }
  );

  // Hàm đăng ký khám
  const registerForExamination = () => {
    if (!account || !LOBBY_ID || LOBBY_ID === "YOUR_LOBBY_ID_HERE") {
      toast.error("Chưa cấu hình LOBBY_ID. Vui lòng cập nhật trong config.ts");
      return;
    }

    setIsRegistering(true);
    const loadingToast = toast.loading("Đang đăng ký khám...");

    const txb = new Transaction();
    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::register_for_examination`,
      arguments: [txb.object(LOBBY_ID)],
    });

    signAndExecuteTransaction(
      { transaction: txb },
      {
        onSuccess: () => {
          toast.success("Đã đăng ký khám thành công!", { id: loadingToast });
          setIsRegistering(false);
        },
        onError: (err) => {
          toast.error("Lỗi: " + err.message, { id: loadingToast });
          setIsRegistering(false);
        },
      }
    );
  };

  if (!account) return null;
  if (isLoading) return <div className="text-muted">Đang tải hồ sơ...</div>;
  if (error) return <div className="text-muted">Lỗi: {error.message}</div>;

  // 2. Kiểm tra xem có tìm thấy cái nào không
  if (!data || data.data.length === 0) {
    return <div className="text-muted">Chưa tìm thấy hồ sơ nào.</div>;
  }

  // Lấy object đầu tiên tìm được
  const record = data.data[0];
  const recordId = record.data?.objectId;
  const recordData = record.data?.content?.fields?.record_data || "Chưa có dữ liệu";

  return (
    <div className="glass-card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="text-highlight" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Calendar size={24} /> Hồ sơ bệnh nhân
        </h2>
        <button 
          className="btn-primary" 
          onClick={() => refetch()}
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          <RefreshCw size={16} /> Cập nhật
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <p className="text-muted" style={{ marginBottom: 5, fontSize: '0.9em' }}>Mã hồ sơ (ID)</p>
          <p style={{ 
            fontFamily: 'monospace', 
            background: 'rgba(0, 0, 0, 0.3)', 
            padding: '8px 12px', 
            borderRadius: 8,
            fontSize: '0.9em',
            wordBreak: 'break-all'
          }}>
            {recordId}
          </p>
        </div>

        <div>
          <p className="text-muted" style={{ marginBottom: 5, fontSize: '0.9em' }}>Chủ sở hữu</p>
          <p style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
            {account.address.slice(0, 10)}...{account.address.slice(-8)}
          </p>
        </div>

        <div>
          <p className="text-muted" style={{ marginBottom: 5, fontSize: '0.9em' }}>Dữ liệu hồ sơ</p>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.3)', 
            padding: '12px', 
            borderRadius: 8,
            border: '1px solid var(--glass-border)'
          }}>
            <p style={{ margin: 0, fontSize: '0.95em' }}>{recordData}</p>
          </div>
        </div>

        {/* Nút đăng ký khám */}
        {LOBBY_ID && LOBBY_ID !== "YOUR_LOBBY_ID_HERE" && (
          <button 
            className="btn-primary"
            onClick={registerForExamination}
            disabled={isRegistering}
            style={{ marginTop: 10, width: '100%' }}
          >
            {isRegistering ? "⏳ Đang đăng ký..." : "📋 Đăng ký khám"}
          </button>
        )}
      </div>
    </div>
  );
}