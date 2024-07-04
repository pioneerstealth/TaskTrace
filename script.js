// (function () {
//     "use strict";
  
//     const els = {
//       s: initElements("s"),
//       m: initElements("m"),
//       h: initElements("h")
//     };
  
//     function initElements(type) {
//       const els = [{}, {}];
  
//       if (!["s", "m", "h"].includes(type)) return els;
  
//       const target = document.querySelector(`.flip-clock-${type}`);
  
//       if (!target) return els;
  
//       let el;
  
//       el = els[0];
//       el.digit = target.querySelector(".digit-left");
//       el.card = el.digit.querySelector(".card");
//       el.cardFaces = el.card.querySelectorAll(".card-face");
//       el.cardFaceA = el.cardFaces[0];
//       el.cardFaceB = el.cardFaces[1];
  
//       el = els[1];
//       el.digit = target.querySelector(".digit-right");
//       el.card = el.digit.querySelector(".card");
//       el.cardFaces = el.card.querySelectorAll(".card-face");
//       el.cardFaceA = el.cardFaces[0];
//       el.cardFaceB = el.cardFaces[1];
  
//       return els;
//     }
  
//     (function runClock() {
//       const date = new Date();
//       const now = {
//         h: date.getHours(),
//         m: date.getMinutes(),
//         s: date.getSeconds()
//       };
//       const updateNow = (h, m, s) => {
//         if (h) {
//           now.h = h;
//           now.h0 = now.h[0];
//           now.h1 = now.h[1];
//         }
//         if (m) {
//           now.m = m;
//           now.m0 = now.m[0];
//           now.m1 = now.m[1];
//         }
//         if (s) {
//           now.s = s;
//           now.s0 = now.s[0];
//           now.s1 = now.s[1];
//         }
//       }
//       updateNow(
//         now.h < 10 ? `0${now.h}` : `${now.h}`,
//         now.m < 10 ? `0${now.m}` : `${now.m}`,
//         now.s < 10 ? `0${now.s}` : `${now.s}`,
//       );
//       console.log(`${now.h0}${now.h1}:${now.m0}${now.m1}:${now.s0}${now.s1}`);
  
//       for (const t of Object.keys(els)) {
//         for (const i of ["0", "1"]) {
//           const curr = now[`${t}${i}`];
//           let next = +curr + 1;
//           if (t === "h") {
//             if (i === "0") next = next <= 2 ? `${next}` : "0";
//             if (i === "1") next = next <= 3 ? `${next}` : "0";
//           }
//           if (t === "m") {
//             if (i === "0") next = next <= 5 ? `${next}` : "0";
//             if (i === "1") next = next <= 9 ? `${next}` : "0";
//           }
//           if (t === "s") {
//             if (i === "0") next = next <= 5 ? `${next}` : "0";
//             if (i === "1") next = next <= 9 ? `${next}` : "0";
//           }
//           const el = els[t][i];
//           if (el && el.digit) {
//             if (!el.digit.dataset.digitBefore) {
//               el.digit.dataset.digitBefore = curr;
//               el.cardFaceA.textContent = el.digit.dataset.digitBefore;
//               el.digit.dataset.digitAfter = next;
//               el.cardFaceB.textContent = el.digit.dataset.digitAfter;
//             } else if (el.digit.dataset.digitBefore !== curr) {
//               el.card.addEventListener(
//                 "transitionend",
//                 function () {
//                   el.digit.dataset.digitBefore = curr;
//                   el.cardFaceA.textContent = el.digit.dataset.digitBefore;
  
//                   const cardClone = el.card.cloneNode(true);
//                   cardClone.classList.remove("flipped");
//                   el.digit.replaceChild(cardClone, el.card);
//                   el.card = cardClone;
//                   el.cardFaces = el.card.querySelectorAll(".card-face");
//                   el.cardFaceA = el.cardFaces[0];
//                   el.cardFaceB = el.cardFaces[1];
  
//                   el.digit.dataset.digitAfter = next;
//                   el.cardFaceB.textContent = el.digit.dataset.digitAfter;
//                 },
//                 { once: true }
//               );
//               if (!el.card.classList.contains("flipped")) {
//                 el.card.classList.add("flipped");
//               }
//             }
//           }
//         }
//       }
  
//       setTimeout(runClock, 1000);
//     })();
//   })();


(function () {
  "use strict";

  const els = {
      h: initElements("h"),
      m: initElements("m"),
      s: initElements("s")
  };

  function initElements(type) {
      const els = [{}, {}];

      if (!["s", "m", "h"].includes(type)) return els;

      const target = document.querySelector(`.flip-clock-${type}`);

      if (!target) return els;

      let el;

      el = els[0];
      el.digit = target.querySelector(".digit-left");
      el.card = el.digit.querySelector(".card");
      el.cardFaces = el.card.querySelectorAll(".card-face");
      el.cardFaceA = el.cardFaces[0];
      el.cardFaceB = el.cardFaces[1];

      el = els[1];
      el.digit = target.querySelector(".digit-right");
      el.card = el.digit.querySelector(".card");
      el.cardFaces = el.card.querySelectorAll(".card-face");
      el.cardFaceA = el.cardFaces[0];
      el.cardFaceB = el.cardFaces[1];

      return els;
  }

  function startTimer(seconds) {
      const startTime = Date.now();
      const endTime = startTime + seconds * 1000;

      function updateTimer() {
          const now = Date.now();
          const timeLeft = Math.max(0, endTime - now);
          const hours = Math.floor(timeLeft / (1000 * 60 * 60) % 24);
          const minutes = Math.floor(timeLeft / (1000 * 60) % 60);
          const seconds = Math.floor(timeLeft / 1000 % 60);

          updateClock(hours, minutes, seconds);

          if (timeLeft > 0) {
              setTimeout(updateTimer, 1000);
          }
      }

      updateTimer();
  }

  function updateClock(h, m, s) {
      const time = {
          h0: Math.floor(h / 10),
          h1: h % 10,
          m0: Math.floor(m / 10),
          m1: m % 10,
          s0: Math.floor(s / 10),
          s1: s % 10
      };

      updateDigit(els.h[0], time.h0);
      updateDigit(els.h[1], time.h1);
      updateDigit(els.m[0], time.m0);
      updateDigit(els.m[1], time.m1);
      updateDigit(els.s[0], time.s0);
      updateDigit(els.s[1], time.s1);
  }

  function updateDigit(el, newDigit) {
      if (!el.digit || el.digit.dataset.digitBefore == newDigit) return;

      el.card.addEventListener(
          "transitionend",
          function () {
              el.digit.dataset.digitBefore = newDigit;
              el.cardFaceA.textContent = el.digit.dataset.digitBefore;

              const cardClone = el.card.cloneNode(true);
              cardClone.classList.remove("flipped");
              el.digit.replaceChild(cardClone, el.card);
              el.card = cardClone;
              el.cardFaces = el.card.querySelectorAll(".card-face");
              el.cardFaceA = el.cardFaces[0];
              el.cardFaceB = el.cardFaces[1];
          },
          { once: true }
      );
      if (!el.card.classList.contains("flipped")) {
          el.card.classList.add("flipped");
      }
  }

  // Example usage:
  startTimer(180); // Start a timer for 3 minutes (180 seconds)
})();

