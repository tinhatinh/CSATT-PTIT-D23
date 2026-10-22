# 🧪 Smart Contract Security Labs (Thực Nghiệm An Ninh Hợp Đồng Thông Minh)

Thư mục này chứa các bài thực nghiệm bảo mật Hợp đồng thông minh Ethereum/Solidity được xây dựng trong khuôn khổ Bài Tập Lớn học phần **Cơ sở An toàn thông tin (PTIT)**.

---

## 📑 Danh Sách Các Bài Lab

| Lab | Chủ Đề & Lỗ Hổng | Tệp Mã Nguồn Liên Quan | Mẫu Phòng Thủ (Defense Pattern) |
|:---:|:---|:---|:---|
| **[Lab 1](./lab1-reentrancy/)** | **Reentrancy Attack**<br>Tấn công tái nhập đệ quy rút cạn quỹ | • `EtherStore.sol` (Vulnerable)<br>• `Attack.sol`<br>• `EtherStoreSafe.sol` (Fixed) | **Checks-Effects-Interactions** & ReentrancyGuard |
| **[Lab 2](./lab2-phishing-tx-origin/)** | **tx.origin Phishing**<br>Mạo danh ủy quyền qua hợp đồng bẫy | • `Wallet.sol` (Vulnerable)<br>• `AttackWallet.sol`<br>• `WalletSafe.sol` (Fixed) | Thay thế `tx.origin` bằng **`msg.sender`** |
| **[Lab 3](./lab3-dos/)** | **Denial of Service (DoS)**<br>Đóng băng logic game qua Revert | • `KingOfEther.sol` (Vulnerable)<br>• `AttackDoS.sol`<br>• `SafeKingOfEther.sol` (Fixed) | **Pull-over-Push Payment** pattern |

---

## 🛠️ Công Cụ Cần Thiết Để Thực Nghiệm

1. **Remix IDE:** [https://remix.ethereum.org](https://remix.ethereum.org) (Trình biên dịch và máy ảo EVM trực quan trên trình duyệt).
2. **Solidity Compiler:** Phiên bản `^0.8.18`.
3. **Môi trường chạy:** `Remix VM (Shanghai/Cancun)` hoặc kết nối mạng cục bộ `Ganache` / `Hardhat node`.
