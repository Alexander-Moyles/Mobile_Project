/**
 * Bubble Popper Game
 * 
 * ============== GAME OVERVIEW ==============
 * A bubble shooting game built with React Native and Expo.
 * 
 * INITIAL IMPLEMENTATION:
 * - Bubble Spawning: Random horizontal positions every 0.5s
 *   - 2 other bubble types which spawn at slower intervals
 * - Bubble Movement: Upward motion until off-screen
 * - Movable Gun: Tap lowest portion of screen to move
 *   - Tap elsewhere to fire laser
 * - Basic Laser: Vertical red line appearing for 0.3s on tap
 * - Hit Detection: X-axis distance comparison, modified for better consistency
 * - Game Flow: Start screen, 120s countdown, score tracking, game over screen
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableWithoutFeedback, ImageBackground } from 'react-native';
import Bubble from './components/Bubble';
/*
  Had initially attempted to add bubbles which would grant power-ups, but there was an issue getting
  them to implement properly and ultimately replaced them with the "Pain" & "Bonus" Bubbles.
 */
//import ElectricBubble from './components/ElectricBubble';
//import IceBubble from './components/IceBubble';
import PainBubble from './components/PainBubble';
import BonusBubble from './components/BonusBubble';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const backgroundImg = require("./assets/bubble_sky.png");

export default function GameScreen() {
  /**
   * Game State
   * 
   * These state variables manage the core game functionality:
   * - gameStarted/gameOver: Control game flow
   * - score/timeLeft: Track player progress
   * - bubbles: Array of bubble objects with positions
   * - laserVisible: Controls when the laser is shown
   * - powerBubbles: Unused array of power-up granting bubbles
   * - painBubbles: Array of bubbles which reduce score on hit
   * - bonusBubbles: Array of bubbles worth 5 points instead of 1
   * - laserWidth: Controls the width of the laser
   * - powerTime: Unused handler for remaining power-up time
   * - bubbleSpeed: Controls speed of regular bubbles
   */
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [bubbles, setBubbles] = useState([]);
  const [laserVisible, setLaserVisible] = useState(false);
  //const [powerBubbles, setPowerBubbles] = useState([]);
  const [painBubbles, setPainBubbles] = useState([]);
  const [bonusBubbles, setBonusBubbles] = useState([]);
  const [laserWidth, setLaserWidth] = useState(4);
  //const [powerTime, setPowerTime] = useState();
  const [bubbleSpeed, setBubbleSpeed] = useState(2);

  
  // Gun position
  const gunWidth = 60;
  const [gunPosition, setGunPosition] = useState({
     'x': (screenWidth / 2 - gunWidth / 2)
  });
  
  // Refs for game timers and IDs
  const bubbleIdRef = useRef(1);
  const timerRef = useRef(null);
  const bubbleTimerRef = useRef(null);
  const powerBubbleTimerRef = useRef(null);
  const painBubbleTimerRef = useRef(null);
  const bonusBubbleTimerRef = useRef(null);
  const laserTimeoutRef = useRef(null);
  const powerTimeRef = useRef(null)
  
  /**
   * Handle tap to shoot laser
   */
  const handleTap = (event) => {
    if (!gameStarted || gameOver) return;
    let { locationX } = event.nativeEvent;
    setGunPosition({ x: locationX - gunWidth/2});
  };

  /**
   * Handle laser firing (temp fix until other thing's working)
   */
  const handleGun = () => {
    fireLaser();
  }
  
  /**
   * Fire a laser from the gun center
   * Creates visible laser and checks for bubble hits
   */
  const fireLaser = () => {
    // Clear any existing laser timeout
    if (laserTimeoutRef.current) {
      clearTimeout(laserTimeoutRef.current);
    }
    
    // Make laser visible
    setLaserVisible(true);
    
    // Check for hits immediately
    checkHits(gunPosition['x'] + (gunWidth / 2) - (laserWidth / 2));
    checkPowerHits(gunPosition['x'] + (gunWidth / 2) - (laserWidth / 2));
    checkPainHits(gunPosition['x'] + (gunWidth / 2) - (laserWidth / 2));
    checkBonusHits(gunPosition['x'] + (gunWidth / 2) - (laserWidth / 2));
    
    // Make laser disappear after 300ms
    laserTimeoutRef.current = setTimeout(() => {
      setLaserVisible(false);
    }, 300);
  };
  
  /**
   * Check if laser hits any bubbles
   * @param {number} laserX - X coordinate of the laser
   */
  const checkHits = (laserX) => {
    setBubbles(prevBubbles => {
      const hitBubbleIds = [];
      let hitCount = 0;
      
      // Check each bubble for collision
      prevBubbles.forEach(bubble => {
        // Calculate bubble center
        const bubbleCenterX = bubble.x + bubble.radius;
        
        // Check if laser x-coordinate is within bubble's horizontal range
        const distanceX = Math.abs(bubbleCenterX - laserX);

        // If laser is within bubble radius, it's a hit
        if (distanceX <= bubble.radius) {
          hitBubbleIds.push(bubble.id);
          hitCount++;
        }
      });
      
      // If any bubbles were hit, update the score
      if (hitCount > 0) {
        setScore(prevScore => prevScore + hitCount);
      }
      
      // Return bubbles that weren't hit
      return prevBubbles.filter(bubble => !hitBubbleIds.includes(bubble.id));
    });
  };

    /**
     * Check if laser hits any power bubbles
     * @param {number} laserX - X coordinate of the laser
     */
    const checkPowerHits = (laserX) => {
        setPowerBubbles(prevBubbles => {
          const hitBubbleIds = [];
          let hitCount = 0;

          // Check each bubble for collision
          prevBubbles.forEach(bubble => {
            // Calculate bubble center
            const bubbleCenterX = bubble.x + bubble.radius;

            // Check if laser x-coordinate is within bubble's horizontal range
            const distanceX = Math.abs(bubbleCenterX - laserX);

            // If laser is within bubble radius, it's a hit
            if (distanceX <= bubble.radius) {
              hitBubbleIds.push(bubble.id);
              hitCount++;
            }
          });

          // If any bubbles were hit, update the score and apply power-up
          if (hitCount > 0) {
            setScore(prevScore => prevScore + hitCount);
            setPowerTime(300);
          }

          // Return bubbles that weren't hit
          return prevBubbles.filter(bubble => !hitBubbleIds.includes(bubble.id));
        });
  };

    /**
     * Check if laser hits any pain bubbles
     * @param {number} laserX - X coordinate of the laser
     */
    const checkPainHits = (laserX) => {
        setPainBubbles(prevBubbles => {
          const hitBubbleIds = [];
          let hitCount = 0;

          // Check each bubble for collision
          prevBubbles.forEach(bubble => {
            // Calculate bubble center
            const bubbleCenterX = bubble.x + bubble.radius;

            // Check if laser x-coordinate is within bubble's horizontal range
            const distanceX = Math.abs(bubbleCenterX - laserX);

            // If laser is within bubble radius, it's a hit
            if (distanceX <= bubble.radius) {
              hitBubbleIds.push(bubble.id);
              hitCount++;
            }
          });

          // If any bubbles were hit, reduce the score
          if (hitCount > 0 && score > 0) {
            setScore(prevScore => prevScore - hitCount);
          }

          // Return bubbles that weren't hit
          return prevBubbles.filter(bubble => !hitBubbleIds.includes(bubble.id));
        });
    };

    /**
     * Check if laser hits any bonus bubbles
     * @param {number} laserX - X coordinate of the laser
     */
     const checkBonusHits = (laserX) => {
        setBonusBubbles(prevBubbles => {
          const hitBubbleIds = [];
          let hitCount = 0;

          // Check each bubble for collision
          prevBubbles.forEach(bubble => {
            // Calculate bubble center
            const bubbleCenterX = bubble.x + bubble.radius;

            // Check if laser x-coordinate is within bubble's horizontal range
            const distanceX = Math.abs(bubbleCenterX - laserX);

            // If laser is within bubble radius, it's a hit
            if (distanceX <= bubble.radius) {
              hitBubbleIds.push(bubble.id);
              hitCount++;
            }
          });

          // If any bubbles were hit, increase the score by 5
          if (hitCount > 0) {
            setScore(prevScore => prevScore + (hitCount * 5));
          }

          // Return bubbles that weren't hit
          return prevBubbles.filter(bubble => !hitBubbleIds.includes(bubble.id));
        });
    };
  
  /**
   * Spawn a new bubble with random horizontal position
   * Creates bubble at bottom of screen with random X position
   */
  const spawnBubble = () => {
    const radius = 30;
    // Ensure bubble stays within screen bounds
    const maxX = screenWidth - (radius * 2);
    const newBubble = {
      id: bubbleIdRef.current++,
      x: Math.random() * maxX,
      y: screenHeight - 100, // Start near bottom of screen
      radius: radius,
    };
    
    setBubbles(prev => [...prev, newBubble]);
  };

/* Spawner for power-up bubbles, unused due to implimentation issues
  const spawnPowerBubble = () => {
      const radius = 30;
      // Ensure bubble stays within screen bounds
      const maxX = screenWidth - (radius * 2);
      const newBubble = {
        id: bubbleIdRef.current++,
        x: Math.random() * maxX,
        y: screenHeight - 100, // Start near bottom of screen
        radius: radius,
      };

      setPowerBubbles(prev => [...prev, newBubble]);
    };
*/

/**
 * Spawns a "Pain Bubble" with random horizontal position
 * Creates pain bubble at bottom of screen with random X position
 */
  const spawnPainBubble = () => {
      const radius = 17.5;
      // Ensure bubble stays within screen bounds
      const maxX = screenWidth - (radius * 2);
      const newBubble = {
        id: bubbleIdRef.current++,
        x: Math.random() * maxX,
        y: screenHeight - 100, // Start near bottom of screen
        radius: radius,
      };

      setPainBubbles(prev => [...prev, newBubble]);
    };

/**
 * Spawns a "Bonus Bubble" with random horizontal position
 * Creates bonus bubble at bottom of screen with random X position
 */
    const spawnBonusBubble = () => {
      const radius = 20;
      // Ensure bubble stays within screen bounds
      const maxX = screenWidth - (radius * 2);
      const newBubble = {
        id: bubbleIdRef.current++,
        x: Math.random() * maxX,
        y: screenHeight - 100, // Start near bottom of screen
        radius: radius,
      };

      setBonusBubbles(prev => [...prev, newBubble]);
    };
  
  /**
   * Start the game
   * Initializes game state and starts timers for bubble spawning and countdown
   */
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(120);
    setBubbles([]);
    setPainBubbles([]);
    setPowerBubbles([]);
    setBonusBubbles([]);
    setLaserVisible(false);
    bubbleIdRef.current = 1;
    
    // Start spawning bubbles every 500ms
    bubbleTimerRef.current = setInterval(spawnBubble, 500);

    // Start spawning power bubbles every 5000ms - unused
    //powerBubbleTimerRef.current = setInterval(spawnPowerBubble, 12000);

    // Start spawning pain bubbles every 2000ms
    painBubbleTimerRef.current = setInterval(spawnPainBubble, 2000);

    // Start spawning bonus bubbles every 18000ms
    bonusBubbleTimerRef.current = setInterval(spawnBonusBubble, 18000);

/*
 //Timers for the unused power-up bubbles
   // Electric power-up removed due to issues with laser width and position
   // Ice power-up removed due to issues with bubble rendering

    // Timer for electric power-up
    powerTimeRef.current = setInterval(() => {
          setPowerTime(prev => {
            if (prev > 1) {
              setLaserWidth(40);
            }
            else (
              setLaserWidth(4)
            )
            return prev - 1;
          });
        }, powerTime);

    // Timer for ice power-up
    powerTimeRef.current = setInterval(() => {
          setPowerTime(prev => {
            if (prev > 1) {
              setBubbleSpeed(0.5)
            }
            else (
              setBubbleSpeed(5)
            )
            return prev - 1;
          });
        }, powerTime);
    
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Game over
          clearInterval(timerRef.current);
          clearInterval(bubbleTimerRef.current);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
*/


  /**
   * Reset game
   * Returns game to initial state and cleans up timers
   */
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setBubbles([]);
    setScore(0);
    setTimeLeft(120);
    setLaserVisible(false);
    bubbleIdRef.current = 1;
    
    if (timerRef.current) clearInterval(timerRef.current);
    if (powerTimeRef.current) clearInterval(powerTimeRef.current);
    if (bubbleTimerRef.current) clearInterval(bubbleTimerRef.current);
    if (powerBubbleTimerRef.current) clearInterval(powerBubbleTimerRef.current);
  };

  /**
   * Move bubbles upward
   * Uses effect to animate bubbles moving up the screen
   */
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const moveInterval = setInterval(() => {
      setBubbles(prev => {
        const updatedBubbles = prev
          .map(bubble => ({
            ...bubble,
            y: bubble.y - bubbleSpeed, // Move bubbles up
          }))
          .filter(bubble => bubble.y > -60); // Remove bubbles that exit the top

        return updatedBubbles;
      });
    }, 16); // ~60 FPS
    
    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver]);

  /**
   * Move power bubbles upward - unused due to implimentation issues
   * Uses effect to animate bubbles moving up the screen
   */
/*
  useEffect(() => {
      if (!gameStarted || gameOver) return;

      const moveInterval = setInterval(() => {
        setPowerBubbles(prev => {
          const updatedBubbles = prev
            .map(bubble => ({
              ...bubble,
              y: bubble.y - 5, // Move bubbles up
            }))
            .filter(bubble => bubble.y > -60); // Remove bubbles that exit the top

          return updatedBubbles;
        });
      }, 16); // ~60 FPS

      return () => clearInterval(moveInterval);
    }, [gameStarted, gameOver]);
*/

    /**
     * Move pain bubbles upward
     * Uses effect to animate bubbles moving up the screen
     */
     useEffect(() => {
        if (!gameStarted || gameOver) return;

        const moveInterval = setInterval(() => {
          setPainBubbles(prev => {
            const updatedBubbles = prev
              .map(bubble => ({
                ...bubble,
                y: bubble.y - (Math.random() * 20), // Move bubbles up
              }))
              .filter(bubble => bubble.y > -60); // Remove bubbles that exit the top

            return updatedBubbles;
          });
        }, 16); // ~60 FPS

        return () => clearInterval(moveInterval);
     }, [gameStarted, gameOver]);

     /**
      * Move bonus bubbles upward
      * Uses effect to animate bubbles moving up the screen
      */
      useEffect(() => {
         if (!gameStarted || gameOver) return;

         const moveInterval = setInterval(() => {
           setBonusBubbles(prev => {
             const updatedBubbles = prev
               .map(bubble => ({
                 ...bubble,
                 y: bubble.y - (Math.random() * 20), // Move bubbles up
               }))
               .filter(bubble => bubble.y > -60); // Remove bubbles that exit the top

             return updatedBubbles;
           });
         }, 16); // ~60 FPS

         return () => clearInterval(moveInterval);
      }, [gameStarted, gameOver]);
  
  /**
   * Cleanup on unmount
   * Ensures all timers are cleared when component unmounts
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (powerTimeRef.current) clearInterval(powerTimeRef.current);
      if (bubbleTimerRef.current) clearInterval(bubbleTimerRef.current);
      if (powerBubbleTimerRef.current) clearInterval(powerBubbleTimerRef.current); //Unused
      if (laserTimeoutRef.current) clearTimeout(laserTimeoutRef.current);
    };
  }, []);
  
  return (
  <ImageBackground
     source={backgroundImg}
     resizeMode="cover"
     style={{
       flex: 1,
       justifyContent: 'center',
     }}
  >

    {/* Ensures player can only move the gun if they tap the bottom of the screen */}
    <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.gunHandler}></View>
    </TouchableWithoutFeedback>

    <View style={styles.container} >
      {/* Game area */}
      <TouchableWithoutFeedback onPress={handleGun} disabled={!gameStarted || gameOver}>
        <View style={styles.gameArea}>
          {/* Bubbles */}
          {bubbles.map(bubble => (
            <Bubble
              key={`bubble-${bubble.id}`}
              x={bubble.x}
              y={bubble.y}
              radius={bubble.radius}
            />
          ))}
          {/* Power Bubbles
          {powerBubbles.map(bubble => (
            <IceBubble
              key={`bubble-${bubble.id}`}
              x={bubble.x}
              y={bubble.y}
              radius={bubble.radius}
            />
          ))}
          */}
          {/* Pain Bubbles */}
          {painBubbles.map(bubble => (
              <PainBubble
                key={`bubble-${bubble.id}`}
                x={bubble.x}
                y={bubble.y}
                radius={bubble.radius}
              />
          ))}
          {/* Bonus Bubbles */}
          {bonusBubbles.map(bubble => (
            <BonusBubble
              key={`bubble-${bubble.id}`}
              x={bubble.x}
              y={bubble.y}
              radius={bubble.radius}
              />
          ))}

          {/* Laser - fires from center of gun */}
          {laserVisible && (
            <View
              style={[
                styles.laser,
                { left: gunPosition['x'] + (gunWidth / 2) - (laserWidth / 2) }, // Center the 4px wide laser from gun center
                { width: laserWidth }
              ]}
            />
          )}

          {/* Gun - moves when user clicks lowest portion of screen */}
          <View style={[styles.gun, { left: gunPosition.x }]}>
            <View style={styles.gunBase} />
            <View style={styles.gunBarrel} />
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Score and Timer */}
      <View style={styles.hudContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={styles.scoreText}>Time: {timeLeft}s</Text>
      </View>

      {/* Start Screen */}
      {!gameStarted && !gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.title}>Bubble Popper</Text>
          <TouchableWithoutFeedback onPress={startGame}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Start Game</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}

      {/* Track for laser gun */}
      {<View onPress={fireLaser} style={styles.gunTrack}></View>}

      {/* Game Over Screen */}
      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.title}>Game Over</Text>
          <Text style={styles.scoreText}>Final Score: {score}</Text>
          <TouchableWithoutFeedback onPress={resetGame}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Play Again</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </View>
  </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
  },
  gameArea: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  hudContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 30,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  scoreText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gun: {
    position: 'absolute',
    bottom: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    backgroundColor: '#555',
    borderRadius: 5,
  },
  gunBase: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 20,
    backgroundColor: '#333',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    zIndex: 90,
  },
  gunBarrel: {
    position: 'absolute',
    bottom: 20,
    width: 10,
    height: 30,
    backgroundColor: '#222',
    zIndex: 90,
  },
  laser: {
    position: 'absolute',
    top: 0,
    height: '97%',
    backgroundColor: '#ff0000',
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 90,
  },
  gunTrack: {
    position: 'absolute',
    backgroundColor: '#3D1A35',
    bottom: 0,
    width: screenWidth,
    height: '8%',
    alignItems: 'bottom',
    zIndex: -1,
  },
  gunHandler: {
    position: 'absolute',
    bottom: 0,
    width: screenWidth,
    height: '8%',
    alignItems: 'bottom',
    zIndex: 200,
  },
});
