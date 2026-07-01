const React = require('react');

const View = (props) => React.createElement('View', props);
const Text = (props) => React.createElement('Text', props);
const TouchableOpacity = (props) => React.createElement('TouchableOpacity', props);
const Pressable = (props) => React.createElement('Pressable', props);
const ActivityIndicator = (props) => React.createElement('ActivityIndicator', props);

const StyleSheet = {
  create(styles) {
    return styles;
  },
  flatten(style) {
    if (Array.isArray(style)) {
      return Object.assign({}, ...style.filter(Boolean));
    }
    return style || {};
  },
};

const Platform = {
  OS: 'ios',
  select: (obj) => obj.ios || obj.default,
};

function AnimatedValue(val) {
  this._value = val;
  this.setValue = jest.fn();
  this.interpolate = jest.fn((config) => ({ _interpolated: config }));
}

const Animated = {
  View: View,
  Text: Text,
  Value: AnimatedValue,
  timing: () => ({ start: jest.fn(), stop: jest.fn() }),
  spring: () => ({ start: jest.fn(), stop: jest.fn() }),
  sequence: () => ({ start: jest.fn(), stop: jest.fn() }),
  parallel: () => ({ start: jest.fn(), stop: jest.fn() }),
  loop: () => ({ start: jest.fn(), stop: jest.fn() }),
};

const Easing = {
  ease: jest.fn(),
  linear: jest.fn(),
  in: jest.fn(() => jest.fn()),
  out: jest.fn(() => jest.fn()),
  inOut: jest.fn(() => jest.fn()),
};

module.exports = {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Dimensions: { get: () => ({ width: 375, height: 812 }) },
  Alert: { alert: jest.fn() },
};
