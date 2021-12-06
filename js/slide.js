export default class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.movement = { currentX: 0, clickX: 0, finalX: 0 };
  }

  moveSlide(finalX) {
    this.slide.style.transform = `translate3d(${finalX}px, 0, 0)`;
    this.movement.finalX = finalX;
  }

  updatePosition(clientX) {
    const finalX =
      (clientX - this.movement.clickX) * 1.6 + this.movement.currentX; // * 1.6: apenas p/ acelerar o movimento
    this.movement.finalX = finalX;
    return finalX;
  }

  onStart(event) {
    let moveEventType;

    if (event.type === "mousedown") {
      event.preventDefault();
      this.movement.clickX = event.clientX; // posição do click inicial
      moveEventType = "mousemove";
    } else {
      this.movement.clickX = event.changedTouches[0].clientX;
      moveEventType = "touchmove";
    }

    this.wrapper.addEventListener(moveEventType, this.onMove);
  }

  onMove(event) {
    const pointerX =
      event.type === "mousemove"
        ? event.clientX
        : event.changedTouches[0].clientX;
    const finalX = this.updatePosition(pointerX);
    this.moveSlide(finalX);
  }

  onEnd(event) {
    let moveEventType = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.wrapper.removeEventListener(moveEventType, this.onMove);
    this.movement.currentX = this.movement.finalX;
  }

  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchend", this.onEnd);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
  }

  slideImagePosition(element) {
    const positionToCenter =
      (window.innerWidth - element.offsetWidth) * 0.5 - element.offsetLeft;
    return positionToCenter;
    //Versão Origamid
    // const margin = (this.wrapper.offsetWidth - li.offsetWidth) * 0.5;
    // return margin - li.offsetLeft;
  }

  // slides config
  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const positionToCenter = this.slideImagePosition(element);
      return {
        element,
        positionToCenter,
      };
    });
  }

  setActiveSlideInfo(index) {
    const last = this.slideArray.length - 1;
    this.activeSlideInfo = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1,
    };
  }

  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.positionToCenter);
    this.setActiveSlideInfo(index);
    this.movement.currentX = activeSlide.positionToCenter;
  }

  init() {
    this.bindEvents();
    this.addSlideEvents();
    this.slidesConfig();

    return this;
  }
}
