import { showAlert, showError } from '../vendors/alerts';
import ALERTS from '../data/alertsMsgs';

export default class Application {
  #API_KEY = '6759d249684e99a49309af19f6af0ff2';
  #BASE_API_URL = 'https://api.themoviedb.org/3';
  #CATEGORIES = {
    topRated: 'movie/top_rated',
    genre: 'genre/movie/list',
    query: 'search/movie',
  };

  constructor({
    makeMoviesCards,
    makeMovieDetails,
    makeHeaderForm,
    makeLibraryBtns,
    refs,
    CSS,
    spriteUrl,
    brokenImgUrl,
  }) {
    this.makeMoviesCards = makeMoviesCards;
    this.makeMovieDetails = makeMovieDetails;
    this.makeHeaderForm = makeHeaderForm;
    this.makeLibraryBtns = makeLibraryBtns;
    this.page = 1;
    this.total_pages = null;
    this.refs = refs;
    this.CSS = CSS;
    this.spriteUrl = { url: spriteUrl };
    this.id = null;
    this.lang = 'en-US';
    this._path = 'movie/top_rated';
    this._urlParams = '';
    this.genres = [];
    this._not_found_img = brokenImgUrl;
  }
  // пример использование функции по работе с жанрами и годом в запросе топ фильмов
  // fetch(".......").then(res=>res.json()).then(films => {
  // const allGenres = this.getGenres();
  // const obj = this.dataCreate(films.results, allGenres)
  // функция рендера карточки(obj)
  // })

  // Методы лучше записывать как стрелочные функции, в таком случае не теряется контекст, если метод передается как коллбек-функция

  loadListeners = () => {
    this.refs.navigation.addEventListener('click', this.onNavigationListClick);
    this.refs.form.addEventListener('submit', this.onSearchFormSubmit);
    // this.refs.myLibraryBtn.addEventListener('click', this.renderMyLibrary);
    // Сюда добавляем слушатели событий, которые должны подключиться при первой загрузке страницы (например клики на кнопки HOME и My Library)
  };

  init = () => {
    // Сюда добавляем все действия, которые должны произойти при загрузке стартовой страницы, например слушатели событий, отрисовка популярных фильмов.
    this.loadListeners();
    this.getGenres();
    this.onLoadPage();
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
      query: searchQuery,
      include_adult: false,
    });
    return `${this.#CATEGORIES.query}?${this.urlParams}&`;
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
  /* ------------ НОРМАЛИЗАЦИЯ ДАННЫХ КОНЕЦ ------------ */

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

  clearCardsContainer = () => {
    this.refs.loadMoreAnchor.classList.add(this.CSS.IS_HIDDEN);
    this.refs.cardsContainer.innerHTML = '';
    this.resetPage();
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

  // Юра

  // renderMyLibrary = () => {
  //   this.clearCardsContainer();

  //   this.refs.cardsTitle.classList.add(this.CSS.IS_HIDDEN);
  //   this.renderMyLibraryMovies('Queue');
  // };

  // Юра

  renderMyLibraryMovies = key => {
    this.clearCardsContainer();

    const localStorageInfo = this.loadInfoFromLocalStorage(key);

    console.log(localStorageInfo);

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

  // Юра

  /* ---------------- LS -------------------- */

  loadInfoFromLocalStorage = key => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  loadBtnStatus = LibraryBtn => {
    localStorage.setItem('button', LibraryBtn.dataset.key);
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

  getMovies = path => {
    return this.fetchMovies(path)
      .then(data => {
        const results = data.results;
        if (!results.length) {
          showAlert(query, ALERTS.NOT_FOUND);
          return;
        }

        this.refs.loadMoreAnchor.classList.remove(this.CSS.IS_HIDDEN);
        this.incrementPage();
        this.total_pages = data.total_pages;

        const normalizedResults = this.getNormalizeMovies(results, this.genres);
        const moviesCardsMarkup = this.makeMoviesCards(normalizedResults);

        this.refs.cardsContainer.insertAdjacentHTML('beforeend', moviesCardsMarkup);
      })
      .catch(showError);
  };

  // Ниже можно добавлять методы, которые касаются обработки событий

  onLoadPage = () => {
    this.resetPage();

    this.path = this.getTopRatedPath();

    this.getMovies(this.path).then(this.observeEndList).catch(showError);
  };

  observeEndList = () => {
    const options = {
      rootMargin: '50px',
      threshold: 0.5,
    };

    const observer = new IntersectionObserver(this.onMoviesEnd, options);

    observer.observe(this.refs.loadMoreAnchor);
  };

  onMoviesEnd = ([entry], observer) => {
    if (!entry.isIntersecting) {
      return;
    }

    if (this.total_pages + 1 === this.page) {
      observer.disconnect();
      this.refs.loadMoreAnchor.classList.add(this.CSS.IS_HIDDEN);
      return;
    }

    this.getMovies(this.path); // загрузка новой порции
  };

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

      this.clearCardsContainer();

      this.path = this.getTopRatedPath();
      this.getMovies(this.path);

      return;
    }

    if (e.target === this.refs.myLibraryBtn) {
      this.accentEl(e.target);
      this.clearAccent(this.refs.homeBtn);
      this.showLibraryBackground();
      this.renderHeaderMarkup(this.makeLibraryBtns).then(() => {
        const libraryBtns = document.querySelector(this.refs.libraryBtnsSelector);

        const activeLibraryBtn = this.getActiveLibraryBtn();
        this.renderMyLibraryMovies(activeLibraryBtn.dataset.key);

        libraryBtns.addEventListener('click', this.onLibraryBtnsClick);
      });

      this.clearCardsContainer();

      this.refs.form.removeEventListener('submit', this.onSearchFormSubmit);
      return;
    }
  };

  onSearchFormSubmit = e => {
    e.preventDefault();
    const form = e.currentTarget;
    const query = form.elements.query.value;
    const normalizedQuery = query.toLowerCase().trim().split(' ').join('+');

    this.clearCardsContainer();

    this.path = this.getQueryPath(normalizedQuery);

    console.log(this.path);

    this.getMovies(this.path).then(this.observeEndList).catch(showError);
  };

  // Юра

  onLibraryBtnsClick = e => {
    const queueBtn = document.querySelector(this.refs.queueBtnSelector);
    const watchedBtn = document.querySelector(this.refs.watchedBtnSelector);

    if (e.target === queueBtn) {
      this.loadBtnStatus(e.target);

      this.accentEl(e.target);
      this.clearAccent(watchedBtn);

      this.renderMyLibraryMovies(e.target.dataset.key);
    }
    if (e.target === watchedBtn) {
      this.loadBtnStatus(e.target);

      this.accentEl(e.target);

      this.clearAccent(queueBtn);
      this.renderMyLibraryMovies(e.target.dataset.key);
    }
  };
}
