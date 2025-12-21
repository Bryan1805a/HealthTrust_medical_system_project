# Hướng dẫn Transfer DoctorCap sang Slush Wallet

## Thông tin:
- **DoctorCap ID**: `0x0a3152da90ae6fe23b0e2f9caea1ccda10cb16fd87142cd049eca59704e77bc6`
- **Slush Wallet Address**: `0x3d09a76bf7d0d720ea12581f57f6c0a5a729ab1c2ed2318eef56bec7d151865a`
- **Local Address**: `0x6a06a0041040886dd5ac1dc7b953eb4c5c20c5a30474f96ea52f59c589e1a121`

## Cách 1: Sử dụng Sui CLI (Khuyến nghị)

### Bước 1: Kiểm tra DoctorCap hiện tại
```bash
sui client object 0x0a3152da90ae6fe23b0e2f9caea1ccda10cb16fd87142cd049eca59704e77bc6
```

### Bước 2: Transfer DoctorCap
```bash
sui client transfer --object-id 0x0a3152da90ae6fe23b0e2f9caea1ccda10cb16fd87142cd049eca59704e77bc6 --to 0x3d09a76bf7d0d720ea12581f57f6c0a5a729ab1c2ed2318eef56bec7d151865a --gas-budget 10000000
```

Hoặc nếu bạn muốn chỉ định gas object cụ thể:
```bash
sui client transfer --object-id 0x0a3152da90ae6fe23b0e2f9caea1ccda10cb16fd87142cd049eca59704e77bc6 --to 0x3d09a76bf7d0d720ea12581f57f6c0a5a729ab1c2ed2318eef56bec7d151865a --gas 0x1c28f3eaef774ba0b2e31e467df2a12521c10489a080c71a9698849a6f6ead12 --gas-budget 10000000
```

## Cách 2: Sử dụng Sui CLI với Transaction (Nếu cách 1 không work)

```bash
sui client transfer-object --object-id 0x0a3152da90ae6fe23b0e2f9caea1ccda10cb16fd87142cd049eca59704e77bc6 --to 0x3d09a76bf7d0d720ea12581f57f6c0a5a729ab1c2ed2318eef56bec7d151865a --gas-budget 10000000
```

## Cách 3: Sử dụng Sui Explorer (Nếu có ví kết nối)

1. Mở https://suiexplorer.com/object/0x0a3152da90ae6fe23b0e2f9caea1ccda10cb16fd87142cd049eca59704e77bc6?network=testnet
2. Click "Transfer"
3. Nhập địa chỉ Slush wallet: `0x3d09a76bf7d0d720ea12581f57f6c0a5a729ab1c2ed2318eef56bec7d151865a`
4. Sign và confirm transaction

## Sau khi transfer:

### Kiểm tra DoctorCap đã được transfer chưa:
```bash
# Kiểm tra trong Slush wallet
sui client objects --address 0x3d09a76bf7d0d720ea12581f57f6c0a5a729ab1c2ed2318eef56bec7d151865a | grep DoctorCap
```

### Hoặc query trực tiếp:
```bash
sui client object 0x0a3152da90ae6fe23b0e2f9caea1ccda10cb16fd87142cd049eca59704e77bc6
```

Owner sẽ thay đổi từ local address sang Slush wallet address.

## Lưu ý:

1. **Gas fee**: Cần có đủ SUI trong local wallet để trả gas fee
2. **Network**: Đảm bảo đang ở testnet: `sui client active-env`
3. **Verification**: Sau khi transfer, kiểm tra lại owner của object

## Troubleshooting:

### Nếu lệnh transfer không work:
- Kiểm tra object ID có đúng không
- Kiểm tra địa chỉ đích có đúng format không (phải bắt đầu bằng 0x)
- Kiểm tra có đủ gas không
- Thử với gas-budget cao hơn: `--gas-budget 50000000`

### Nếu object không transfer được:
- Kiểm tra object có `store` ability không (DoctorCap có `store` nên OK)
- Kiểm tra bạn có quyền sở hữu object không

