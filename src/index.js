import './sass/main.scss';

import Application from './js/services/app';
import makeMoviesCards from './templating/moviesCards.hbs';
import makeMovieDetails from './templating/movieDetails.hbs';
import getRefs from './js/data/references';
import CSS from './js/data/css';

const refs = getRefs();

const options = {
  makeMoviesCards,
  makeMovieDetails,
  refs,
  CSS,
};

const app = new Application(options);

app.init();
