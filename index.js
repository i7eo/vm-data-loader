'use strict'

/**
 * The inspiration came from this velocity-loader
 * [velocity-loader](https://github.com/WISZC/velocity-loader)
 */

const loaderUtils = require('loader-utils')
const path = require('path')
const fs = require('fs')
const Velocity = require('velocityjs')
const { Compile, parse } = Velocity

module.exports = function (content) {
  if (this.cacheable) {
    this.cacheable()
  }
  const callback = this.async()
  const query = loaderUtils.parseQuery(this.query)

  if (typeof query === 'object' && query.dataPath) {
    const dataPath = path.resolve(query.dataPath)
    this.addDependency(dataPath)

    try {
      fs.readFile(dataPath, 'utf-8', function (err, text) {
        if (err) return callback(err)
        try {
          const context = JSON.parse(text)
          /**
           * 创建自定义宏：
           * https://github.com/shepherdwind/velocity.js/issues/108
           */
          const result = new Compile(parse(content)).render(context, { toJson: JSON.stringify })
          callback(null, result)
        } catch (err) {
          callback(err, new Compile(parse(content)).render({}))
        }
      })
    } catch (err) {
      console.error('数据文件路径出错', query.dataPath, '找不到该文件')
    }
  } else {
    callback(null, new Compile(parse(content)).render({}))
  }
}
