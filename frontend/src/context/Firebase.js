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
}

export const FirebaseProvider = (props) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return JSON.parse(localStorage.getItem('isLoggedIn')) || false;
    });
    const [error, setError] = useState('');

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

        return () => unsubscribe();
    }, []);

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
        } catch (error) {
            setError(error.message);
            console.error('Error creating user or setting authentication:', error);
        }
    };

    const signinUserWithEmailAndPassword = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            return userCredential;
        } catch (error) {
            setError(error.message);
            throw new Error('Failed to sign in. Please check your credentials and try again.');
        }
    };

    const signinWithGoogle = async () => {
        try {
            await signInWithPopup(firebaseAuth, googleProvider);
        } catch (error) {
            setError(error.message);
        }
    };

    const sendPReset = async (email) => {
        try {
            await sendPasswordResetEmail(firebaseAuth, email);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(firebaseAuth);
            localStorage.removeItem('isLoggedIn');
        } catch (error) {
            setError(error.message);
        }
    };

    const uploadPDFToFirebase = async (pdfBlob) => {
        try {
            const storageRef = ref(storage, `pdfs/emission-estimate-${Date.now()}.pdf`);
            const snapshot = await uploadBytes(storageRef, pdfBlob);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await addDoc(collection(firestore, "users", user.uid, "pdfs"), {
                url: downloadURL,
                createdAt: new Date(),
                userId: user ? user.uid : null,
            });

            console.log('PDF uploaded and metadata saved successfully');
            return downloadURL;
        } catch (error) {
            setError(error.message);
            throw new Error('Failed to upload PDF to Firebase');
        }
    };

    const fetchUserPDFs = async () => {
        try {
            if (!user) throw new Error("No user is logged in");

            const pdfsCollectionRef = collection(firestore, 'users', user.uid, 'pdfs');
            const pdfsSnapshot = await getDocs(pdfsCollectionRef);
            const pdfList = pdfsSnapshot.docs.map(doc => doc.data());

            return pdfList;
        } catch (error) {
            setError(error.message);
            throw new Error("Failed to fetch PDFs");
        }
    };

    return (
        <FirebaseContext.Provider value={{
            user,
            isLoggedIn,
            error,
            addUser,
            signinUserWithEmailAndPassword,
            signinWithGoogle,
            handleLogout,
            sendPReset,
            uploadPDFToFirebase,
            fetchUserPDFs
        }}>
            {props.children}
            {error && <div className="error">{error}</div>} {/* Display error message */}
        </FirebaseContext.Provider>
    );
};
