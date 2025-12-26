import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME, LOBBY_ID } from "./config";
import { uploadToPinata } from "./pinata";
import { DoctorLobbyView } from "./DoctorLobbyView";
import toast from 'react-hot-toast';

export function DoctorDashboard({ doctorCapId }: { doctorCapId: string }) {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [patientId, setPatientId] = useState("");
  const [patientIndex, setPatientIndex] = useState<number | null>(null);
  const [prescriptionName, setPrescriptionName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [doctorName, setDoctorName] = useState("");
  
  const [ipfsHash, setIpfsHash] = useState(""); 
  const [isUploading, setIsUploading] = useState(false);

  const handleSelectPatient = (address: string, index: number) => {
    setPatientId(address);
    setPatientIndex(index);
    console.log(`Selected patient: ${address} at index: ${index}`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const hash = await uploadToPinata(file);
    setIsUploading(false);

    if (hash) {
      setIpfsHash(hash);
      toast.success("Image uploaded successfully!");
    } else {
      toast.error("Upload failed.");
    }
  };

  const createPrescription = () => {
    // 👇 CHANGE 1: Remove check !ipfsHash from validate condition
    if (!account || !patientId || patientIndex === null || !prescriptionName || !diagnosis || !doctorName) {
      toast.error("Please fill in all required fields (*)");
      return;
    }

    if (!PACKAGE_ID || !LOBBY_ID) {
      toast.error("ID not configured in config.ts");
      return;
    }

    const txb = new Transaction();
    const nameBytes = new TextEncoder().encode(prescriptionName);
    
    // 👇 CHANGE 2: If no image, send empty string or default message
    const finalHash = ipfsHash || ""; 
    const ipfsBytes = new TextEncoder().encode(finalHash);
    
    const diagnosisBytes = new TextEncoder().encode(diagnosis);
    const doctorNameBytes = new TextEncoder().encode(doctorName);
    const timestampSeconds = Math.floor(Date.now() / 1000);

    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_prescription`,
      arguments: [
        txb.object(doctorCapId),
        txb.object(LOBBY_ID),
        txb.pure.u64(patientIndex),
        txb.pure.vector("u8", nameBytes),
        txb.pure.vector("u8", ipfsBytes), // Still send bytes; will be empty bytes if no image
        txb.pure.vector("u8", diagnosisBytes),
        txb.pure.u64(timestampSeconds),
      ],
    });

    const loadingToast = toast.loading("Signing prescription & removing from queue...");

    signAndExecuteTransaction(
      { transaction: txb },
      {
        onSuccess: () => {
          toast.success("Prescription sent successfully!", { id: loadingToast });
          // Reset form
          setPrescriptionName("");
          setDiagnosis("");
          setDoctorName("");
          setPatientId("");
          setPatientIndex(null);
          setIpfsHash(""); 
        },
        onError: (err) => toast.error("Error: " + err.message, { id: loadingToast }),
      }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <DoctorLobbyView 
        onSelectPatient={(address: string, index: number) => handleSelectPatient(address, index)} 
      />

      <div className="glass-card" style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
        <h2 className="text-highlight" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          👨‍⚕️ Doctor Dashboard
        </h2>
        <p className="text-muted" style={{ fontSize: '0.8em', marginBottom: 20 }}>
          ID: {doctorCapId}
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 5 }}>Patient wallet ID <span style={{color: 'red'}}>*</span></label>
          <input 
            className="input-glass"
            value={patientId}
            readOnly 
            placeholder="Select patient from the list above..."
          />
        </div>
        
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 5 }}>Prescription name <span style={{color: 'red'}}>*</span></label>
          <input className="input-glass" placeholder="e.g., Flu prescription..." value={prescriptionName} onChange={(e) => setPrescriptionName(e.target.value)} />
        </div>

        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 5 }}>Diagnosis <span style={{color: 'red'}}>*</span></label>
          <textarea className="input-glass" rows={2} placeholder="Diagnosis..." value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        </div>

        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: 5 }}>Doctor name <span style={{color: 'red'}}>*</span></label>
          <input className="input-glass" placeholder="Dr. John Doe" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
        </div>

        <div style={{ padding: 15, background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--glass-border)', borderRadius: 8 }}>
            {/* 👇 CHANGE 3: Add 'Optional' label */}
            <label style={{ display: "block", marginBottom: 10, fontWeight: "bold", fontSize: '0.9em' }}>
                📎 Attach X-ray / Prescription (Optional)
            </label>
            <input type="file" onChange={handleFileChange} disabled={isUploading} style={{ color: 'white' }} />
            {isUploading && <p style={{ color: "#fbbf24", margin: "10px 0 0" }}>⏳ Uploading to IPFS...</p>}
            {ipfsHash && <p style={{ color: "#4ade80", fontSize: "0.8em", margin: "10px 0 0" }}>✅ Upload complete: {ipfsHash.slice(0, 20)}...</p> }
        </div>

        <button 
          className="btn-primary"
          onClick={createPrescription}
          // 👇 CHANGE: Removed !ipfsHash from disabled
          disabled={isUploading || !patientId || !prescriptionName || !diagnosis}
          style={{ marginTop: 10, padding: 15 }}
        >
          ✍️ Sign & Send Prescription
        </button>
        </div>
      </div>
    </div>
  );
}