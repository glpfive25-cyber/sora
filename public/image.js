// Image Generation Page JavaScript
let currentMode = 'text'; // 'text' or 'edit'
let uploadedImageData = null;
let uploadedMaskData = null;
// Load history and filter out corrupted entries
let imageHistory = [];
try {
    const storedHistory = JSON.parse(localStorage.getItem('sora2-image-history') || '[]');
    // Filter out corrupted entries
    imageHistory = storedHistory.filter(item => {
        return item && item.images && Array.isArray(item.images) && item.images.length > 0;
    });
    // Clean localStorage if we found corrupted data
    if (storedHistory.length !== imageHistory.length) {
        console.log('Cleaning corrupted history entries...');
        localStorage.setItem('sora2-image-history', JSON.stringify(imageHistory));
    }
} catch (error) {
    console.error('Error loading history:', error);
    imageHistory = [];
}

// DOM Elements
const textToImageTab = document.getElementById('textToImageTab');
const imageEditTab = document.getElementById('imageEditTab');
const textToImageSection = document.getElementById('textToImageSection');
const imageEditSection = document.getElementById('imageEditSection');

// Text to Image Elements
const textToImageForm = document.getElementById('textToImageForm');
const imagePrompt = document.getElementById('imagePrompt');
const negativePrompt = document.getElementById('negativePrompt');
const imageSize = document.getElementById('imageSize');
const numImages = document.getElementById('numImages');
const imageModel = document.getElementById('imageModel');
const seed = document.getElementById('seed');
const steps = document.getElementById('steps');
const stepsValue = document.getElementById('stepsValue');
const cfgScale = document.getElementById('cfgScale');
const cfgValue = document.getElementById('cfgValue');
const advancedToggle = document.getElementById('advancedToggle');
const advancedSettings = document.getElementById('advancedSettings');
const advancedIcon = document.getElementById('advancedIcon');
const generateImageBtn = document.getElementById('generateImageBtn');
const imageResults = document.getElementById('imageResults');

// Image Edit Elements
const imageEditForm = document.getElementById('imageEditForm');
const editImageUpload = document.getElementById('editImageUpload');
const editImagePreview = document.getElementById('editImagePreview');
const editPreviewImg = document.getElementById('editPreviewImg');
const removeEditImage = document.getElementById('removeEditImage');
const editPrompt = document.getElementById('editPrompt');
const maskUploadSection = document.getElementById('maskUploadSection');
const maskUpload = document.getElementById('maskUpload');
const editImageBtn = document.getElementById('editImageBtn');
const editResults = document.getElementById('editResults');

// History
const historyGrid = document.getElementById('historyGrid');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadHistory();
});

function setupEventListeners() {
    // Tab switching
    textToImageTab.addEventListener('click', () => switchMode('text'));
    imageEditTab.addEventListener('click', () => switchMode('edit'));

    // Text to Image form
    textToImageForm.addEventListener('submit', handleTextToImage);

    // Advanced settings toggle
    advancedToggle.addEventListener('click', toggleAdvancedSettings);

    // Range inputs
    steps.addEventListener('input', (e) => {
        stepsValue.textContent = e.target.value;
    });

    cfgScale.addEventListener('input', (e) => {
        cfgValue.textContent = e.target.value;
    });

    // Image Edit form
    imageEditForm.addEventListener('submit', handleImageEdit);

    // Image upload
    editImageUpload.addEventListener('change', handleImageUpload);
    removeEditImage.addEventListener('click', handleRemoveImage);

    // Mask upload
    maskUpload.addEventListener('change', handleMaskUpload);

    // Edit type change
    document.querySelectorAll('input[name="editType"]').forEach(radio => {
        radio.addEventListener('change', handleEditTypeChange);
    });
}

// Mode Switching
function switchMode(mode) {
    currentMode = mode;

    if (mode === 'text') {
        textToImageTab.classList.add('tab-active');
        textToImageTab.classList.remove('tab-inactive');
        imageEditTab.classList.add('tab-inactive');
        imageEditTab.classList.remove('tab-active');

        textToImageSection.classList.remove('hidden');
        imageEditSection.classList.add('hidden');
    } else {
        imageEditTab.classList.add('tab-active');
        imageEditTab.classList.remove('tab-inactive');
        textToImageTab.classList.add('tab-inactive');
        textToImageTab.classList.remove('tab-active');

        imageEditSection.classList.remove('hidden');
        textToImageSection.classList.add('hidden');
    }
}

// Text to Image Generation
async function handleTextToImage(e) {
    e.preventDefault();

    const prompt = imagePrompt.value.trim();
    if (!prompt) {
        alert(window.i18n.t('pleaseEnterDescription'));
        return;
    }

    // Disable button and show loading
    generateImageBtn.disabled = true;
    generateImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Generating...</span>';

    // Show loading state
    showImageLoading();

    try {
        const requestBody = {
            prompt: prompt,
            negative_prompt: negativePrompt.value.trim(),
            size: imageSize.value,
            num_images: parseInt(numImages.value),
            model: imageModel.value
        };

        // Add optional parameters
        if (seed.value) {
            requestBody.seed = parseInt(seed.value);
        }
        if (steps.value) {
            requestBody.steps = parseInt(steps.value);
        }
        if (cfgScale.value) {
            requestBody.cfg_scale = parseFloat(cfgScale.value);
        }

        const response = await fetch('/api/image/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Image generation failed');
        }

        const data = await response.json();

        // 安全检查：确保返回的数据格式正确
        if (!data || !data.images || !Array.isArray(data.images)) {
            console.error('Invalid response from server:', data);
            throw new Error('Invalid response format from server');
        }

        displayGeneratedImages(data.images, prompt);

        // Save to history
        saveToHistory({
            type: 'text',
            prompt: prompt,
            images: data.images,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error:', error);
        showImageError(error.message);
    } finally {
        generateImageBtn.disabled = false;
        generateImageBtn.innerHTML = `<i class="fas fa-magic"></i><span>${window.i18n.t('generateImage')}</span>`;
    }
}

// Image Editing
async function handleImageEdit(e) {
    e.preventDefault();

    const editType = document.querySelector('input[name="editType"]:checked').value;
    const prompt = editPrompt.value.trim();

    if (!uploadedImageData) {
        alert(window.i18n.t('pleaseUploadImage'));
        return;
    }

    // Disable button and show loading
    editImageBtn.disabled = true;
    editImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Editing...</span>';

    // Show loading state
    showEditLoading();

    try {
        const requestBody = {
            image: uploadedImageData,
            edit_type: editType,
            prompt: prompt,
            model: imageModel.value
        };

        // Add mask if available
        if (uploadedMaskData) {
            requestBody.mask = uploadedMaskData;
        }

        const response = await fetch('/api/image/edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Image edit failed');
        }

        const data = await response.json();

        // 安全检查：确保返回的数据格式正确
        if (!data || !data.images || !Array.isArray(data.images)) {
            console.error('Invalid response from server:', data);
            throw new Error('Invalid response format from server');
        }

        displayEditedImages(data.images, prompt);

        // Save to history
        saveToHistory({
            type: 'edit',
            edit_type: editType,
            prompt: prompt,
            original_image: uploadedImageData,
            images: data.images,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error:', error);
        showEditError(error.message);
    } finally {
        editImageBtn.disabled = false;
        editImageBtn.innerHTML = `<i class="fas fa-edit"></i><span>${window.i18n.t('editImageBtn')}</span>`;
    }
}

// Image Upload Handlers
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert(window.i18n.t('pleaseUploadImageFile'));
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert(window.i18n.t('imageSizeLimit'));
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        uploadedImageData = event.target.result;
        editPreviewImg.src = event.target.result;
        editImagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function handleRemoveImage() {
    uploadedImageData = null;
    editImageUpload.value = '';
    editImagePreview.classList.add('hidden');
    editPreviewImg.src = '';
}

function handleMaskUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        uploadedMaskData = event.target.result;
    };
    reader.readAsDataURL(file);
}

function handleEditTypeChange(e) {
    const editType = e.target.value;

    // Show/hide mask upload for inpaint
    if (editType === 'inpaint') {
        maskUploadSection.classList.remove('hidden');
    } else {
        maskUploadSection.classList.add('hidden');
        uploadedMaskData = null;
        maskUpload.value = '';
    }
}

// UI Update Functions
function toggleAdvancedSettings() {
    advancedSettings.classList.toggle('hidden');
    advancedIcon.classList.toggle('rotate-180');
}

function showImageLoading() {
    imageResults.innerHTML = `
        <div class="flex items-center justify-center h-96">
            <div class="text-center">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p class="text-gray-600">${window.i18n.t('generatingImage')}</p>
            </div>
        </div>
    `;
}

function showEditLoading() {
    editResults.innerHTML = `
        <div class="flex items-center justify-center h-96">
            <div class="text-center">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p class="text-gray-600">${window.i18n.t('editingImage')}</p>
            </div>
        </div>
    `;
}

function showImageError(message) {
    imageResults.innerHTML = `
        <div class="text-center py-12">
            <div class="text-6xl mb-4">❌</div>
            <h3 class="text-lg font-semibold text-red-600 mb-2">${window.i18n.t('imageGenerationFailed')}</h3>
            <p class="text-sm text-gray-600">${message}</p>
            <button onclick="resetImageResults()" class="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                Try Again
            </button>
        </div>
    `;
}

function showEditError(message) {
    editResults.innerHTML = `
        <div class="text-center py-12">
            <div class="text-6xl mb-4">❌</div>
            <h3 class="text-lg font-semibold text-red-600 mb-2">${window.i18n.t('imageEditFailed')}</h3>
            <p class="text-sm text-gray-600">${message}</p>
            <button onclick="resetEditResults()" class="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                Try Again
            </button>
        </div>
    `;
}

function displayGeneratedImages(images, prompt) {
    // 安全检查：确保images是数组
    if (!images || !Array.isArray(images)) {
        console.error('Invalid images data:', images);
        showImageError('Invalid response from server');
        return;
    }

    if (images.length === 0) {
        showImageError('No images generated');
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'image-grid gap-4';

    images.forEach((imageData, index) => {
        const card = createImageCard(imageData, prompt, `gen-${Date.now()}-${index}`);
        grid.appendChild(card);
    });

    imageResults.innerHTML = '';
    imageResults.appendChild(grid);
}

function displayEditedImages(images, prompt) {
    // 安全检查：确保images是数组
    if (!images || !Array.isArray(images)) {
        console.error('Invalid images data:', images);
        showEditError('Invalid response from server');
        return;
    }

    if (images.length === 0) {
        showEditError('No images edited');
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'image-grid gap-4';

    images.forEach((imageData, index) => {
        const card = createImageCard(imageData, prompt, `edit-${Date.now()}-${index}`);
        grid.appendChild(card);
    });

    editResults.innerHTML = '';
    editResults.appendChild(grid);
}

function createImageCard(imageData, prompt, id) {
    const card = document.createElement('div');
    card.className = 'image-card fade-in';
    card.innerHTML = `
        <img src="${imageData}" alt="Generated image" class="w-full h-full object-cover rounded-lg">
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
            <p class="text-white text-xs truncate">${prompt}</p>
            <div class="flex space-x-2 mt-2">
                <button onclick="downloadImage('${imageData}', '${id}')" class="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs transition">
                    <i class="fas fa-download"></i>
                </button>
                <button onclick="copyImage('${imageData}')" class="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs transition">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        </div>
    `;
    return card;
}

function resetImageResults() {
    imageResults.innerHTML = `
        <div class="text-center py-12 text-gray-400">
            <i class="fas fa-image text-6xl mb-4"></i>
            <h3 class="text-lg font-semibold mb-2">${window.i18n.t('noImagesYet')}</h3>
            <p class="text-sm">${window.i18n.t('enterPromptToGenerate')}</p>
        </div>
    `;
}

function resetEditResults() {
    editResults.innerHTML = `
        <div class="text-center py-12 text-gray-400">
            <i class="fas fa-edit text-6xl mb-4"></i>
            <h3 class="text-lg font-semibold mb-2">${window.i18n.t('noEditedImagesYet')}</h3>
            <p class="text-sm">${window.i18n.t('uploadImageToEdit')}</p>
        </div>
    `;
}

// Image Actions
function downloadImage(imageData, id) {
    const a = document.createElement('a');
    a.href = imageData;
    a.download = `generated-image-${id}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function copyImage(imageData) {
    fetch(imageData)
        .then(res => res.blob())
        .then(blob => {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(() => {
                alert('Image copied to clipboard!');
            });
        });
}

// History Management
function saveToHistory(item) {
    // 验证item结构是否合法
    if (!item || !item.images || !Array.isArray(item.images) || item.images.length === 0) {
        console.error('Cannot save invalid item to history:', item);
        return;
    }

    imageHistory.unshift(item);
    // Keep only last 50 items
    if (imageHistory.length > 50) {
        imageHistory = imageHistory.slice(0, 50);
    }
    localStorage.setItem('sora2-image-history', JSON.stringify(imageHistory));
    loadHistory();
}

function loadHistory() {
    if (imageHistory.length === 0) {
        historyGrid.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-400">
                <i class="fas fa-history text-4xl mb-2"></i>
                <p>No history yet</p>
            </div>
        `;
        return;
    }

    historyGrid.innerHTML = '';
    imageHistory.slice(0, 12).forEach(item => {
        // 跳过损坏的历史记录项
        if (!item || !item.images || !Array.isArray(item.images) || item.images.length === 0) {
            console.warn('Skipping invalid history item:', item);
            return;
        }

        const card = document.createElement('div');
        card.className = 'image-card cursor-pointer hover:opacity-90 transition';

        if (item.type === 'text') {
            card.innerHTML = `
                <img src="${item.images[0]}" alt="Generated image" class="w-full h-full object-cover rounded-lg">
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                    <p class="text-white text-xs truncate">${item.prompt}</p>
                    <p class="text-white/60 text-xs">${new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
            `;
        } else {
            card.innerHTML = `
                <img src="${item.images[0]}" alt="Edited image" class="w-full h-full object-cover rounded-lg">
                <div class="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                    ${item.edit_type}
                </div>
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                    <p class="text-white text-xs truncate">${item.prompt}</p>
                    <p class="text-white/60 text-xs">${new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
            `;
        }

        card.addEventListener('click', () => {
            // Show full size image in modal
            showImageModal(item.images[0]);
        });

        historyGrid.appendChild(card);
    });
}

function showImageModal(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4';
    modal.onclick = () => modal.remove();

    modal.innerHTML = `
        <img src="${imageSrc}" alt="Full size image" class="max-w-full max-h-full rounded-lg">
        <button class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(modal);
}

// Update language when changed
window.addEventListener('languageChanged', () => {
    // Update button texts
    if (generateImageBtn && !generateImageBtn.disabled) {
        generateImageBtn.innerHTML = `<i class="fas fa-magic"></i><span>${window.i18n.t('generateImage')}</span>`;
    }
    if (editImageBtn && !editImageBtn.disabled) {
        editImageBtn.innerHTML = `<i class="fas fa-edit"></i><span>${window.i18n.t('editImageBtn')}</span>`;
    }
});

// Make functions globally accessible
window.downloadImage = downloadImage;
window.copyImage = copyImage;
window.resetImageResults = resetImageResults;
window.resetEditResults = resetEditResults;