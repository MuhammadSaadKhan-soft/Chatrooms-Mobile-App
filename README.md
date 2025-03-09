This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).
The Roomey Chatroom mobile app, developed in React Native for Android through the CLI, is a seamless extension of the web platform, offering users the flexibility to engage in real-time messaging, audio, and video communication on the go. Built using the MERN stack, the app integrates key features like real-time messaging via Socket.IO, media sharing with Cloudinary, and live voice/video calls powered by ZegoCloud and Agora RTC. It supports multiple room types, including public, private, temporary, and scheduled rooms, ensuring a versatile user experience. The app also incorporates secure user authentication, GitHub API integration for dynamic data fetching, and an automated email system using Nodemailer for notifications. With a focus on performance optimization, the app leverages caching and database indexing to deliver fast and responsive interactions, making it a robust solution for modern communication needs.
# Getting Started
<!-- Images Section -->
<img src="https://github.com/user-attachments/assets/25891939-71f6-478c-9835-92acdbbf5b16" alt="Image 1" width="300" height="500">
<img src="https://github.com/user-attachments/assets/7f2afde6-2709-40b6-9cad-f97ec346ffde" alt="Image 2" width="300" height="500">
<img src="https://github.com/user-attachments/assets/0374154c-5d94-44b9-b048-9c1a9ad94eed" alt="Image 3" width="300" height="500">
<img src="https://github.com/user-attachments/assets/552d35b3-32a2-4a6d-a9af-7d2b663eb3de" alt="Image 4" width="300" height="500">
<img src="https://github.com/user-attachments/assets/e3cddb45-e287-46f6-807d-34d3f8c4067b" alt="Image 5" width="300" height="500">
<img src="https://github.com/user-attachments/assets/97342324-50f1-4685-b782-431f53a832f3" alt="Image 6" width="300" height="500">
<img src="https://github.com/user-attachments/assets/24c71611-b01a-4985-b844-5540b64fb651" alt="Image 7" width="300" height="500">
<img src="https://github.com/user-attachments/assets/ca4b5036-3b8a-49c9-905e-5c9d20d2ccfc" alt="Image 8" width="300" height="500">
<img src="https://github.com/user-attachments/assets/36b870cf-1fd9-46a1-8e3d-b01a653193c5" alt="Image 9" width="300" height="500">
<img src="https://github.com/user-attachments/assets/dae551ee-64f9-44a4-b9a0-3412ae19883c" alt="Image 10" width="300" height="500">
<img src="https://github.com/user-attachments/assets/9d7fb5aa-05ab-4aaa-89c7-af0b215758f2" alt="Image 11" width="300" height="500">
<img src="https://github.com/user-attachments/assets/cc9e747d-73a0-4452-8bb5-d81a1a761418" alt="Image 12" width="300" height="500">


>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
