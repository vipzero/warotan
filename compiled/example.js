'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = robot => {
  robot.hear(/ぬるぽ/i, res => {
    res.send('ガッ');
  });
};