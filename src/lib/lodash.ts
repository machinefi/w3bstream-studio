import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import each from 'lodash/each';
import flattenDeep from 'lodash/flattenDeep';
import omitBy from 'lodash/omitBy';
import isNil from 'lodash/isNil';
import get from 'lodash/get';
import set from 'lodash/set';
import keyBy from 'lodash/keyBy';
import merge from 'lodash/merge';

export const _ = {
  throttle,
  debounce,
  each,
  flattenDeep,
  omitBy,
  isNil,
  get,
  set,
  keyBy,
  merge
};
