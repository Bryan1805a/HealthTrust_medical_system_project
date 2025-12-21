import { useSuiClientQuery, useCurrentAccount } from "@mysten/dapp-kit";
import { useState } from "react";
import { Copy, CheckCircle, Search } from "lucide-react";
import toast from 'react-hot-toast';

/**
 * Component helper để tìm PACKAGE_ID và LOBBY_ID sau khi publish contract
 * Component này sẽ tự động query từ blockchain để tìm các IDs
 */
export function FindContractIds() {
  const account = useCurrentAccount();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Query tất cả objects của user để tìm DoctorCap và Lobby
  const { data: ownedObjects } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      options: {
        showType: true,
        showContent: true,
      },
    },
    { enabled: !!account }
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`Đã copy ${label}!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Tìm DoctorCap để extract PACKAGE_ID từ type
  const doctorCap = ownedObjects?.data?.find((obj: any) => 
    obj.data?.type?.includes("DoctorCap")
  );

  // Tìm Lobby object
  const lobby = ownedObjects?.data?.find((obj: any) => 
    obj.data?.type?.includes("Lobby")
  );

  // Extract PACKAGE_ID từ DoctorCap type (format: 0x...::core::DoctorCap)
  const packageId = doctorCap?.data?.type?.split("::")[0] || null;
  const lobbyId = lobby?.data?.objectId || null;

  if (!account) {
    return (
      <div className="glass-card fade-in">
        <p className="text-muted">Vui lòng kết nối ví để tìm contract IDs</p>
      </div>
    );
  }

  return (
    <div className="glass-card fade-in" style={{ marginBottom: 30 }}>
      <h3 className="text-highlight" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Search size={20} /> Tìm Contract IDs
      </h3>

      {packageId ? (
        <div style={{ marginBottom: 20 }}>
          <label className="text-muted" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
            📦 PACKAGE_ID
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
          }}>
            <code style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '0.9em',
              wordBreak: 'break-all',
              color: 'var(--primary-light)',
            }}>
              {packageId}
            </code>
            <button
              onClick={() => copyToClipboard(packageId, "PACKAGE_ID")}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                color: copiedId === packageId ? 'var(--primary-color)' : 'var(--text-muted)',
                transition: 'color 0.2s',
              }}
            >
              {copiedId === packageId ? <CheckCircle size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85em', marginTop: 8, marginLeft: 4 }}>
            Copy ID này và paste vào <code>config.ts</code> → <code>PACKAGE_ID</code>
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: 20, padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <p style={{ margin: 0, color: '#ef4444' }}>
            ⚠️ Chưa tìm thấy PACKAGE_ID. Đảm bảo bạn đã deploy contract và có DoctorCap trong ví.
          </p>
        </div>
      )}

      {lobbyId ? (
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
            🏥 LOBBY_ID
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
          }}>
            <code style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '0.9em',
              wordBreak: 'break-all',
              color: 'var(--primary-light)',
            }}>
              {lobbyId}
            </code>
            <button
              onClick={() => copyToClipboard(lobbyId, "LOBBY_ID")}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                color: copiedId === lobbyId ? 'var(--primary-color)' : 'var(--text-muted)',
                transition: 'color 0.2s',
              }}
            >
              {copiedId === lobbyId ? <CheckCircle size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85em', marginTop: 8, marginLeft: 4 }}>
            Copy ID này và paste vào <code>config.ts</code> → <code>LOBBY_ID</code>
          </p>
        </div>
      ) : (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <p style={{ margin: 0, color: '#ef4444' }}>
            ⚠️ Chưa tìm thấy LOBBY_ID. Lobby là shared object, có thể cần query từ transaction publish.
          </p>
          <p className="text-muted" style={{ marginTop: 8, fontSize: '0.9em' }}>
            💡 Tip: Kiểm tra output của lệnh <code>sui client publish</code> để tìm Lobby ID trong phần "Created Objects"
          </p>
        </div>
      )}

      {packageId && lobbyId && (
        <div style={{ marginTop: 24, padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <p style={{ margin: 0, color: '#10b981', fontWeight: 600 }}>
            ✅ Đã tìm thấy cả hai IDs! Copy và paste vào config.ts
          </p>
        </div>
      )}
    </div>
  );
}

