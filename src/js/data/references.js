// Сюда кидаем ссылки на елементы, которые будем обрабатывать через js, а также селекторы, которые мы будем использовать для поиска елементов, уже после их рендеринга на страницу

export default () => {
  return {
    logo: document.querySelector('.js-logo'),
    navigation: document.querySelector('.js-navigation'),
    homeBtn: document.querySelector('.js-home-btn'),
    myLibraryBtn: document.querySelector('.js-mylibrary-btn'),
    header: document.querySelector('.js-header'),
    headerBottomContainer: document.querySelector('.js-header__bottom'),
    form: document.querySelector('#search-form'),
    input: document.querySelector('[name="query"]'),
    cardsContainer: document.querySelector('.js-cards__list'),
    loadMoreBtn: document.querySelector('.js-loadmore-btn'),
    loadMoreAnchor: document.querySelector('.js-loadmore-anchor'),
    cardModal: document.querySelector('.js-card-modal'),
    addToWatchedBtn: document.querySelector('button[data-action="add-to-watched"]'),
    addToQueueBtn: document.querySelector('button[data-action="add-to-queue"]'),
    devsLink: document.querySelector('.js-devs-link'),
    devsModal: document.querySelector('.js-devs-modal'),
    cardsTitle: document.querySelector('.cards__title'),
    cardModalContent: document.querySelector('.js-card-modal-content'),
    // selectors example
    watchedBtnSelector: '.js-watched-btn',
    queueBtnSelector: '.js-queue-btn',
    formSelector: '#search-form',
    libraryBtnsSelector: '.js-library-btns',
  };
};
