import { showAlert, showError } from '../vendors/alerts';
import ALERTS from '../data/alertsMsgs';

export default class Application {
  #API_KEY = '6759d249684e99a49309af19f6af0ff2';
  #BASE_API_URL = 'https://api.themoviedb.org/3';
  #CATEGORIES = {
    topRated: 'movie/top_rated',
  };

  constructor({
    makeMoviesCards,
    makeMovieDetails,
    makeHeaderForm,
    makeLibraryBtns,
    refs,
    CSS,
    spriteUrl,
  }) {
    this.makeMoviesCards = makeMoviesCards;
    this.makeMovieDetails = makeMovieDetails;
    this.makeHeaderForm = makeHeaderForm;
    this.makeLibraryBtns = makeLibraryBtns;
    this.page = 1;
    this.refs = refs;
    this.CSS = CSS;
    this.spriteUrl = { url: spriteUrl };
  }

  // Методы лучше записывать как стрелочные функции, в таком случае не теряется контекст, если метод передается как коллбек-функция

  loadListeners = () => {
    this.refs.navigation.addEventListener('click', this.onNavigationListClick);
    this.refs.form.addEventListener('submit', this.onSearchFormSubmit);
    this.refs.myLibraryBtn.addEventListener('click', this.renderMyLibrary);
    // Сюда добавляем слушатели событий, которые должны подключиться при первой загрузке страницы (например клики на кнопки HOME и My Library)
  };

  init = () => {
    // Сюда добавляем все действия, которые должны произойти при загрузке стартовой страницы, например слушатели событий, отрисовка популярных фильмов.
    this.loadListeners();
  };

  // Ниже можно добавлять методы, которые касаются работы с API

  // Пример ассинхронной функции

  // fecthTopRatedFilms = async () => {
  //   try {
  //     const urlParams = new URLSearchParams({
  //       api_key: this.#API_KEY,
  //       language: 'en-US',
  //       page: this.page,
  //     });

  //     const res = await fetch(`${this.#BASE_API_URL}/${this.#CATEGORIES.topRated}?${urlParams}`); // await
  //     if (res.ok) {
  //       console.log('OK');
  //       return res.json();
  //     }
  //     console.log('No OK');
  //     return Promise.reject({
  //       title: res.status,
  //       message: res.statusText,
  //     });
  //   } catch (error) {
  //     console.log('No OK. error');
  //     return Promise.reject({
  //       title: error.message,
  //     });
  //   }
  // };

  // Пример стандартной фукнции (метода)

  fecthTopRatedFilms = () => {
    const urlParams = new URLSearchParams({
      api_key: this.#API_KEY,
      language: 'en-US',
      page: this.page,
    });

    fetch(`${this.#BASE_API_URL}/${this.#CATEGORIES.topRated}?${urlParams}`)
      .then(res => {
        if (res.ok) {
          console.log('OK', res);
          return res.json();
        }
        console.log('No OK', res, res.status, res.statusText);
        return Promise.reject({
          title: res.status,
          message: res.statusText,
        });
      })
      .catch(err => {
        console.log('No OK. error', err);
        return Promise.reject({
          title: err.message,
        });
      });
  };

  // Ниже можно добавлять методы, которые касаются работы с DOM

  // нужно для отображения подходящего бекграунта

  showHomepageBackground = () => {
    this.refs.header.classList.add('home');
    this.refs.header.classList.remove('library');
  };

  // нужно для отображения подходящего бекграунта

  showLibraryBackground = () => {
    this.refs.header.classList.add('library');
    this.refs.header.classList.remove('home');
  };

  // добавляет класс accent c елемента

  accentEl = el => {
    el.classList.add(this.CSS.ACCENT);
  };

  // elfkztn класс accent с елемента

  clearAccent = el => {
    el.classList.remove(this.CSS.ACCENT);
  };

  hideHeaderContainer = () => {
    this.refs.headerBottomContainer.classList.add(this.CSS.IS_HIDDEN);
  };

  showHeaderContainer = () => {
    this.refs.headerBottomContainer.classList.remove(this.CSS.IS_HIDDEN);
  };

  // Паша Ш. Функция построена на промисе, прячет контейнер в хереде.
  // Через 250мс (после того, как отработает анимация), очищает
  // контейнер, промис резолвится для дальнейших зенов.

  clearHeaderContainer = () => {
    this.hideHeaderContainer();
    const promise = new Promise(res => {
      setTimeout(() => {
        this.refs.headerBottomContainer.innerHTML = '';
        res(true);
      }, 250);
    });
    return promise;
  };

  // Паша Ш. Функция построена на промисах и возвращает промис, делает ряд последовательных действий:
  /*
  очищает контейнер в хедере (250ms)
  потом создает разментку и добавляет в дом.
  показывает контейрер
  */

  renderHeaderMarkup = (markupTemplate, data = '') => {
    return this.clearHeaderContainer()
      .then(() => {
        const headerMarkUp = markupTemplate(data);
        this.refs.headerBottomContainer.innerHTML = headerMarkUp;
        this.showHeaderContainer();
      })
      .catch(console.log);
  };

  renderMyLibrary = () => {
    this.refs.cardsContainer.innerHTML = '';
    this.refs.cardsTitle.classList.add(this.CSS.VIS_HIDDEN);
    this.renderMyLibraryMovies('Queue');
  };

  renderMyLibraryMovies = key => {
    this.refs.cardsContainer.innerHTML = '';
    const localStorageInfo = this.loadInfoFromLocalStorage(key);

    if (localStorageInfo == null || localStorageInfo.length == 0) {
      this.refs.cardsContainer.insertAdjacentHTML(
        'beforeend',
        `<p class="my-library__description">В даному розділі фільми відсутні!</p>`,
      );
      return;
    } else {
      this.refs.cardsContainer.insertAdjacentHTML(
        'beforeend',
        this.makeMoviesCards(localStorageInfo),
      );
    }
  };

  loadInfoFromLocalStorage = key => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  // Паша Ш. Функция для поиска елемента, по желанию можно юзать, когда это надо.

  getElement = selector => {
    return document.querySelector(selector);
  };

  // Ниже можно добавлять методы, которые касаются обработки событий

  // Паша Шеремет. Обработчик нажатия на кнопки HOME и Library
  /*
  Функция перерендеривает контейнер, которые в разментке называется
  headet__bottom, в зависимости от нажатия на кнопку либо загружается
  форма для поиска фильма, либо кнопки моей библиотеке.

  После загрузки контента, именно тут подключаются/удаляются слушатели события на форму и на кнопки WATCHED и QUEUE
  */

  onNavigationListClick = e => {
    if (e.target.tagName !== 'BUTTON' || e.target.classList.contains(this.CSS.ACCENT)) {
      return;
    }
    if (e.target === this.refs.homeBtn) {
      this.getElement(this.refs.libraryBtnsSelector).removeEventListener(
        'click',
        this.onLibraryBtnsClick,
      );

      this.accentEl(e.target);
      this.clearAccent(this.refs.myLibraryBtn);
      this.showHomepageBackground();
      this.renderHeaderMarkup(this.makeHeaderForm, this.spriteUrl).then(() => {
        const formRef = document.querySelector(this.refs.formSelector);

        formRef.addEventListener('submit', this.onSearchFormSubmit);
      });

      return;
    }

    if (e.target === this.refs.myLibraryBtn) {
      this.accentEl(e.target);
      this.clearAccent(this.refs.homeBtn);
      this.showLibraryBackground();
      this.renderHeaderMarkup(this.makeLibraryBtns).then(() => {
        const libraryBtns = document.querySelector(this.refs.libraryBtnsSelector);

        libraryBtns.addEventListener('click', this.onLibraryBtnsClick);
      });

      this.refs.form.removeEventListener('submit', this.onSearchFormSubmit);
      return;
    }
  };

  onSearchFormSubmit = e => {
    e.preventDefault();
    console.log(e.target);
  };

  onLibraryBtnsClick = e => {
    if (e.target.classList.contains('js-queue-btn')) {
      this.accentEl(e.target);
      this.clearAccent(document.querySelector('.js-watched-btn'));
      // this.clearAccent(this.refs.watchedBtnSelector);
      this.renderMyLibraryMovies('Queue');
    }
    if (e.target.classList.contains('js-watched-btn')) {
      this.accentEl(e.target);
      // this.clearAccent(this.refs.queueBtnSelector);
      this.clearAccent(document.querySelector('.js-queue-btn'));
      this.renderMyLibraryMovies('Watched');
    }
  };
}
