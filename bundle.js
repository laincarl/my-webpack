(function (modules) {
  // console.log(modules)
  function __webpack_require__(moduleId) {
    // console.log(moduleId)
    const target = modules[moduleId];
    const module = {
      exports: {}
    }
    target.call(null, module, module.exports, __webpack_require__);
    return module.exports;
  }
  return __webpack_require__("./demo/src/index.js");
})({
  

  "./demo/src/index.js":

  (function (module, exports, __webpack_require__) {

    eval(`"use strict";

var b = __webpack_require__("./demo/src/b.js");

b();`)

  }),
    
    

  "./demo/src/b.js":

  (function (module, exports, __webpack_require__) {

    eval(`"use strict";

module.exports = function b() {
  console.log('b');
};`)

  }),
    
     
  })