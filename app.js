// Địa chỉ và ABI của hợp đồng
const FLAPPY_GAME_ABI = [
    "function playGame() payable",
    "function submitScore(uint256 score)",
    "function sellHat(uint256 tokenId)",
    "function getLevels() view returns (uint256[])",
    "function contractBalance() view returns (uint256)",
    "event GamePlayed(address indexed player, uint256 fee)",
    "event ScoreSubmitted(address indexed player, uint256 score)",
    "event HatRewarded(address indexed player, uint256 tokenId, uint256 level)",
    "event HatSold(address indexed player, uint256 tokenId, uint256 level, uint256 amount)"
];

const FLAPPY_HAT_NFT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function approve(address to, uint256 tokenId)",
    "function hatLevelOf(uint256 tokenId) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)"
];

// Thay bằng địa chỉ hợp đồng của bạn
const FLAPPY_GAME_ADDRESS = "0x388d023dFe6F91B912152cfF1EcBf787c49C6470";
const FLAPPY_HAT_NFT_ADDRESS = "0xE60073690977fc59D915A220eb0f0cE90d647DEd";

// Biến toàn cục
let provider, signer, flappyGame, flappyHatNFT;
let score = 0;
let gameStarted = false;
let gameOver = false;
let animationId;
let frameCount = 0;

// Lấy các phần tử DOM
const connectWalletBtn = document.getElementById('connect-wallet');
const walletAddressEl = document.getElementById('wallet-address');
const startGameBtn = document.getElementById('start-game');
const submitScoreBtn = document.getElementById('submit-score');
const restartBtn = document.getElementById('restart-btn');
const gameCanvas = document.getElementById('game-canvas');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const hatsListEl = document.getElementById('hats-list');
const gameAddressEl = document.getElementById('game-address');
const nftAddressEl = document.getElementById('nft-address');

// Thiết lập game
const ctx = gameCanvas.getContext('2d');
const bird = {
    x: 50,
    y: 150,
    width: 30,
    height: 30,
    gravity: 0.08,  // Giảm từ 0.1
    velocity: 0,
    jump: -3.5,     // Giảm từ -4
    color: '#FFD700'
};

const pipes = [];
const pipeWidth = 50;
const pipeGap = 180;  // Tăng khoảng cách giữa các cột ống nước  
let pipeSpawnRate = 150;  

// Khởi tạo ứng dụng
async function init() {
    console.log('Đang khởi tạo ứng dụng...');
    
    // Hiển thị địa chỉ hợp đồng
    gameAddressEl.textContent = FLAPPY_GAME_ADDRESS;
    nftAddressEl.textContent = FLAPPY_HAT_NFT_ADDRESS;

    // Kiểm tra MetaMask
    if (window.ethereum) {
        console.log('Đã phát hiện MetaMask!');
        
        // Khởi tạo provider
        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Kiểm tra đã kết nối trước đó chưa
        try {
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                await connectWallet(accounts[0]);
            }
        } catch (error) {
            console.error('Lỗi kiểm tra tài khoản:', error);
        }
        
        // Thêm sự kiện click cho nút kết nối ví
        connectWalletBtn.addEventListener('click', async () => {
            try {
                console.log('1. Bắt đầu kết nối ví...');
                console.log('2. Đang yêu cầu quyền truy cập tài khoản...');
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                console.log('3. Danh sách tài khoản:', accounts);
                if (accounts.length > 0) {
                    console.log('4. Đang kết nối với tài khoản:', accounts[0]);
                    await connectWallet(accounts[0]);
                } else {
                    console.log('4. Không có tài khoản nào được chọn');
                }
            } catch (error) {
                console.error('Lỗi kết nối ví:', error);
                alert('Lỗi kết nối ví: ' + (error.message || 'Không thể kết nối'));
            }
        });
        
    } else {
        alert('Vui lòng cài đặt MetaMask!');
        connectWalletBtn.disabled = true;
    }

    // Các sự kiện khác
    startGameBtn.addEventListener('click', startGame);
    submitScoreBtn.addEventListener('click', submitScore);
    restartBtn.addEventListener('click', startGame);
    
    // Điều khiển game
    document.addEventListener('keydown', (e) => {
        if ((e.code === 'Space' || e.key === ' ' || e.keyCode === 32) && gameStarted && !gameOver) {
            e.preventDefault();
            bird.velocity = bird.jump;
        }
    });
    
    gameCanvas.addEventListener('click', () => {
        if (gameStarted && !gameOver) {
            bird.velocity = bird.jump;
        }
    });
    
    // Lắng nghe sự kiện thay đổi tài khoản
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            console.log('Tài khoản đã thay đổi:', accounts);
            if (accounts.length === 0) {
                // Đã ngắt kết nối
                walletAddressEl.textContent = '';
                connectWalletBtn.textContent = 'Kết nối ví';
                connectWalletBtn.disabled = false;
                startGameBtn.disabled = true;
            } else {
                connectWallet(accounts[0]);
            }
        });
    }
}

// Kết nối ví
async function connectWallet(account) {
    try {
        console.log('Đang kết nối ví...');
        
        // Cập nhật giao diện
        const address = account || (await provider.getSigner().getAddress());
        walletAddressEl.textContent = `${address.substring(0, 6)}...${address.substring(38)}`;
        connectWalletBtn.textContent = 'Đã kết nối';
        connectWalletBtn.disabled = true;
        startGameBtn.disabled = false;
        
        // Khởi tạo signer và hợp đồng
        signer = provider.getSigner();
        flappyGame = new ethers.Contract(FLAPPY_GAME_ADDRESS, FLAPPY_GAME_ABI, signer);
        flappyHatNFT = new ethers.Contract(FLAPPY_HAT_NFT_ADDRESS, FLAPPY_HAT_NFT_ABI, signer);
        
        console.log('Đã kết nối ví, đang tải mũ...');
        await loadPlayerHats();
        
    } catch (error) {
        console.error('Lỗi trong connectWallet:', error);
        alert('Lỗi kết nối ví: ' + (error.message || 'Lỗi không xác định'));
        connectWalletBtn.disabled = false;
        connectWalletBtn.textContent = 'Kết nối ví';
    }
}

// Tải danh sách mũ của người chơi
async function loadPlayerHats() {
    try {
        if (!flappyHatNFT || !signer || !flappyGame) {
            console.log('Chưa khởi tạo đầy đủ (flappyHatNFT, signer hoặc flappyGame)');
            return;
        }
        
        const address = await signer.getAddress();
        console.log('Đang tải mũ cho địa chỉ:', address);
        
        const balance = await flappyHatNFT.balanceOf(address);
        console.log('Số lượng mũ:', balance.toString());
        
        const hatsListEl = document.querySelector('#hats-list');
        if (!hatsListEl) {
            console.error('Không tìm thấy phần tử #hats-list');
            return;
        }
        
        hatsListEl.innerHTML = '';
        
        if (balance.eq(0)) {
            hatsListEl.innerHTML = '<div class="no-hats">Bạn chưa có mũ nào</div>';
            return;
        }
        
        // Thay vì dùng tokenOfOwnerByIndex, chúng ta sẽ lấy tất cả token ID và kiểm tra owner
        // Lưu ý: Cách này chỉ phù hợp khi số lượng token ít
        const maxTokenId = 1000; // Giả sử token ID tối đa là 1000
        const hatsContainer = document.createElement('div');
        hatsContainer.className = 'hats-container';
        let hatCount = 0;
        
        for (let i = 0; i < maxTokenId; i++) {
            try {
                const owner = await flappyHatNFT.ownerOf(i);
                if (owner.toLowerCase() === address.toLowerCase()) {
                    const level = await flappyHatNFT.hatLevelOf(i);
                    console.log(`Tìm thấy mũ #${i}, cấp độ:`, level);
                    
                    const hatElement = document.createElement('div');
                    hatElement.className = 'hat-item';
                    hatElement.dataset.tokenId = i;
                    
                    const hatColor = getHatColor(level);
                    
                    hatElement.style.color = hatColor;
                    hatElement.innerHTML = `
                        <div class="hat-preview">
                            <div class="hat-level">${level}</div>
                        </div>
                        <div class="hat-info">
                            <div class="hat-name">Mũ #${i}</div>
                            <div class="hat-level-text">Cấp độ: ${level}</div>
                        </div>
                        <div class="hat-actions">
                            <button class="equip-hat" data-token-id="${i}">Đội mũ</button>
                            <button class="sell-hat" data-token-id="${i}">Bán mũ</button>
                        </div>
                    `;
                    
                    // Thêm sự kiện cho nút đội mũ
                    const equipButton = hatElement.querySelector('.equip-hat');
                    equipButton.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        await equipHat(i);
                    });
                    
                    // Thêm sự kiện cho nút bán mũ
                    const sellButton = hatElement.querySelector('.sell-hat');
                    sellButton.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        if (confirm(`Bạn có chắc muốn bán mũ #${i}?`)) {
                            try {
                                // Cần approve trước khi bán
                                const txApprove = await flappyHatNFT.approve(flappyGame.address, i);
                                await txApprove.wait();
                                
                                const tx = await flappyGame.sellHat(i);
                                await tx.wait();
                                showNotification('Đã bán mũ thành công!', 'success');
                                await loadPlayerHats(); // Tải lại danh sách mũ
                            } catch (error) {
                                console.error('Lỗi khi bán mũ:', error);
                                showNotification('Lỗi khi bán mũ: ' + (error.message || 'Lỗi không xác định'), 'error');
                            }
                        }
                    });
                    
                    hatsContainer.appendChild(hatElement);
                    hatCount++;
                    
                    // Dừng nếu đã tìm đủ số lượng mũ
                    if (hatCount >= balance.toNumber()) {
                        break;
                    }
                }
            } catch (error) {
                // Bỏ qua các token không tồn tại hoặc lỗi
                continue;
            }
        }
        
        hatsListEl.appendChild(hatsContainer);
        
        // Tải mũ đang đội (nếu có)
        await loadEquippedHat();
    } catch (error) {
        console.error('Lỗi trong loadPlayerHats:', error);
    }
}

// Bán mũ
async function sellHat(tokenId) {
    try {
        const tx = await flappyGame.sellHat(tokenId);
        await tx.wait();
        alert('Đã bán mũ thành công!');
        await loadPlayerHats(); // Cập nhật lại danh sách mũ
    } catch (error) {
        console.error('Lỗi khi bán mũ:', error);
        alert('Lỗi khi bán mũ: ' + (error.message || 'Lỗi không xác định'));
    }
}

// Bắt đầu game
async function startGame() {
    if (!signer) {
        alert('Vui lòng kết nối ví trước!');
        return;
    }
    
    try {
        // Ẩn nút bắt đầu và vô hiệu hóa tạm thời
        startGameBtn.style.display = 'none';
        
        // Hiển thị thông báo chuẩn bị
        const prepareEl = document.createElement('div');
        prepareEl.id = 'prepare-message';
        prepareEl.style.position = 'absolute';
        prepareEl.style.top = '40%';
        prepareEl.style.left = '50%';
        prepareEl.style.transform = 'translate(-50%, -50%)';
        prepareEl.style.fontSize = '24px';
        prepareEl.style.fontWeight = 'bold';
        prepareEl.style.color = 'white';
        prepareEl.style.textAlign = 'center';
        prepareEl.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        prepareEl.innerHTML = 'Đang chuẩn bị...<br><small>Vui lòng xác nhận giao dịch trong MetaMask</small>';
        document.getElementById('game-section').appendChild(prepareEl);
        
        // Đặt trạng thái game ban đầu
        gameOver = false;
        score = 0;
        pipes.length = [];
        bird.y = gameCanvas.height / 2 - 15;
        bird.velocity = 0;
        
        // Ẩn màn hình kết thúc nếu có
        gameOverEl.style.display = 'none';
        
        // Thanh toán phí chơi game
        try {
            const tx = await flappyGame.playGame({ value: ethers.utils.parseEther('1') });
            
            // Cập nhật thông báo sau khi đã gửi giao dịch
            prepareEl.innerHTML = 'Đã gửi giao dịch<br><small>Đang chờ xác nhận...</small>';
            
            // Chờ giao dịch được xác nhận
            await tx.wait();
            
            // Thông báo đã xác nhận và bắt đầu đếm ngược
            prepareEl.innerHTML = 'Đã xác nhận!<br><small>Chuẩn bị bắt đầu sau:</small>';
            
            // Đếm ngược 3 giây sau khi xác nhận giao dịch
            for (let i = 3; i > 0; i--) {
                prepareEl.innerHTML = `Chuẩn bị!<br><small>Bắt đầu sau: ${i} giây</small>`;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            prepareEl.remove();
            
        } catch (error) {
            console.error('Lỗi khi thanh toán:', error);
            prepareEl.remove();
            startGameBtn.style.display = 'inline-block';
            alert('Lỗi khi thanh toán phí chơi game: ' + (error.message || 'Lỗi không xác định'));
            return;
        }
        
        // Kích hoạt game
        gameStarted = true;
        startGameBtn.disabled = true;
        submitScoreBtn.disabled = true;
        
        // Bắt đầu vòng lặp game
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        gameLoop();
        
    } catch (error) {
        console.error('Lỗi khi bắt đầu game:', error);
        gameStarted = false;
        startGameBtn.disabled = false;
        alert('Lỗi khi bắt đầu game: ' + (error.message || 'Lỗi không xác định'));
    }
}

// Gửi điểm số
async function submitScore() {
    if (!signer) {
        alert('Vui lòng kết nối ví trước!');
        return;
    }
    
    if (score === 0) {
        alert('Bạn chưa có điểm nào để gửi!');
        return;
    }
    
    try {
        submitScoreBtn.disabled = true;
        console.log('Đang gửi điểm:', score);
        
        // Lấy địa chỉ ví hiện tại
        const address = await signer.getAddress();
        console.log('Địa chỉ ví:', address);
        
        // Lấy số dư mũ hiện có trước khi gửi điểm
        const balanceBefore = await flappyHatNFT.balanceOf(address);
        console.log('Số mũ trước khi gửi điểm:', balanceBefore.toString());
        
        // Gửi điểm
        const tx = await flappyGame.submitScore(score);
        console.log('Đã gửi giao dịch, đang chờ xác nhận...', tx.hash);
        
        // Hiển thị thông báo đang xử lý
        const processingEl = document.createElement('div');
        processingEl.id = 'processing-message';
        processingEl.style.position = 'fixed';
        processingEl.style.top = '20px';
        processingEl.style.left = '50%';
        processingEl.style.transform = 'translateX(-50%)';
        processingEl.style.padding = '10px 20px';
        processingEl.style.background = '#4CAF50';
        processingEl.style.color = 'white';
        processingEl.style.borderRadius = '5px';
        processingEl.style.zIndex = '1000';
        processingEl.textContent = 'Đang xử lý giao dịch, vui lòng chờ...';
        document.body.appendChild(processingEl);
        
        // Chờ giao dịch được xác nhận
        const receipt = await tx.wait();
        console.log('Giao dịch đã được xác nhận. Receipt:', receipt);
        
        // Xóa thông báo xử lý
        if (processingEl.parentNode) {
            processingEl.parentNode.removeChild(processingEl);
        }
        
        // Kiểm tra sự kiện trong receipt
        let hatRewarded = false;
        
        if (receipt.events && receipt.events.length > 0) {
            console.log('Các sự kiện trong receipt:', receipt.events);
            
            // Tìm sự kiện HatRewarded
            for (const event of receipt.events) {
                console.log('Sự kiện:', event.event, 'Args:', event.args);
                if (event.event === 'HatRewarded' || (event.eventSignature && event.eventSignature.includes('HatRewarded'))) {
                    const [player, tokenId, level] = event.args || [];
                    if (player && tokenId && level) {
                        console.log(`Nhận được mũ! Cấp độ: ${level}, Token ID: ${tokenId}`);
                        // Hiển thị thông báo đẹp hơn
                        const hatMessage = document.createElement('div');
                        hatMessage.id = 'hat-message';
                        hatMessage.style.position = 'fixed';
                        hatMessage.style.top = '20px';
                        hatMessage.style.left = '50%';
                        hatMessage.style.transform = 'translateX(-50%)';
                        hatMessage.style.padding = '15px 25px';
                        hatMessage.style.background = '#4CAF50';
                        hatMessage.style.color = 'white';
                        hatMessage.style.borderRadius = '5px';
                        hatMessage.style.zIndex = '1000';
                        hatMessage.style.fontSize = '18px';
                        hatMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                        hatMessage.innerHTML = `🎉 Chúc mừng! Bạn đã nhận được mũ cấp ${level} (ID: ${tokenId})`;
                        document.body.appendChild(hatMessage);
                        
                        // Tự động ẩn sau 5 giây
                        setTimeout(() => {
                            if (hatMessage.parentNode) {
                                hatMessage.parentNode.removeChild(hatMessage);
                            }
                        }, 5000);
                        
                        hatRewarded = true;
                        break;
                    }
                }
            }
        }
        
        // Kiểm tra lại số dư mũ sau khi gửi điểm
        const balanceAfter = await flappyHatNFT.balanceOf(address);
        console.log('Số mũ sau khi gửi điểm:', balanceAfter.toString());
        
        // Cập nhật danh sách mũ trước khi hiển thị thông báo
        await loadPlayerHats();
        
        if (!hatRewarded) {
            // Nếu không tìm thấy sự kiện, kiểm tra xem có mũ mới không
            if (balanceAfter.gt(balanceBefore)) {
                // Hiển thị thông báo nhận mũ
                const newHatMessage = document.createElement('div');
                newHatMessage.id = 'new-hat-message';
                newHatMessage.style.position = 'fixed';
                newHatMessage.style.top = '20px';
                newHatMessage.style.left = '50%';
                newHatMessage.style.transform = 'translateX(-50%)';
                newHatMessage.style.padding = '15px 25px';
                newHatMessage.style.background = '#4CAF50';
                newHatMessage.style.color = 'white';
                newHatMessage.style.borderRadius = '5px';
                newHatMessage.style.zIndex = '1000';
                newHatMessage.style.fontSize = '18px';
                newHatMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                newHatMessage.textContent = '🎉 Bạn đã nhận được mũ mới!';
                document.body.appendChild(newHatMessage);
                
                // Tự động ẩn sau 5 giây
                setTimeout(() => {
                    if (newHatMessage.parentNode) {
                        newHatMessage.parentNode.removeChild(newHatMessage);
                    }
                }, 5000);
            } else {
                // Kiểm tra điều kiện nhận mũ
                const levels = await flappyGame.getLevels();
                console.log('Các mức điểm để nhận mũ:', levels);
                
                // Tìm mức điểm tiếp theo
                const nextLevel = levels.find(l => l.gt(score));
                if (nextLevel) {
                    alert(`Chúc mừng! Bạn đã gửi điểm thành công.\nCần đạt ${nextLevel} điểm để nhận mũ tiếp theo!`);
                } else {
                    alert('Chúc mừng! Bạn đã đạt được tất cả các mũ có thể nhận!');
                }
            }
        }
    } catch (error) {
        console.error('Lỗi khi gửi điểm:', error);
        alert('Lỗi khi gửi điểm: ' + (error.message || 'Lỗi không xác định'));
    } finally {
        submitScoreBtn.disabled = false;
    }
}

// Hàm hiển thị thông báo
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// Hàm lấy màu sắc mũ dựa trên cấp độ
function getHatColor(level) {
    const colors = {
        5: '#808080',   // Gray - Level 5
        10: '#00FF00',  // Green - Level 10
        25: '#0000FF',  // Blue - Level 25
        50: '#800080',  // Purple - Level 50
        75: '#FFA500',  // Orange - Level 75
        100: '#FF0000'  // Red - Level 100
    };
    return colors[level] || '#000000'; // Default to black if level not found
}


// Hàm đội mũ
async function equipHat(tokenId) {
    try {
        // Lấy thông tin level của mũ
        const level = await flappyHatNFT.hatLevelOf(tokenId);
        
        // Lưu thông tin mũ đang đội vào localStorage
        localStorage.setItem('equippedHat', tokenId);
        
        // Cập nhật màu mũ cho chim
        bird.hatColor = getHatColor(level);
        bird.hatLevel = level;
        
        // Cập nhật giao diện
        await updateEquippedHatUI(tokenId);
        
        showNotification(`Đã đội mũ cấp ${level} thành công!`, 'success');
    } catch (error) {
        console.error('Lỗi khi đội mũ:', error);
        showNotification('Lỗi khi đội mũ: ' + (error.message || 'Lỗi không xác định'), 'error');
    }
}

// Tải mũ đang đội
async function loadEquippedHat() {
    const equippedHatId = localStorage.getItem('equippedHat');
    if (equippedHatId) {
        try {
            // Kiểm tra xem mũ có còn tồn tại không
            const owner = await flappyHatNFT.ownerOf(equippedHatId);
            const address = await signer.getAddress();
            if (owner.toLowerCase() === address.toLowerCase()) {
                // Lấy thông tin level của mũ
                const level = await flappyHatNFT.hatLevelOf(equippedHatId);
                
                // Cập nhật màu mũ cho chim
                bird.hatColor = getHatColor(level);
                bird.hatLevel = level;
                
                // Cập nhật giao diện
                await updateEquippedHatUI(equippedHatId);
                return;
            }
        } catch (error) {
            console.log('Mũ đang đội không còn tồn tại hoặc đã bị bán');
        }
        // Nếu mũ không còn tồn tại, xóa khỏi localStorage
        localStorage.removeItem('equippedHat');
        bird.hatColor = null;
        bird.hatLevel = null;
    } else {
        bird.hatColor = null;
        bird.hatLevel = null;
    }
}

// Cập nhật giao diện mũ đang đội
async function updateEquippedHatUI(tokenId) {
    // Xóa class 'equipped' khỏi tất cả các mũ
    document.querySelectorAll('.hat-item').forEach(item => {
        item.classList.remove('equipped');
    });
    
    if (!tokenId) return;
    
    // Thêm class 'equipped' cho mũ đang đội
    const equippedHat = document.querySelector(`.hat-item[data-token-id="${tokenId}"]`);
    if (equippedHat) {
        equippedHat.classList.add('equipped');
    }
    
    // Cập nhật hình ảnh mũ trên đầu con chim (nếu đang trong game)
    if (gameStarted) {
        // Code để cập nhật hình ảnh mũ trên con chim
        // Bạn cần thêm logic vẽ mũ lên canvas ở đây
    }
}

// Tải mũ đang đội
async function loadEquippedHat() {
    const equippedHatId = localStorage.getItem('equippedHat');
    if (equippedHatId) {
        try {
            // Kiểm tra xem mũ có còn tồn tại không
            const owner = await flappyHatNFT.ownerOf(equippedHatId);
            const address = await signer.getAddress();
            if (owner.toLowerCase() === address.toLowerCase()) {
                await updateEquippedHatUI(equippedHatId);
                return;
            }
        } catch (error) {
            console.log('Mũ đang đội không còn tồn tại hoặc đã bị bán');
        }
        // Nếu mũ không còn tồn tại, xóa khỏi localStorage
        localStorage.removeItem('equippedHat');
    }
}

// Vòng lặp game
function gameLoop() {
    update();
    draw();
    
    if (!gameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Cập nhật trạng thái game
function update() {
    if (!gameStarted || gameOver) return;
    
    // Cập nhật vị trí chim
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Kiểm tra va chạm với biên
    if (bird.y <= 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
    
    if (bird.y + bird.height > gameCanvas.height) {
        endGame();
        return;
    }
    
    // Tạo ống mới
    if (frameCount % pipeSpawnRate === 0) {
        createPipe();
    }
    
    // Cập nhật ống
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 1.1;  // Giảm tốc độ di chuyển của ống
        
        // Kiểm tra va chạm
        if (checkCollision(bird, pipes[i])) {
            endGame();
            return;
        }
        
        // Tăng điểm khi vượt qua ống
        if (!pipes[i].scored && bird.x > pipes[i].x + pipeWidth) {
            pipes[i].scored = true;
            score++;
            console.log('Điểm:', score);  // Log để debug
        }
        
        // Xóa ống đã ra khỏi màn hình
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
    
    frameCount++;
}

// Vẽ game
function draw() {
    // Xóa màn hình
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Vẽ nền
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Vẽ chim
    ctx.fillStyle = bird.color;
    ctx.save();
    ctx.translate(bird.x + bird.width/2, bird.y + bird.height/2);
    const rotation = Math.min(Math.max(bird.velocity * 3, -30), 30);
    ctx.rotate(rotation * Math.PI / 180);
    
    // Vẽ thân chim
    ctx.fillRect(-bird.width/2, -bird.height/2, bird.width, bird.height);
    
    // Vẽ mũ nếu đang đội
    if (bird.hatColor) {
    ctx.save();
    const hatY = -bird.height/2 - 5;
    
    // Set the hat color from the bird's hatColor property
    ctx.fillStyle = bird.hatColor;
    
    // Draw hat brim
    ctx.beginPath();
    ctx.ellipse(0, hatY, bird.width * 0.7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw hat body
    ctx.fillRect(-bird.width * 0.6, hatY - 10, bird.width * 1.2, 10);
    
    // Draw hat top
    ctx.beginPath();
    ctx.moveTo(-bird.width * 0.4, hatY - 10);
    ctx.lineTo(0, hatY - 20);
    ctx.lineTo(bird.width * 0.4, hatY - 10);
    ctx.fill();
    
    ctx.restore();
    }
    
    ctx.restore();
    
    // Vẽ ống
    ctx.fillStyle = '#2E8B57';
    pipes.forEach(pipe => {
        // ống trên
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        // ống dưới
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, gameCanvas.height - pipe.bottom);
    });
    
    // Vẽ điểm
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`Điểm: ${score}`, 10, 30);
}

// Tạo ống mới
function createPipe() {
    const gap = 180; // Tăng từ 150 lên 180 để dễ chơi hơn
    const minHeight = 50;
    const maxHeight = gameCanvas.height - gap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    
    pipes.push({
        x: gameCanvas.width,
        top: height,
        bottom: height + gap,
        width: pipeWidth
    });
}

// Kiểm tra va chạm
function checkCollision(bird, pipe) {
    // Kiểm tra va chạm với ống trên
    if (bird.x < pipe.x + pipe.width &&
        bird.x + bird.width > pipe.x &&
        bird.y < pipe.top) {
        return true;
    }
    
    // Kiểm tra va chạm với ống dưới
    if (bird.x < pipe.x + pipe.width &&
        bird.x + bird.width > pipe.x &&
        bird.y + bird.height > pipe.bottom) {
        return true;
    }
    
    return false;
}

// Kết thúc game
function endGame() {
    gameOver = true;
    gameStarted = false;
    
    // Hiển thị màn hình kết thúc
    gameOverEl.style.display = 'block';
    finalScoreEl.textContent = score;
    
    // Kích hoạt nút chơi lại và gửi điểm
    startGameBtn.disabled = false;
    submitScoreBtn.disabled = false;
}

// Khởi chạy ứng dụng
window.addEventListener('DOMContentLoaded', () => {
    init().catch(console.error);
});