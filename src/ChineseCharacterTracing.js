import React, { useState, useRef, useEffect } from 'react';
import HanziWriter from 'hanzi-writer';
import { FaArrowRight, FaRandom, FaPlayCircle, FaVolumeUp, FaPenNib, FaExternalLinkAlt } from "react-icons/fa";

const DISPLAY_QUEUE_SIZE = 50;

const getBaiduBaikeLink = (character) => {
  return `https://baike.baidu.com/item/${encodeURIComponent(character)}`;
};

const ChineseCharacterTracing = () => {
  const [displayQueue, setDisplayQueue] = useState([]);
  const [tempQueue, setTempQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextCount, setNextCount] = useState(0); 
  // const [mode, setMode] = useState('sequential');
  const [mode, setMode] = useState('write'); // New state for tracking mode
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [writer, setWriter] = useState(null);
  const characterTarget = useRef(null);
  const [strokeThickness, setStrokeThickness] = useState(30);

  const fetchDefaultCharacters = () => {
    return [
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
    ];
  };

  const fetchMoreCharacters = async () => {
    const chars = [];
    let attempts = 0;
    const maxAttempts = 100; // Increased to allow for more filtering

    const isSimplifiedChinese = (char) => {
      const code = char.charCodeAt(0);
      return (code >= 0x4E00 && code <= 0x9FFF) && 
             !(code >= 0x2E80 && code <= 0x2EFF) && // Exclude CJK Radicals Supplement
             !(code >= 0x2F00 && code <= 0x2FDF) && // Exclude Kangxi Radicals
             !(code >= 0xF900 && code <= 0xFAFF) &&   // Exclude CJK Compatibility Ideographs (often traditional)
             !(code >= 0x3400 && code <= 0x4DBF);   // Exclude CJK Unified Ideographs Extension
    };

    while (chars.length < 10 && attempts < maxAttempts) {
      attempts++;
      const randomCodePoint = Math.floor(Math.random() * (0x9FFF - 0x4E00 + 1) + 0x4E00);
      const char = String.fromCodePoint(randomCodePoint);
      
      if (isSimplifiedChinese(char)) {
        try {
          const charData = await HanziWriter.loadCharacterData(char);
          if (charData && charData.strokes.length > 1) { // Exclude single-stroke characters (likely radicals)
            chars.push({ char, strokes: charData.strokes.length });
          }
        } catch (error) {
          console.warn(`Failed to load data for character: ${char}`, error);
        }
      }
    }
    return chars;
  };

  useEffect(() => {
    const defaultChars = fetchDefaultCharacters();
    const randomIndex = Math.floor(Math.random() * defaultChars.length);
    setDisplayQueue(defaultChars);
    setCurrentIndex(randomIndex);

    // Fetch more characters in the background
    setIsLoadingMore(true);
    fetchMoreCharacters().then(newChars => {
      console.log('Fetched new characters:', newChars);
      setTempQueue(newChars);
      setIsLoadingMore(false);
    });
  }, []);

  useEffect(() => {
    if (displayQueue.length > 0 && characterTarget.current) {
      if (!writer) {
        const newWriter = HanziWriter.create(characterTarget.current, displayQueue[currentIndex].char, {
          width: 500,
          height: 500,
          padding: 5,
          showOutline: true,
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 100,
          strokeColor: '#333',
          outlineColor: '#DDD',
          drawingWidth: 30, // Use a fixed value or state variable if needed
          drawingColor: '#333',
          highlightColor: '#008c9b',
        });
        setWriter(newWriter);
        startQuiz(newWriter);
      }
    }
  }, [displayQueue, currentIndex]);

  const startQuiz = (w = writer) => {
    if (w) {
      w.quiz({
        onComplete: (summaryData) => {
          console.log('Quiz completed!', summaryData);
        }
      });
    }
  };

  const nextCharacter = () => {
    let nextIndex = currentIndex + 1;
    
    console.log('Current index:', currentIndex);
    console.log('Display queue length:', displayQueue.length);
    console.log('Temp queue length:', tempQueue.length);

    if (nextIndex >= displayQueue.length) {
      console.log('Reached end of display queue');
      if (tempQueue.length > 0) {
        console.log('Swapping queues');
        setDisplayQueue(tempQueue);
        setTempQueue([]);
        nextIndex = 0;
      } else {
        console.log('Temp queue empty, looping back to start');
        nextIndex = 0;
      }
    }

    setCurrentIndex(nextIndex);

    // Update the writer with the new character
    if (writer) {
      const newChar = (nextIndex === 0 && tempQueue.length > 0) ? tempQueue[0].char : displayQueue[nextIndex].char;
      console.log('Setting new character:', newChar);
      writer.setCharacter(newChar);
      startQuiz();
    }

    // Fetch more characters if temp queue is empty
    if (tempQueue.length === 0 && !isLoadingMore) {
      console.log('Fetching more characters');
      setIsLoadingMore(true);
      fetchMoreCharacters().then(newChars => {
        console.log('Fetched new characters:', newChars);
        setTempQueue(newChars);
        setIsLoadingMore(false);
      });
    }
  };

  const playAnimation = () => {
    if (writer) {
      writer.animateCharacter();
    }
  };

  const playSound = () => {
    if (displayQueue.length === 0) return;
    console.log('Playing sound for character:', displayQueue[currentIndex].char);
    const utterance = new SpeechSynthesisUtterance(displayQueue[currentIndex].char);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.2;
    speechSynthesis.speak(utterance);
  };

  const toggleMode = () => {
    if (mode === 'write') {
      setMode('animate');
      if (writer) {
        writer.animateCharacter();
      }
    } else {
      setMode('write');
      startQuiz();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Trace the Character: {displayQueue[currentIndex]?.char || ''}
          <a
            href={getBaiduBaikeLink(displayQueue[currentIndex]?.char)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-[#008c9b] hover:text-[rgba(var(--color-008c9b),0.8)]"
            title="Look up on Baidu Baike"
          >
            <FaExternalLinkAlt className="inline-block text-sm" />
          </a>
        </h2>
        <div ref={characterTarget} style={{ width: '500px', height: '500px' }}></div>
        <div className="mt-4 flex justify-center items-center space-x-4">
          {/* Toggle switch */}
          <div className="flex items-center p-1">
            <span className={`mr-2 ${mode === 'write' ? 'text-gray-800' : 'text-gray-500'}`}>Write</span>
            <div
              className="w-14 h-7 flex items-center bg-[rgba(var(--color-008c9b),0.5)] rounded-full p-1 cursor-pointer"
              onClick={toggleMode}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${
                  mode === 'animate' ? 'translate-x-7' : ''
                }`}
              ></div>
            </div>
            <span className={`ml-2 ${mode === 'animate' ? 'text-gray-800' : 'text-gray-500'}`}>Animate</span>
          </div>

          {/* Buttons */}
          <button
            onClick={playSound}
            className="px-4 py-2 bg-[rgba(var(--color-008c9b),0.5)] text-gray-700 rounded hover:bg-[rgba(var(--color-008c9b),0.7)] flex items-center"
          >
            <FaVolumeUp className="mr-2" /> Pronounce
          </button>
          <button
            onClick={nextCharacter}
            className="px-4 py-2 bg-[#008c9b] text-white rounded hover:bg-[rgba(var(--color-008c9b),0.8)] flex items-center"
          >
            <FaArrowRight className="mr-2" /> Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChineseCharacterTracing;