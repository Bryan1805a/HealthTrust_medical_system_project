# Cách tìm LOBBY_ID

Lobby là **shared object** nên không nằm trong owned objects. Bạn cần tìm từ transaction publish.

## Cách 1: Từ output của lệnh publish

Khi bạn chạy `sui client publish`, trong output sẽ có phần:

```
Created Objects:
┌───
│ ObjectID: 0x...  <-- Đây là LOBBY_ID
│ Sender: 0x...
│ Owner: Shared
│ ObjectType: 0x8c42f6aa9f916880d3fcab5761cda5cdbf670da2735a9658461d05b23d2c6618::core::Lobby
│ Version: ...
│ Digest: ...
└───
```

Tìm object có `ObjectType` chứa `Lobby` và `Owner: Shared` → đó là LOBBY_ID.

## Cách 2: Từ Sui Explorer

1. Mở https://suiexplorer.com/?network=testnet
2. Tìm transaction publish gần nhất của bạn
3. Trong phần "Created Objects", tìm object có type `Lobby` và Owner là "Shared"
4. Copy Object ID → đó là LOBBY_ID

## Cách 3: Query từ CLI

```bash
# Tìm transaction publish gần nhất
sui client transactions --limit 10

# Xem chi tiết transaction publish
sui client transaction <TRANSACTION_DIGEST> --json | grep -i lobby
```

## Cách 4: Từ frontend (sau khi có PACKAGE_ID)

Component `FindContractIds` sẽ tự động tìm, nhưng nếu không thấy, bạn có thể:

1. Mở browser console
2. Chạy:
```javascript
// Query shared objects
const client = window.suiClient;
const objects = await client.queryObjects({
  filter: {
    StructType: "0x8c42f6aa9f916880d3fcab5761cda5cdbf670da2735a9658461d05b23d2c6618::core::Lobby"
  }
});
console.log("Lobby objects:", objects);
```

## PACKAGE_ID đã tìm thấy:

✅ **PACKAGE_ID**: `0x8c42f6aa9f916880d3fcab5761cda5cdbf670da2735a9658461d05b23d2c6618`

Đã được cập nhật vào `config.ts`!

## LOBBY_ID:

⚠️ Cần tìm từ transaction publish hoặc Sui Explorer như hướng dẫn trên.

