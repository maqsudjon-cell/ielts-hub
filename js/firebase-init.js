/*!
 * IELTS Hub — Firebase bootstrap (compat SDK)
 * Self-contained: loads the Firebase compat scripts, initializes the app,
 * and ensures a signed-in user (anonymous by default, Google on request).
 *
 * Usage (classic script, any page):
 *   <script src="js/firebase-init.js" defer></script>
 *   IHFirebase.ready.then(function (fb) {
 *     if (!fb) return;            // Firebase unavailable — degrade gracefully
 *     fb.db.collection('results')…
 *   });
 *
 * NOTE: the apiKey below is a public app identifier, not a secret.
 * Access control lives in Firestore security rules.
 */
(function () {
  'use strict';
  if (window.IHFirebase) return;

  var SDK_VERSION = '12.14.0';
  var SDK_BASE = 'https://www.gstatic.com/firebasejs/' + SDK_VERSION + '/';

  var CONFIG = {
    apiKey: 'AIzaSyAqS59ek0seZ0rcSZb3RPhiwTzleIAZ-9E',
    authDomain: 'ieltshub-e2aa8.firebaseapp.com',
    projectId: 'ieltshub-e2aa8',
    storageBucket: 'ieltshub-e2aa8.firebasestorage.app',
    messagingSenderId: '645780307385',
    appId: '1:645780307385:web:1dc8640e294be2204b4a68'
  };

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        if (existing.getAttribute('data-ih-loaded')) { resolve(); return; }
        existing.addEventListener('load', function () { resolve(); });
        existing.addEventListener('error', function () { reject(new Error('load failed: ' + src)); });
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = function () { s.setAttribute('data-ih-loaded', '1'); resolve(); };
      s.onerror = function () { reject(new Error('load failed: ' + src)); };
      (document.head || document.documentElement).appendChild(s);
    });
  }

  /* Resolves the current user, signing in anonymously only when nobody is
     signed in — never clobbers an existing (e.g. Google) session. */
  function ensureUser(auth) {
    return new Promise(function (resolve) {
      var unsub = auth.onAuthStateChanged(function (user) {
        unsub();
        if (user) { resolve(user); return; }
        auth.signInAnonymously().then(function (cred) {
          resolve(cred.user);
        }).catch(function (err) {
          // Most common cause: Anonymous provider not enabled in the console.
          console.warn('[IH Firebase] anonymous sign-in failed:', err && err.code, err && err.message);
          resolve(null);
        });
      });
    });
  }

  var ready = loadScript(SDK_BASE + 'firebase-app-compat.js')
    .then(function () { return loadScript(SDK_BASE + 'firebase-auth-compat.js'); })
    .then(function () { return loadScript(SDK_BASE + 'firebase-firestore-compat.js'); })
    .then(function () {
      var app = firebase.apps.length ? firebase.app() : firebase.initializeApp(CONFIG);
      var auth = firebase.auth();
      var db = firebase.firestore();
      return ensureUser(auth).then(function (user) {
        return { app: app, auth: auth, db: db, user: user, firebase: firebase };
      });
    })
    .catch(function (err) {
      console.warn('[IH Firebase] unavailable:', err && err.message);
      return null;
    });

  /* Google sign-in for cross-device sync.
     Anonymous user → linkWithPopup keeps the same uid, so results already
     saved on this device follow the Google account. If that Google account
     is already in use (linked on another device first), we switch to it. */
  function signInWithGoogle() {
    return ready.then(function (fb) {
      if (!fb) throw new Error('Firebase unavailable');
      var provider = new firebase.auth.GoogleAuthProvider();
      var p;
      if (fb.user && fb.user.isAnonymous) {
        p = fb.user.linkWithPopup(provider).catch(function (err) {
          if (err && err.credential &&
              (err.code === 'auth/credential-already-in-use' || err.code === 'auth/email-already-in-use')) {
            return fb.auth.signInWithCredential(err.credential);
          }
          throw err;
        });
      } else {
        p = fb.auth.signInWithPopup(provider);
      }
      return p.then(function (cred) {
        fb.user = cred.user || fb.auth.currentUser;
        return fb.user;
      });
    });
  }

  function signOutUser() {
    return ready.then(function (fb) {
      if (fb) return fb.auth.signOut();
    });
  }

  window.IHFirebase = { ready: ready, signInWithGoogle: signInWithGoogle, signOut: signOutUser };
})();
