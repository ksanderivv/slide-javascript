import debounce from "./debounce.js";

export default class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.movement = { currentX: 0, clickX: 0, finalX: 0 };
    this.activeClass = "active";
  }

  // transição suave do slide
  transition(active) {
    this.slide.style.transition = active ? "transform .3s" : "";
  }

  moveSlide(finalX) {
    this.slide.style.transform = `translate3d(${finalX}px, 0, 0)`;
    this.movement.finalX = finalX;
  }

  // retorna a posição para onde o slide deve ser movido conforme o mouse é arrastado
  updatePosition(clientX) {
    this.movement.displacement = clientX - this.movement.clickX;
    // s = ds + s0
    const finalX = this.movement.displacement * 1.6 + this.movement.currentX; // * 1.6: apenas p/ acelerar o movimento
    this.movement.finalX = finalX;
    return finalX;
  }

  // ações disparadas quando o click inicia
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
    this.transition(false); // remove transição suave, deve estar desabilitada durante o onMove
  }

  // ações disparadas quando o mouse é arrastado
  // durante o onMove, a transição deve estar desabilitada
  onMove(event) {
    const pointerX =
      event.type === "mousemove"
        ? event.clientX
        : event.changedTouches[0].clientX;
    const finalX = this.updatePosition(pointerX);
    this.moveSlide(finalX);
  }

  // ações disparadas quando o click termina
  onEnd(event) {
    let moveEventType = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.wrapper.removeEventListener(moveEventType, this.onMove);
    this.movement.currentX = this.movement.finalX;
    this.transition(true); // ativa transição suave
    this.changeSlideOnEnd();
  }

  // muda slide quando usuário arrasta imagem por mais de 120px
  changeSlideOnEnd() {
    if (
      this.movement.displacement > 120 &&
      this.activeSlideInfo.next !== undefined
    ) {
      this.activeNextSlide();
    } else if (
      this.movement.displacement < -120 &&
      this.activeSlideInfo.prev !== undefined
    ) {
      this.activePrevSlide();
    } else {
      //centraliza a imagem atual caso o |arrasto| < 120 ou prev/next === undefined
      this.changeSlide(this.activeSlideInfo.active);
    }
  }

  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchend", this.onEnd);
  }

  slideImagePosition(element) {
    const positionToCenter =
      (window.innerWidth - element.offsetWidth) * 0.5 - element.offsetLeft;
    return positionToCenter;
    //Versão Origamid
    // const margin = (this.wrapper.offsetWidth - li.offsetWidth) * 0.5;
    // return margin - li.offsetLeft;
  }

  // configura o slideArray: itens/posicionamento p/ centralizar
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

  // move o slide para a imagem do index passado no slideArray
  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.positionToCenter);
    this.setActiveSlideInfo(index);
    this.movement.currentX = activeSlide.positionToCenter;
    this.setActiveClass();
  }

  // coloca class active no li ativo no momento
  setActiveClass() {
    this.slideArray.forEach((slideItem) =>
      slideItem.element.classList.remove(this.activeClass)
    );
    this.slideArray[this.activeSlideInfo.active].element.classList.add(
      this.activeClass
    );
  }

  // move para o slide anterior, caso ele exista
  activePrevSlide() {
    if (this.activeSlideInfo.prev !== undefined)
      this.changeSlide(this.activeSlideInfo.prev);
  }
  activeNextSlide() {
    if (this.activeSlideInfo.next !== undefined)
      this.changeSlide(this.activeSlideInfo.next);
  }

  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.activeSlideInfo.active);
    }, 1000); // o setTimeout é para esperar o usuário terminar de dar o resize p/ só então reconfigurar o slide
    console.log("resize!");
  }

  // reconfigura o slide caso a tela seja redimensionada
  addResizeEvent() {
    window.addEventListener("resize", this.onResize);
  }

  // configura o this dentro de certo métodos
  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);

    // espera 200ms p/ decidir se o usuário terminou o resize
    // se o resize for redisparado antes de 200ms, onResize não será chamada
    this.onResize = debounce(this.onResize.bind(this), 200);
  }

  init() {
    this.bindEvents();
    this.addSlideEvents();
    this.slidesConfig();
    this.addResizeEvent();
    return this;
  }
}
