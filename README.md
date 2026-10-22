# 🛡️ BTL Cơ Sở An Toàn Thông Tin - PTIT D23

<p align="center">
  <img src="https://img.shields.io/badge/PTIT-H%E1%BB%8Dc%20vi%E1%BB%87n%20CNBCVT-red?style=for-the-badge&logo=school" alt="PTIT">
  <img src="https://img.shields.io/badge/Course-CSATTT%20(INT1472)-blue?style=for-the-badge" alt="Course">
  <img src="https://img.shields.io/badge/Solidity-%5E0.8.20-363636?style=for-the-badge&logo=solidity" alt="Solidity">
  <img src="https://img.shields.io/badge/Ethers.js-v5.7.2-2535a0?style=for-the-badge" alt="Ethers.js">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

> **Đề tài:** Khám phá Công nghệ Blockchain: Lý thuyết, Ứng dụng và Thử nghiệm An ninh  
> **Học viện Công nghệ Bưu chính Viễn thông (PTIT)** - Khóa D23  
> **Giảng viên hướng dẫn:** ThS. Đỗ Xuân Trợ  
> **Tác giả / Sinh viên thực hiện:** Danh Phan ([@tinhatinh](https://github.com/tinhatinh)) & Nhóm BTL  

---

## 📖 Giới Thiệu Dự Án

Kho lưu trữ này tổng hợp toàn bộ tài liệu nghiên cứu, mã nguồn các bài thực nghiệm tấn công/phòng thủ Smart Contract và ứng dụng Web3 GameFi thuộc Bài Tập Lớn học phần **Cơ sở An toàn thông tin (CSATTT)**.

Dự án tập trung vào 2 mục tiêu chính:
1. **Thực nghiệm An ninh Smart Contract:** Tái hiện 3 lỗ hổng bảo mật phổ biến hàng đầu trong hệ sinh thái Ethereum (Reentrancy, tx.origin Phishing, DoS via Revert), xây dựng các kịch bản khai thác thực tế và triển khai các mẫu thiết kế bảo mật chuẩn để vá lỗi.
2. **Xây dựng DApp GameFi (Play-to-Earn):** Triển khai trò chơi Flappy Bird tích hợp Smart Contract ERC-721 (NFT) và cơ chế trả thưởng ETH, đồng thời phân tích các rủi ro bảo mật đặc thù của ứng dụng phi tập trung tương tác qua trình duyệt.

---

## 📂 Cấu Trúc Kho Lưu Trữ

```
CSATT-PTIT-D23/
├── docs/                                # Tài liệu học tập & Báo cáo đề tài
│   ├── Bài báo cáo CSATTT Nhóm 1.docx   # Toàn văn báo cáo khoa học BTL
│   ├── LUAT_CHOI.md                     # Luật chơi & cơ chế Tokenomics Flappy GameFi
│   └── LUAT_CHOI.txt                    # Bản lưu trữ gốc
│
├── labs/                                # Các bài thực nghiệm an ninh Hợp đồng thông minh
│   ├── README.md                        # Tổng quan các bài Lab bảo mật
│   ├── lab1-reentrancy/                 # Lab 1: Tấn công Tái nhập (Reentrancy)
│   │   ├── README.md                    # Chi tiết lỗ hổng, phân tích & hướng dẫn test
│   │   ├── EtherStore.sol               # Hợp đồng nạn nhân (chứa lỗ hổng)
│   │   ├── EtherStoreSafe.sol           # Hợp đồng đã vá (Checks-Effects-Interactions)
│   │   └── Attack.sol                   # Hợp đồng khai thác đệ quy
│   │
│   ├── lab2-phishing-tx-origin/         # Lab 2: Lừa đảo ủy quyền qua tx.origin
│   │   ├── README.md                    # So sánh tx.origin vs msg.sender & kịch bản bẫy
│   │   ├── Wallet.sol                   # Ví cá nhân dễ tổn thương
│   │   ├── WalletSafe.sol               # Ví an toàn sử dụng msg.sender
│   │   └── AttackWallet.sol             # Hợp đồng bẫy Phishing
│   │
│   └── lab3-dos/                        # Lab 3: Tấn công Từ chối Dịch vụ (DoS)
│       ├── README.md                    # Phân tích mô hình Push vs Pull payment
│       ├── KingOfEther.sol              # Game tranh ngai vàng có lỗi Push payment
│       ├── SafeKingOfEther.sol          # Bản vá bảo mật áp dụng Pull payment
│       └── AttackDoS.sol                # Hợp đồng kẻ tấn công ("Vua lì đòn" revert)
│
├── dapps/                               # Ứng dụng Web3 Thực Tế
│   └── flappy-gamefi/                   # Game Flappy Bird Play-to-Earn DApp
│       ├── README.md                    # Hướng dẫn deploy & chạy DApp
│       ├── contracts/                   # Smart Contracts cho DApp
│       │   ├── FlappyGame.sol           # Quản lý logic game, nộp điểm & thanh khoản ETH
│       │   └── FlappyHatNFT.sol         # Token NFT ERC-721 phần thưởng Mũ
│       └── frontend/                    # Giao diện Web tương tác ví MetaMask
│           ├── index.html               # Canvas Game & Bảng điều khiển DApp
│           ├── style.css                # Giao diện hiện đại, responsive, hiệu ứng mây bay
│           └── app.js                   # Logic game HTML5 & kết nối Ethers.js
│
├── .gitignore                           # Danh sách tệp loại trừ trong Git
└── README.md                            # Tài liệu tổng quan dự án
```

---

## 🧪 Tóm Tắt Các Bài Thực Nghiệm Bảo Mật (Labs)

### 1. [Lab 1: Reentrancy Attack](./labs/lab1-reentrancy/)
- **Lỗ hổng:** Hợp đồng `EtherStore` thực hiện chuyển tiền ra bên ngoài (`call{value: bal}`) trước khi cập nhật số dư của người dùng về 0.
- **Khai thác:** Hợp đồng `Attack` tận dụng hàm `receive()` để liên tục gọi lại hàm `withdraw()` khi giao dịch trước đó chưa hoàn tất, rút cạn toàn bộ số dư của quỹ.
- **Phòng thủ:** Triển khai quy tắc **Checks-Effects-Interactions**: cập nhật trạng thái `balances[msg.sender] = 0` trước khi thực hiện chuyển tiền.

### 2. [Lab 2: tx.origin Phishing Attack](./labs/lab2-phishing-tx-origin/)
- **Lỗ hổng:** `Wallet` sử dụng `require(tx.origin == owner)` để xác thực quyền rút tiền.
- **Khai thác:** Kẻ tấn công tạo một hợp đồng trung gian ngụy trang `AttackWallet` và lừa nạn nhân (Owner) tương tác với nó. Vì giao dịch bắt nguồn từ nạn nhân, `tx.origin` bằng `owner`, hợp đồng cho phép rút toàn bộ tiền về ví hacker.
- **Phòng thủ:** Luôn sử dụng `msg.sender` để xác thực người gọi trực tiếp.

### 3. [Lab 3: Denial of Service (DoS)](./labs/lab3-dos/)
- **Lỗ hổng:** Mô hình thanh toán cưỡng bức (Push Payment) trong `KingOfEther`: mỗi khi có vua mới, hợp đồng tự động gửi trả tiền cho vua cũ.
- **Khai thác:** Hacker trở thành vua thông qua hợp đồng `AttackDoS` với hàm `receive()` cố tình `revert`. Bất kỳ ai cố gắng trả giá cao hơn để chiếm ngôi đều bị hoàn tác giao dịch do hợp đồng không thể gửi tiền cho hacker.
- **Phòng thủ:** Áp dụng mô hình **Pull-over-Push Payment**: lưu khoản tiền hoàn trả vào `pendingWithdrawals` để cựu vương tự chủ động rút về thông qua hàm `withdraw()`.

---

## 🎮 Ứng Dụng Flappy Bird GameFi

DApp minh họa trực quan ứng dụng công nghệ Blockchain trong ngành công nghiệp game:
- **Cơ chế tham gia:** Người chơi nộp phí 1 ETH vào `FlappyGame` để bắt đầu lượt chơi.
- **Hệ thống cấp bậc:**
  - Vượt qua 5, 10, 25, 50, 75, 100 chướng ngại vật để nhận các NFT Mũ tương ứng: *Mũ Xám, Mũ Xanh Lá, Mũ Xanh Dương, Mũ Tím, Mũ Cam, Mũ Đỏ*.
- **Cơ chế tài chính (P2E):** Người chơi có thể bán lại NFT cho hợp đồng để nhận thưởng lên đến **3.0 ETH**.
- **Khởi chạy nhanh Frontend:**
  ```bash
  cd dapps/flappy-gamefi/frontend
  python -m http.server 8000
  ```
  Truy cập: `http://localhost:8000` (yêu cầu cài đặt MetaMask).

---

## 🛠️ Công Nghệ Sử Dụng

- **Smart Contract:** Solidity `^0.8.18` & `^0.8.20`
- **Thư viện tiêu chuẩn:** OpenZeppelin Contracts (ERC-721, Ownable)
- **Web3 Interface:** Ethers.js v5.7.2
- **Frontend:** HTML5 Canvas, Vanilla CSS3, Modern JavaScript (ES6+)
- **Môi trường mô phỏng:** Remix Ethereum IDE, Ganache Local Blockchain

---

## 👨‍💻 Thông Tin Tác Giả & Liên Hệ

- **Sinh viên:** Danh Phan (PTIT D23)
- **GitHub:** [@tinhatinh](https://github.com/tinhatinh)
- **Facebook:** [Danh Phan](https://www.facebook.com/winterboyy)
- **TikTok:** [@danh_pachirisu](https://www.tiktok.com/@danh_pachirisu)

---

<p align="center">
  <i>Đồ án Bài tập lớn môn Cơ sở An toàn thông tin - Học viện Công nghệ Bưu chính Viễn thông</i>
</p>
