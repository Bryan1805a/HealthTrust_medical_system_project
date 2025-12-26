import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "./config";
import QRCode from "react-qr-code"; // <--- NEW: QR Code
import toast from "react-hot-toast"; // <--- NEW: Toast

export function PrescriptionList() {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::Prescription` },
      options: { showContent: true },
    },
    { enabled: !!account }
  );

  const usePrescription = (prescriptionId: string) => {
    setProcessingId(prescriptionId);
    // Toast Loading
    const loadingToast = toast.loading("Verifying on Blockchain...");

    const txb = new Transaction();
    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::use_prescription`,
      arguments: [txb.object(prescriptionId)],
    });

    signAndExecuteTransaction(
      { transaction: txb },
      {
        onSuccess: () => {
          toast.success("Prescription used successfully!", { id: loadingToast }); // update old toast
          refetch();
          setProcessingId(null);
        },
        onError: (e) => {
          console.error(e);
          toast.error("Error: " + e.message, { id: loadingToast });
          setProcessingId(null);
        },
      }
    );
  };

  if (!data || data.data.length === 0)
    return (
      <p className="text-muted" style={{ textAlign: "center", marginTop: 20 }}>
        <i>No prescriptions yet.</i>
      </p> 
    );

  return (
    <div style={{ marginTop: 30 }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        💊 Medication & QR
      </h3> 

      <div style={{ display: "grid", gap: 20 }}>
        {data.data.map((item: any) => {
          const fields = item.data?.content?.fields;
          if (!fields) return null;
          const isProcessing = processingId === item.data.objectId;

          // Real IPFS link
          const ipfsLink = `https://gateway.pinata.cloud/ipfs/${fields.medication_hash}`;

          const ts = Number(fields.timestamp ?? 0);
          const dateString =
            ts > 0 ? new Date(ts * 1000).toLocaleString() : "Unknown time";

          return (
            <div
              key={item.data.objectId}
              className="glass-card"
              style={{
                display: "flex",
                gap: 20,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {/* COLUMN 1: QR CODE - HIGHLIGHT */}
              <div
                style={{
                  background: "white",
                  padding: 10,
                  borderRadius: 12,
                  height: "fit-content",
                }}
              >
                <QRCode value={ipfsLink} size={80} />
              </div>

              {/* COLUMN 2: INFORMATION */}
              <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 6 }}>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "1.2em" }}>🧾 {fields.name}</h4>
                <div className="text-muted" style={{ fontSize: "0.85em", marginBottom: 4 }}>
                  ID: {item.data.objectId.slice(0, 10)}...
                </div>
                <div className="text-muted" style={{ fontSize: "0.8em" }}>
                  👨‍⚕️ Doctor: <strong>{fields.doctor_name || "Unknown"}</strong>
                </div>
                <div className="text-muted" style={{ fontSize: "0.8em" }}>
                  🕒 Prescription time: <strong>{dateString}</strong>
                </div>
                <div
                  style={{
                    fontSize: "0.85em",
                    marginTop: 6,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid var(--glass-border)",
                    background: "rgba(15,23,42,0.6)",
                  }}
                >
                  <span style={{ opacity: 0.8 }}>Diagnosis:</span>{" "}
                  <strong>{fields.diagnosis || "None"}</strong>
                </div>

                <a
                  href={ipfsLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: "0.9em",
                    marginTop: 6,
                  }}
                >
                  👁️ View original image
                </a>
              </div>

              {/* COLUMN 3: ACTION BUTTONS */}
              <div>
                {fields.is_used ? (
                  <div
                    style={{
                      border: "1px solid #ef4444",
                      color: "#ef4444",
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontWeight: "bold",
                      background: "rgba(239, 68, 68, 0.1)",
                    }}
                  >
                    🚫 Used
                  </div>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() => usePrescription(item.data.objectId)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "⏳ Processing..." : "✅ Redeem now"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}