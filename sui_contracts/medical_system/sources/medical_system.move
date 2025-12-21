module medical::core {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::vector;
    use std::string::{String};

    // --- CÁC STRUCT ---

    struct DoctorCap has key, store { id: UID }

    // --- EVENTS ---
    
    struct PrescriptionCreated has copy, drop {
        prescription_id: ID,
        doctor_id: address,
        patient_id: address,
        name: String,
    }

    struct RecordCreated has copy, drop {
        record_id: ID,
        patient_id: address,
    }

    struct PrescriptionUsed has copy, drop {
        prescription_id: ID,
        patient_id: address,
    }

    struct PatientRegistered has copy, drop {
        patient_id: address,
        lobby_id: ID,
    }

    struct MedicalRecord has key, store {
        id: UID,
        owner: address,
        record_data: String
    }

    struct Prescription has key, store {
        id: UID,
        name: String,
        medication_hash: String,
        doctor_id: address,
        is_used: bool
    }

    // [MỚI] Sảnh chờ - Nơi chứa danh sách bệnh nhân
    struct Lobby has key, store {
        id: UID,
        patients: vector<address>
    }

    // --- KHỞI TẠO ---

    fun init(ctx: &mut TxContext) {
        // 1. Tạo thẻ bác sĩ gửi cho người deploy
        transfer::transfer(DoctorCap { id: object::new(ctx) }, tx_context::sender(ctx));

        // 2. [MỚI] Tạo Sảnh chờ và SHARE cho cộng đồng
        transfer::share_object(Lobby {
            id: object::new(ctx),
            patients: vector::empty()
        });
    }

    // --- CÁC HÀM CHỨC NĂNG ---

    // 1. Tạo hồ sơ
    #[allow(lint(self_transfer))]
    public fun create_profile(_ctx: &mut TxContext) {
        let sender = tx_context::sender(_ctx);
        let record = MedicalRecord {
            id: object::new(_ctx),
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

    // 2. [MỚI] Bệnh nhân đăng ký khám (Thêm tên vào Lobby)
    public fun register_for_examination(lobby: &mut Lobby, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        // Kiểm tra xem đã có trong danh sách chưa để tránh trùng (Optional)
        if (!vector::contains(&lobby.patients, &sender)) {
            vector::push_back(&mut lobby.patients, sender);
            
            // Emit event
            event::emit(PatientRegistered {
                patient_id: sender,
                lobby_id: object::id(lobby),
            });
        };
    }

    // 3. Kê đơn (Giữ nguyên - chỉ sửa chút tham số đầu vào cho gọn)
    public fun create_prescription(
        _: &DoctorCap,
        patient_addr: address,
        name: vector<u8>,
        medication_hash: vector<u8>,
        ctx: &mut TxContext
    ) {
        let prescription_name = std::string::utf8(name);
        let prescription = Prescription {
            id: object::new(ctx),
            name: prescription_name,
            medication_hash: std::string::utf8(medication_hash),
            doctor_id: tx_context::sender(ctx),
            is_used: false
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
        });
    }

    // 4. Mua thuốc (Giữ nguyên)
    public fun use_prescription(prescription: &mut Prescription, ctx: &mut TxContext) {
        let prescription_id = object::id(prescription);
        prescription.is_used = true;
        
        // Emit event
        event::emit(PrescriptionUsed {
            prescription_id,
            patient_id: tx_context::sender(ctx),
        });
    }
}