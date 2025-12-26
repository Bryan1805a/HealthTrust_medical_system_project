import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "./config";
import { Clock, ExternalLink, FileText, Pill, UserPlus, CheckCircle, Activity } from "lucide-react";

export function TransactionHistory() {
  const account = useCurrentAccount();

  // Query transactions of the user
  const { data: transactionsData, isLoading } = useSuiClientQuery(
    "queryTransactions",
    {
      filter: {
        FromAddress: account?.address || "",
      },
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
      },
      limit: 20,
    },
    { enabled: !!account }
  );

  if (!account) return null;
  if (isLoading) {
    return (
      <div className="glass-card fade-in">
        <h3 className="text-highlight" style={{ marginBottom: 20 }}>
          📜 Transaction History
        </h3> 
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!transactionsData?.data || transactionsData.data.length === 0) {
    return (
      <div className="glass-card fade-in">
        <h3 className="text-highlight" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={20} /> Transaction History
        </h3> 
        <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>
          No transactions yet
        </p> 
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    if (type.includes("PrescriptionCreated")) return <Pill size={18} color="#10b981" />;
    if (type.includes("RecordCreated")) return <FileText size={18} color="#3b82f6" />;
    if (type.includes("PatientRegistered")) return <UserPlus size={18} color="#f59e0b" />;
    if (type.includes("PrescriptionUsed")) return <CheckCircle size={18} color="#ef4444" />;
    return <Activity size={18} />;
  };

  const getEventName = (type: string) => {
    if (type.includes("PrescriptionCreated")) return "Prescription Created";
    if (type.includes("RecordCreated")) return "Record Created";
    if (type.includes("PatientRegistered")) return "Patient Registered";
    if (type.includes("PrescriptionUsed")) return "Prescription Used";
    return "Transaction";
  };

  const formatDate = (timestamp: string | number) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="glass-card fade-in">
      <h3 className="text-highlight" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Clock size={20} /> Transaction History
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {transactionsData.data.slice(0, 10).map((tx: any, index: number) => {
          const txDigest = tx.digest;
          const timestamp = tx.timestampMs || Date.now();
          const events = tx.events || [];
          
          // Find events related to our contract
          const relevantEvents = events.filter((event: any) => 
            event.type?.includes(PACKAGE_ID) || 
            event.type?.includes(MODULE_NAME)
          );

          if (relevantEvents.length === 0 && index > 5) return null; // Only show first 5 tx if there are no events

          return (
            <div
              key={txDigest}
              className="glass-card"
              style={{
                padding: '16px',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  {relevantEvents.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {relevantEvents.map((event: any, eventIndex: number) => (
                        <div key={eventIndex} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {getEventIcon(event.type)}
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                              {getEventName(event.type)}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.85em', fontFamily: 'monospace' }}>
                              {txDigest.slice(0, 16)}...
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        Blockchain transaction
                      </div> 
                      <div className="text-muted" style={{ fontSize: '0.85em', fontFamily: 'monospace' }}>
                        {txDigest.slice(0, 16)}...
                      </div>
                    </div>
                  )}
                  
                  <div className="text-muted" style={{ fontSize: '0.8em', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={12} />
                    {formatDate(timestamp)}
                  </div>
                </div>

                <a
                  href={`https://suiexplorer.com/txblock/${txDigest}?network=testnet`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--primary-light)',
                    textDecoration: 'none',
                    fontSize: '0.9em',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  }}
                >
                  View on Explorer
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {transactionsData.data.length > 10 && (
        <p className="text-muted" style={{ textAlign: 'center', marginTop: 16, fontSize: '0.9em' }}>
          Showing 10 most recent transactions
        </p> 
      )}
    </div>
  );
}

