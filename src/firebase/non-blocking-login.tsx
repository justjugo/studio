
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance).catch((error) => {
    console.error('Anonymous Sign-In Error:', error);
    toast({
      variant: 'destructive',
      title: 'La connexion anonyme a échoué',
      description: error.message,
    });
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string
): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
        if (userCredential.user) {
            sendEmailVerification(userCredential.user);
        }
    })
    .catch(
    (error) => {
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
    }
  );
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string
): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
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
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
