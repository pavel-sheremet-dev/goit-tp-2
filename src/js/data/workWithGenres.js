import allGenres from '../data/genres.json';

// Создание нового свойства с годом (для всех)
function createYear(obj) {
  const date = new Date(obj.release_date)
  return obj.release_date ? date.getFullYear() : '';
}
// Создание нового свойства с жанрами для трендов
function createGenresFromTOP(array, genres) {
    let newArr = array
        .map(id => genres.filter(element => element.id === id))
        .slice(0, 3)
        .flat();
    if (newArr.length ===3) {
      newArr.splice(2, 1, {name:'Other'})
      return newArr
    }
    console.log("масив без иф" ,newArr);
    return newArr
}

// Создание нового свойства с жанрами для запроса по ID фильма
function createGenresFromID(array) {
  let genresNameArr = array.genres
    .map(genre => genre.name)
    .flat();

    return genresNameArr
}

// Соединение информации о фильме для страницы home
function dataCreate(films, allGenres) {
const imageLink = "./images/broken.png"
return  films.map(film => { const imageUrl = film.poster_path ? `https://image.tmdb.org/t/p/w500${film.poster_path}` : imageLink;
    return {
    ...film,
    year: createYear(film),
    genres: createGenresFromTOP(film.genre_ids, allGenres),
    img: imageUrl,
  }}); 
}

function getGenres() {
    const { genres } = allGenres;
    return genres;
  }

export {
  dataCreate,
  createGenresFromTOP,
  createGenresFromID,
  createYear,
  getGenres
};