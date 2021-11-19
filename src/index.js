import './sass/main.scss';

import Application from './js/services/app';
import makeMoviesCards from './templating/moviesCards.hbs';
import makeMovieDetails from './templating/movieDetails.hbs';

const options = {
  makeMoviesCards,
  makeMovieDetails,
};

const app = new Application(options);

app.init();
