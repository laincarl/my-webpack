const path = require('path');
const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');
const t = require('@babel/types')
const ejs = require('ejs')
class Compiler {
  constructor(config) {
    this.config = config
    this.modules = {}
    const { entry } = this.config
    this.entryId = this.getMouldId(entry);
  }
  compile() {
    const { entry } = this.config
    this.genDependenceTree(entry, __dirname);
    this.generateFile()
  }
  getMouldId(moduleName, context = __dirname) {
    return './' + path.relative(
      process.cwd(),
      path.resolve(context, moduleName),
    ).replace(/\\/g, '/')
  }
  transform(filename, context) {
    const filePath = path.resolve(context, filename);
    const folder = path.dirname(filePath)
    // console.log(filePath)
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const ast = parser.parse(content, { sourceType: 'module' });
    const dependencies = {};
    const that = this;
    traverse(ast, {
      CallExpression({ node }) {
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__';
          const moduleName = node.arguments[0].value;
          const newFile = that.getMouldId(moduleName, folder);
          // console.log(newFile)
          //保存所依赖的模块
          dependencies[moduleName] = newFile
          node.arguments = [t.stringLiteral(newFile)]
        }
      },
    });
    const { code } = babel.transformFromAst(ast, null, {
      presets: ["@babel/preset-env"]
    })
    return {
      moduleId: this.getMouldId(filename, context),
      dependencies,
      code
    }
  }
  genDependenceTree(entry, context) {
    const result = this.transform(entry, context);
    this.modules[result.moduleId] = result.code;
    if (result && Object.keys(result.dependencies).length > 0) {
      const nextContext = path.dirname(path.resolve(context, entry));
      // console.log(nextContext)
      Object.keys(result.dependencies).forEach(moduleName => {
        this.genDependenceTree(moduleName, nextContext)
      })
    }
  }
  generateFile() {
    const template = fs.readFileSync(path.join(__dirname, './template.ejs')).toString();
    fs.writeFileSync(
      'bundle.js',
      ejs.render(template, {
        entryId: this.entryId,
        modules: this.modules
      }),
    );
  }
}

const compiler = new Compiler({
  entry: '../demo/src/index.js',
  output: 'bundle.js'
})
compiler.compile()