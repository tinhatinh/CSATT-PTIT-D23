# 🎮 Flappy GameFi - Luật Chơi & Cơ Chế Kinh Tế (Tokenomics)

---

## 📜 Mục Lục
1. [Giới thiệu](#1-giới-thiệu)
2. [Cách chơi](#2-cách-chơi)
3. [Hệ thống điểm và cấp độ](#3-hệ-thống-điểm-và-cấp-độ)
4. [Hệ thống mũ NFT](#4-hệ-thống-mũ-nft)
5. [Phần thưởng và giá trị bán lại](#5-phần-thưởng-và-giá-trị-bán-lại)
6. [Lưu ý an toàn & Bảo mật](#6-lưu-ý-an-toàn--bảo-mật)
7. [Thông tin Smart Contract](#7-thông-tin-smart-contract)

---

## 1. Giới thiệu
**Flappy GameFi** là một tựa game Web3 phiêu lưu mô phỏng trò chơi Flappy Bird huyền thoại kết hợp với công nghệ Blockchain Ethereum / EVM:
- **Play-to-Earn (P2E):** Vượt qua chướng ngại vật để nhận phần thưởng là các vật phẩm NFT mũ độc đáo.
- **Giá trị thực tế:** Người chơi có thể đội mũ trong game hoặc bán lại trực tiếp cho Smart Contract để nhận lại tiền điện tử (ETH).
- **Mục tiêu học thuật:** Minh họa cơ chế tài chính phi tập trung (GameFi) và phân tích các rủi ro an ninh trong ứng dụng Web3.

---

## 2. Cách chơi

### 🎯 Mục tiêu
Điều khiển chú chim bay qua các cột ống nước mà không để va chạm hoặc rơi ra ngoài màn hình.

### 🎮 Điều khiển
- **Phím Space (Cách) / Chuột trái / Chạm màn hình:** Nhảy lên.
- **Thả phím:** Chim rơi xuống do tác dụng trọng lực.
- Vượt qua càng nhiều cột ống nước thì điểm tích lũy càng cao.

### 💰 Phí tham gia
- Mỗi lượt chơi yêu cầu đặt cược / nộp phí **1 ETH** thông qua giao dịch Smart Contract (`playGame()`).
- Toàn bộ phí thu được sẽ tích lũy vào hợp đồng để làm quỹ trả thưởng (Pool) cho người chơi đạt cấp độ cao.

---

## 3. Hệ thống điểm và cấp độ

- **1 điểm** = Vượt qua thành công 1 cột ống nước.
- Điểm được ghi nhận sau khi kết thúc lượt chơi và submit lên Smart Contract.

| Cấp độ (Level) | Điểm yêu cầu | Phần thưởng Mũ NFT | Giá trị mua lại từ Contract |
|:---:|:---:|:---:|:---:|
| **Level 5** | 5 điểm | 🎩 Mũ Xám (*Gray*) | **0.3 ETH** |
| **Level 10** | 10 điểm | 🎩 Mũ Xanh Lá (*Green*) | **0.6 ETH** |
| **Level 25** | 25 điểm | 🎩 Mũ Xanh Dương (*Blue*) | **1.0 ETH** |
| **Level 50** | 50 điểm | 🎩 Mũ Tím (*Purple*) | **1.6 ETH** |
| **Level 75** | 75 điểm | 🎩 Mũ Cam (*Orange*) | **2.3 ETH** |
| **Level 100** | 100 điểm | 🎩 Mũ Đỏ (*Red*) | **3.0 ETH** |

> **Quy tắc nhận thưởng:** Mỗi cấp độ chỉ được nhận thưởng NFT 1 lần duy nhất cho mỗi địa chỉ ví.

---

## 4. Hệ thống Mũ NFT (ERC-721)

- Chuẩn triển khai: **ERC-721** kết hợp `Ownable` của OpenZeppelin.
- **Metadata On-chain:**
  - `tokenId`: Định danh duy nhất của từng NFT.
  - `hatLevel`: Cấp độ tương ứng (5, 10, 25, 50, 75, 100).
- **Tính năng:**
  - Trang bị (đội mũ) để thay đổi màu sắc chú chim trên Canvas game.
  - Bán lại cho hợp đồng `FlappyGame` để thu về ETH.
  - Chuyển nhượng (`transferFrom`) cho người chơi khác trên sàn giao dịch NFT.

---

## 5. Phần thưởng và Giá trị bán lại

- Người chơi đạt Level 25 hoàn vốn (1.0 ETH).
- Người chơi đạt Level 100 nhận tổng giá trị vượt trội so với phí tham gia:
  $$\text{Tổng nhận} = 0.3 + 0.6 + 1.0 + 1.6 + 2.3 + 3.0 = 8.8\text{ ETH}$$
*(với điều kiện Pool hợp đồng có đủ thanh khoản ETH).*

---

## 6. Lưu ý an toàn & Bảo mật (Góc nhìn CSATTT)

> [!WARNING]
> **Rủi ro cốt lõi trong mô hình GameFi Client-Side:**
> Trong phiên bản demo này, hàm `submitScore(uint256 score)` được gọi từ client frontend.
> - Kẻ tấn công am hiểu kỹ thuật có thể bỏ qua giao diện game và trực tiếp gọi `submitScore(100)` qua Remix / Web3 script để mint trọn bộ NFT mà không cần chơi game.
> - **Giải pháp khắc phục trong thực tế:**
>   1. **Server-side Signature:** Máy chủ game tính toán điểm số và ký chữ ký số (EIP-712), smart contract chỉ chấp nhận điểm có chữ ký hợp lệ từ server backend uy tín.
>   2. **Zero-Knowledge Proofs (zk-SNARKs):** Tạo bằng chứng mật mã chứng minh người chơi đã thực hiện chuỗi thao tác hợp lệ mà không cần tiết lộ chi tiết đầu vào.
>   3. **Oracle tích hợp:** Sử dụng Chainlink hoặc dịch vụ Oracle phi tập trung để xác thực kết quả game.

---

## 7. Thông tin Smart Contract

### Chức năng chính
- `playGame()`: Tham gia game, chuyển chính xác 1 ETH vào contract.
- `submitScore(uint256 score)`: Nộp kết quả điểm, tự động mint NFT tương ứng các mốc đạt được.
- `sellHat(uint256 tokenId)`: Bán lại NFT cho contract để nhận ETH theo bảng giá cố định.
- `setHatPrice(uint256 level, uint256 price)`: Điều chỉnh biểu giá (chỉ dành cho Owner).
- `withdraw(uint256 amount)`: Rút tiền thanh khoản khẩn cấp (Owner).
