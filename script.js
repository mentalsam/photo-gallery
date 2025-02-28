const imageInput = document.getElementById('imageInput');
const imageContainer = document.getElementById('imageContainer');

imageInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!data || !data.secure_url) {
            throw new Error('アップロードに失敗しました');
        }

        displayImage(data.secure_url, file.name);
        imageInput.value = '';

    } catch (error) {
        console.error('アップロードエラー:', error);
        alert('アップロードに失敗しました。もう一度お試しください。');
    }
});

function displayImage(url, filename) {
    const div = document.createElement('div');
    div.className = 'image-item';

    const img = document.createElement('img');
    img.src = url;
    img.alt = filename || '画像';

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'ダウンロード';
    downloadBtn.className = 'download-btn';
    downloadBtn.onclick = () => downloadImage(url, filename);

    div.appendChild(img);
    div.appendChild(downloadBtn);
    imageContainer.appendChild(div);
}

function downloadImage(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
