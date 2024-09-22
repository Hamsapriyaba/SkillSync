import React, { useState, useEffect, createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore, doc, setDoc, addDoc, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APPID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
export const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// Create Context
const FirebaseContext = createContext(null);

export const useFirebase = () => {
    const firebase = useContext(FirebaseContext);
    if (!firebase) {
        throw new Error("useFirebase must be used within a FirebaseProvider");
    }
    return firebase;
}

export const FirebaseProvider = (props) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        // Retrieve the value from local storage on initial load
        return JSON.parse(localStorage.getItem('isLoggedIn')) || false;
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, user => {
            if (user) {
                setUser(user);
                setIsLoggedIn(true);
                localStorage.setItem('isLoggedIn', JSON.stringify(true));
            } else {
                setUser(null);
                setIsLoggedIn(false);
                localStorage.setItem('isLoggedIn', JSON.stringify(false));
            }
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, []);

    // Function to add a user to Firestore
    const addUser = async (CoalName, email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            const loggedInUser = userCredential.user;

            const userDoc = {
                CoalName,
                email,
                userId: loggedInUser.uid,
            };

            const userDocRef = doc(firestore, 'users', loggedInUser.uid);
            await setDoc(userDocRef, userDoc);
            console.log('User document created with UID: ', loggedInUser.uid);

            onAuthStateChanged(firebaseAuth, (user) => {
                if (user) {
                    console.log('User is logged in:', user);
                } else {
                    console.log('No user is logged in');
                }
            });

        } catch (error) {
            console.error('Error creating user or setting authentication:', error);
        }
    };

    // Function to sign in with email and password
    const signinUserWithEmailAndPassword = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            return userCredential;
        } catch (error) {
            let errorMessage = 'An error occurred during sign-in.';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please try again.';
                    break;
                default:
                    errorMessage = 'Failed to sign in. Please check your credentials and try again.';
                    break;
            }
            throw new Error(errorMessage);
        }
    };

    // Function to sign in with Google
    const signinWithGoogle = () => {
        signInWithPopup(firebaseAuth, googleProvider);
    };

    // Function to send password reset email
    const sendPReset = (email) => {
        sendPasswordResetEmail(firebaseAuth, email);
    };

    // Function to log out the user
    const handleLogout = async () => {
        try {
            await signOut(firebaseAuth);
            localStorage.removeItem('isLoggedIn');
        } catch (error) {
            console.error('Error occurred during logout:', error);
        }
    };

    // Function to upload PDF to Firebase Storage and save metadata to Firestore
    const uploadPDFToFirebase = async (pdfBlob) => {
        try {
            // Step 1: Upload PDF to Firebase Storage
            const storageRef = ref(storage, `pdfs/emission-estimate-${Date.now()}.pdf`);
            const snapshot = await uploadBytes(storageRef, pdfBlob);

            // Step 2: Get the download URL of the uploaded PDF
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Step 3: Store PDF metadata or URL in Firestore
            await addDoc(collection(firestore, "users", user.uid, "pdfs"), {
                url: downloadURL,
                createdAt: new Date(),
                userId: user ? user.uid : null,
            });

            console.log('PDF uploaded and metadata saved successfully');
            return downloadURL;
        } catch (error) {
            console.error("Error uploading PDF to Firebase:", error);
            throw new Error('Failed to upload PDF to Firebase');
        }
    };

    // Function to fetch all PDFs for the logged-in user
    const fetchUserPDFs = async () => {
        try {
            if (!user) throw new Error("No user is logged in");

            const pdfsCollectionRef = collection(firestore, 'users', user.uid, 'pdfs');
            const pdfsSnapshot = await getDocs(pdfsCollectionRef);
            const pdfList = pdfsSnapshot.docs.map(doc => doc.data());

            return pdfList;
        } catch (error) {
            console.error("Error fetching PDFs: ", error);
            throw new Error("Failed to fetch PDFs");
        }
    };

    return (
        <FirebaseContext.Provider value={{
            user,
            isLoggedIn,
            addUser,
            signinUserWithEmailAndPassword,
            signinWithGoogle,
            handleLogout,
            sendPReset,
            uploadPDFToFirebase,
            fetchUserPDFs
        }}>
            {props.children}
        </FirebaseContext.Provider>
    );
};