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
      toast.error("Please connect your wallet to create a profile");
      return;
    }

    if (!PACKAGE_ID || PACKAGE_ID === "YOUR_PACKAGE_ID_HERE") {
      toast.error("PACKAGE_ID not configured. Please update in config.ts");
      return;
    }

    setIsCreating(true);
    const loadingToast = toast.loading("Creating medical record...");

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
          console.log("Success!", result);
          toast.success("Medical record created successfully!", { id: loadingToast });
          setIsCreating(false);
          onCreated(); 
        },
        onError: (err) => {
          console.error("Error:", err);
          toast.error("An error occurred: " + err.message, { id: loadingToast });
          setIsCreating(false);
        },
      }
    );
  };

  if (!account) {
    return (
      <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '40px' }}>
        <p className="text-muted">Please connect your wallet to create a profile</p>
      </div>
    );
  }

  return (
    <div className="glass-card fade-in" style={{ maxWidth: 500, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <UserPlus size={48} color="var(--primary-color)" style={{ marginBottom: 16 }} />
        <h2 className="text-highlight" style={{ marginBottom: 10 }}>Create new medical record</h2>
        <p className="text-muted">
          You don't have a medical record in the system yet. Create a new record to start using the service.
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
            Creating record...
          </>
        ) : (
          <>
            <UserPlus size={20} />
            Create New Medical Record
          </>
        )} 
      </button>

      <p className="text-muted" style={{ marginTop: 20, fontSize: '0.85em', textAlign: 'center' }}>
        ⚠️ Note: Records will be stored on the Sui blockchain and belong to you.
      </p>
    </div>
  );
}