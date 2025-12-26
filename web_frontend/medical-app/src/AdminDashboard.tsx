import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "./config";
import toast from 'react-hot-toast';
import { Shield, UserPlus, Users, Stethoscope } from "lucide-react";

export function AdminDashboard({ adminCapId }: { adminCapId: string }) {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [doctorName, setDoctorName] = useState(""); // State: store doctor name
  const [isMinting, setIsMinting] = useState(false);

  const mintDoctorCap = () => {
    // 1. Validate input data
    if (!account || !recipientAddress || !doctorName) {
      toast.error("Please enter both Name and Wallet Address!");
      return;
    }

    if (!recipientAddress.startsWith("0x") || recipientAddress.length < 10) {
      toast.error("Invalid wallet address!");
      return;
    }

    if (!PACKAGE_ID || PACKAGE_ID === "YOUR_PACKAGE_ID_HERE") {
      toast.error("PACKAGE_ID not configured in config.ts");
      return;
    }

    setIsMinting(true);
    const loadingToast = toast.loading("Creating doctor cap...");

    const txb = new Transaction();

    // 2. Update Move Call with 3 args: AdminCap, Recipient, Name
    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::mint_doctor_cap`,
      arguments: [
        txb.object(adminCapId),             // Arg 1: AdminCap
        txb.pure.address(recipientAddress), // Arg 2: Recipient wallet
        txb.pure.string(doctorName),        // Arg 3: Doctor name (new)
      ],
    });

    signAndExecuteTransaction(
      { transaction: txb },
      {
        onSuccess: (result) => {
          toast.success(`Doctor ${doctorName} granted successfully!`, { id: loadingToast });
          setRecipientAddress("");
          setDoctorName(""); // Reset form
          setIsMinting(false);
          console.log("Transaction Digest:", result.digest);
        },
        onError: (err) => {
          toast.error("Error: " + err.message, { id: loadingToast });
          setIsMinting(false);
        },
      }
    );
  };

  return (
    <div className="glass-card fade-in" style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Shield size={28} color="var(--primary-color)" />
        <h2 className="text-highlight" style={{ margin: 0 }}>
          🛡️ Admin Dashboard
        </h2>
      </div>
      
      <p className="text-muted" style={{ fontSize: '0.9em', marginBottom: 20 }}>
        Use AdminCap to grant DoctorCap to new doctors joining the system.
      </p>

      {/* Show current AdminCap ID */}
      <div style={{ 
        background: 'rgba(59, 130, 246, 0.1)', 
        padding: '16px', 
        borderRadius: '12px', 
        marginBottom: 24,
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Shield size={16} />
          <strong style={{ fontSize: '0.9em' }}>AdminCap ID (Your):</strong>
        </div>
        <p style={{ 
          fontFamily: 'monospace', 
          fontSize: '0.85em', 
          margin: 0,
          wordBreak: 'break-all',
          color: 'var(--text-muted)'
        }}>
          {adminCapId}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        
        {/* Input 1: Doctor Display Name */}
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 8, fontSize: '0.95em' }}>
            <Stethoscope size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Doctor display name
          </label>
          <input 
            className="input-glass"
            placeholder="e.g.: Dr. Strange" 
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Input 2: Recipient Wallet Address */}
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 8, fontSize: '0.95em' }}>
            <UserPlus size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Sui wallet address (Recipient)
          </label>
          <input 
            className="input-glass"
            placeholder="0x..." 
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <button 
          className="btn-primary"
          onClick={mintDoctorCap}
          disabled={!recipientAddress || !doctorName || isMinting}
          style={{ 
            padding: '14px 24px', 
            fontSize: '1em',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 10
          }}
        >
          {isMinting ? (
            <>
              <span className="spinner" style={{ display: 'inline-block', width: 16, height: 16 }}></span>
              Processing...
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Grant Doctor Cap
            </>
          )}
        </button>
      </div>

      <div style={{ 
        marginTop: 30, 
        padding: '16px', 
        background: 'rgba(34, 197, 94, 0.1)', 
        borderRadius: '12px', 
        border: '1px solid rgba(34, 197, 94, 0.3)',
        fontSize: '0.85em'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Users size={18} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', marginBottom: 6 }}>💡 Note:</strong>
            <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-muted)' }}>
              <li>The new DoctorCap will be sent directly to the recipient wallet.</li>
              <li>The doctor name will be permanently stored in that DoctorCap.</li>
              <li>If you want to test doctor features yourself, enter your own wallet address.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}