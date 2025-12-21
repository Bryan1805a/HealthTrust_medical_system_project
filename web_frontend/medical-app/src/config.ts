// src/config.ts
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

export const NETWORK = "testnet"; // Đổi sang testnet

// ⚠️ QUAN TRỌNG: Sau khi deploy contract mới lên testnet, bạn cần cập nhật các ID này:
// 1. Deploy contract: sui client publish --gas-budget 100000000
// 2. Copy PACKAGE_ID từ output
// 3. Tìm LOBBY_ID bằng cách query: sui client objects --json | grep Lobby
export const PACKAGE_ID = "0x8c42f6aa9f916880d3fcab5761cda5cdbf670da2735a9658461d05b23d2c6618"; // ✅ Đã cập nhật
export const LOBBY_ID = "0x8f405a80855185372499122d8aea1382ed79e9960a4c1d8b8152844cec2ec113"; // ✅ Đã cập nhật (Shared Object)
export const MODULE_NAME = "core"; // Tên module trong file Move

export const { networkConfig } = createNetworkConfig({
	devnet: { url: getFullnodeUrl("devnet") },
	testnet: { url: getFullnodeUrl("testnet") },
	mainnet: { url: getFullnodeUrl("mainnet") },
});