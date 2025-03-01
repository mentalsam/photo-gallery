const imageInput = document.getElementById('imageInput');
const imageContainer = document.getElementById('imageContainer');
const loadingIndicator = document.getElementById('loading');

let images = [];

// 初期ロード時に画像リストを取得
loadImages();

// 画像アップロードイベント
imageInput.addEventListener('change', async function(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // ロード中表示
    showLoading(true);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        try {
            // サーバーAPIを使用してアップロード
            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (!response.data || !response.data.secure_url) {
                throw new Error('アップロードレスポンスが不正です');
            }
            
        } catch (error) {
            console.error('アップロードエラー:', error);
            alert(`"${file.name}" のアップロードに失敗しました。もう一度お試しください。`);
        }
    }
    
    // アップロード完了後に画像リストを再取得
    await loadImages();
    imageInput.value = '';
    showLoading(false);
});

// サーバーから画像リストを取得
async function loadImages() {
    try {
        showLoading(true);
        const response = await axios.get('/api/images');
        images = response.data;
        displayImages();
    } catch (error) {
        console.error('画像データ取得エラー:', error);
        alert('画像データの取得に失敗しました。ページを更新してください。');
    } finally {
        showLoading(false);
    }
}

// 画像の表示処理
function displayImages() {
    imageContainer.innerHTML = '';
    
    if (images.length === 0) {
        const message = document.createElement('p');
        message.textContent = '画像がありません。画像を追加してください。';
        imageContainer.appendChild(message);
        return;
    }

    images.forEach((image, index) => {
        if (!image || !image.url) return;

        const div = document.createElement('div');
        div.className = 'image-item';

        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.filename || '画像';
        img.onerror = () => {
            img.src = 'https://via.placeholder.com/150?text=Error';
        };

        const filename = document.createElement('p');
        filename.className = 'filename';
        filename.textContent = image.filename || 'Unnamed';
        
        const timestamp = document.createElement('p');
        timestamp.className = 'timestamp';
        timestamp.textContent = image.uploadedAt ? new Date(image.uploadedAt).toLocaleString() : '';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '削除';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteImage(index);

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'ダウンロード';
        downloadBtn.className = 'download-btn';
        downloadBtn.onclick = () => downloadImage(image.url, image.filename || 'downloaded-image.jpg');

        div.appendChild(img);
        div.appendChild(filename);
        div.appendChild(timestamp);
        div.appendChild(deleteBtn);
        div.appendChild(downloadBtn);
        imageContainer.appendChild(div);
    });
}

// 画像削除処理
async function deleteImage(index) {
    if (index >= 0 && index < images.length) {
        try {
            showLoading(true);
            await axios.delete(`/api/images/${index}`);
            await loadImages(); // 画像リストを再取得
        } catch (error) {
            console.error('削除エラー:', error);
            alert('画像の削除に失敗しました。もう一度お試しください。');
            showLoading(false);
        }
    }
}

// 画像ダウンロード処理
function downloadImage(url, filename) {
    if (!url) return;
    
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        })
        .catch(error => {
            console.error('ダウンロードエラー:', error);
            alert('ダウンロードに失敗しました。もう一度お試しください。');
        });
}

// ローディングインジケーターの表示/非表示
function showLoading(show) {
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }
}
