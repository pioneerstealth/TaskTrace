  import { auth, database, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, doc, setDoc, updateDoc, getDoc } from './firebase_config.js';

  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     // Redirect to userhub.html if the user is already logged in
  //     window.location.href = "userhub.html";
  //   }
  // });

  let isSigningUp = false;

  const signUp_form = document.getElementById("signUp_form");

  signUp_form.addEventListener("submit", (signUp) => {
    signUp.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email_input_signUp = document.getElementById("email_input_signUp").value;
    const password_input_signUp = document.getElementById("password_input_signUp").value;

    isSigningUp = true;

    createUserWithEmailAndPassword(auth, email_input_signUp, password_input_signUp)
      .then((userCredential) => {
        const user = userCredential.user;
        return setDoc(doc(database, "users", user.uid), {
          email: user.email,
          role: "user",
          fullName: fullName,
        });
      })
      .then(() => {
        isSigningUp = false;
        loginpress();
        signUp_form.reset();
      })
      .catch((error) => {
        isSigningUp = false;
        alert(error.message);
      });
  });

  const logIn_form = document.getElementById("logIn_form");

  logIn_form.addEventListener("submit", (logIn) => {
    logIn.preventDefault();

    const email_input_logIn = document.getElementById("email_input_logIn").value;
    const password_input_logIn = document.getElementById("password_input_logIn").value;

    signInWithEmailAndPassword(auth, email_input_logIn, password_input_logIn)
      .then((userCredential) => {
        const user = userCredential.user;
        const dt = new Date();
        return updateDoc(doc(database, "users", user.uid), {
          lastLogin: dt,
        }).then(() => user);
      })
      .then((user) => {
        const userDocRef = doc(database, "users", user.uid);
        return getDoc(userDocRef);
      })
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const role = userData.role;
          if (role === 'admin') {
            window.location.href = "index.html";
          } else {
            window.location.href = "userhub.html";
          }
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        alert(error.message);
      });
  });

  onAuthStateChanged(auth, (user) => {
    if (user && !isSigningUp) {
      console.log("User is signed in but we don't handle redirection here anymore.");
    } else {
      console.log("User is signed out");
    }
  });

  function loginpress() {
    container.classList.remove("right-panel-active");
  }

  document.getElementById("user").addEventListener("click", (event) => {
    event.preventDefault();
    fetchUserData();
  });

  function fetchUserData() {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(database, "users", user.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const fullName = userData.fullName;
            const email = userData.email;
            const role = userData.role;

            const infoDiv = document.getElementById("info");
            infoDiv.innerHTML = `
              <p id="fullname">Name: ${fullName}</p>
              <p id="email">${email}</p>
              <p id="role">Role: ${role}</p>
            `;
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.error("Error getting user document:", error);
        });
    } else {
      console.log("User not signed in.");
    }
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchUserData();
    }
  });

  (() => {
    "use strict";

    const initElements = (type) => {
      const els = [{}, {}];
      if (!["s", "m", "h"].includes(type)) return els;

      const target = document.querySelector(`.flip-clock-${type}`);
      if (!target) return els;

      ["left", "right"].forEach((side, index) => {
        const el = els[index];
        el.digit = target.querySelector(`.digit-${side}`);
        el.card = el.digit.querySelector(".card");
        el.cardFaces = el.card.querySelectorAll(".card-face");
        [el.cardFaceA, el.cardFaceB] = el.cardFaces;
      });

      return els;
    };

    const els = {
      h: initElements("h"),
      m: initElements("m"),
      s: initElements("s")
    };

    const initializeClock = (h, m, s) => {
      const time = {
        h: [Math.floor(h / 10), h % 10],
        m: [Math.floor(m / 10), m % 10],
        s: [Math.floor(s / 10), s % 10]
      };

      Object.entries(time).forEach(([unit, digits]) => {
        digits.forEach((digit, index) => {
          const el = els[unit][index];
          el.digit.dataset.digitBefore = digit;
          el.cardFaceA.textContent = digit;
          el.cardFaceB.textContent = digit;
        });
      });
    };

    const updateDigit = (el, newDigit) => {
      if (!el.digit) return;

      const currentDigit = parseInt(el.digit.dataset.digitBefore);

      if (currentDigit !== newDigit) {
        el.cardFaceB.textContent = newDigit;

        el.card.addEventListener("transitionend", () => {
          el.digit.dataset.digitBefore = newDigit;
          el.cardFaceA.textContent = newDigit;

          const cardClone = el.card.cloneNode(true);
          cardClone.classList.remove("flipped");
          el.digit.replaceChild(cardClone, el.card);
          el.card = cardClone;
          [el.cardFaceA, el.cardFaceB] = el.card.querySelectorAll(".card-face");
        }, { once: true });

        el.card.classList.add("flipped");
      }
    };

    const updateClock = (h, m, s) => {
      const time = {
        h: [Math.floor(h / 10), h % 10],
        m: [Math.floor(m / 10), m % 10],
        s: [Math.floor(s / 10), s % 10]
      };

      Object.entries(time).forEach(([unit, digits]) => {
        digits.forEach((digit, index) => updateDigit(els[unit][index], digit));
      });
    };

    const startTimer = (seconds) => {
      let endTime = localStorage.getItem('timerEndTime');

      if (!endTime) {
        endTime = Date.now() + seconds * 1000;
        localStorage.setItem('timerEndTime', endTime);
      }

      const initialTimeLeft = Math.max(0, endTime - Date.now());
      const initialHours = Math.floor(initialTimeLeft / (1000 * 60 * 60) % 24);
      const initialMinutes = Math.floor(initialTimeLeft / (1000 * 60) % 60);
      const initialSeconds = Math.floor(initialTimeLeft / 1000 % 60);

      initializeClock(initialHours, initialMinutes, initialSeconds);

      const updateTimer = () => {
        const now = Date.now();
        const timeLeft = Math.max(0, endTime - now);

        if (timeLeft === 0) {
          localStorage.removeItem('timerEndTime');
        } else {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60) % 24);
          const minutes = Math.floor(timeLeft / (1000 * 60) % 60);
          const seconds = Math.floor(timeLeft / 1000 % 60);

          updateClock(hours, minutes, seconds);

          const flipClockContainer = document.querySelector('.flip-clock-container');
          if (timeLeft <= 60000) {
            flipClockContainer.classList.add('red');
          } else {
            flipClockContainer.classList.remove('red');
          }

          requestAnimationFrame(updateTimer);
        }
      };

      updateTimer();
    };

    const existingEndTime = localStorage.getItem('timerEndTime');
    if (existingEndTime) {
      const remainingTime = Math.max(0, existingEndTime - Date.now());
      startTimer(Math.ceil(remainingTime / 1000));
    } else {
      startTimer(120);
    }
  })();

  const userinfo = document.getElementById('user');
  const info = document.getElementById('info');

  userinfo.addEventListener('click', function(event) {
    event.preventDefault();
    info.style.opacity = '1';
    info.style.visibility = 'visible';
  });

  document.addEventListener('click', function(event) {
    const isClickInsideInfo = info.contains(event.target);
    const isClickOnUser = userinfo.contains(event.target);

    if (!isClickInsideInfo && !isClickOnUser) {
      info.style.opacity = '0';
      info.style.visibility = 'hidden';
    }
  });
