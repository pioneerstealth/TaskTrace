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

        // Add red animation if time left is below 100 seconds
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

  // Check if there's an existing timer and start it, or start a new one
  const existingEndTime = localStorage.getItem('timerEndTime');
  if (existingEndTime) {
    const remainingTime = Math.max(0, existingEndTime - Date.now());
    startTimer(Math.ceil(remainingTime / 1000));
  } else {
    startTimer(120); // Start a new timer for 3 minutes (180 seconds)
  }
})();
