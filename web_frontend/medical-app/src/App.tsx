import { ConnectButton, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { CreateProfile } from "./CreateProfile";
import { PatientProfile } from "./PatientProfile";
import { DoctorDashboard } from "./DoctorDashboard"; // <--- Import mới
import { PACKAGE_ID, MODULE_NAME, DOCTOR_CAP_ID } from "./config"; // <--- Import DOCTOR_CAP_ID
import { PrescriptionList } from "./PrescriptionList";

function App() {
  const account = useCurrentAccount();

  // QUERY 1: Kiểm tra xem user có phải là Bệnh nhân không?
  const { data: patientData, refetch: refetchPatient } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::MedicalRecord` },
    },
    { enabled: !!account }
  );

  // QUERY 2: Kiểm tra xem user có phải là Bác sĩ không? (Tìm DoctorCap)
  const { data: doctorData } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::DoctorCap` },
    },
    { enabled: !!account }
  );

  // Logic phân loại User
  const patientRecord = patientData?.data?.[0];
  const doctorCap = doctorData?.data?.[0];

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <h1>🏥 SUI Medical System</h1>
        <ConnectButton />
      </nav>

      <div style={{ marginTop: 20 }}>
        {!account ? (
          <div style={{ textAlign: "center", padding: 50 }}><h2>Kết nối ví để tiếp tục</h2></div>
        ) : (
          <div>
            {/* 1. NẾU LÀ BÁC SĨ --> HIỆN DASHBOARD BÁC SĨ */}
            {doctorCap && (
              <div style={{ marginBottom: 40 }}>
                <DoctorDashboard doctorCapId={doctorCap.data?.objectId!} />
              </div>
            )}

            <hr style={{ margin: "30px 0", opacity: 0.2 }} />

            {/* 2. KHU VỰC BỆNH NHÂN (Ai cũng có thể là bệnh nhân, kể cả bác sĩ) */}
            <h3>Khu vực cá nhân</h3>
            {patientRecord ? (
              <>
                <PatientProfile />
                <hr style={{ margin: "20px 0", opacity: 0.1 }} />
                {/* Thêm danh sách đơn thuốc vào dưới hồ sơ */}
                <PrescriptionList /> 
              </>
            ) : (
              <CreateProfile onCreated={() => setTimeout(refetchPatient, 1000)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;