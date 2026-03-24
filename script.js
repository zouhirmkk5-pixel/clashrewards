document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('downloadForm');
    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const btnText = downloadBtn.querySelector('.btn-text');
    const btnLoader = downloadBtn.querySelector('.btn-loader');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    
    // Video info elements
    const thumbnail = document.getElementById('thumbnail');
    const videoTitle = document.getElementById('videoTitle');
    const videoAuthor = document.getElementById('videoAuthor');
    const videoLikes = document.getElementById('videoLikes');
    const videoViews = document.getElementById('videoViews');
    
    // Download buttons
    const downloadNoWatermark = document.getElementById('downloadNoWatermark');
    const downloadWithWatermark = document.getElementById('downloadWithWatermark');
    
    let currentVideoData = null;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const url = videoUrlInput.value.trim();
        if (!url) return;
        
        // Validate TikTok URL
        if (!isValidTikTokUrl(url)) {
            showError('Please enter a valid TikTok video URL');
            return;
        }
        
        // Show loading state
        setLoading(true);
        hideResult();
        hideError();
        
        try {
            // Fetch video info using TikWM API (free, no auth required)
            const videoData = await fetchVideoInfo(url);
            
            if (videoData) {
                currentVideoData = videoData;
                displayResult(videoData);
            } else {
                showError('Could not fetch video information. Please check the URL and try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    });
    
    // Download button handlers
    downloadNoWatermark.addEventListener('click', function() {
        handleDownload('no_watermark');
    });
    
    downloadWithWatermark.addEventListener('click', function() {
        handleDownload('with_watermark');
    });
    
    async function handleDownload(type) {
        // Show loading overlay
        showLoadingOverlay('Preparing your download...');
        
        try {
            // Check with server if OGAds page should be shown
            const response = await fetch('download.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `video_url=${encodeURIComponent(videoUrlInput.value)}&type=${type}`
            });
            
            const data = await response.json();
            
            hideLoadingOverlay();
            
            if (data.showOgadsPage) {
                // Show OGAds page in overlay (iframe style)
                showOgadsPage();
            } else {
                // Normal download
                if (currentVideoData) {
                    const downloadUrl = type === 'no_watermark' 
                        ? currentVideoData.play 
                        : currentVideoData.wmplay;
                    
                    if (downloadUrl) {
                        window.open(downloadUrl, '_blank');
                    } else {
                        showError('Download link not available');
                    }
                }
            }
        } catch (error) {
            hideLoadingOverlay();
            console.error('Download error:', error);
            showError('Download failed. Please try again.');
        }
    }
    
    function showOgadsPage() {
        // Remove existing overlay if any
        const existingOverlay = document.querySelector('.ogads-overlay');
        if (existingOverlay) existingOverlay.remove();
        
        // Create fullscreen overlay with OGAds page
        const overlay = document.createElement('div');
        overlay.className = 'ogads-overlay';
        
        overlay.innerHTML = `
            <div class="ogads-container">
                <iframe src="ogads-page.php" frameborder="0"></iframe>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add animation
        setTimeout(() => overlay.classList.add('active'), 10);
    }
    
    window.closeOgadsPage = function() {
        const overlay = document.querySelector('.ogads-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    }
    
    function isValidTikTokUrl(url) {
        const patterns = [
            /tiktok\.com\/@[\w.-]+\/video\/\d+/i,
            /tiktok\.com\/t\/\w+/i,
            /vm\.tiktok\.com\/\w+/i,
            /vt\.tiktok\.com\/\w+/i,
            /tiktok\.com\/v\/\d+/i
        ];
        return patterns.some(pattern => pattern.test(url));
    }
    
    async function fetchVideoInfo(url) {
        // Using TikWM API - free and reliable
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
        
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.code === 0 && data.data) {
                return data.data;
            }
            return null;
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    }
    
    function displayResult(data) {
        // Set thumbnail
        thumbnail.src = data.cover || data.origin_cover || '';
        
        // Set video info
        videoTitle.textContent = data.title || 'TikTok Video';
        videoAuthor.textContent = `@${data.author?.unique_id || data.author?.nickname || 'unknown'}`;
        videoLikes.textContent = `❤️ ${formatNumber(data.digg_count || 0)}`;
        videoViews.textContent = `👁️ ${formatNumber(data.play_count || 0)}`;
        
        resultDiv.style.display = 'block';
    }
    
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    function setLoading(loading) {
        downloadBtn.disabled = loading;
        btnText.style.display = loading ? 'none' : 'inline';
        btnLoader.style.display = loading ? 'inline-flex' : 'none';
    }
    
    function showError(message) {
        document.getElementById('errorMessage').textContent = message;
        errorDiv.style.display = 'block';
    }
    
    function hideError() {
        errorDiv.style.display = 'none';
    }
    
    function hideResult() {
        resultDiv.style.display = 'none';
    }
    
    function showLoadingOverlay(message) {
        // Create overlay if it doesn't exist
        let overlay = document.querySelector('.loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="spinner-large"></div>
                <p>${message}</p>
                <div class="progress-bar">
                    <div class="progress"></div>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            overlay.querySelector('p').textContent = message;
            overlay.style.display = 'flex';
        }
    }
    
    function hideLoadingOverlay() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
});
