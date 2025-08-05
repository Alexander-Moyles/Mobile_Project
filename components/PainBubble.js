/**
 * Bubble Component
 * 
 * Renders a circular bubble for the Bubble Popper game.
 * Each bubble has a position (x, y) and size (radius).
 * 
 * This file is for a special bubble type, the "Pain Bubble"
 * Pain Bubbles are a much smaller than regular bubbles, move faster and take points away
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

/**
 * Bubble component for the Bubble Popper game
 * 
 * @param {Object} props - Component properties
 * @param {number} props.x - X coordinate of the bubble
 * @param {number} props.y - Y coordinate of the bubble
 * @param {number} props.radius - Radius of the bubble
 * @returns {React.Component} Rendered bubble
 */
export default function PainBubble({ x, y, radius }) {
  return (
    <View
      style={[
        styles.bubble,
        {
          left: x,
          top: y,
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
        },
      ]}
    >
        <Text style={styles.text}>💀</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    backgroundColor: 'purple',
    opacity: 0.75,
    borderColor: 'red',
    borderWidth: 1.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  text: {
    textAlign: "center",
    fontWeight: '700',
    fontSize: 25,
  }
});
