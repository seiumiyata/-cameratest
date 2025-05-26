# バーコードリーダー PWA

このプロジェクトは、スマートフォンやPCのブラウザで動作するPWA（プログレッシブウェブアプリ）型のバーコードリーダーです。  
カメラでバーコードを読み取り、ピントが合った瞬間に効果音を鳴らし、スキャン後はカメラ画面を非表示にして結果のみを表示します。  
オフラインでも動作し、iOS/AndroidのChrome・Safariに対応しています。

---

## 特長

- **ピントが合った瞬間に効果音を再生**
- **スキャン完了後はカメラ画面を非表示、結果のみ表示**
- **再スキャンもワンタップ**
- **PWA対応でホーム画面追加・オフライン動作**
- **iOS/Androidの主要ブラウザ対応**
- **html5-qrcodeライブラリをローカルキャッシュ**

---

## セットアップ手順

1. **リポジトリをクローンまたはダウンロード**
2. [html5-qrcode公式GitHub](https://github.com/mebjas/html5-qrcode/releases)から`html5-qrcode.min.js`をダウンロードし、  
   プロジェクト直下（例: `/your-path/-cameratest/`）に配置
3. 必要なファイルをサーバーまたはローカルに配置
    - `index.html`
    - `app.js`
    - `html5-qrcode.min.js`
    - `manifest.json`
    - `sw.js`
    - `icon-192.png`
4. サーバーで公開、またはローカルで`index.html`をブラウザで開く

---

## 使い方

1. ブラウザで`index.html`を開く
2. 「スキャン開始」ボタンを押す
3. バーコードにカメラを向ける
4. ピントが合うと音が鳴り、スキャンされるとカメラ画面が消えて結果が表示される
5. 「再スキャン」ボタンで再度スキャン可能

---

## PWAとしてインストール

- ChromeやSafariでページを開き、「ホーム画面に追加」からPWAとしてインストールできます
- オフラインでも動作します

---

## 注意事項

- **iOS Safariでは初回のみ「音をON」ボタンを押してからスキャンしてください**
- カメラ利用許可が必要です
- バーコードの種類によっては読み取れない場合があります

---

## ファイル構成

```
|- index.html
|- app.js
|- html5-qrcode.min.js
|- manifest.json
|- sw.js
|- icon-192.png
```

---

## ライセンス

- このプロジェクトはMITライセンスです
- `html5-qrcode`は[公式リポジトリ](https://github.com/mebjas/html5-qrcode)のライセンスに従ってください

---

## クレジット

- バーコード読み取り: [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- アイコン: オリジナルまたはフリー素材

---

## サポート・フィードバック

ご質問・ご要望はIssueまたはメール等でご連絡ください。

---
Perplexity の Eliot より: pplx.ai/share
