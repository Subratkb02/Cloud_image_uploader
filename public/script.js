let fileInput;
let previewContainer;
let progressContainer;
let resultContainer;
let imageUrl;
const API_URL = 'https://cloud-image-uploader-1.onrender.com/'; 

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    fileInput = document.getElementById('fileInput');
    previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    resultContainer = document.getElementById('resultContainer');
    imageUrl = document.getElementById('imageUrl');

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    // File input handler
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFile(file);
    });
});

// Handle file selection
function handleFile(file) {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('imagePreview').src = e.target.result;
        document.getElementById('fileName').textContent = `Name: ${file.name}`;
        document.getElementById('fileSize').textContent = `Size: ${formatFileSize(file.size)}`;
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function uploadFile() {
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        previewContainer.style.display = 'none';
        progressContainer.style.display = 'block';
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('progressText').textContent = 'Uploading...';

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            progressContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            imageUrl.value = data.fileUrl;
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    } catch (error) {
        alert('Error uploading file: ' + error.message);
        resetUploader();
    }
}

function copyUrl() {
    imageUrl.select();
    document.execCommand('copy');
    alert('URL copied to clipboard!');
}

function resetUploader() {
    fileInput.value = '';
    previewContainer.style.display = 'none';
    progressContainer.style.display = 'none';
    resultContainer.style.display = 'none';
}

function clearPreview() {
    fileInput.value = '';
    previewContainer.style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
