// // Import React Hooks
// import React, { useRef, useState, useEffect } from 'react';
// // Import user interface elements
// import {
//     SafeAreaView,
//     ScrollView,
//     StyleSheet,
//     Text,
//     View,
//     Switch,
// } from 'react-native';
// // Import components related to obtaining Android device permissions
// import { PermissionsAndroid, Platform } from 'react-native';
// // Import Agora SDK
// import {
//     createAgoraRtcEngine,
//     ChannelProfileType,
//     ClientRoleType,
//     IRtcEngine,
//     RtcSurfaceView,
//     RtcConnection,
//     IRtcEngineEventHandler,
// } from 'react-native-agora';

// // Define basic information
// const appId = '4c8b2fa8310a4729b6fb5c62e4cb3694';
// const token = '007eJxTYBDSjEzappEtcTgswusMnweHUUB/65rshTMXH3Of3SSdXK3AYJJskWSUlmhhbGiQaGJuZJlklpZkmmxmlGqSnGRsZmnSvj87vSGQkaHsQRozIwMEgvgsDMWJiSkMDABlfR0H';
// const channelName = 'saad';
// const uid = 0; // Local user Uid, no need to modify

// const VideoChat = () => {
//     const agoraEngineRef = useRef<IRtcEngine>(); // IRtcEngine instance
//     const [isJoined, setIsJoined] = useState(false); // Whether the local user has joined the channel
//     const [isHost, setIsHost] = useState(true); // User role
//     const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
//     const [message, setMessage] = useState(''); // User prompt message
//     const eventHandler = useRef<IRtcEngineEventHandler>(); // Implement callback functions

//     useEffect(() => {
//         // Initialize the engine when the App starts
//         setupVideoSDKEngine();
//         // Release memory when the App is closed
//         return () => {
//             agoraEngineRef.current?.unregisterEventHandler(eventHandler.current!);
//             agoraEngineRef.current?.release();
//         };
//     }, []);

//     // Define the setupVideoSDKEngine method called when the App starts
//     const setupVideoSDKEngine = async () => {
//         try {
//             // Create RtcEngine after obtaining device permissions
//             if (Platform.OS === 'android') {
//                 await getPermission();
//             }
//             agoraEngineRef.current = createAgoraRtcEngine();
//             const agoraEngine = agoraEngineRef.current;
//             eventHandler.current = {
//                 onJoinChannelSuccess: () => {
//                     showMessage('Successfully joined channel: ' + channelName);
//                     setIsJoined(true);
//                 },
//                 onUserJoined: (_connection: RtcConnection, uid: number) => {
//                     showMessage('Remote user ' + uid + ' joined');
//                     setRemoteUid(uid);
//                 },
//                 onUserOffline: (_connection: RtcConnection, uid: number) => {
//                     showMessage('Remote user ' + uid + ' left the channel');
//                     setRemoteUid(0);
//                 },
//             };

//             // Register the event handler
//             agoraEngine.registerEventHandler(eventHandler.current);
//             // Initialize the engine
//             agoraEngine.initialize({
//                 appId: appId,
//             });
//             // Enable local video
//             agoraEngine.enableVideo();
//         } catch (e) {
//             console.log(e);
//         }
//     };

//     // Consolidated join method for both host and audience
//     const join = async () => {
//         if (isJoined) {
//             return;
//         }

//         try {
//             const role = isHost ? ClientRoleType.ClientRoleBroadcaster : ClientRoleType.ClientRoleAudience;
//             const publishAudio = isHost;
//             const publishVideo = isHost;

//             // Start preview only if the user is a host
//             if (isHost) {
//                 agoraEngineRef.current?.startPreview();
//             }

//             // Join the channel with the appropriate settings for host or audience
//             agoraEngineRef.current?.joinChannel(token, channelName, uid, {
//                 channelProfile: ChannelProfileType.ChannelProfileCommunication,
//                 clientRoleType: role,
//                 publishMicrophoneTrack: publishAudio,
//                 publishCameraTrack: publishVideo,
//                 autoSubscribeAudio: true,
//                 autoSubscribeVideo: true,
//             });
//         } catch (e) {
//             console.log(e);
//         }
//     };

//     // Define the leave method called after clicking the leave channel button
//     const leave = () => {
//         try {
//             // Call leaveChannel method to leave the channel
//             agoraEngineRef.current?.leaveChannel();
//             setRemoteUid(0);
//             setIsJoined(false);
//             showMessage('Left the channel');
//         } catch (e) {
//             console.log(e);
//         }
//     };

//     // Render user interface
//     return (
//         <SafeAreaView style={styles.main}>
//             <View style={styles.btnContainer}>
//                 <Text onPress={join} style={styles.button}>Join Channel</Text>
//                 <Text onPress={leave} style={styles.button}>Leave Channel</Text>
//             </View>
//             <View style={styles.btnContainer}>
//                 <Text>Audience</Text>
//                 <Switch
//                     onValueChange={switchValue => {
//                         setIsHost(switchValue);
//                         if (isJoined) {
//                             leave();
//                         }
//                     }}
//                     value={isHost}
//                 />
//                 <Text>Host</Text>
//             </View>
//             <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContainer}>
//                 {isJoined ? (
//                     <>
//                         {isHost && (
//                             <View style={styles.videoContainer}>
//                                 <RtcSurfaceView canvas={{ uid: 0 }} style={styles.videoView} />
//                             </View>
//                         )}
//                         {remoteUid !== 0 && (
//                             <View style={styles.videoContainer}>
//                                 <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.videoView} />
//                             </View>
//                         )}
//                     </>
//                 ) : (
//                     <Text>{isHost ? 'Waiting for remote user to join' : 'Join a channel'}</Text>
//                 )}
//                 <Text style={styles.info}>{message}</Text>
//             </ScrollView>
//         </SafeAreaView>
//     );

//     // Display information
//     function showMessage(msg: string) {
//         setMessage(msg);
//     }
// };

// // Define user interface styles
// const styles = StyleSheet.create({
//     main: {
//         flex: 1,
//         alignItems: 'center',
//         backgroundColor: '#f5f7fa', // Subtle background color for the app
//     },
//     button: {
//         paddingHorizontal: 25,
//         paddingVertical: 10,
//         fontWeight: 'bold',
//         fontSize: 16,
//         color: '#ffffff',
//         backgroundColor: '#0078d7', // Primary button color
//         borderRadius: 8,
//         margin: 8,
//         textAlign: 'center',
//         overflow: 'hidden',
//         elevation: 3, // Subtle shadow for buttons
//     },
//     btnContainer: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginVertical: 10,
//     },
//     scroll: {
//         flex: 1,
//         width: '100%',
//         backgroundColor: '#f5f7fa',
//     },
//     scrollContainer: {
//         alignItems: 'center',
//         paddingVertical: 20,
//     },
//     videoContainer: {
//         width: '90%',
//         height: 300,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginVertical: 15,
//         backgroundColor: '#ffffff', // Neutral background for videos
//         borderRadius: 15,
//         elevation: 5, // Adds a shadow effect
//         overflow: 'hidden',
//     },
//     videoView: {
//         width: '100%',
//         height: '100%',
//     },
//     info: {
//         backgroundColor: '#e7f3ff', // Subtle info background
//         paddingHorizontal: 12,
//         paddingVertical: 8,
//         color: '#003366', // Complementary text color
//         fontSize: 14,
//         borderRadius: 5,
//         textAlign: 'center',
//         marginVertical: 10,
//     },
//     head: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: '#333333',
//         marginBottom: 10,
//     },
// });

// const getPermission = async () => {
//     if (Platform.OS === 'android') {
//         await PermissionsAndroid.requestMultiple([
//             PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//             PermissionsAndroid.PERMISSIONS.CAMERA,
//         ]);
//     }
// };

// export default VideoChat;


import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
} from 'react-native-agora';
import styles from './style';
import requestCameraAndAudioPermission from './Permission';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
const config = {
  appId: '4c8b2fa8310a4729b6fb5c62e4cb3694',
  token: '007eJxTYKicbbPXxz3SY7dzf2Wk3QTVb/WdIQ611bK7yx8Uv7hoJKnAYJJskWSUlmhhbGiQaGJuZJlklpZkmmxmlGqSnGRsZmmyZeWM9IZARga2ObdZGBkgEMRnYShOTExhYAAAC70e5w==',
  channelName: 'saad',
};

const VideoChat = () => {
  const _engine = useRef(null);
  const [isJoined, setJoined] = useState(false);
  const [peerIds, setPeerIds] = useState([]);
  const [isMuted, setMuted] = useState(false);
  const [isVideoDisabled, setVideoDisabled] = useState(false);
 const navigation = useNavigation();
  useEffect(() => {
    const initAgora = async () => {
      const { appId } = config;
      _engine.current = await createAgoraRtcEngine();
      await _engine.current.initialize({ appId });
      _engine.current.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
      _engine.current.setClientRole(ClientRoleType.ClientRoleBroadcaster);
      _engine.current.enableVideo();
      _engine.current.startPreview();

      _engine.current.addListener('onUserJoined', (connection, uid) => {
        console.log('UserJoined', connection, uid);
        if (!peerIds.includes(uid)) {
          setPeerIds(prev => [...prev, uid]);
        }
      });

      _engine.current.addListener('onUserOffline', (connection, uid) => {
        console.log('UserOffline', connection, uid);
        setPeerIds(prev => prev.filter(id => id !== uid));
      });

      _engine.current.addListener('onJoinChannelSuccess', connection => {
        console.log('JoinChannelSuccess', connection);
        setJoined(true);
      });

      _engine.current.addListener('onError', (err) => {
        console.error('Agora Error: ', err);
      });
    };

    if (Platform.OS === 'android') {
      requestCameraAndAudioPermission().then(() => {
        console.log('Permissions granted');
        initAgora();
      });
    }

    return () => {
      // Cleanup on unmount
      _engine.current?.removeAllListeners();
      _engine.current?.release();
    };
  }, []);

  const startCall = async () => {
    try {
      await _engine.current?.joinChannel(config.token, config.channelName, 0, {});
    } catch (error) {
      console.error('Error joining channel:', error);
    }
  };

  const endCall = async () => {
    try {
      await _engine.current?.leaveChannel();
      setPeerIds([]);
      setJoined(false);
      setMuted(false);
      setVideoDisabled(false);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const muteAudio = () => {
    if (isMuted) {
      _engine.current?.muteLocalAudioStream(false);
    } else {
      _engine.current?.muteLocalAudioStream(true);
    }
    setMuted(!isMuted);
  };

  const disableVideo = () => {
    if (isVideoDisabled) {
      _engine.current?.enableVideo();
    } else {
      _engine.current?.disableVideo();
    }
    setVideoDisabled(!isVideoDisabled);
  };

  const _renderVideos = () => {
    return isJoined ? (
      <View style={styles.fullView}>
        <RtcSurfaceView
          style={styles.max}
          canvas={{
            uid: 0,
          }}
        />
        {_renderRemoteVideos()}
      </View>
    ) : null;
  };

  const _renderRemoteVideos = () => {
    return (
      <ScrollView
        style={styles.remoteContainer}
        contentContainerStyle={styles.padding}
        horizontal={true}>
        {peerIds.map(id => (
          <RtcSurfaceView
            style={styles.remote}
            canvas={{
              uid: id,
            }}
            key={id}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.max}>
     <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('(tabs)', { screen: 'Search Rooms' })}
          >
            <FontAwesomeIcon icon={faArrowLeft} size={24} color="white" />
          </TouchableOpacity>
      <View style={styles.max}>
        <View style={styles.buttonHolder}>
          {!isJoined ? (
            <TouchableOpacity onPress={startCall} style={styles.button}>
              <Text style={styles.buttonText}>Start Call</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={endCall} style={styles.button}>
              <Text style={styles.buttonText}>End Call</Text>
            </TouchableOpacity>
          )}

          {isJoined && (
            <TouchableOpacity onPress={muteAudio} style={styles.button}>
              <Text style={styles.buttonText}>
                {isMuted ? 'Unmute Audio' : 'Mute Audio'}
              </Text>
            </TouchableOpacity>
          )}

          {isJoined && (
            <TouchableOpacity onPress={disableVideo} style={styles.button}>
              <Text style={styles.buttonText}>
                {isVideoDisabled ? 'Enable Video' : 'Disable Video'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {_renderVideos()}
      </View>
    </View>
  );
};

export default VideoChat;
