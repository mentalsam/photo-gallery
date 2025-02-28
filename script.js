const imageInput = document.getElementById('imageInput');
const imageContainer = document.getElementById('imageContainer');
const CLOUD_NAME = 'あなたのCloudinary Cloud Name';
const UPLOAD_PRESET = '署名なしアップロード用のプリセット'; // Cloudinaryダッシュボードで作成

// ローカルストレージから画像一覧を取得（簡易永続化）
let images = JSON.parse(localStorage.getItem('uploadedImages')) || [];

// 初期表示
displayImages();

// 画像アップロード
imageInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            formData
        );
        const imageData = {
            url: response.data.secure_url,
            publicId: response.data.public_id,
            filename: file.name
        };
        images.push(imageData);
        localStorage.setItem('uploadedImages', JSON.stringify(images));
        displayImages();
        imageInput.value = '';
    } catch (error) {
        console.error('アップロードエラー:', error);
    }
});

// 画像表示
function displayImages() {
    imageContainer.innerHTML = '';
    images.forEach((image, index) => {
        const div = document.createElement('div');
        div.className = 'image-item';

        const img = document.createElement('img');
        img.src = image.url;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '削除';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteImage(index);

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'ダウンロード';
        downloadBtn.className = 'download-btn';
        downloadBtn.onclick = () => downloadImage(image.url, image.filename);

        div.appendChild(img);
        div.appendChild(deleteBtn);
        div.appendChild(downloadBtn);
        imageContainer.appendChild(div);
    });
}

// 画像削除
function deleteImage(index) {
    images.splice(index, 1);
    localStorage.setItem('uploadedImages', JSON.stringify(images));
    displayImages();
}

// 画像ダウンロード
function downloadImage(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
