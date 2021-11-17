// Пример спиннера, который можно использовать, разметка под него также есть

import { Spinner } from 'spin.js';

const loadSpinner = new Spinner({
  lines: 12,
  length: 7,
  width: 1,
  radius: 10,
  scale: 2.0,
  corners: 1,
  color: '#ded7f0',
  fadeColor: 'transparent',
  animation: 'spinner-line-shrink',
  rotate: 0,
  direction: 1,
  speed: 1,
  zIndex: 2e9,
  className: 'spinner',
  top: '50%',
  left: '50%',
  shadow: '0 0 1px transparent',
  position: 'absolute',
});

export { loadSpinner };
