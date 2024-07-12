
  export const initElements = (type) => {
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

  export const initializeClock = (h, m, s) => {
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

  export const updateDigit = (el, newDigit) => {
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

  export const updateClock = (h, m, s) => {
    const time = {
      h: [Math.floor(h / 10), h % 10],
      m: [Math.floor(m / 10), m % 10],
      s: [Math.floor(s / 10), s % 10]
    };

    Object.entries(time).forEach(([unit, digits]) => {
      digits.forEach((digit, index) => updateDigit(els[unit][index], digit));
    });
  };

  


 