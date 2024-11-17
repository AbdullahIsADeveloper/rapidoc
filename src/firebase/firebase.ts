import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB4iWaIlMBgBU7zDI7-cxFF2O8CU8xRU3E",
  authDomain: "rapidoc-ff873.firebaseapp.com",
  projectId: "rapidoc-ff873",
  storageBucket: "rapidoc-ff873.firebasestorage.app",
  messagingSenderId: "265681352127",
  appId: "1:265681352127:web:b42a6cd285980f07171d0a",
  measurementId: "G-3HRDYSH03P"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
export {app, auth}