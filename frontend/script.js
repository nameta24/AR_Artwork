let artworkUrl = '';
let arContentUrl = '';

// ✅ Use dynamic base URL
const baseURL = window.location.origin;

async function uploadFile(type) {
  const input = document.getElementById(`${type}Input`);
  const status = document.getElementById(`${type}Status`);
  if (!input.files[0]) {
    status.textContent = 'Please select a file.';
    return;
  }

  const formData = new FormData();
  formData.append('file', input.files[0]);

  try {
    const response = await fetch(`${baseURL}/upload/${type}`, {
      method: 'POST',
      credentials: 'include', // ✅ important for session
      body: formData
    });

    const data = await response.json();

    if (data.error) {
      status.textContent = data.error;
    } else {
      status.textContent = 'File uploaded successfully!';
      if (type === 'artwork') artworkUrl = data.url;
      else arContentUrl = data.url;
    }
  } catch (error) {
    status.textContent = `Error uploading file: ${error.message}`;
    console.error('Upload error:', error);
  }
}

async function publishAR() {
  const status = document.getElementById('publishStatus');
  if (!artworkUrl || !arContentUrl) {
    status.textContent = 'Please upload both artwork and AR content.';
    return;
  }

  try {
    const response = await fetch(`${baseURL}/publish`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ artworkUrl, arContentUrl })
    });

    const data = await response.json();

    if (data.error) {
      status.textContent = data.error;
    } else {
      const arUrl = `${baseURL}${data.url}`;
      status.innerHTML = `AR Experience published! <a href="${arUrl}" target="_blank">View AR Experience</a>`;
    }
  } catch (error) {
    status.textContent = `Error publishing AR experience: ${error.message}`;
    console.error('Publish error:', error);
  }
}
