import React, { useState, useRef, useEffect } from 'react';
import HanziWriter from 'hanzi-writer';
import { FaArrowRight,FaRandom, FaPlayCircle, FaVolumeUp, FaPenNib } from "react-icons/fa";

const ChineseCharacterTracing = () => {
  const [characters, setCharacters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextCount, setNextCount] = useState(0); 
  const [mode, setMode] = useState('sequential');
  const [isLoading, setIsLoading] = useState(true);
  const [writer, setWriter] = useState(null);
  const characterTarget = useRef(null);
  const [strokeThickness, setStrokeThickness] = useState(30);

  // const fetchCharacters = () => {
  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve([
  //         { char: '一', strokes: 1 },
  //         { char: '二', strokes: 2 },
  //         { char: '四', strokes: 3 },
  //         { char: '十', strokes: 2 },
  //         { char: '口', strokes: 3 },
  //         { char: '日', strokes: 4 },
  //         { char: '月', strokes: 4 },
  //         { char: '田', strokes: 5 },
  //         { char: '目', strokes: 5 },
  //         { char: '你', strokes: 7 },
  //         { char: '我', strokes: 7 },
  //         { char: '他', strokes: 5 },
  //         { char: '她', strokes: 6 },
  //         { char: '好', strokes: 6 },
  //         { char: '爱', strokes: 10 },
  //       ]);
  //     }, 500);
  //   });
  // };

  const fetchCharacters = async () => {
    const chars = [];
    while (chars.length < 10) {
      const randomCodePoint = Math.floor(Math.random() * (0x9FFF - 0x4E00 + 1) + 0x4E00);
      const char = String.fromCodePoint(randomCodePoint);
      try {
        // Use HanziWriter.loadCharacterData instead of getCharacterData
        const charData = await HanziWriter.loadCharacterData(char);
        if (charData) {
          chars.push({ char, strokes: charData.strokes.length });
        }
      } catch (error) {
        console.warn(`Failed to load data for character: ${char}`, error);
      }
    }
    return chars.sort((a, b) => a.strokes - b.strokes);
  };

  const refreshCharacters = async () => {
    setIsLoading(true);
    const newChars = await fetchCharacters();
    setCharacters(newChars);
    setCurrentIndex(0);
    setNextCount(0);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshCharacters();
  }, []);

  // useEffect(() => {
  //   setIsLoading(true);
  //   fetchCharacters().then(chars => {
  //     setCharacters(chars.sort((a, b) => a.strokes - b.strokes));
  //     setIsLoading(false);
  //   });
  // }, []);

  useEffect(() => {
    if (characters.length > 0 && characterTarget.current) {
      console.log('Attempting to create/update writer for character:', characters[currentIndex].char);
      if (writer) {
        writer.setCharacter(characters[currentIndex].char);
        startQuiz(); // Start quiz after setting new character
      } else {
        const newWriter = HanziWriter.create(characterTarget.current, characters[currentIndex].char, {
          width: 500,
          height: 500,
          padding: 5,
          showOutline: true,
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 100,
          strokeColor: '#333',
          outlineColor: '#DDD',
          drawingWidth: strokeThickness, // Set the stroke thickness here
          drawingColor: '#333',
          //radicalColor: '#337ab7',
          highlightColor: '#337ab7',
        });
        setWriter(newWriter);
        setTimeout(() => startQuiz(newWriter), 100);
      }
    }
  }, [characters, currentIndex, writer, strokeThickness]);

  const startQuiz = (w = writer) => {
    if (w) {
      w.quiz({
        drawingWidth: strokeThickness,
        onComplete: (summaryData) => {
          console.log('Quiz completed!', summaryData);
        }
      });
    }
  };

  // const nextCharacter = () => {
  //   if (characters.length === 0) return;
  //   if (mode === 'random') {
  //     setCurrentIndex(Math.floor(Math.random() * characters.length));
  //   } else {
  //     setCurrentIndex((prevIndex) => (prevIndex + 1) % characters.length);
  //   }
  // };

  const nextCharacter = () => {
    if (characters.length === 0) return;
    const nextIndex = (currentIndex + 1) % characters.length;
    setCurrentIndex(nextIndex);
    setNextCount(prevCount => {
      const newCount = prevCount + 1;
      if (newCount >= 10) {
        refreshCharacters();
        return 0;
      }
      return newCount;
    });
  };


  const randomCharacter = () => {
    if (characters.length === 0) return;
    const randomIndex = Math.floor(Math.random() * characters.length);
    setCurrentIndex(randomIndex);
  };

  const playAnimation = () => {
    if (writer) {
      writer.animateCharacter();
    }
  };

  const playSound = () => {
    if (characters.length === 0) return;
    console.log('Playing sound for character:', characters[currentIndex].char);
    const utterance = new SpeechSynthesisUtterance(characters[currentIndex].char);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.2;
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
        <div ref={characterTarget} style={{ width: '500px', height: '500px' }}></div>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={nextCharacter}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          >
            <FaArrowRight className="mr-2" /> Next
          </button>
          <button
            onClick={randomCharacter}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center"
          >
            <FaRandom className="mr-2" /> Random
          </button>
          <button
            onClick={playAnimation}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-green-600 flex items-center"
          >
            <FaPlayCircle className="mr-2" /> Animate
          </button>
          <button
            onClick={() => startQuiz()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-yellow-600 flex items-center"
          >
            <FaPenNib className="mr-2" /> Write
          </button>
          <button
            onClick={playSound}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-green-600 flex items-center"
          >
            <FaVolumeUp className="mr-2" /> Pronounce
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChineseCharacterTracing;