"use strict";

// node_modules/vm2/lib/fixasync.js
var { GeneratorFunction, AsyncFunction, AsyncGeneratorFunction, global, internal, host, hook } = exports;
var { Contextify, Decontextify } = internal;
var { Function, eval: eval_, Promise: Promise2, Object, Reflect } = global;
var { getOwnPropertyDescriptor, defineProperty, assign } = Object;
var { apply: rApply, construct: rConstruct } = Reflect;
var FunctionHandler = {
  __proto__: null,
  apply(target, thiz, args) {
    const type = this.type;
    args = Decontextify.arguments(args);
    try {
      args = Contextify.value(hook(type, args));
    } catch (e) {
      throw Contextify.value(e);
    }
    return rApply(target, thiz, args);
  },
  construct(target, args, newTarget) {
    const type = this.type;
    args = Decontextify.arguments(args);
    try {
      args = Contextify.value(hook(type, args));
    } catch (e) {
      throw Contextify.value(e);
    }
    return rConstruct(target, args, newTarget);
  }
};
function makeCheckFunction(type) {
  return assign({
    __proto__: null,
    type
  }, FunctionHandler);
}
function override(obj, prop, value) {
  const desc = getOwnPropertyDescriptor(obj, prop);
  desc.value = value;
  defineProperty(obj, prop, desc);
}
var proxiedFunction = new host.Proxy(Function, makeCheckFunction("function"));
override(Function.prototype, "constructor", proxiedFunction);
if (GeneratorFunction) {
  Object.setPrototypeOf(GeneratorFunction, proxiedFunction);
  override(GeneratorFunction.prototype, "constructor", new host.Proxy(GeneratorFunction, makeCheckFunction("generator_function")));
}
if (AsyncFunction) {
  Object.setPrototypeOf(AsyncFunction, proxiedFunction);
  override(AsyncFunction.prototype, "constructor", new host.Proxy(AsyncFunction, makeCheckFunction("async_function")));
}
if (AsyncGeneratorFunction) {
  Object.setPrototypeOf(AsyncGeneratorFunction, proxiedFunction);
  override(AsyncGeneratorFunction.prototype, "constructor", new host.Proxy(AsyncGeneratorFunction, makeCheckFunction("async_generator_function")));
}
global.Function = proxiedFunction;
global.eval = new host.Proxy(eval_, makeCheckFunction("eval"));
if (Promise2) {
  Promise2.prototype.then = new host.Proxy(Promise2.prototype.then, makeCheckFunction("promise_then"));
  if (Promise2.prototype.finally) {
    Promise2.prototype.finally = new host.Proxy(Promise2.prototype.finally, makeCheckFunction("promise_finally"));
  }
  if (Promise2.prototype.catch) {
    Promise2.prototype.catch = new host.Proxy(Promise2.prototype.catch, makeCheckFunction("promise_catch"));
  }
}
