import { showAlert, showError } from '../vendors/alerts';
import ALERTS from '../data/alertsMsgs';





export default class Application {
  #API_KEY = '6759d249684e99a49309af19f6af0ff2';
  #BASE_API_URL = 'https://api.themoviedb.org/3';
  #CATEGORIES = {
    topRated: 'movie/top_rated',
  };
  constructor({ makeMoviesCards, makeMovieDetails }) {
    this.makeMoviesCards = makeMoviesCards;
    this.makeMovieDetails = makeMovieDetails;
    this.page = 1;
  }

  // Методы лучше записывать как стрелочные функции, в таком случае не теряется контекст, если метод передается как коллбек-функция

  loadListeners = () => {
    // Сюда добавляем слушатели событий, которые должны подключиться при первой загрузке страницы (например клики на кнопки HOME и My Library)
  };

  init = () => {
    // Сюда добавляем все действия, которые должны произойти при загрузке стартовой страницы, например слушатели событий, отрисовка популярных фильмов.
    this.topRatedShow();
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

  topRatedShow = () => {
  
const container = document.querySelector('.js-cards__list');

const infScroll = new InfiniteScroll(container, {
  
  path: function () {
         return `https://api.themoviedb.org/3/movie/top_rated?api_key=6759d249684e99a49309af19f6af0ff2&language=en-US&page=${this.pageIndex}`;
  },
  // load response as JSON
  responseBody: 'json',
  status: '.page-load-status',
  history: false,
});

    // use element to turn HTML string into elements
let proxyElem = document.createElement('li');

infScroll.on('load', function (body) {
 
  // compile body data into HTML
  var itemsHTML = body.results.map(getTopRatedMarkUp).join('');

  // convert HTML string into elements
  proxyElem.innerHTML = itemsHTML;
 
  // append item elements
  
  container.append( ...proxyElem.children );
});

// load initial page
infScroll.loadNextPage();

//------------------//

 function getTopRatedMarkUp({ id, poster_path, title, vote_average, genre_ids, release_date}) {

    return `
   <li class="cards__item">
  <a href="#" class="cards__link link" data-id="${id}">
          <div class="cards__loader"></div>
          <img
            class="cards__img"
            src ="https://image.tmdb.org/t/p/original/${poster_path}"
            alt="постер фильма ${title}"
          />
          <h3 class="cards__title">${title}</h3>
          <p class="cards__genres">[${[...genre_ids]} | ${release_date.substring(0, 4)}]</p>
          <p class="cards__rating">${vote_average}</p>
        </a>
    </li>`;

}
   
}


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

  // Ниже можно добавлять методы, которые касаются обработки событий
}
