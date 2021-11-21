import './sass/main.scss';

import Application from './js/services/app';
import makeMoviesCards from './templating/moviesCards.hbs';
import makeMovieDetails from './templating/movieDetails.hbs';

const options = {
  makeMoviesCards,
  makeMovieDetails,
};

const app = new Application(options);


//-------------------------------------//
// init Infinte Scroll





//  const container = document.querySelector('.js-cards__list');

// const infScroll = new InfiniteScroll( container, {
//   path: function() {
//      return `https://api.themoviedb.org/3/movie/top_rated?api_key=6759d249684e99a49309af19f6af0ff2&language=en-US&page=${this.pageIndex}`;
//   },


//   // load response as JSON
//   responseBody: 'json',
//   // status: '.scroll-status',
//   status: '.page-load-status',
//   history: false,
// });

 
// // use element to turn HTML string into elements
// let proxyElem = document.createElement('li');

// infScroll.on('load', function (body) {
 
//   // compile body data into HTML
//   var itemsHTML = body.results.map(getItemHTML).join('');

//   // convert HTML string into elements
//   proxyElem.innerHTML = itemsHTML;
 
//   // append item elements
  
//   container.append( ...proxyElem.children );
// });

// // load initial page
// infScroll.loadNextPage();

// //------------------//

// function getItemHTML({ id, poster_path, title, vote_average, genre_ids, release_date}) {

//   return `
//    <li class="cards__item">
//   <a href="#" class="cards__link link" data-id="${id}">
//           <div class="cards__loader"></div>
//           <img
//             class="cards__img"
//             src ="https://image.tmdb.org/t/p/original/${poster_path}"
//             alt="постер фильма ${title}"
//           />
//           <h3 class="cards__title">${title}</h3>
//           <p class="cards__genres">[${[...genre_ids]} | ${release_date.substring(0,4)}]</p>
//           <p class="cards__rating">${vote_average}</p>
//         </a>
//     </li>`;


// }


app.init();

