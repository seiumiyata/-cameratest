class BarcodeReader {
    constructor() {
        this.html5QrCode = null;
        this.isScanning = false;
        this.cameras = [];
        this.selectedCameraId = null;
        this.lastScanned = '';
        this.audio = document.getElementById('beep-audio');

        this.initElements();
        this.bindEvents();
        this.requestCameraPermission();
    }

    initElements() {
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.resultElement = document.getElementById('barcode-result');
        this.errorElement = document.getElementById('error-message');
        this.cameraSelect = document.getElementById('camera-select');
        this.soundBtn = document.getElementById('sound-btn');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startScanning());
        this.stopBtn.addEventListener('click', () => this.stopScanning());
        this.cameraSelect.addEventListener('change', () => this.onCameraChange());
        this.soundBtn.addEventListener('click', () => this.enableSound());
    }

    enableSound() {
        // iOSで音を有効化するために一度再生
        this.audio.play().catch(()=>{});
    }

    async requestCameraPermission() {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
                // リアカメラ優先で初期選択
                let defaultCamera = this.cameras.find(camera =>
                    camera.label.toLowerCase().includes('back') ||
                    camera.label.toLowerCase().includes('rear')
                )?.id ||
                this.cameras.find(camera =>
                    camera.label.toLowerCase().includes('front')
                )?.id ||
                this.cameras[0].id;

                this.populateCameraSelect(defaultCamera);
                this.selectedCameraId = defaultCamera;
            }
        } catch (error) {
            this.showError('カメラの取得に失敗しました。');
        }
    }

    populateCameraSelect(defaultCameraId) {
        this.cameraSelect.innerHTML = '';
        this.cameras.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.id;
            option.text = camera.label || `カメラ${camera.id}`;
            if (camera.id === defaultCameraId) {
                option.selected = true;
            }
            this.cameraSelect.appendChild(option);
        });
    }

    onCameraChange() {
        this.selectedCameraId = this.cameraSelect.value;
        if (this.isScanning) {
            this.stopScanning().then(() => this.startScanning());
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
                this.selectedCameraId,
                config,
                (decodedText) => this.onScanSuccess(decodedText),
                () => {}
            );
            this.isScanning = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.cameraSelect.disabled = true;
            this.showError('');
            this.lastScanned = '';
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
            this.cameraSelect.disabled = false;
        } catch (error) {
            // 無視
        }
    }

    onScanSuccess(decodedText) {
        const numbers = decodedText.replace(/\D/g, '');
        if (numbers && numbers !== this.lastScanned) {
            this.resultElement.textContent = numbers;
            this.resultElement.style.backgroundColor = '#d4edda';
            setTimeout(() => {
                this.resultElement.style.backgroundColor = '';
            }, 1000);
            this.playBeep();
            this.lastScanned = numbers;
            this.stopScanning(); // 1回で自動停止
        }
    }

    playBeep() {
        // 効果音を再生
        this.audio.currentTime = 0;
        this.audio.play().catch(()=>{});
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
    navigator.serviceWorker.register('./sw.js');
}

document.addEventListener('DOMContentLoaded', () => {
    new BarcodeReader();
});
