import firebase from "firebase";

const config = {
  apiKey: "AIzaSyBLWp9hZuE9g4hnCtUdVJW81B320hFSkkE",
  authDomain: "chatboat-484c3.firebaseapp.com",
  databaseURL: "https://chatboat-484c3-default-rtdb.firebaseio.com/",
};
firebase.initializeApp(config);
export const auth = firebase.auth;
export const db = firebase.database();
