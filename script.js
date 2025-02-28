const imageInput = document.getElementById('imageInput');
const imageContainer = document.getElementById('imageContainer');

const CLOUD_NAME = 'dbcqnzlvc'; // Cloudinaryダッシュボードから正確にコピー
const UPLOAD_PRESET = 'mentalsam'; // Upload Presetsで作成した名前を確認

let images = JSON.parse(localStorage.getItem('uploadedImages')) || [];

displayImages();

imageInput.addEventListener('change', async function(e) {
    // ファイルが選択されたか確認
    if (!e.target.files || e.target.files.length === 0) {
        alert('ファイルが選択されていません');
        return;
    }

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        console.log('アップロード開始:', file.name);
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            formData,
            { timeout: 15000 } // 15秒タイムアウト
        );
        console.log('アップロード成功:', response.data.secure_url);

        const imageData = {
            url: response.data.secure_url,
            publicId: response.data.public_id,
            filename: file.name
        };
        images.push(imageData);
        localStorage.setItem('uploadedImages', JSON.stringify(images));
        displayImages();
        imageInput.value = ''; // 入力リセット
    } catch (error) {
        console.error('アップロードエラー:', error);
        let errorMsg = 'アップロードに失敗しました。';
        if (error.response) {
            errorMsg += `\nエラー: ${error.response.data.error.message}`;
        } else {
            errorMsg += `\n詳細: ${error.message}`;
        }
        alert(errorMsg);
    }
});

function displayImages() {
    imageContainer.innerHTML = '';
    images.forEach((image, index) => {
        const div = document.createElement('div');
        div.className = 'image-item';

        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.filename;

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
    images.splice(index, 1);
    localStorage.setItem('uploadedImages', JSON.stringify(images));
    displayImages();
}

function downloadImage(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
