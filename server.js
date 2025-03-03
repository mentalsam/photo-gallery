const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// アップロードされたファイルを保存するディレクトリ
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multerの設定
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// 写真アップロード用のエンドポイント
app.post('/upload', upload.single('photo'), (req, res) => {
    if (req.file) {
        res.json({ success: true, filename: req.file.filename });
    } else {
        res.status(400).json({ success: false });
    }
});

// 写真一覧を取得するエンドポイント
app.get('/photos', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan files' });
        }
        res.json(files);
    });
});

// 写真削除用のエンドポイント
app.delete('/delete/:filename', (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
