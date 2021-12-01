import { showAlert, showError } from '../vendors/alerts';
import ALERTS from '../data/alertsMsgs';

export default class Application {
  #API_KEY = '6759d249684e99a49309af19f6af0ff2';
  #BASE_API_URL = 'https://api.themoviedb.org/3';
  #CATEGORIES = {
    weekTrending: '/trending/movie/week',
    genre: 'genre/movie/list',
    query: 'search/movie',
  };
  #PER_PAGES = 12;
  #LIBRARY_BTN_KEY = 'button';

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
    this.makeLibraryMessage = makeLibraryMessage;
    this.page = 1;
    this.total_pages = 0;
    this.refs = refs;
    this.CSS = CSS;
    this.spriteUrl = { sprite: spriteUrl };
    // this.id = null;
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
    this.isMyLibrary = false;
  }

  loadListeners = () => {
    window.addEventListener('load', this.onLoadPage);
    this.refs.navigation.addEventListener('click', this.onNavigationListClick);
    this.refs.form.addEventListener('submit', this.onSearchFormSubmit);
    this.refs.devsLink.addEventListener('click', this.onDevsModalClick);
    this.refs.cardsContainer.addEventListener('click', this.onCardsClick);
    this.refs.logo.addEventListener('click', this.onLogoClick);
    this.refs.topScroll.addEventListener('click', this.onTopClick);
    this.getLoadMoreObserver();
  };

  init = () => {
    this.loadListeners();
    this.getGenres();
    this.getNotFoundPicture(this._not_found_img);
  };

  /* ------------ API МЕТОДЫ ------------ */

  getWeekTrendingPath = () => `${this.#CATEGORIES.weekTrending}?`;

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
          return res.json();
        }
        return Promise.reject({
          title: res.status,
          message: res.statusText,
        });
      })
      .catch(err => {
        console.log(err);
        return Promise.reject({
          title: err.message,
        });
      });
  };

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
        console.log(err);
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

  /* ------------ API МЕТОДЫ КОНЕЦ ------------ */

  /* ------------ МЕТОДЫ ВЗАИМОДЕЙСТВИЯ С DOM ------------ */

  // Поиск елемента

  getElement = selector => {
    return document.querySelector(selector);
  };

  // Добавляет-очищает класс на нужный елемент

  accentEl = el => {
    el.classList.add(this.CSS.ACCENT);
  };

  clearAccent = el => {
    el.classList.remove(this.CSS.ACCENT);
  };

  // Тоглит акцент на кнопки

  toggleAccentBtn = (target, queueBtn, watchedBtn) => {
    if (target === queueBtn) {
      this.accentEl(target);
      this.clearAccent(watchedBtn);
    } else {
      this.accentEl(target);
      this.clearAccent(queueBtn);
    }
  };

  // HEADER -----------------------

  // Показывает бекграунд домашней страницы

  showHomepageBackground = () => {
    this.refs.header.classList.add('home');
    this.refs.header.classList.remove('library');
  };

  // Показывает бекграунд моей библиотеки

  showLibraryBackground = () => {
    this.refs.header.classList.add('library');
    this.refs.header.classList.remove('home');
  };

  // Прячет-показывает динамическое содержимое хедера

  hideHeaderContainer = () => {
    this.refs.headerBottomContainer.classList.add(this.CSS.IS_HIDDEN);
  };

  showHeaderContainer = () => {
    this.refs.headerBottomContainer.classList.remove(this.CSS.IS_HIDDEN);
  };

  // Очистка контейнера с динамической информацией в хедере

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

  // Рендерит динамическую часть хедера

  renderHeaderMarkup = (markupTemplate, data = '') => {
    return this.clearHeaderContainer()
      .then(() => {
        const headerMarkUp = markupTemplate(data);
        this.refs.headerBottomContainer.innerHTML = headerMarkUp;
        this.showHeaderContainer();
      })
      .catch(console.log);
  };

  // Делает активной кнопку из моей библиотеки, в зависимости от того, какую страницу библиотеки он посещал последний раз.

  getActiveLibraryBtn = btnsList => {
    const currentKey = localStorage.getItem(this.#LIBRARY_BTN_KEY);
    if (!currentKey) {
      const defaultBtn = btnsList.querySelector(this.refs.queueBtnSelector);
      this.accentEl(defaultBtn);
      return defaultBtn;
    }
    const currentKeyBtn = btnsList.querySelector(`[data-key="${currentKey}"]`);
    this.accentEl(currentKeyBtn);
    return currentKeyBtn;
  };

  // CARDS LIST -----------------------

  // Прячет и очищает список карточек

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

  // Отображает список карточек

  showCardsContainer = () => {
    this.refs.cardsContainer.classList.remove(this.CSS.IS_HIDDEN);
  };

  // HOME

  // открывает домашнюю страницу

  openHomePage = () => {
    this.isMyLibrary = false;
    this.accentEl(this.refs.homeBtn);
    this.clearAccent(this.refs.myLibraryBtn);
    this.showHomepageBackground();
    this.renderHeaderMarkup(this.makeHeaderForm, this.spriteUrl).then(() => {
      const formRef = this.getElement(this.refs.formSelector);
      this.notificationEl = this.getElement(this.refs.notificationElSelector);

      formRef.addEventListener('submit', this.onSearchFormSubmit);
    });

    this.resetPage();
    this.unObserveLoadMoreAnchor();
    this.refs.topScroll.classList.add(this.CSS.ACTIVE);

    this.path = this.getWeekTrendingPath();
    this.getMovies(this.path);

    const libraryMessage = this.getElement('.my-library__description');
    if (libraryMessage) {
      libraryMessage.remove();
    }
  };

  // Получает фильмы (тренды и по поисковому запросу)

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

  // Получает следующую страницу с фильмами

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

  // Рендерит фильмы в список

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

  // MY LIBRARY ---------------

  // получает фильмы из моей библиотеке (просмотренные и в очереди)

  getMyLibraryMovies = key => {
    const promise = new Promise(res => {
      const dataFromLocaStorage = this.getDataFromLocalStorage(key);

      this.getTotalPages(dataFromLocaStorage);
      const libraryMessage = this.getElement('.my-library__description');

      if (!this.total_pages && !libraryMessage) {
        this.refs.cardsContainer.insertAdjacentHTML('beforebegin', this.makeLibraryMessage());
        this.refs.topScroll.classList.remove(this.CSS.ACTIVE);
        return;
      }

      this.refs.topScroll.classList.add(this.CSS.ACTIVE);

      const onePageMovies = this.getOnePageData(dataFromLocaStorage);
      const normalizeMovies = this.normalizeIdsMovies(onePageMovies);
      const moviesCardsMarkup = this.makeMoviesCards(normalizeMovies);
      this.refs.cardsContainer.insertAdjacentHTML('beforeend', moviesCardsMarkup);
      res(true);
    });
    return promise;
  };

  // получает, следующую страницу с фильмами из моей библиотеке

  getMoreLibraryMovies = key => {
    this.showAnchorLoader();
    this.getMyLibraryMovies(key);
    this.showImages(this.page);
    this.hideAnchorLoader();
    this.incrementPage();
  };

  // Рендерит и открывает модальное окно с деталицаей фильма

  renderMovieDetails = data => {
    const normalizeData = this.getNormalizeOneMovie(data);
    const movieMarkup = this.makeMovieDetails(normalizeData);
    this.refs.cardModalContent.innerHTML = movieMarkup;
    this.refs.cardModal.classList.remove(this.CSS.IS_HIDDEN);
    const modalImage = this.refs.cardModalContent.querySelector('.movie-card__image');
    const imageBox = modalImage.closest('div');

    this.showImage(modalImage, imageBox);
  };

  // Закрывает модальное окно

  closeModal = () => {
    window.removeEventListener('keydown', this.onEscapeClick);
    this.refs.cardModal.classList.add(this.CSS.IS_HIDDEN);
    document.body.classList.remove(this.CSS.LOCK);
  };

  // Устанавливает статус кнопки, в зависимости отналичия фильма в библиотеке

  getModalBtnsStatus = btnsList => {
    const modalBtns = btnsList.querySelectorAll(this.refs.modalBtnSelector);

    const movieId = btnsList.dataset.id;

    modalBtns.forEach(btn => {
      const isMovieOnLibraryData = this.checkIsIncludeMovieInLibraryData(movieId, btn.dataset.key);
      if (isMovieOnLibraryData.findedMovie) {
        this.switchBtntoAdded(btn);
      }
    });
  };

  // Меняет кнопку на "ADDED TO ...", добавляет акцент

  switchBtntoAdded = btnRef => {
    const btnText = btnRef.textContent.trim();
    const updateBtnText = btnText.split(' ');
    updateBtnText[0] = 'ADDED';
    btnRef.textContent = updateBtnText.join(' ');
    this.accentEl(btnRef);
  };

  // Меняет кнопку на "ADD TO ...", снимает акцент

  switchBtntoDefault = btnRef => {
    const btnText = btnRef.textContent.trim();
    const updateBtnText = btnText.split(' ');
    updateBtnText[0] = 'ADD';
    btnRef.textContent = updateBtnText.join(' ');
    this.clearAccent(btnRef);
    btnRef.blur();
  };

  // Очищает данные с Хранилища и удаляет карточку из моей библиотеки.

  removeCardfromList = btn => {
    const movieCard = btn.closest('.cards__item');
    const currentKey = this.getElement('.my-library__btn.accent').dataset.key;
    const movieId = movieCard.dataset.id;
    const movieStatus = this.checkIsIncludeMovieInLibraryData(movieId, currentKey);
    const dataToUpdate = this.getDataFromLocalStorage(currentKey);

    dataToUpdate.splice(movieStatus.movieIndex, 1);
    localStorage.setItem(currentKey, JSON.stringify(dataToUpdate));
    movieCard.remove();

    if (!dataToUpdate.length) {
      this.refs.cardsContainer.insertAdjacentHTML('beforebegin', this.makeLibraryMessage());
      this.refs.topScroll.classList.remove(this.CSS.ACTIVE);
      return;
    }
  };

  // Создает изображение (нужно при первой загрузке, чтобы упало в кеш)

  getNotFoundPicture = broken_img_url => {
    const img = new Image();
    img.src = broken_img_url;
    img.dataset.src = broken_img_url;
    img.alt = 'Not found image';
    img.classList.add(this.CSS.IMG, this.CSS.NOT_FOUND);
    return img;
  };

  // Показывает изображения после их загрузки

  showImages = page => {
    const images = document.querySelectorAll(`[data-page="${page}"]`);

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

  // Показывает изображение после их загрузки

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

  // добавляет нотификацию и показывает её

  showNotification = (el, message) => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    el.textContent = message;
    el.classList.remove(this.CSS.IS_HIDDEN);
    this.timeoutId = setTimeout(() => {
      el.classList.add(this.CSS.IS_HIDDEN);
      setTimeout(() => {
        el.textContent = '';
      }, 500);
    }, 2500);
  };

  // Включают, отключают лодеры (спиннеры)

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

  /* ------------ МЕТОДЫ DOM КОНЕЦ ------------ */

  /* ------------ ОБРАБОТКА ДАННЫХ ------------ */

  // считает кол-во страниц данных для пагинации

  getTotalPages = fullData => {
    this.total_pages = Math.ceil(fullData.length / this.#PER_PAGES);
  };

  // получает данный одной страницы

  getOnePageData = data => {
    const startIdx = (this.page - 1) * this.#PER_PAGES;
    const endIdx = this.page * this.#PER_PAGES;
    return data.slice(startIdx, endIdx);
  };

  // Проверяет, если ли объект с входящим id, в данных, взятых с локального хранилища

  checkIsIncludeMovieInLibraryData = (id, key) => {
    const moviesFromLocalStorage = this.getDataFromLocalStorage(key);
    const moviesIds = moviesFromLocalStorage.map(movie => movie.id);
    return {
      findedMovie: moviesIds.includes(Number(id)),
      movieIndex: moviesIds.indexOf(Number(id)),
    };
  };

  /* ------------ ОБРАБОТКА ДАННЫХ КОНЕЦ ------------ */

  /* ------------ НОРМАЛИЗАЦИЯ ДАННЫХ ------------ */

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
    ...this.spriteUrl,
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
        // vote_average: this.pad(movie.vote_average),
      };
    });
  };

  // нормализация перед добавление в LS
  normalizedDataToLocaleStorage = obj => {
    obj.img = this.createImage(obj);
    obj.year = this.createYear(obj);
    obj.vote_average = this.pad(obj.vote_average);
    obj.inLibrary = true;
    obj.sprite = this.spriteUrl.sprite;
    if (obj.genres.length > 2) {
      const newGenres = obj.genres.slice(0, 3);
      obj.genres = newGenres;
      obj.genres.splice(2, 1, { id: 7777777, name: 'Other' });
    }
    return obj;
  };

  /* ------------ НОРМАЛИЗАЦИЯ ДАННЫХ КОНЕЦ ------------ */

  /* ---------------- LOCAL STORAGE -------------------- */

  // получает данные из LS по ключу

  getDataFromLocalStorage = key => {
    try {
      const localStorageMoviesData = JSON.parse(localStorage.getItem(key));
      if (!localStorageMoviesData) {
        return [];
      }
      return localStorageMoviesData;
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  // Записывает актуальное значение ключа #LIBRARY_BTN_KEY

  loadBtnDataKeyToLocalStorage = BtnDataKey => {
    localStorage.setItem(this.#LIBRARY_BTN_KEY, BtnDataKey);
  };

  changeLibraryData = (movieId, btnKey, movieStatus) => {
    if (movieStatus.findedMovie) {
      const dataToUpdate = this.getDataFromLocalStorage(btnKey);
      dataToUpdate.splice(movieStatus.movieIndex, 1);
      localStorage.setItem(btnKey, JSON.stringify(dataToUpdate));
      return dataToUpdate;
    }

    this.fetchMovieByID(movieId).then(data => {
      const normalizedResults = this.normalizedDataToLocaleStorage(data);
      const dataToUpdate = [...this.getDataFromLocalStorage(btnKey), normalizedResults];
      localStorage.setItem(btnKey, JSON.stringify(dataToUpdate));

      const activeLibraryPageKey = document.querySelector('.my-library__btn.accent').dataset.key;

      if (this.isMyLibrary && btnKey === activeLibraryPageKey) {
        const cardMarkup = this.makeMoviesCards([normalizedResults]);
        this.refs.cardsContainer.insertAdjacentHTML('beforeend', cardMarkup);
        const cardImage = this.refs.cardsContainer.querySelector('.cards__img.is-hidden');
        const cardItem = cardImage.closest('li');
        this.showImage(cardImage, cardItem);
      }
    });
  };

  /* ---------------- LOCAL STORAGE END -------------------- */

  /* ---------------- EVENTS -------------------- */

  onLoadPage = () => {
    this.resetPage();

    this.notificationEl = this.refs.notificationEl;
    this.path = this.getWeekTrendingPath();

    this.getMovies(this.path);
    this.refs.topScroll.classList.add(this.CSS.ACTIVE);
  };

  /* ----------- OBSERVER INFINITY SCROLL ------------ */

  // Получает и запускает обсервер

  getLoadMoreObserver = () => {
    const options = {
      rootMargin: '50px',
      threshold: 0.5,
    };

    this.loadMoreObserver = new IntersectionObserver(this.onMoviesEnd, options);

    // this.observeLoadMoreAnchor();
  };

  // Включает обсервер

  observeLoadMoreAnchor = () => {
    this.loadMoreObserver.observe(this.refs.loadMoreAnchor);
  };

  // Отключает обсервер

  unObserveLoadMoreAnchor = () => {
    this.loadMoreObserver.disconnect();
  };

  // Инициирует и загружает загрузку следующих фильмов

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

  // Обработчик клика на кнопку топ-скролл

  onTopClick = () => {
    this.refs.header.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // Обработчик клика на логотип

  onLogoClick = evt => {
    evt.preventDefault();
    this.openHomePage();
  };

  // Обработчик клика кнопки навигации

  onNavigationListClick = e => {
    if (e.target.tagName !== 'BUTTON' || e.target.classList.contains(this.CSS.ACCENT)) {
      return;
    }
    if (e.target === this.refs.homeBtn) {
      const libraryBtns = this.getElement(this.refs.libraryBtnsSelector);
      libraryBtns.removeEventListener('click', this.onLibraryBtnsClick);
      this.openHomePage();
    }

    if (e.target === this.refs.myLibraryBtn) {
      this.isMyLibrary = true;
      this.accentEl(e.target);
      this.clearAccent(this.refs.homeBtn);
      this.showLibraryBackground();
      // this.refs.topScroll.classList.add(this.CSS.ACTIVE);
      this.resetPage();
      this.unObserveLoadMoreAnchor();

      Promise.all([this.renderHeaderMarkup(this.makeLibraryBtns), this.clearCardsContainer()]).then(
        () => {
          const libraryBtns = this.getElement(this.refs.libraryBtnsSelector);

          const activeLibraryBtn = this.getActiveLibraryBtn(libraryBtns);
          this.currentLibraryKey = activeLibraryBtn.dataset.key;
          this.getMyLibraryMovies(this.currentLibraryKey).then(this.observeLoadMoreAnchor);
          this.showCardsContainer();
          this.showImages(this.page);
          this.hideCardsListLoader();
          this.incrementPage();
          libraryBtns.addEventListener('click', this.onLibraryBtnsClick);
        },
      );

      this.refs.form.removeEventListener('submit', this.onSearchFormSubmit);
      return;
    }
  };

  // Обработчик сабмита формы

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

    // Предварительно проверяет наличие результатов
    this.fetchMovies(this.path).then(data => {
      if (!data.results.length) {
        this.showNotification(this.notificationEl, ALERTS.NOT_FOUND);
        return;
      }

      this.getMovies(this.path);
    });
  };

  // Обработчик клика по кнопкам Watched и Queue

  onLibraryBtnsClick = e => {
    const queueBtn = this.getElement(this.refs.queueBtnSelector);
    const watchedBtn = this.getElement(this.refs.watchedBtnSelector);

    if (
      (e.target !== queueBtn && e.target !== watchedBtn) ||
      e.target.classList.contains(this.CSS.ACCENT)
    ) {
      return;
    }

    const libraryMessage = this.getElement('.my-library__description');
    if (libraryMessage) {
      libraryMessage.remove();
    }

    this.currentLibraryKey = e.target.dataset.key;
    this.loadBtnDataKeyToLocalStorage(this.currentLibraryKey);

    this.toggleAccentBtn(e.target, queueBtn, watchedBtn);

    this.resetPage();
    this.unObserveLoadMoreAnchor();

    this.clearCardsContainer().then(() => {
      this.getMyLibraryMovies(e.target.dataset.key).then(this.observeLoadMoreAnchor);
      this.showCardsContainer();
      this.hideCardsListLoader();
      this.showImages(this.page);
      this.incrementPage();
    });
  };

  // Обработчик клика на карточки фильмов

  onCardsClick = e => {
    e.preventDefault();

    if (e.target.closest('ul') !== e.currentTarget || e.target === e.currentTarget) {
      return;
    }

    if (e.target.closest('.cards__btn-remove')) {
      this.removeCardfromList(e.target);
      return;
    }

    this.showWindowLoader();

    const currentId = e.target.closest('li').dataset.id;

    this.fetchMovieByID(currentId)
      .then(data => {
        this.renderMovieDetails(data);

        this.hideWindowLoader();

        this.refs.cardModal.addEventListener('click', this.onModalClick);
        window.addEventListener('keydown', this.onEscapeClick);

        const cardModalBtnList = this.getElement(this.refs.modalBtnsListSelector);
        this.getModalBtnsStatus(cardModalBtnList);

        cardModalBtnList.addEventListener('click', this.onModalBtnsClick);
      })
      .catch(showError);
  };

  // Обработчик нажатия на кнопку Escape

  onEscapeClick = event => {
    if (event.code === 'Escape') {
      this.closeModal();
    }
  };

  // Обработчик нажатия на елементы модального окна

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
    setTimeout(() => {
      this.refs.cardModalContent.innerHTML = '';
    }, this.CSS.DELAY);
  };

  // Обработчик нажатия на ссылку открытия модального окна разработчиков

  onDevsModalClick = () => {
    this.refs.devsModal.classList.remove(this.CSS.IS_HIDDEN);
    this.refs.devsModal.addEventListener('click', this.closeModalWindow);
    document.body.classList.add(this.CSS.LOCK);
  };

  // Обработчик нажатия на кнопку закрытия модального окна разработчиков

  closeModalWindow = e => {
    if (e.target.closest(this.refs.devsCloseBtnSelector) !== this.refs.devsCloseBtn) {
      return;
    }

    this.refs.devsModal.classList.add(this.CSS.IS_HIDDEN);
    document.body.classList.remove(this.CSS.LOCK);
  };

  // обработчик клика на кнопки в модальном окне с фильмом

  onModalBtnsClick = e => {
    const movieID = e.currentTarget.dataset.id;
    const btnKey = e.target.dataset.key;
    const movieStatus = this.checkIsIncludeMovieInLibraryData(movieID, btnKey);

    const updatedData = this.changeLibraryData(movieID, btnKey, movieStatus);

    if (movieStatus.findedMovie) {
      this.switchBtntoDefault(e.target);

      const activeLibraryPageKey = document.querySelector('.my-library__btn.accent').dataset.key;

      if (this.isMyLibrary && activeLibraryPageKey === btnKey) {
        const movieCard = this.getElement(`li[data-id="${movieID}"]`);
        movieCard.remove();
        if (!updatedData.length) {
          this.refs.cardsContainer.insertAdjacentHTML('beforebegin', this.makeLibraryMessage());
          this.refs.topScroll.classList.remove(this.CSS.ACTIVE);
        }
      }
      return;
    }

    const libraryMessage = this.getElement('.my-library__description');
    if (this.isMyLibrary && libraryMessage) {
      this.refs.topScroll.classList.add(this.CSS.ACTIVE);
      libraryMessage.remove();
    }
    this.switchBtntoAdded(e.target);
  };
}
