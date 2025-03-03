document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData();
    const fileInput = document.getElementById('photoInput');
    formData.append('photo', fileInput.files[0]);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('写真がアップロードされました！');
            loadGallery();
        } else {
            alert('アップロードに失敗しました。');
        }
    })
    .catch(error => console.error('Error:', error));
});

function loadGallery() {
    fetch('/photos')
    .then(response => response.json())
    .then(photos => {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';
        photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = `/uploads/${photo}`;
            gallery.appendChild(img);
        });
    })
    .catch(error => console.error('Error:', error));
}

// ページ読み込み時にギャラリーを読み込む
document.addEventListener('DOMContentLoaded', loadGallery);