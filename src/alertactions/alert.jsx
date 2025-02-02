import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

function Alert({ alert }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (!visible) return null;

  const alertStyles = [styles.alert, styles[`alert${alert.type}`]];

  return (
    <View style={alertStyles}>
    <Text style={styles.text}>{alert.message}</Text>

      <TouchableOpacity onPress={() => setVisible(false)}>
        <Text style={styles.closeBtn}>&times;</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Alert;

const styles = StyleSheet.create({
  alert: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 320,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)',  // Adding shadow effect
  },

  text: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'System',
    flex: 1,
  },
  closeBtn: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 16,
  },
  alertsuccess: {
    backgroundColor: '#28a745',  // Green for success
  },
  alerterror: {
    backgroundColor: '#dc3545',  // Red for error
  },
  alertinfo: {
    backgroundColor: '#17a2b8',  // Blue for info
  },
  alertwarning: {
    backgroundColor: '#ffc107',  // Yellow for warning
  },
});
