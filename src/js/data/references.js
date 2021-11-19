// Сюда кидаем ссылки на елементы, которые будем обрабатывать через js, а также селекторы, которые мы будем использовать для поиска елементов, уже после их рендеринга на страницу

export default () => {
  return {
    logo: document.querySelector('.js-logo'),
    homeBtn: document.querySelector('.js-home-btn'),
    myLibraryBtn: document.querySelector('.js-mylibrary-btn'),
    form: document.querySelector('#search-form'),
    input: document.querySelector('[name="query"]'),
    watchedBtn: document.querySelector('.js-watched-btn'),
    queueBtn: document.querySelector('.js-queue-btn'),
    cardsContainer: document.querySelector('.js-cards__list'),
    loadMoreBtn: document.querySelector('.js-loadmore-btn'),
    loadMoreAnchor: document.querySelector('.js-loadmore-anchor'),
    cardModal: document.querySelector('.js-card-modal'),
    addToWatchedBtn: document.querySelector('button[data-action="add-to-watched"]'),
    addToQueueBtn: document.querySelector('button[data-action="add-to-queue"]'),
    devsLink: document.querySelector('.js-devs-link'),
    devsModal: document.querySelector('.js-devs-modal'),
    // selectors example
    // imageSelector: '.card__img',
  };
};
