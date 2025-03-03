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
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';

            const img = document.createElement('img');
            img.src = `/uploads/${photo}`;
            photoItem.appendChild(img);

            const downloadButton = document.createElement('button');
            downloadButton.textContent = 'ダウンロード';
            downloadButton.addEventListener('click', () => {
                window.open(`/uploads/${photo}`, '_blank');
            });
            photoItem.appendChild(downloadButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '削除';
            deleteButton.addEventListener('click', () => {
                deletePhoto(photo);
            });
            photoItem.appendChild(deleteButton);

            gallery.appendChild(photoItem);
        });
    })
    .catch(error => console.error('Error:', error));
}

function deletePhoto(filename) {
    if (confirm('本当に削除しますか？')) {
        fetch(`/delete/${filename}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('写真が削除されました！');
                loadGallery();
            } else {
                alert('削除に失敗しました。');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

// ページ読み込み時にギャラリーを読み込む
document.addEventListener('DOMContentLoaded', loadGallery);
