import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';

const Message = ({ sender, message, classs, timestamp, profilePicture, audioUrl }) => {
  const [clicked, setClicked] = useState(false); // State to track if the message is clicked
  const [scaleValue] = useState(new Animated.Value(1)); // Animated value for scaling
  const [translateY] = useState(new Animated.Value(0)); // Animated value for translation
  const [profileScale] = useState(new Animated.Value(1)); // Animated value for profile picture scale

  const formattedTimestamp = new Date(timestamp).toLocaleTimeString();

  if (!message && !audioUrl) {
    return null;
  }

  const handlePress = () => {
    setClicked(!clicked);

    // Trigger the scaling and translation animations
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: clicked ? 1 : 1.1, // Increase size when clicked
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: clicked ? 0 : -5, // Move the message slightly when clicked
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(profileScale, {
        toValue: clicked ? 1 : 1.2, // Slightly scale the profile picture when clicked
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.messageContainer,
          classs === 'right' ? styles.right : styles.left,
          {
            transform: [{ scale: scaleValue }, { translateY: translateY }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
          },
        ]}
      >
        <View
          style={[
            styles.message,
            classs === 'right' ? styles.rightMessage : styles.leftMessage,
            { backgroundColor: classs === 'right' ? '#007bff' : '#e1e1e1' }, // Dynamic background
          ]}
        >
          {profilePicture && (
            <Animated.Image
              source={{ uri: profilePicture }}
              style={[styles.profilePicture, { transform: [{ scale: profileScale }] }]}
            />
          )}
          <Text style={[styles.sender, styles.senderBold]}>{sender}:</Text>
          {message && !audioUrl && <Text style={styles.messageText}>{message}</Text>}
        </View>
        <Text style={[styles.timestamp, classs === 'right' ? styles.right : styles.left]}>
          {formattedTimestamp}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 12,
    transform: [{ scale: 1 }],
    transition: 'transform 0.3s ease',
  },
  right: {
    alignItems: 'flex-end',
  },
  left: {
    alignItems: 'flex-start',
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 300,
    padding: 10,
    borderRadius: 20, // Increased roundness for a softer look
    backgroundColor: '#f1f1f1',
    marginTop: 10,
    wordWrap: 'break-word',
    position: 'relative',
    borderWidth: 2, // Adding a border for more visual separation
    borderColor: '#ddd', // Light border color
  },
  messageText: {
    margin: 0,
    color: '#333',
    fontSize: 14,
    letterSpacing: 0.5, // Added letter-spacing for readability
  },
  timestamp: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
    textAlign: 'right',
  },
  rightMessage: {
    backgroundColor: '#007bff', // Message background for the right side
    color: 'white',
  },
  leftMessage: {
    backgroundColor: '#e1e1e1', // Message background for the left side
    color: 'black',
  },
  profilePicture: {
    width: 40, // Slightly larger profile picture for a more polished look
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderColor: '#ddd',
    borderWidth: 2,
  },
  sender: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'normal',
  },
  senderBold: {
    fontWeight: 'bold',
    color: 'black', // Dark color for better contrast
  },
  rightMessageHover: {
    backgroundColor: '#0056b3', // Darker blue for hover effect
  },
  leftMessageHover: {
    backgroundColor: '#d1d1d1', // Darker gray for hover effect
  },
});

export default Message;
