// Пример спиннера, который можно использовать, разметка под него также есть

import { Spinner } from 'spin.js';

const loadSpinner = new Spinner({
  lines: 11,
  length: 0,
  width: 5,
  radius: 12,
  scale: 2.0,
  corners: 1,
  color: '#ff001b',
  fadeColor: 'transparent',
  animation: 'spinner-line-shrink',
  rotate: 0,
  direction: 1,
  speed: 1,
  zIndex: 5,
  className: 'spinner',
  top: '50%',
  left: '50%',
  shadow: '0 0 1px transparent',
  position: 'absolute',
});

const windowSpinner = new Spinner({
  lines: 11,
  length: 0,
  width: 5,
  radius: 12,
  scale: 2.0,
  corners: 1,
  color: '#ffffff',
  fadeColor: 'transparent',
  animation: 'spinner-line-shrink',
  rotate: 0,
  direction: 1,
  speed: 1,
  zIndex: 5,
  className: 'spinner',
  top: '50%',
  left: '50%',
  shadow: '0 0 1px transparent',
  position: 'absolute',
});

const anchorSpinner = new Spinner({
  lines: 10,
  length: 0,
  width: 3,
  radius: 7,
  scale: 2.0,
  corners: 1,
  color: '#ff001b',
  fadeColor: 'transparent',
  animation: 'spinner-line-shrink',
  rotate: 0,
  direction: 1,
  speed: 1,
  zIndex: 5,
  className: 'spinner',
  top: '50%',
  left: '50%',
  shadow: '0 0 1px transparent',
  position: 'absolute',
});

export { loadSpinner, windowSpinner, anchorSpinner };
