const { src, dest } = require('gulp');

function buildIcons() {
  return src('src/**/*.svg').pipe(dest('dist'));
}

function buildCodex() {
  return src('src/**/*.node.json').pipe(dest('dist'));
}

exports['build:icons'] = buildIcons;
exports['build:codex'] = buildCodex;
