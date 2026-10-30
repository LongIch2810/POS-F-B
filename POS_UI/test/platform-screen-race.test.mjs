import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../src/features/platform/PlatformAdminScreen.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
}).outputText;

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

// Run the actual screen with controlled hooks and service boundaries, without adding a DOM dependency.
function mount(service) {
  const slots = [];
  let index = 0, dirty = true, tree;
  let props = { activeTab: 'stores' };
  let effects = [];
  const React = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) {
      const key = index++;
      if (!slots[key]) slots[key] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[key].value, update => {
        const next = typeof update === 'function' ? update(slots[key].value) : update;
        if (!Object.is(next, slots[key].value)) { slots[key].value = next; dirty = true; }
      }];
    },
    useEffect(effect, deps) {
      const key = index++;
      const previous = slots[key];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        effects.push(() => { previous?.cleanup?.(); slots[key] = { deps, cleanup: effect() }; });
      }
    },
  };
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: path => {
    if (path === 'react') return React;
    if (path.endsWith('/platformService')) return { platformService: service };
    if (path.endsWith('/ToastContext')) return { useToast: () => ({ showToast() {} }) };
    if (path.endsWith('/formatters')) return { formatDateTimeVN: String };
    const name = path.split('/').at(-1);
    if (['Badge', 'Button', 'Dialog', 'Field'].includes(name)) return { [name]: name };
    return require(path);
  } });
  function render() {
    for (let pass = 0; dirty; pass++) {
      assert.ok(pass < 30, 'render settles');
      dirty = false; index = 0; effects = [];
      tree = exports.PlatformAdminScreen(props);
      effects.forEach(run => run());
    }
  }
  async function flush() {
    for (let pass = 0; pass < 20; pass++) { render(); await Promise.resolve(); }
    render();
  }
  function button(label, node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.map(child => button(label, child)).find(Boolean);
    if (node.type === 'Button' && node.props.children.includes(label)) return node;
    return button(label, node.props?.children);
  }
  return {
    flush,
    async tab(activeTab) { props = { activeTab }; dirty = true; await flush(); },
    async click(label) {
      const target = button(label, tree);
      assert.ok(target, 'button exists: ' + label);
      assert.ok(!target.props.disabled, 'button enabled: ' + label);
      target.props.onClick(); await flush();
    },
  };
}

test('PB-03 late mutation refresh cannot replace OWNER cursor after changing tabs', async () => {
  const mutation = deferred();
  const storeReload = deferred();
  const ownerCursors = [];
  let storeReads = 0;
  const list = (data, nextCursor) => ({ data, meta: { nextCursor, limit: 20, total: 2 } });
  const screen = mount({
    getStores() {
      if (++storeReads > 1) return storeReload.promise;
      return Promise.resolve(list([{ id: 'store', name: 'QA', status: 'SUSPENDED' }], 'STORE_INITIAL_CURSOR'));
    },
    getOwners(cursor) {
      ownerCursors.push(cursor);
      return Promise.resolve(list([{ id: 'owner', username: 'QA', fullName: 'QA' }], 'OWNER_NEXT_CURSOR'));
    },
    reactivateStore: () => mutation.promise,
  });
  await screen.flush();
  await screen.click('Mở lại');
  await screen.tab('owners');
  mutation.resolve({});
  await screen.flush();
  storeReload.resolve(list([], 'STORE_RELOAD_CURSOR'));
  await screen.flush();
  await screen.click('Trang sau');
  assert.equal(ownerCursors.at(-1), 'OWNER_NEXT_CURSOR');
});
