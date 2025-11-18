import React, { useState, useRef, useEffect } from 'react';
import '../styles/components/image-cropper.css';

const ImageCropper = ({ src, onCrop, onCancel }) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });

  useEffect(() => {
    if (src) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        
        // Tính toán scale ban đầu để ảnh hiển thị cân đối trong canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const cropRadius = 150;
          
          // Scale để ảnh vừa với canvas, nhưng không quá nhỏ so với vòng crop
          const canvasScale = Math.min(
            (canvasSize.width * 0.65) / img.width,    // 65% chiều rộng canvas (giảm từ 80%)
            (canvasSize.height * 0.65) / img.height   // 65% chiều cao canvas
          );
          
          // Scale tối thiểu để crop circle có thể crop được
          const minCropScale = Math.max(
            (cropRadius * 2.2) / img.width,    // Hơi lớn hơn crop circle một chút
            (cropRadius * 2.2) / img.height
          );
          
          // Chọn scale phù hợp: không quá nhỏ, không quá lớn
          const initialScale = Math.max(minCropScale, Math.min(canvasScale, 0.6));
          setScale(initialScale);
          
          // Tính toán vị trí ban đầu để center ảnh
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const imgCenterX = (img.width * initialScale) / 2;
          const imgCenterY = (img.height * initialScale) / 2;
          
          setPosition({
            x: centerX - imgCenterX,
            y: centerY - imgCenterY
          });
        }
        
        setImageLoaded(true);
      };
      img.src = src;
    }
  }, [src]);

  // Thêm hàm để constrain position khi scale thay đổi
  const constrainPosition = (newScale, currentPos = position) => {
    if (!imageRef.current) return currentPos;
    
    const img = imageRef.current;
    const scaledWidth = img.width * newScale;
    const scaledHeight = img.height * newScale;
    const cropRadius = 150;
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    // Tính toán giới hạn để vòng tròn không vượt ra ngoài ảnh
    const maxX = centerX - cropRadius;
    const minX = centerX + cropRadius - scaledWidth;
    const maxY = centerY - cropRadius;
    const minY = centerY + cropRadius - scaledHeight;
    
    return {
      x: Math.max(minX, Math.min(maxX, currentPos.x)),
      y: Math.max(minY, Math.min(maxY, currentPos.y))
    };
  };

  // Hàm zoom theo trọng tâm vòng tròn
  const handleScaleChange = (newScale) => {
    if (!imageRef.current) {
      setScale(newScale);
      return;
    }

    const img = imageRef.current;
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    // Tính tỷ lệ thay đổi
    const scaleRatio = newScale / scale;
    
    // Tính vị trí mới để zoom theo trọng tâm vòng tròn
    const newX = centerX - (centerX - position.x) * scaleRatio;
    const newY = centerY - (centerY - position.y) * scaleRatio;
    
    // Áp dụng constraints
    const constrainedPos = constrainPosition(newScale, { x: newX, y: newY });
    
    setScale(newScale);
    setPosition(constrainedPos);
  };

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [scale, position, imageLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Set canvas size cố định
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image với scale và position
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    
    ctx.drawImage(
      img, 
      position.x, 
      position.y, 
      scaledWidth, 
      scaledHeight
    );
    
    // Draw overlay tối
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Vòng tròn crop cố định ở giữa
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150; // Radius cố định
    
    // Clear vùng crop circle
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Vẽ lại ảnh trong vùng crop
    ctx.globalCompositeOperation = 'source-over';
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.clip();
    
    ctx.drawImage(
      img, 
      position.x, 
      position.y, 
      scaledWidth, 
      scaledHeight
    );
    
    ctx.restore();
    
    // Draw viền crop circle
    ctx.strokeStyle = '#1877f2';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - position.x,
      y: e.clientY - rect.top - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !imageRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragStart.x;
    const newY = e.clientY - rect.top - dragStart.y;
    
    // Giới hạn position để vòng tròn crop luôn nằm trong ảnh
    const img = imageRef.current;
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const cropRadius = 150;
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    // Tính toán giới hạn để vòng tròn không vượt ra ngoài ảnh
    const maxX = centerX - cropRadius;
    const minX = centerX + cropRadius - scaledWidth;
    const maxY = centerY - cropRadius;
    const minY = centerY + cropRadius - scaledHeight;
    
    const constrainedX = Math.max(minX, Math.min(maxX, newX));
    const constrainedY = Math.max(minY, Math.min(maxY, newY));
    
    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    // Tạo crop canvas
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    const img = imageRef.current;
    
    // Kích thước crop canvas (hình vuông)
    const cropSize = 300;
    cropCanvas.width = cropSize;
    cropCanvas.height = cropSize;
    
    // Vòng tròn crop cố định
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;
    
    // Tính toán vùng crop trong ảnh gốc
    const sourceX = (centerX - radius - position.x) / scale;
    const sourceY = (centerY - radius - position.y) / scale;
    const sourceSize = (radius * 2) / scale;
    
    // Vẽ ảnh đã crop
    cropCtx.drawImage(
      img,
      sourceX,
      sourceY, 
      sourceSize,
      sourceSize,
      0,
      0,
      cropSize,
      cropSize
    );
    
    // Convert to blob
    cropCanvas.toBlob((blob) => {
      onCrop(blob);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="image-cropper-modal">
      <div className="image-cropper-content">
        <h3>Chọn ảnh đại diện</h3>
        
        <div className="cropper-container">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          />
        </div>
        
        {/* Zoom Slider */}
        <div className="zoom-controls">
          <span className="zoom-label">−</span>
          <input
            type="range"
            min={imageRef.current ? Math.max(
              (320 / imageRef.current.width),    // Tăng min để có thể crop tốt
              (320 / imageRef.current.height),
              0.3                                // Cho phép scale nhỏ hơn
            ) : 0.3}
            max="2.0"
            step="0.05"
            value={scale}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
            className="zoom-slider"
          />
          <span className="zoom-label">+</span>
        </div>
        
        <div className="cropper-instructions">
          <p>Ảnh đại diện của bạn hiện thị công khai.</p>
        </div>
        
        <div className="cropper-controls">
          <button 
            onClick={onCancel}
            className="crop-cancel-btn"
          >
            Hủy
          </button>
          <button 
            onClick={handleCrop}
            className="crop-confirm-btn"
            disabled={!imageLoaded}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;