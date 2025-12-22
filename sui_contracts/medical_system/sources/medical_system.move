module medical::core {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::vector;
    use std::string::{String};

    // --- CÁC STRUCT ---

    /// Thẻ bác sĩ (Capability)
    struct DoctorCap has key, store { id: UID }

    /// Thẻ admin - chỉ admin mới có quyền mint DoctorCap
    struct AdminCap has key, store { id: UID }

    // --- EVENTS ---
    
    /// Event khi tạo đơn thuốc
    struct PrescriptionCreated has copy, drop {
        prescription_id: ID,
        doctor_id: address,
        patient_id: address,
        name: String,
        diagnosis: String,
        timestamp: u64,
    }

    /// Event khi tạo hồ sơ
    struct RecordCreated has copy, drop {
        record_id: ID,
        patient_id: address,
    }

    /// Event khi dùng đơn thuốc
    struct PrescriptionUsed has copy, drop {
        prescription_id: ID,
        patient_id: address,
    }

    /// Event khi bệnh nhân đăng ký khám
    struct PatientRegistered has copy, drop {
        patient_id: address,
        lobby_id: ID,
        symptoms: String,
        department: String,
        priority: u8,
    }

    /// Event khi mint DoctorCap mới
    struct DoctorCapMinted has copy, drop {
        doctor_cap_id: ID,
        recipient: address,
        admin: address,
    }

    /// Hồ sơ bệnh án cơ bản
    struct MedicalRecord has key, store {
        id: UID,
        owner: address,
        record_data: String,
    }

    /// Đối tượng bệnh nhân trong sảnh chờ (Waiting Room)
    struct WaitingPatient has copy, drop, store {
        addr: address,
        symptoms: String,
        department: String,
        priority: u8,
    }

    /// Đơn thuốc v2 với metadata đầy đủ
    struct Prescription has key, store {
        id: UID,
        name: String,
        medication_hash: String,
        doctor_id: address,
        diagnosis: String,
        doctor_name: String,
        timestamp: u64,
        is_used: bool,
    }

    /// Sảnh chờ - chứa danh sách bệnh nhân đang đợi khám
    struct Lobby has key, store {
        id: UID,
        patients: vector<WaitingPatient>,
    }

    // --- KHỞI TẠO ---

    fun init(ctx: &mut TxContext) {
        let deployer = tx_context::sender(ctx);
        
        // 1. Tạo AdminCap cho người deploy (để có thể mint thêm DoctorCap sau này)
        transfer::transfer(AdminCap { id: object::new(ctx) }, deployer);

        // 2. Tạo thẻ bác sĩ đầu tiên gửi cho người deploy
        transfer::transfer(DoctorCap { id: object::new(ctx) }, deployer);

        // 3. Tạo Sảnh chờ và SHARE cho cộng đồng
        transfer::share_object(Lobby {
            id: object::new(ctx),
            patients: vector::empty(),
        });
    }

    // --- CÁC HÀM CHỨC NĂNG ---

    /// 1. Tạo hồ sơ cơ bản cho bệnh nhân
    #[allow(lint(self_transfer))]
    public fun create_profile(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let record = MedicalRecord {
            id: object::new(ctx),
            owner: sender,
            record_data: std::string::utf8(b"Ho So Benh Nhan"),
        };
        let record_id = object::id(&record);
        transfer::transfer(record, sender);
        
        // Emit event
        event::emit(RecordCreated {
            record_id,
            patient_id: sender,
        });
    }

    /// 2. Bệnh nhân đăng ký khám, lưu thêm metadata vào Lobby
    public fun register_for_examination(
        lobby: &mut Lobby,
        symptoms: vector<u8>,
        department: vector<u8>,
        priority: u8,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let symptoms_str = std::string::utf8(symptoms);
        let department_str = std::string::utf8(department);

        let waiting = WaitingPatient {
            addr: sender,
            symptoms: symptoms_str,
            department: department_str,
            priority,
        };

        vector::push_back(&mut lobby.patients, waiting);

        // Emit event
        event::emit(PatientRegistered {
            patient_id: sender,
            lobby_id: object::id(lobby),
            symptoms: waiting.symptoms,
            department: waiting.department,
            priority,
        });
    }

    /// 3. Kê đơn thuốc với metadata đầy đủ
    public fun create_prescription(
        _: &DoctorCap,
        patient_addr: address,
        name: vector<u8>,
        medication_hash: vector<u8>,
        diagnosis: vector<u8>,
        doctor_name: vector<u8>,
        timestamp: u64,
        ctx: &mut TxContext,
    ) {
        let prescription_name = std::string::utf8(name);
        let diagnosis_str = std::string::utf8(diagnosis);
        let doctor_name_str = std::string::utf8(doctor_name);

        let prescription = Prescription {
            id: object::new(ctx),
            name: prescription_name,
            medication_hash: std::string::utf8(medication_hash),
            doctor_id: tx_context::sender(ctx),
            diagnosis: diagnosis_str,
            doctor_name: doctor_name_str,
            timestamp,
            is_used: false,
        };
        let prescription_id = object::id(&prescription);

        // Gửi đơn thuốc thẳng vào ví bệnh nhân
        transfer::transfer(prescription, patient_addr);
        
        // Emit event
        event::emit(PrescriptionCreated {
            prescription_id,
            doctor_id: tx_context::sender(ctx),
            patient_id: patient_addr,
            name: prescription_name,
            diagnosis: diagnosis_str,
            timestamp,
        });
    }

    /// 4. Đánh dấu đơn thuốc đã sử dụng
    public fun use_prescription(prescription: &mut Prescription, ctx: &mut TxContext) {
        let prescription_id = object::id(prescription);
        prescription.is_used = true;
        
        // Emit event
        event::emit(PrescriptionUsed {
            prescription_id,
            patient_id: tx_context::sender(ctx),
        });
    }

    /// 5. Admin mint DoctorCap mới cho bác sĩ khác
    /// Chỉ admin có AdminCap mới gọi được hàm này
    public fun mint_doctor_cap(
        _admin: &AdminCap,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        let admin_addr = tx_context::sender(ctx);
        let new_cap = DoctorCap { id: object::new(ctx) };
        let cap_id = object::id(&new_cap);
        
        // Gửi DoctorCap mới cho recipient
        transfer::transfer(new_cap, recipient);
        
        // Emit event
        event::emit(DoctorCapMinted {
            doctor_cap_id: cap_id,
            recipient,
            admin: admin_addr,
        });
    }
}