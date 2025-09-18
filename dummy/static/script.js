const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const captureBtn = document.getElementById('capture');
const predictBtn = document.getElementById('predict');
const roiDiv = document.getElementById('roi');
const cuDiv = document.getElementById('cu');
const feDiv = document.getElementById('fe');

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => { video.srcObject = stream; })
.catch(err => { console.error(err); });

// Set ROI div di tengah video
function updateROI() {
    const w = video.offsetWidth / 2;
    const h = video.offsetHeight / 2;
    const x = video.offsetLeft + video.offsetWidth/4;
    const y = video.offsetTop + video.offsetHeight/4;

    roiDiv.style.width = w + "px";
    roiDiv.style.height = h + "px";
    roiDiv.style.left = x + "px";
    roiDiv.style.top = y + "px";
}
video.addEventListener('loadedmetadata', updateROI);
window.addEventListener('resize', updateROI);

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
        animateResult(cuDiv, data.cu_ppm);
        animateResult(feDiv, data.fe_ppm);
    });
});

// Animasi update hasil
function animateResult(div, value) {
    div.textContent = value.toFixed(2);
    if(value < 5) div.style.backgroundColor = "#4caf50";      // hijau
    else if(value < 15) div.style.backgroundColor = "#ffeb3b"; // kuning
    else div.style.backgroundColor = "#f44336";               // merah
    div.style.transform = "scale(1.2)";
    setTimeout(() => { div.style.transform = "scale(1)"; }, 300);
}

// Helper: convert base64 to Blob
function dataURLToBlob(dataURL) {
    const arr = dataURL.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    for(let i=0;i<n;i++) u8arr[i]=bstr.charCodeAt(i);
    return new Blob([u8arr], {type:mime});
}
