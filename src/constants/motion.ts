import { Easing } from 'react-native';

export const motion = {
  duration: {
    fast: 180,
    medium: 420,
    slow: 780,
  },
  easing: {
    out: Easing.out(Easing.cubic),
    inOut: Easing.inOut(Easing.cubic),
  },
  stagger: 70,
};
