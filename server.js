const express = require('express');
const multer = require('multer');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// データ保存用のJSONファイルパス
const DATA_FILE = path.join(__dirname, 'images.json');

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

// Cloudinary設定
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// データ読み込み関数
function loadImagesData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (err) {
        console.error('データ読み込みエラー:', err);
        return [];
    }
}

// データ保存関数
function saveImagesData(images) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(images, null, 2), 'utf8');
    } catch (err) {
        console.error('データ保存エラー:', err);
    }
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 画像アップロードAPI
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        cloudinary.uploader.upload_stream(
            { upload_preset: 'mentalsam' },
            (error, result) => {
                if (error) return res.status(500).json({ error: error.message });
                
                // 画像データを保存
                const images = loadImagesData();
                const imageData = {
                    url: result.secure_url,
                    publicId: result.public_id,
                    filename: req.file.originalname,
                    uploadedAt: new Date().toISOString()
                };
                
                images.push(imageData);
                saveImagesData(images);
                
                res.json(result);
            }
        ).end(req.file.buffer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 画像一覧取得API
app.get('/api/images', (req, res) => {
    try {
        const images = loadImagesData();
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 画像削除API
app.delete('/api/images/:index', (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const images = loadImagesData();
        
        if (index >= 0 && index < images.length) {
            const deletedImage = images.splice(index, 1)[0];
            
            // Cloudinaryからも削除（オプション）
            if (deletedImage.publicId) {
                cloudinary.uploader.destroy(deletedImage.publicId, (error) => {
                    if (error) console.error('Cloudinary削除エラー:', error);
                });
            }
            
            saveImagesData(images);
            res.json({ success: true, message: '画像が削除されました' });
        } else {
            res.status(404).json({ error: '画像が見つかりません' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// HTMLファイルの提供
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`サーバーがポート ${PORT} で起動しました`);
});
