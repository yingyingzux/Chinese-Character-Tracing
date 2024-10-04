import React, { useState, useRef, useEffect } from 'react';
// import { Sparkles } from 'lucide-react';

const ChineseCharacterTracing = () => {
  const [characters, setCharacters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  // const [showCelebration, setShowCelebration] = useState(false);
  // const [completionPercentage, setCompletionPercentage] = useState(0);
  const [mode, setMode] = useState('sequential');
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef(null);
  const templateCanvasRef = useRef(null);
  const contextRef = useRef(null);

  const fetchCharacters = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { char: '一', strokes: 1 },
          { char: '二', strokes: 2 },
          { char: '四', strokes: 3 },
          { char: '十', strokes: 2 },
          { char: '口', strokes: 3 },
          { char: '日', strokes: 4 },
          { char: '月', strokes: 4 },
          { char: '田', strokes: 5 },
          { char: '目', strokes: 5 },
          { char: '你', strokes: 7 },
          { char: '我', strokes: 7 },
          { char: '他', strokes: 5 },
          { char: '她', strokes: 6 },
          { char: '好', strokes: 6 },
          { char: '爱', strokes: 10 },
        ]);
      }, 500);
    });
  };

  useEffect(() => {
    setIsLoading(true);
    fetchCharacters().then(chars => {
      setCharacters(chars.sort((a, b) => a.strokes - b.strokes));
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (characters.length > 0) {
      setupCanvas(canvasRef.current);
      setupCanvas(templateCanvasRef.current);
      drawBaseCharacter();
    }
  }, [characters, currentIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventDefault = (e) => {
      e.preventDefault();
    };

    const handleTouchMove = (e) => {
      if (isDrawing) {
        e.preventDefault();
        const touch = e.touches[0];
        draw(touch);
      }
    };

    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', preventDefault, { passive: false });

    return () => {
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', preventDefault);
    };
  }, [isDrawing]);

  const setupCanvas = (canvas) => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 500 * dpr;
    canvas.height = 500 * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    canvas.style.width = '500px';
    canvas.style.height = '500px';
  };

  const drawBaseCharacter = () => {
    if (characters.length === 0) return;
    const context = canvasRef.current.getContext('2d');
    const templateContext = templateCanvasRef.current.getContext('2d');
    
    // Clear both canvases
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    templateContext.clearRect(0, 0, templateCanvasRef.current.width, templateCanvasRef.current.height);
    
    // Draw faded character on main canvas
    context.font = '400px "Heiti SC", "SimHei", sans-serif';
    context.fillStyle = 'rgba(200, 200, 200, 0.5)';
    context.fillText(characters[currentIndex].char, 50, 400);
    
    // Draw solid character on template canvas (for comparison, not visible to user)
    templateContext.font = '400px "Heiti SC", "SimHei", sans-serif';
    templateContext.fillStyle = 'rgba(0, 0, 0, 1)';
    templateContext.fillText(characters[currentIndex].char, 50, 400);

    contextRef.current = canvasRef.current.getContext('2d');
  };

  const startDrawing = (event) => {
    event.preventDefault();
    const { offsetX, offsetY } = getCoordinates(event);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    contextRef.current.strokeStyle = '#0000FF';
    contextRef.current.lineWidth = 20;
    contextRef.current.lineCap = 'round';
    contextRef.current.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    event.preventDefault();
    const { offsetX, offsetY } = getCoordinates(event);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    checkCompletion();
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    contextRef.current.closePath();
    checkCompletion();
  };

  const getCoordinates = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (event.touches && event.touches[0]) {
      return {
        offsetX: event.touches[0].clientX - rect.left,
        offsetY: event.touches[0].clientY - rect.top
      };
    }
    return {
      offsetX: (event.clientX || event.nativeEvent.clientX) - rect.left,
      offsetY: (event.clientY || event.nativeEvent.clientY) - rect.top
    };
  };

  const checkCompletion = () => {
    // Commenting out the completion check logic
    /*
    const userCanvas = canvasRef.current;
    const templateCanvas = templateCanvasRef.current;
    const userContext = userCanvas.getContext('2d');
    const templateContext = templateCanvas.getContext('2d');

    const userImageData = userContext.getImageData(0, 0, userCanvas.width, userCanvas.height);
    const templateImageData = templateContext.getImageData(0, 0, templateCanvas.width, templateCanvas.height);

    let coveredPixels = 0;
    let totalTemplatePixels = 0;

    for (let y = 0; y < templateCanvas.height; y += 2) {
      for (let x = 0; x < templateCanvas.width; x += 2) {
        const i = (y * templateCanvas.width + x) * 4;
        if (templateImageData.data[i + 3] > 20) {
          totalTemplatePixels++;
          if (hasNearbyBluePixel(userImageData, x, y, templateCanvas.width, 10)) {
            coveredPixels++;
          }
        }
      }
    }

    const completion = (coveredPixels / totalTemplatePixels) * 100;
    setCompletionPercentage(Math.min(100, completion));
    if (completion > 70) {
      setShowCelebration(true);
    }
    */
  };

  // Comment out the hasNearbyBluePixel function as it's not being used now
  /*
  const hasNearbyBluePixel = (imageData, x, y, width, radius) => {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < imageData.height) {
          const i = (ny * width + nx) * 4;
          if (imageData.data[i] === 0 && imageData.data[i + 1] === 0 && imageData.data[i + 2] === 255) {
            return true;
          }
        }
      }
    }
    return false;
  };
  */

  const nextCharacter = () => {
    if (characters.length === 0) return;
    if (mode === 'random') {
      setCurrentIndex(Math.floor(Math.random() * characters.length));
    } else {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % characters.length);
    }
    // setShowCelebration(false);
    // setCompletionPercentage(0);
  };

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'sequential' ? 'random' : 'sequential');
  };

  const playSound = () => {
    if (characters.length === 0) return;
    const utterance = new SpeechSynthesisUtterance(characters[currentIndex].char);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.2; // Add this line to slow down the speech rate
    speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return <div>Loading characters...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Trace the Character: {characters[currentIndex]?.char || ''}
        </h2>
        <div className="relative" style={{ width: '500px', height: '500px', touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={finishDrawing}
            onMouseLeave={finishDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={finishDrawing}
            className="border-2 border-gray-300 bg-white rounded-lg absolute top-0 left-0"
            style={{ width: '100%', height: '100%' }}
          />
          <canvas
            ref={templateCanvasRef}
            className="hidden"
            style={{ display: 'none' }}
          />
        </div>
        {/* Removed completion percentage display */}
        {/* Removed celebration message */}
        <div className="mt-4 flex space-x-4">
          <button
            onClick={nextCharacter}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Next Character
          </button>
          <button
            onClick={toggleMode}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            {mode === 'sequential' ? "Switch to Random" : "Switch to Sequential"}
          </button>
          <button
            onClick={playSound}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Listen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChineseCharacterTracing;