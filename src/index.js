import './sass/main.scss';

import Application from './js/services/app';
import makeMoviesCards from './templating/moviesCards.hbs';
import makeMovieDetails from './templating/movieDetails.hbs';
import makeHeaderForm from './templating/headerForm.hbs';
import makeLibraryBtns from './templating/libraryButtons.hbs';
import getRefs from './js/data/references';
import CSS from './js/data/css';
import spriteUrl from './images/sprite.svg';
import brokenImgUrl from './images/broken.png';
// import {dataCreate, getGenres} from '../src/js/data/workWithGenres';

const refs = getRefs();

const options = {
  makeMoviesCards,
  makeMovieDetails,
  makeHeaderForm,
  makeLibraryBtns,
  refs,
  CSS,
  spriteUrl,
  brokenImgUrl,
};

const app = new Application(options);

app.init();
