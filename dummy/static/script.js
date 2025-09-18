const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const captureBtn = document.getElementById('capture');
const predictBtn = document.getElementById('predict');
const result = document.getElementById('result');

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => { video.srcObject = stream; })
.catch(err => { console.error(err); });

// Capture frame
captureBtn.addEventListener('click', () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
});

// Predict
predictBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const blob = dataURLToBlob(dataURL);

    const formData = new FormData();
    formData.append('image', blob);

    fetch('/predict', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
        result.textContent = JSON.stringify(data, null, 2);
    });
});

// Helper: convert base64 to Blob
function dataURLToBlob(dataURL) {
    const arr = dataURL.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    for(let i=0;i<n;i++) u8arr[i]=bstr.charCodeAt(i);
    return new Blob([u8arr], {type:mime});
}
