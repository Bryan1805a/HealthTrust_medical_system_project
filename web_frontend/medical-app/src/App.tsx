import { useState, useEffect } from "react";
import { ConnectButton, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { CreateProfile } from "./CreateProfile";
import { PatientProfile } from "./PatientProfile";
import { DoctorDashboard } from "./DoctorDashboard";
import { PrescriptionList } from "./PrescriptionList";
import { StatisticsDashboard } from "./StatisticsDashboard";
import { TransactionHistory } from "./TransactionHistory";
import { FindContractIds } from "./FindContractIds";
import { PACKAGE_ID, MODULE_NAME } from "./config";
import { Toaster } from 'react-hot-toast';
import { LayoutDashboard, User, Stethoscope, Activity, Shield } from "lucide-react";
import { AdminDashboard } from "./AdminDashboard";


function App() {
  const account = useCurrentAccount();
  const [activeTab, setActiveTab] = useState("patient"); // Default tab

  // Query 1: Check Patient
  const { data: patientData, refetch: refetchPatient } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::MedicalRecord` },
    },
    { enabled: !!account }
  );

  // Query 2: Check Doctor
  const { data: doctorData } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::DoctorCap` },
    },
    { enabled: !!account }
  );

  // Query 3: Check Admin
  const { data: adminData } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::AdminCap` },
    },
    { enabled: !!account }
  );

  const patientRecord = patientData?.data?.[0];
  const doctorCap = doctorData?.data?.[0];
  const adminCap = adminData?.data?.[0];

  // Automatically switch to Doctor tab if DoctorCap is detected (but don't override Admin)
  useEffect(() => {
    if (doctorCap && !adminCap) setActiveTab("doctor");
  }, [doctorCap, adminCap]);

  return (
    <div className="container" style={{ paddingTop: 30, paddingBottom: 100 }}>
      {/* 1. TOASTER CONFIG (Notifications appear top-right) */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)'
          },
        }}
      />

      {/* HEADER - Navigation bar */}
      <nav className="glass-card" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 40,
        padding: "20px 28px"
      }}>
        <h1 className="text-highlight" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          fontSize: '1.75rem', 
          margin: 0,
          fontWeight: 700
        }}>
          <Activity color="#3b82f6" size={32} /> 
          <span>NOVA MEDICAL</span>
        </h1>
        <ConnectButton />
      </nav>

      <div>
        {!account ? (
          <div className="glass-card fade-in" style={{ 
            textAlign: "center", 
            padding: "60px 40px",
            maxWidth: 600,
            margin: "0 auto"
          }}>
            <h2 style={{ marginBottom: 16 }}>👋 Welcome to the Nova Medical System</h2>
            <p className="text-muted" style={{ fontSize: '1.1em', marginBottom: 0 }}>
              Please connect a Sui wallet to continue
            </p>
          </div>
        ) : PACKAGE_ID === "YOUR_PACKAGE_ID_HERE" ? (
          <div className="fade-in">
            <div className="glass-card" style={{ maxWidth: 800, margin: '0 auto', marginBottom: 30 }}>
              <h2 style={{ marginBottom: 16, color: '#f59e0b' }}>⚠️ Contract IDs configuration required</h2>
              <p className="text-muted" style={{ marginBottom: 20 }}>
                You have successfully published the contract! Now update PACKAGE_ID and LOBBY_ID in config.ts
              </p>
              <FindContractIds />
            </div>
          </div>
        ) : (
          <div className="fade-in">
            {/* 2. TAB MENU - Tab navigation */}
            <div style={{ 
              display: 'flex', 
              gap: 12, 
              marginBottom: 30,
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={() => setActiveTab('patient')}
                className={`tab-button ${activeTab === 'patient' ? 'active' : ''}`}
              >
                <User size={18} /> Patient Portal
              </button>

              {/* Show doctor tab only if authorized */}
              {doctorCap && (
                 <button 
                   onClick={() => setActiveTab('doctor')}
                   className={`tab-button ${activeTab === 'doctor' ? 'active' : ''}`}
                 >
                   <Stethoscope size={18} /> Doctor Portal
                 </button>
              )}

              {/* Show admin tab only if AdminCap exists */}
              {adminCap && (
                 <button 
                   onClick={() => setActiveTab('admin')}
                   className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
                 >
                   <Shield size={18} /> Admin Portal
                 </button>
              )}
            </div>

            {/* 3. MAIN CONTENT (Changes per Tab) */}
            <div className="glass-card" style={{ minHeight: 500, padding: 40 }}>
              
              {/* === PATIENT TAB === */}
              {activeTab === 'patient' && (
                <div className="fade-in">
                  {patientRecord ? (
                    <>
                      <StatisticsDashboard />
                      <div style={{ 
                        margin: "40px 0", 
                        height: 1, 
                        background: 'linear-gradient(90deg, transparent, var(--glass-border) 50%, transparent)',
                        border: 'none'
                      }}></div>
                      <PatientProfile />
                      <div style={{ 
                        margin: "40px 0", 
                        height: 1, 
                        background: 'linear-gradient(90deg, transparent, var(--glass-border) 50%, transparent)',
                        border: 'none'
                      }}></div>
                      <PrescriptionList />
                      <div style={{ 
                        margin: "40px 0", 
                        height: 1, 
                        background: 'linear-gradient(90deg, transparent, var(--glass-border) 50%, transparent)',
                        border: 'none'
                      }}></div>
                      <TransactionHistory />
                    </>
                  ) : (
                    <CreateProfile onCreated={() => setTimeout(refetchPatient, 1000)} />
                  )}
                </div>
              )}

              {/* === DOCTOR TAB === */}
              {activeTab === 'doctor' && doctorCap && (
                <div className="fade-in">
                  <DoctorDashboard doctorCapId={doctorCap.data?.objectId!} />
                </div>
              )}

              {/* === ADMIN TAB === */}
              {activeTab === 'admin' && adminCap && (
                <div className="fade-in">
                  <AdminDashboard adminCapId={adminCap.data?.objectId!} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;