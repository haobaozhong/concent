import ccContext from '../../cc-context';
import { MODULE_GLOBAL, MODULE_VOID } from '../../support/constant';
import * as util from '../../support/util';
import * as checker from '../checker';
import guessDuplicate from '../base/guess-duplicate';

export default function (module, mState, moduleMustNotExisted = true) {
  //force MODULE_VOID state as {}
  let state = module === MODULE_VOID ? {} : mState;

  try {
    checker.checkModuleNameAndState(module, state, moduleMustNotExisted);
  } catch (err) {
    guessDuplicate(err, module, 'state');
  }

  const ccStore = ccContext.store;
  const rootState = ccStore.getState();
  const rootStateVer = ccStore.getStateVer();
  const prevRootState = ccStore.getPrevState();
  rootState[module] = state;
  prevRootState[module] = Object.assign({}, state);
  rootStateVer[module] = util.okeys(state).reduce((map, key) => {
    map[key] = 1;
    return map;
  }, {});

  const statKeys = Object.keys(state);
  ccContext.moduleName_stateKeys_[module] = statKeys;

  if (module === MODULE_GLOBAL) {
    const globalStateKeys = ccContext.globalStateKeys;
    statKeys.forEach(key => {
      if (!globalStateKeys.includes(key)) globalStateKeys.push(key)
    });
  }
}