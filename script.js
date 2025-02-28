const imageInput = document.getElementById('imageInput');
const imageContainer = document.getElementById('imageContainer');

const CLOUD_NAME = 'dbcqnzlvc'; 
const UPLOAD_PRESET = 'mentalsam';

let images = JSON.parse(localStorage.getItem('uploadedImages')) || [];

displayImages();

imageInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            formData
        );

        if (!response.data || !response.data.secure_url) {
            throw new Error('アップロードレスポンスが不正です');
        }

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
        alert('アップロードに失敗しました。もう一度お試しください。');
    }
});

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
            img.src = 'データを読み込めませんでした';
        };

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

function deleteImage(index) {
    if (index >= 0 && index < images.length) {
        images.splice(index, 1);
        localStorage.setItem('uploadedImages', JSON.stringify(images));
        displayImages();
    }
}

function downloadImage(url, filename) {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
