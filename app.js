class BarcodeReader {
    constructor() {
        this.html5QrCode = null;
        this.isScanning = false;
        this.cameras = [];
        this.selectedCameraId = null;
        this.lastScanned = '';
        this.audio = document.getElementById('beep-audio');
        this.lastScanStatus = false;

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
        this.readerDiv = document.getElementById('reader');
        this.controlsDiv = document.getElementById('controls');
        this.rescanBtn = document.getElementById('rescan-btn');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startScanning());
        this.stopBtn.addEventListener('click', () => this.stopScanning());
        this.cameraSelect.addEventListener('change', () => this.onCameraChange());
        this.soundBtn.addEventListener('click', () => this.enableSound());
        this.rescanBtn.addEventListener('click', () => this.rescan());
    }

    enableSound() {
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
            this.showError('カメラへのアクセス権限が必要です。ブラウザの設定でカメラを許可してください。');
            console.error('Camera permission error:', error);
        }
    }

    async getCameras() {
        try {
            this.cameras = await Html5Qrcode.getCameras();
            if (this.cameras && this.cameras.length > 0) {
                // 修正：this.cameras.id → this.cameras[0].id
                let defaultCamera = this.cameras.find(camera =>
                    camera.label.toLowerCase().includes('back') ||
                    camera.label.toLowerCase().includes('rear')
                )?.id ||
                this.cameras.find(camera =>
                    camera.label.toLowerCase().includes('front')
                )?.id ||
                this.cameras[0].id; // ← ここを修正！

                this.populateCameraSelect(defaultCamera);
                this.selectedCameraId = defaultCamera;
            } else {
                this.showError('利用可能なカメラが見つかりません。');
            }
        } catch (error) {
            this.showError('カメラの取得に失敗しました。ブラウザでカメラが許可されているか確認してください。');
            console.error('Get cameras error:', error);
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
                (errorMessage) => this.onScanFailure(errorMessage)
            );
            this.isScanning = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.cameraSelect.disabled = true;
            this.showError('');
            this.lastScanned = '';
            this.lastScanStatus = false;
            this.readerDiv.classList.remove('hidden');
            this.controlsDiv.classList.remove('hidden');
            this.rescanBtn.classList.add('hidden');
        } catch (error) {
            this.showError(`スキャンを開始できませんでした: ${error.message}`);
            console.error('Start scanning error:', error);
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
            console.error('Stop scanning error:', error);
        }
    }

    onScanFailure(errorMessage) {
        this.lastScanStatus = false;
    }

    onScanSuccess(decodedText) {
        if (!this.lastScanStatus) {
            this.playBeep();
        }
        this.lastScanStatus = true;

        const numbers = decodedText.replace(/\D/g, '');
        if (numbers && numbers !== this.lastScanned) {
            this.resultElement.textContent = numbers;
            this.resultElement.style.backgroundColor = '#d4edda';
            setTimeout(() => {
                this.resultElement.style.backgroundColor = '';
            }, 1000);
            this.lastScanned = numbers;
            this.stopScanning();
            this.hideCameraView();
        }
    }

    hideCameraView() {
        this.readerDiv.classList.add('hidden');
        this.controlsDiv.classList.add('hidden');
        this.rescanBtn.classList.remove('hidden');
    }

    rescan() {
        this.resultElement.textContent = 'まだスキャンされていません';
        this.readerDiv.classList.remove('hidden');
        this.controlsDiv.classList.remove('hidden');
        this.rescanBtn.classList.add('hidden');
        this.startScanning();
    }

    playBeep() {
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

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}

document.addEventListener('DOMContentLoaded', () => {
    new BarcodeReader();
});
