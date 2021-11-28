import { showAlert, showError } from '../vendors/alerts';
import ALERTS from '../data/alertsMsgs';

export default class Application {
  #API_KEY = '6759d249684e99a49309af19f6af0ff2';
  #BASE_API_URL = 'https://api.themoviedb.org/3';
  #CATEGORIES = {
    topRated: '/trending/movie/week',
    genre: 'genre/movie/list',
    query: 'search/movie',
  };
  #PER_PAGES = 12;

  constructor({
    makeMoviesCards,
    makeMovieDetails,
    makeHeaderForm,
    makeLibraryBtns,
    refs,
    CSS,
    spriteUrl,
    brokenImgUrl,
    loadSpinner,
    windowSpinner,
    anchorSpinner,
    makeLibraryMessage,
  }) {
    this.makeMoviesCards = makeMoviesCards;
    this.makeMovieDetails = makeMovieDetails;
    this.makeHeaderForm = makeHeaderForm;
    this.makeLibraryBtns = makeLibraryBtns;
    this.page = 1;
    this.total_pages = 0;
    this.refs = refs;
    this.CSS = CSS;
    this.spriteUrl = { url: spriteUrl };
    this.id = null;
    this.lang = 'en-US';
    this._path = '/trending/movie/week';
    this._urlParams = '';
    this.genres = [];
    this._not_found_img = brokenImgUrl;
    this.notificationEl = null;
    this.timeoutId = null;
    this.loadMoreObserver = null;
    this.loadSpinner = loadSpinner;
    this.windowSpinner = windowSpinner;
    this.anchorSpinner = anchorSpinner;
    this.listMovietoWatched = [];
    this.listMovietoQueue = [];
    this.key = {
      watched: 'watched',
      queue: 'queue',
    };
    this.isMyLibrary = false;
    this.makeLibraryMessage = makeLibraryMessage;
  }
  // пример использование функции по работе с жанрами и годом в запросе топ фильмов
  // fetch(".......").then(res=>res.json()).then(films => {
  // const allGenres = this.getGenres();
  // const obj = this.dataCreate(films.results, allGenres)
  // функция рендера карточки(obj)
  // })

  // Методы лучше записывать как стрелочные функции, в таком случае не теряется контекст, если метод передается как коллбек-функция

  loadListeners = () => {
    window.addEventListener('load', this.onLoadPage);
    this.refs.navigation.addEventListener('click', this.onNavigationListClick);
    this.refs.form.addEventListener('submit', this.onSearchFormSubmit);
    this.getLoadMoreObserver();
    this.refs.footerDevsLink.addEventListener('click', this.modalOverflow);
    this.refs.cardsContainer.addEventListener('click', this.onCardsClick);
    this.refs.logo.addEventListener('click', this.onLogoClick);
  };

  init = () => {
    // Сюда добавляем все действия, которые должны произойти при загрузке стартовой страницы, например слушатели событий, отрисовка популярных фильмов.
    this.loadListeners();
    this.getGenres();
    this.getNotFoundPicture(this._not_found_img);
  };

  // Ниже можно добавлять методы, которые касаются работы с API

  // Пример стандартной фукнции (метода)

  // fecthTopRatedFilms = () => {
  //   const urlParams = new URLSearchParams({
  //     api_key: this.#API_KEY,
  //     language: 'en-US',
  //     page: this.page,
  //   });

  //   return fetch(`${this.#BASE_API_URL}/${this.#CATEGORIES.topRated}?${urlParams}`)
  //     .then(res => {
  //       if (res.ok) {
  //         // console.log('OK', res);
  //         return res.json();
  //       }
  //       // console.log('No OK', res, res.status, res.statusText);
  //       return Promise.reject({
  //         title: res.status,
  //         message: res.statusText,
  //       });
  //     })
  //     .catch(err => {
  //       console.log('No OK. error', err);
  //       return Promise.reject({
  //         title: err.message,
  //       });
  //     });
  // };

  getTopRatedPath = () => `${this.#CATEGORIES.topRated}?`;

  getQueryPath = searchQuery => {
    this.urlParams = new URLSearchParams({
      include_adult: false,
    });
    return `${this.#CATEGORIES.query}?${this.urlParams}&query=${searchQuery}&`;
  };

  fetchMovies = path => {
    const baseUrlParams = new URLSearchParams({
      api_key: this.#API_KEY,
      language: 'en-US',
      page: this.page,
    });

    return fetch(`${this.#BASE_API_URL}/${path}${baseUrlParams}`)
      .then(res => {
        if (res.ok) {
          // console.log('OK', res);
          return res.json();
        }
        // console.log('No OK', res, res.status, res.statusText);
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

  fetchGenres = () => {
    const urlParams = new URLSearchParams({
      api_key: this.#API_KEY,
      language: 'en-US',
    });

    return fetch(`${this.#BASE_API_URL}/${this.#CATEGORIES.genre}?${urlParams}`)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
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

  getGenres = () => {
    this.fetchGenres().then(({ genres }) => {
      this.genres = genres;
    });
  };

  resetPage = () => {
    this.page = 1;
  };

  incrementPage = () => {
    this.page += 1;
  };

  //Artem: fetch for details once films

  fetchMovieByID = async id => {
    const res = await fetch(
      `${this.#BASE_API_URL}/movie/${id}?api_key=${this.#API_KEY}&append_to_response=videos`,
    );
    if (res.ok) {
      return res.json();
    }

    return Promise.reject({
      title: res.status,
      message: res.statusText,
    });
  };
  catch(error) {
    console.log(error);
    return Promise.reject({
      title: error.message,
    });
  }

  /* ------------- НОРМАЛИЗАЦИЯ ДАННЫХ ---------- */
  pad(value) {
    return String(value).padEnd(3, '.0');
  }

  // Создание нового свойства с годом (для всех)
  createYear(obj) {
    const date = new Date(obj.release_date);
    return obj.release_date ? date.getFullYear() : '';
  }
  createImage = obj => {
    return obj.poster_path
      ? `https://image.tmdb.org/t/p/w500${obj.poster_path}`
      : this._not_found_img;
  };

  // Создание нового свойства с жанрами для трендов
  createGenresFromTOP(array, genres) {
    let newArr = array
      .map(id => genres.filter(element => element.id === id))
      .slice(0, 3)
      .flat();
    if (!newArr.length) {
      return [{ id: 7777777, name: 'Other' }];
    }
    if (newArr.length === 3) {
      newArr.splice(2, 1, { id: 7777777, name: 'Other' });
      return newArr;
    }
    return newArr;
  }

  // Создание нового свойства с жанрами для запроса по ID фильма
  createGenresFromID(obj) {
    return obj.genres.map(genre => genre.name).flat();
  }

  normalize = (film, metod) => ({
    ...film,
    year: this.createYear(film),
    genres: metod,
    img: this.createImage(film),
    vote_average: this.pad(film.vote_average),
    currentPage: this.page,
  });
  // Соединение информации о фильме для страницы home
  getNormalizeMovies(films, allGenres) {
    return films.map(film => {
      return this.normalize(film, this.createGenresFromTOP(film.genre_ids, allGenres));
    });
  }
  // Соединение информации для запроса по ID
  getNormalizeOneMovie(film) {
    return this.normalize(film, this.createGenresFromID(film));
  }

  normalizeIdsMovies = movies => {
    return movies.map(movie => {
      return {
        ...movie,
        currentPage: this.page,
      };
    });
  };

  /* ------------ НОРМАЛИЗАЦИЯ ДАННЫХ КОНЕЦ ------------ */

  // Ниже можно добавлять методы, которые касаются работы с DOM
  onLogoClick = evt => {
    evt.preventDefault();
    this.accentEl(this.refs.homeBtn);
    this.clearAccent(this.refs.myLibraryBtn);
    this.showHomepageBackground();
    this.renderHeaderMarkup(this.makeHeaderForm, this.spriteUrl).then(() => {
      const formRef = document.querySelector(this.refs.formSelector);
      this.notificationEl = document.querySelector(this.refs.notificationElSelector);

      formRef.addEventListener('submit', this.onSearchFormSubmit);
    });

    this.resetPage();
    this.unObserveLoadMoreAnchor();

    this.path = this.getTopRatedPath();
    this.getMovies(this.path);

    return;
  };
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
      }, this.CSS.DELAY);
    });
    return promise;
  };

  // Паша Ш. Функция построена на промисах и возвращает промис, делает ряд последовательных действий:
  /*
  очищает контейнер в хедере (this.CSS.DELAYms)
  потом создает разментку и добавляет в дом.
  показывает контейрер
  */

  clearCardsContainer = () => {
    this.refs.cardsContainer.classList.add(this.CSS.IS_HIDDEN);
    this.showCardsListLoader();
    const promise = new Promise(res => {
      setTimeout(() => {
        this.refs.cardsContainer.innerHTML = '';
        res(true);
      }, this.CSS.DELAY);
    });
    return promise;
  };

  showCardsContainer = () => {
    this.refs.cardsContainer.classList.remove(this.CSS.IS_HIDDEN);
  };

  renderHeaderMarkup = (markupTemplate, data = '') => {
    return this.clearHeaderContainer()
      .then(() => {
        const headerMarkUp = markupTemplate(data);
        this.refs.headerBottomContainer.innerHTML = headerMarkUp;
        this.showHeaderContainer();
      })
      .catch(console.log);
  };

  showCardsListLoader = () => {
    this.refs.loaderBackdrop.classList.remove(this.CSS.IS_HIDDEN);
    this.loadSpinner.spin(this.refs.loaderSpinner);
  };

  hideCardsListLoader = () => {
    this.refs.loaderBackdrop.classList.add(this.CSS.IS_HIDDEN);
    this.loadSpinner.stop();
  };

  showWindowLoader = () => {
    this.refs.windowLoaderBackdrop.classList.remove(this.CSS.IS_HIDDEN);
    this.windowSpinner.spin(this.refs.windowSpinner);
  };

  hideWindowLoader = () => {
    this.refs.windowLoaderBackdrop.classList.add(this.CSS.IS_HIDDEN);
    this.windowSpinner.stop();
  };

  showAnchorLoader = () => {
    this.refs.loadMoreAnchor.classList.remove(this.CSS.IS_HIDDEN);
    this.anchorSpinner.spin(this.refs.anchorSpinner);
  };

  hideAnchorLoader = () => {
    this.refs.loadMoreAnchor.classList.add(this.CSS.IS_HIDDEN);
    this.anchorSpinner.stop();
  };

  // Юра

  // renderMyLibrary = () => {
  //   this.clearCardsContainer();
  //     this.resetPage();
  //   this.unObserveLoadMoreAnchor();

  //   this.refs.cardsTitle.classList.add(this.CSS.IS_HIDDEN);
  //   this.renderMyLibraryMovies('Queue');
  // };

  // Юра

  getTotalPages = fullData => {
    this.total_pages = Math.ceil(fullData.length / this.#PER_PAGES);
  };

  getOnePageData = data => {
    const startIdx = (this.page - 1) * this.#PER_PAGES;
    const endIdx = this.page * this.#PER_PAGES;
    return data.slice(startIdx, endIdx);
  };

  renderMyLibraryMovies = key => {
    const localStorageInfo = this.loadInfoFromLocalStorage(key);

    this.getTotalPages(localStorageInfo);
    const libraryContainerMessage = document.querySelector('.my-library__container');
    if (!this.total_pages && !libraryContainerMessage) {
      this.refs.cardsContainer.insertAdjacentHTML('beforebegin', this.makeLibraryMessage());

      return;
    }

    const onePageMovies = this.getOnePageData(localStorageInfo);

    const normalizeMovies = this.normalizeIdsMovies(onePageMovies);

    const moviesCardsMarkup = this.makeMoviesCards(normalizeMovies);

    this.refs.cardsContainer.insertAdjacentHTML('beforeend', moviesCardsMarkup);
  };

  // Юра

  /* ---------------- LS -------------------- */

  loadInfoFromLocalStorage = key => {
    try {
      const localeStorageMoviesData = JSON.parse(localStorage.getItem(key));
      if (!localeStorageMoviesData) {
        return [];
      }
      return localeStorageMoviesData;
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  loadBtnDataKeyToLocalStorage = BtnDataKey => {
    localStorage.setItem('button', BtnDataKey);
  };

  getActiveLibraryBtn = () => {
    const currentKey = localStorage.getItem('button');
    if (!currentKey) {
      const defaultBtn = document.querySelector(this.refs.queueBtnSelector);
      this.accentEl(defaultBtn);
      return defaultBtn;
    }
    const currentKeyBtn = document.querySelector(`[data-key="${currentKey}"]`);
    this.accentEl(currentKeyBtn);
    return currentKeyBtn;
  };

  /* ---------------- LS END -------------------- */

  // Паша Ш. Функция для поиска елемента, по желанию можно юзать, когда это надо.

  getElement = selector => {
    return document.querySelector(selector);
  };

  getNotFoundPicture = broken_img_url => {
    const img = new Image();
    img.src = broken_img_url;
    img.dataset.src = broken_img_url;
    img.alt = 'Not found image';
    img.classList.add(this.CSS.IMG, this.CSS.NOT_FOUND);
    return img;
  };

  showImages = page => {
    const images = document.querySelectorAll(`[data-page="${page}"]`);

    // console.log(images);

    images.forEach(image => {
      const liRef = image.closest('li');

      this.showImage(image, liRef);

      image.onerror = () => {
        const notFoundImage = this.getNotFoundPicture(this._not_found_img);
        image.replaceWith(notFoundImage);
        setTimeout(() => {
          liRef.classList.remove(this.CSS.ACTIVE);
        }, 3000);
      };
    });
  };

  onloadImage = () => {};

  showImage = (image, liRef) => {
    image.addEventListener(
      'load',
      () => {
        image.classList.remove(this.CSS.IS_HIDDEN);
        liRef.classList.remove(this.CSS.ACTIVE);
      },
      { once: true },
    );
  };

  renderMovies = data => {
    const results = data.results;
    if (!results.length) {
      this.showNotification(this.notificationEl, ALERTS.NOT_FOUND);
      return;
    }
    const normalizedResults = this.getNormalizeMovies(results, this.genres);

    this.total_pages = data.total_pages;

    const moviesCardsMarkup = this.makeMoviesCards(normalizedResults);

    this.refs.cardsContainer.insertAdjacentHTML('beforeend', moviesCardsMarkup);
  };

  getMovies = path => {
    Promise.all([this.fetchMovies(path), this.clearCardsContainer()])
      .then(res => {
        const data = res[0];
        this.renderMovies(data);
        this.showCardsContainer();
        this.hideCardsListLoader();
        this.showImages(this.page);
        this.observeLoadMoreAnchor();

        this.incrementPage();
      })
      .catch(showError);
  };

  getMoreMovies = path => {
    this.showAnchorLoader();
    this.fetchMovies(path)
      .then(data => {
        this.renderMovies(data);
        this.showImages(this.page);
        this.hideAnchorLoader();
        this.incrementPage();
      })
      .catch(showError);
  };

  getMoreLibraryMovies = key => {
    this.showAnchorLoader();
    this.renderMyLibraryMovies(key);
    this.showImages(this.page);
    this.hideAnchorLoader();
    this.incrementPage();
  };

  // Ниже можно добавлять методы, которые касаются обработки событий

  onLoadPage = () => {
    this.resetPage();

    this.notificationEl = this.refs.notificationEl;
    this.path = this.getTopRatedPath();

    this.getMovies(this.path);
  };

  /* ----------- OBSERVER INFINITY SCROLL ------------ */

  getLoadMoreObserver = () => {
    const options = {
      rootMargin: '50px',
      threshold: 0.5,
    };

    this.loadMoreObserver = new IntersectionObserver(this.onMoviesEnd, options);

    this.loadMoreObserver.observe(this.refs.loadMoreAnchor);
  };

  observeLoadMoreAnchor = () => {
    this.loadMoreObserver.observe(this.refs.loadMoreAnchor);
  };

  unObserveLoadMoreAnchor = () => {
    this.loadMoreObserver.disconnect();
  };

  onMoviesEnd = ([entry], observer) => {
    if (!entry.isIntersecting) {
      return;
    }

    if (this.page === this.total_pages + 1) {
      observer.disconnect();
      return;
    }
    observer.observe(this.refs.loadMoreAnchor);

    if (this.isMyLibrary) {
      this.getMoreLibraryMovies(this.currentLibraryKey);
      return;
    }
    this.getMoreMovies(this.path);
  };

  /* ----------- END OBSERVER INFINITY SCROLL ------------ */

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
      this.isMyLibrary = false;
      this.getElement(this.refs.libraryBtnsSelector).removeEventListener(
        'click',
        this.onLibraryBtnsClick,
      );

      this.accentEl(e.target);
      this.clearAccent(this.refs.myLibraryBtn);
      this.showHomepageBackground();
      this.renderHeaderMarkup(this.makeHeaderForm, this.spriteUrl).then(() => {
        const formRef = document.querySelector(this.refs.formSelector);
        this.notificationEl = document.querySelector(this.refs.notificationElSelector);

        formRef.addEventListener('submit', this.onSearchFormSubmit);
      });

      this.resetPage();
      this.unObserveLoadMoreAnchor();

      this.path = this.getTopRatedPath();
      this.getMovies(this.path);

      const libraryContainerMessage = document.querySelector('.my-library__container');
      if (libraryContainerMessage) {
        libraryContainerMessage.remove();
      }

      return;
    }

    if (e.target === this.refs.myLibraryBtn) {
      this.isMyLibrary = true;
      this.accentEl(e.target);
      this.clearAccent(this.refs.homeBtn);
      this.showLibraryBackground();

      this.resetPage();
      this.unObserveLoadMoreAnchor();

      Promise.all([this.renderHeaderMarkup(this.makeLibraryBtns), this.clearCardsContainer()]).then(
        () => {
          const libraryBtns = document.querySelector(this.refs.libraryBtnsSelector);

          const activeLibraryBtn = this.getActiveLibraryBtn();
          this.currentLibraryKey = activeLibraryBtn.dataset.key;
          this.renderMyLibraryMovies(this.currentLibraryKey);

          this.showCardsContainer();
          this.hideCardsListLoader();
          this.showImages(this.page);
          this.observeLoadMoreAnchor();
          this.incrementPage();

          libraryBtns.addEventListener('click', this.onLibraryBtnsClick);
        },
      );

      this.refs.form.removeEventListener('submit', this.onSearchFormSubmit);
      return;
    }
  };

  onSearchFormSubmit = e => {
    e.preventDefault();
    const form = e.currentTarget;
    const query = form.elements.query.value;
    const normalizedQuery = query.toLowerCase().trim().split(' ').join('+');

    if (!normalizedQuery) {
      this.showNotification(this.notificationEl, ALERTS.EMPTY);
      return;
    }

    this.resetPage();
    this.unObserveLoadMoreAnchor();

    this.path = this.getQueryPath(normalizedQuery);

    this.fetchMovies(this.path).then(data => {
      if (!data.results.length) {
        this.showNotification(this.notificationEl, ALERTS.NOT_FOUND);
        return;
      }
      this.getMovies(this.path);
    });
  };

  showNotification = (el, message) => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    el.classList.remove(this.CSS.IS_HIDDEN);
    el.textContent = message;
    this.timeoutId = setTimeout(() => {
      el.classList.add(this.CSS.IS_HIDDEN);
      setTimeout(() => {
        el.textContent = '';
      }, 500);
    }, 2500);
  };

  // Юра

  toggleAccentBtn = (target, queueBtn, watchedBtn) => {
    if (target === queueBtn) {
      this.accentEl(target);
      this.clearAccent(watchedBtn);
    } else {
      this.accentEl(target);
      this.clearAccent(queueBtn);
    }
  };

  onLibraryBtnsClick = e => {
    const queueBtn = document.querySelector(this.refs.queueBtnSelector);
    const watchedBtn = document.querySelector(this.refs.watchedBtnSelector);
    const libraryContainerMessage = document.querySelector('.my-library__container');
    if (libraryContainerMessage) {
      libraryContainerMessage.remove();
    }

    if (
      (e.target !== queueBtn && e.target !== watchedBtn) ||
      e.target.classList.contains(this.CSS.ACCENT)
    ) {
      return;
    }

    this.currentLibraryKey = e.target.dataset.key;
    this.loadBtnDataKeyToLocalStorage(this.currentLibraryKey);

    this.toggleAccentBtn(e.target, queueBtn, watchedBtn);

    this.resetPage();
    this.unObserveLoadMoreAnchor();

    this.clearCardsContainer().then(() => {
      this.renderMyLibraryMovies(e.target.dataset.key);

      this.showCardsContainer();
      this.hideCardsListLoader();
      this.showImages(this.page);
      this.observeLoadMoreAnchor();
      this.incrementPage();
    });
  };

  // Artem: function for listener function

  renderMovieDetails = data => {
    const preNormalize = this.getNormalizeOneMovie(data);
    const normalizeData = { ...preNormalize, ...this.spriteUrl };

    const movieMarkup = this.makeMovieDetails(normalizeData);
    this.refs.cardModalContent.innerHTML = movieMarkup;
    this.refs.cardModal.classList.remove(this.CSS.IS_HIDDEN);
  };

  onCardsClick = e => {
    e.preventDefault();

    if (e.target.closest('ul') !== e.currentTarget || e.target === e.currentTarget) {
      return;
    }

    const currentId = e.target.closest('li').dataset.id;

    this.fetchMovieByID(currentId)
      .then(data => {
        this.renderMovieDetails(data);

        this.refs.cardModal.addEventListener('click', this.onModalClick);
        window.addEventListener('keydown', this.onEscapeClick);
        document.body.classList.add(this.CSS.LOCK);

        // vadim
        this.addEventListenerOnBtnWatchedQueue();
      })
      .catch(error => {
        console.log(error);
      });
  };

  closeModal = () => {
    window.removeEventListener('keydown', this.onEscapeClick);
    this.refs.cardModal.classList.add('is-hidden');
    document.body.classList.remove(this.CSS.LOCK);
  };

  onEscapeClick = event => {
    if (event.code === 'Escape') {
      this.closeModal();
    }
  };

  onModalClick = e => {
    if (
      !(
        e.target.classList.contains('card-modal__overlay') ||
        e.target.closest('button[data-action="close-card-modal"]')
      )
    ) {
      return;
    }

    this.closeModal();
  };

  // Artem: methods open-close modal close

  openShowModal = e => {
    window.addEventListener('keydown', this.closeByEsc);
    this.refs.cardModal.classList.remove('is-hidden');
  };

  modalOverflow = () => {
    this.refs.jsDevsModal.classList.add('js-open-modal');
  };

  closeModalWindow = () => {
    this.refs.jsDevsModal.classList.remove('js-open-modal');
  };

  // ====================== Vadym =================================

  addEventListenerOnBtnWatchedQueue = () => {
    const refs = {
      cartModalBtnList: document.querySelector('.movie-card__btn-list'),
      addMovieToWatchedBtn: document.querySelector('[data-action="add-to-watched"]'),
      addMovieToQueueBtn: document.querySelector('[data-action="add-to-queue"]'),
    };

    const movieId = refs.cartModalBtnList.dataset.id;
    const includeIdOnLibraryToWatched = this.includesMovieOnLibrary(movieId, this.key.watched);

    const includeIdOnLibraryToQueue = this.includesMovieOnLibrary(movieId, this.key.queue);
    if (includeIdOnLibraryToWatched) {
      refs.addMovieToWatchedBtn.textContent = 'ADDED TO WATCHED';
      refs.addMovieToWatchedBtn.style.backgroundColor = '#ff6b08';
    }
    if (includeIdOnLibraryToQueue) {
      refs.addMovieToQueueBtn.textContent = 'ADDED TO QUEUE';
      refs.addMovieToQueueBtn.style.backgroundColor = '#ff6b08';
    }

    refs.cartModalBtnList.addEventListener('click', this.sortMovieListByUser);
  };

  sortMovieListByUser = e => {
    const movieID = e.currentTarget.dataset.id;

    const eventTargetDataset = e.target.dataset.action;
    const btnKey = this.keyGeneration(eventTargetDataset);

    if (eventTargetDataset === 'add-to-watched') {
      this.addMovieToWatched(movieID, btnKey);
    }

    if (eventTargetDataset === 'add-to-queue') {
      this.addMovieToQueue(movieID, btnKey);
    }
  };

  addMovieToWatched = (movieId, btnKey) => {
    const includeIdOnLibraryToWatched = this.includesMovieOnLibrary(movieId, btnKey);

    if (includeIdOnLibraryToWatched) {
      showAlert('Warning 🤔', 'This movie is already in your library!');
      return;
    }

    this.fetchMovieByID(movieId).then(data => {
      const normalizedResults = this.normalizedDataToLocaleStorage(data);
      showAlert(
        'Congratulations 😄',
        'This movie has been successfully added to your library under "Watched".',
      );
      this.listMovietoWatched.push(normalizedResults);
      localStorage.setItem(btnKey, JSON.stringify(this.listMovietoWatched));
    });
  };

  addMovieToQueue = (movieId, btnKey) => {
    const includeIdOnLibraryToQueue = this.includesMovieOnLibrary(movieId, btnKey);

    if (includeIdOnLibraryToQueue) {
      showAlert('Warning 🤔', 'This movie is already in your library!');
      return;
    }

    this.fetchMovieByID(movieId).then(data => {
      const normalizedResults = this.normalizedDataToLocaleStorage(data);
      showAlert(
        'Congratulations 😄',
        'This movie has been successfully added to your library under "Queue".',
      );
      this.listMovietoQueue.push(normalizedResults);
      localStorage.setItem(this.key.queue, JSON.stringify(this.listMovietoQueue));
    });
  };
  includesMovieOnLibrary = (id, key) => {
    const dataJSON = this.loadInfoFromLocalStorage(key);
    let dataJSONMap = [];

    if (dataJSON !== null) {
      dataJSONMap = dataJSON.map(result => result.id);
    }
    return dataJSONMap.includes(Number(id));
  };
  keyGeneration = key => {
    if (key === 'add-to-watched') {
      key = this.key.watched;
    }
    if (key === 'add-to-queue') {
      key = this.key.queue;
    }
    return key;
  };
  //========== Нормализация перед localeStorage ==========

  normalizedDataToLocaleStorage = obj => {
    obj.img = this.createImage(obj);
    obj.year = this.createYear(obj);
    if (obj.genres.length > 2) {
      const newGenres = obj.genres.slice(0, 3);
      obj.genres = newGenres;
      obj.genres.splice(2, 1, { id: 7777777, name: 'Other' });
    }
    return obj;
  };

  // =========== Конец нормализации localeStorage ================
  // ====================== Vadym ==============================
}
