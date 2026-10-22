# 🎮 Flappy Bird GameFi DApp

Ứng dụng phi tập trung (Decentralized Application - DApp) kết hợp trò chơi cổ điển **Flappy Bird** với mô hình kinh tế **Play-to-Earn (P2E)** và vật phẩm **NFT (ERC-721)** trên nền tảng Blockchain EVM.

---

## 📁 Cấu Trúc Thư Mục

```
dapps/flappy-gamefi/
├── contracts/
│   ├── FlappyHatNFT.sol    # Smart Contract ERC-721 đại diện cho các cấp độ Mũ
│   └── FlappyGame.sol      # Smart Contract quản lý lượt chơi, quỹ thưởng ETH và nộp điểm
├── frontend/
│   ├── index.html          # Giao diện người dùng DApp
│   ├── style.css           # Hiệu ứng mây bay, game canvas và component
│   └── app.js              # Logic Game HTML5 Canvas và tương tác Web3 (Ethers.js v5)
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Triển Khai

### 1. Chuẩn bị
- Trình duyệt đã cài đặt tiện ích mở rộng [MetaMask](https://metamask.io/).
- Mạng Blockchain cục bộ (Local Ganache / Anvil) hoặc Testnet (Ethereum Sepolia).
- Một lượng test ETH trong ví.

### 2. Triển khai Smart Contract (bằng Remix IDE hoặc Hardhat)

1. Mở [Remix IDE](https://remix.ethereum.org).
2. Tải 2 tệp `FlappyHatNFT.sol` và `FlappyGame.sol` vào Remix.
3. Chọn compiler Solidity `0.8.20`.
4. **Deploy Hợp đồng NFT trước:**
   - Deploy `FlappyHatNFT`.
   - Sao chép lại địa chỉ vừa deploy (ví dụ: `0xNFT_ADDRESS`).
5. **Deploy Hợp đồng Game:**
   - Deploy `FlappyGame` với tham số constructor: `_hatContract = 0xNFT_ADDRESS`.
   - Sao chép lại địa chỉ `FlappyGame` (ví dụ: `0xGAME_ADDRESS`).
6. **Cấp thanh khoản (Liquidity):**
   - Hợp đồng Game cần có sẵn ETH để trả thưởng khi người chơi bán mũ. Gửi một khoản ETH (ví dụ 5-10 ETH) vào địa chỉ `FlappyGame`.

### 3. Cấu hình Frontend

Mở tệp `dapps/flappy-gamefi/frontend/app.js` và cập nhật 2 dòng cấu hình ở đầu file:

```javascript
const FLAPPY_GAME_ADDRESS = "0xGAME_ADDRESS_VỪA_DEPLOY";
const FLAPPY_HAT_NFT_ADDRESS = "0xNFT_ADDRESS_VỪA_DEPLOY";
```

### 4. Khởi chạy Giao Diện Web

Bạn có thể chạy frontend bằng bất kỳ máy chủ static web nào:

```bash
# Cách 1: Sử dụng Python HTTP server
cd dapps/flappy-gamefi/frontend
python -m http.server 8000

# Cách 2: Sử dụng npx serve
npx serve dapps/flappy-gamefi/frontend

# Cách 3: Sử dụng extension "Live Server" trên VS Code / Antigravity IDE
```

Mở trình duyệt truy cập: `http://localhost:8000`.

---

## 🕹️ Hướng Dẫn Trải Nghiệm Game

1. Nhấn nút **"Kết nối ví"** để liên kết với MetaMask.
2. Nhấn nút **"Bắt đầu (1 ETH)"** và xác nhận giao dịch để tham gia ván chơi.
3. Nhấn phím cách (Space) hoặc nhấp chuột để điều khiển chú chim bay qua các cột ống nước.
4. Khi trò chơi kết thúc (Game Over), nhấn **"Gửi điểm"** để nộp điểm lên Smart Contract.
5. Nếu đạt các mốc điểm (5, 10, 25, 50, 75, 100), hệ thống sẽ tự động mint NFT chiếc Mũ tương ứng vào mục **"Mũ của tôi"**.
6. Bạn có thể nhấn vào mũ để đội (thay đổi skin) hoặc nhấn **"Bán"** để đổi lấy ETH từ quỹ hợp đồng.

---

## 🛡️ Phân Tích An Ninh GameFi (Security Insights)

### ⚠️ Lỗ hổng tiềm ẩn: "Client-Side Trust"
- Điểm số được tính toán hoàn toàn dưới trình duyệt của người chơi (Off-chain JavaScript).
- Sau khi chơi xong, client trực tiếp gọi hàm `flappyGame.submitScore(score)`.
- **Rủi ro:** Kẻ tấn công có thể mở DevTools hoặc viết script Web3 trực tiếp gửi giao dịch `submitScore(100)` mà không cần tốn thời gian chơi game, nhận ngay NFT cấp cao nhất và bán rút cạn quỹ ETH của hợp đồng.

### 💡 Giải pháp cải tiến trong môi trường Production
1. **Server-Side Validation:** Backend có thẩm quyền tính toán điểm số và ký một chữ ký mã hóa (ECDSA / EIP-712). Contract chỉ mint NFT khi nhận được chữ ký hợp lệ từ Backend.
2. **Commit-Reveal Scheme:** Sử dụng hàm băm hạt giống ngẫu nhiên để xác định vị trí chướng ngại vật theo block hash on-chain.
3. **Decentralized Oracles:** Ứng dụng Chainlink VRF và Chainlink Functions để phi tập trung hóa quá trình xác thực.
