class BarcodeReader {
    constructor() {
        this.html5QrCode = null;
        this.isScanning = false;
        this.cameras = [];
        this.selectedCameraId = null;
        
        this.initElements();
        this.bindEvents();
        this.requestCameraPermission();
    }
    
    initElements() {
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.resultElement = document.getElementById('barcode-result');
        this.errorElement = document.getElementById('error-message');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startScanning());
        this.stopBtn.addEventListener('click', () => this.stopScanning());
    }
    
    async requestCameraPermission() {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                stream.getTracks().forEach(track => track.stop());
                await this.getCameras();
            }
        } catch (error) {
            this.showError('カメラへのアクセス権限が必要です。');
        }
    }
    
    async getCameras() {
        try {
            this.cameras = await Html5Qrcode.getCameras();
            if (this.cameras && this.cameras.length > 0) {
                this.selectedCameraId = this.cameras.find(camera => 
                    camera.label.toLowerCase().includes('back')
                )?.id || this.cameras[0].id;
            }
        } catch (error) {
            this.showError('カメラの取得に失敗しました。');
        }
    }
    
    async startScanning() {
        if (this.isScanning) return;
        
        try {
            this.html5QrCode = new Html5Qrcode("reader");
            
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
            };
            
            await this.html5QrCode.start(
                this.selectedCameraId || { facingMode: "environment" },
                config,
                (decodedText) => this.onScanSuccess(decodedText),
                () => {} // エラーは無視
            );
            
            this.isScanning = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.showError('');
            
        } catch (error) {
            this.showError(`スキャンを開始できませんでした: ${error.message}`);
        }
    }
    
    async stopScanning() {
        if (!this.isScanning || !this.html5QrCode) return;
        
        try {
            await this.html5QrCode.stop();
            this.html5QrCode.clear();
            this.html5QrCode = null;
            
            this.isScanning = false;
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
        } catch (error) {
            console.error('スキャン停止エラー:', error);
        }
    }
    
    onScanSuccess(decodedText) {
        const numbers = decodedText.replace(/\D/g, '');
        
        if (numbers) {
            this.resultElement.textContent = numbers;
            this.resultElement.style.backgroundColor = '#d4edda';
            setTimeout(() => {
                this.resultElement.style.backgroundColor = '';
            }, 1000);
        } else {
            this.resultElement.textContent = `${decodedText}（数字なし）`;
        }
    }
    
    showError(message) {
        if (message) {
            this.errorElement.textContent = message;
            this.errorElement.style.display = 'block';
        } else {
            this.errorElement.style.display = 'none';
        }
    }
}

// PWA対応
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

// アプリ初期化
document.addEventListener('DOMContentLoaded', () => {
    new BarcodeReader();
});
