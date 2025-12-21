import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "./config";
import { Users, FileText, Pill, Activity } from "lucide-react";

export function StatisticsDashboard() {
  const account = useCurrentAccount();

  // Query Medical Records
  const { data: recordsData } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::MedicalRecord` },
    },
    { enabled: !!account }
  );

  // Query Prescriptions
  const { data: prescriptionsData } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::Prescription` },
      options: { showContent: true },
    },
    { enabled: !!account }
  );

  const totalRecords = recordsData?.data?.length || 0;
  const totalPrescriptions = prescriptionsData?.data?.length || 0;
  const usedPrescriptions = prescriptionsData?.data?.filter(
    (item: any) => item.data?.content?.fields?.is_used === true
  ).length || 0;
  const activePrescriptions = totalPrescriptions - usedPrescriptions;

  const stats = [
    {
      title: "Hồ sơ y tế",
      value: totalRecords,
      icon: FileText,
      color: "#3b82f6",
      description: "Tổng số hồ sơ",
    },
    {
      title: "Đơn thuốc",
      value: totalPrescriptions,
      icon: Pill,
      color: "#10b981",
      description: "Tổng số đơn",
    },
    {
      title: "Đơn đang dùng",
      value: activePrescriptions,
      icon: Activity,
      color: "#f59e0b",
      description: "Chưa sử dụng",
    },
    {
      title: "Đơn đã dùng",
      value: usedPrescriptions,
      icon: Users,
      color: "#ef4444",
      description: "Đã hoàn thành",
    },
  ];

  if (!account) return null;

  return (
    <div className="glass-card fade-in" style={{ marginBottom: 30 }}>
      <h2 className="text-highlight" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Activity size={24} /> Thống kê
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 20 
      }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="glass-card"
              style={{
                padding: '20px',
                textAlign: 'center',
                border: `2px solid ${stat.color}40`,
                background: `linear-gradient(135deg, ${stat.color}15 0%, transparent 100%)`,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 32px ${stat.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: 12 
              }}>
                <div style={{
                  background: `${stat.color}20`,
                  padding: '12px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={24} color={stat.color} />
                </div>
              </div>
              
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: stat.color,
                marginBottom: 4,
              }}>
                {stat.value}
              </div>
              
              <div style={{
                fontSize: '0.9em',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: 4,
              }}>
                {stat.title}
              </div>
              
              <div className="text-muted" style={{ fontSize: '0.8em' }}>
                {stat.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar cho đơn thuốc */}
      {totalPrescriptions > 0 && (
        <div style={{ marginTop: 24, padding: '20px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="text-muted">Tiến độ sử dụng đơn thuốc</span>
            <span className="text-highlight" style={{ fontWeight: 600 }}>
              {Math.round((usedPrescriptions / totalPrescriptions) * 100)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${(usedPrescriptions / totalPrescriptions) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #3b82f6)',
              borderRadius: '4px',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

