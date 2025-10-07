// components/puzzle/LogicMaze.tsx (New)
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MAZE_SIZE = 5;
const CELL_SIZE = 50;

const mazeLayout = [
  [0, 1, 0, 0, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 1, 0],
  [1, 1, 0, 1, 0],
  [0, 0, 0, 1, 2], // 2 is the exit
];

interface LogicMazeProps {
  onComplete: (result: any) => void;
}

export default function LogicMaze({ onComplete }: LogicMazeProps) {
  const [playerPosition, setPlayerPosition] = useState({ row: 0, col: 0 });
  const [path, setPath] = useState([{ row: 0, col: 0 }]);
  const [isCompleted, setIsCompleted] = useState(false);

  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (isCompleted) return;

    let { row, col } = playerPosition;
    let newRow = row;
    let newCol = col;

    switch (direction) {
      case 'up': newRow--; break;
      case 'down': newRow++; break;
      case 'left': newCol--; break;
      case 'right': newCol++; break;
    }

    if (
      newRow >= 0 && newRow < MAZE_SIZE &&
      newCol >= 0 && newCol < MAZE_SIZE &&
      mazeLayout[newRow][newCol] !== 1
    ) {
      setPlayerPosition({ row: newRow, col: newCol });
      const newPath = [...path, { row: newRow, col: newCol }];
      setPath(newPath);

      if (mazeLayout[newRow][newCol] === 2) {
        setIsCompleted(true);
        onComplete({
          completed: true,
          pathLength: newPath.length,
          moves: newPath.length - 1,
        });
        Alert.alert("Maze Complete!", "Your choices have been recorded.");
      }
    }
  };

  const renderMaze = () => {
    return mazeLayout.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((cell, colIndex) => {
          const isPlayerHere = playerPosition.row === rowIndex && playerPosition.col === colIndex;
          const isPath = path.some(p => p.row === rowIndex && p.col === colIndex);
          
          return (
            <View
              key={colIndex}
              style={[
                styles.cell,
                cell === 1 && styles.wall,
                cell === 2 && styles.exit,
                isPath && styles.path,
              ]}
            >
              {isPlayerHere && (
                <Ionicons name="person" size={24} color="#fff" />
              )}
              {cell === 2 && !isPlayerHere && (
                <Ionicons name="flag" size={24} color="#fff" />
              )}
            </View>
          );
        })}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Guide the player to the flag!</Text>
      <View style={styles.mazeContainer}>{renderMaze()}</View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => movePlayer('up')}>
          <Ionicons name="arrow-up" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.middleControls}>
          <TouchableOpacity style={styles.button} onPress={() => movePlayer('left')}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => movePlayer('down')}>
            <Ionicons name="arrow-down" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => movePlayer('right')}>
            <Ionicons name="arrow-forward" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      {isCompleted && (
        <Text style={styles.completeText}>Well done!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  mazeContainer: {
    borderWidth: 2,
    borderColor: '#333',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#f0f0f0',
    borderWidth: 0.5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wall: {
    backgroundColor: '#333',
  },
  exit: {
    backgroundColor: '#4CAF50',
  },
  path: {
    backgroundColor: '#007AFF',
  },
  controls: {
    marginTop: 20,
    alignItems: 'center',
  },
  middleControls: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 32,
    margin: 4,
  },
  completeText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
