import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import each from 'lodash/each';
import flattenDeep from 'lodash/flattenDeep';
import omitBy from 'lodash/omitBy';
import isNil from 'lodash/isNil';
import get from 'lodash/get';
import set from 'lodash/set';
import keyBy from 'lodash/keyBy';
import mergeWith from 'lodash/mergeWith';
import cloneDeep from 'lodash/cloneDeep';
import groupBy from 'lodash/groupBy';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import findIndex from 'lodash/findIndex';
import remove from 'lodash/remove';

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
  mergeWith,
  cloneDeep,
  groupBy,
  isEqual,
  uniqWith,
  findIndex,
  remove
};
