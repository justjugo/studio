
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
// Import Firestore functions
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error) => {
    console.error('Anonymous Sign-In Error:', error);
    toast({
      variant: 'destructive',
      title: 'La connexion anonyme a échoué',
      description: error.message,
    });
  });
}

/**
 * Initiate email/password sign-up.
 * This function is now ASYNCHRONOUS and returns a promise.
 */
export async function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string
): Promise<void> { // Return a Promise
  try {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    const user = userCredential.user;

    if (user) {
      // After creating the user in Auth, create their document in Firestore
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);
      const newUserData = {
        id: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
        role: 'user', // Assign a default role
      };

      // Wait for the Firestore document to be created
      await setDoc(userDocRef, newUserData);
      
      // Now, send the verification email
      await sendEmailVerification(user);
    }
  } catch (error: any) {
    console.error('Sign-Up Error:', error);
    let description = 'Une erreur inattendue est survenue.';
    if (error.code === 'auth/email-already-in-use') {
      description = 'Cette adresse e-mail est déjà utilisée.';
    } else if (error.code === 'auth/weak-password') {
      description = 'Le mot de passe est trop faible. Veuillez utiliser un mot de passe plus fort.';
    }
    toast({
      variant: 'destructive',
      title: 'L\'inscription a échoué',
      description: description,
    });
    // Re-throw the error so the calling function knows it failed
    throw error;
  }
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string
): void {
  signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error('Sign-In Error:', error);
    let description = 'Une erreur inattendue est survenue.';
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      description = 'Email ou mot de passe invalide. Veuillez réessayer.';
    }
    toast({
      variant: 'destructive',
      title: 'La connexion a échoué',
      description: description,
    });
  });
}
