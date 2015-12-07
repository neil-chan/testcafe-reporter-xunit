# testcafe-reporter-xunit
[![Build Status](https://travis-ci.org/DevExpress/testcafe-reporter-xunit.svg)](https://travis-ci.org/DevExpress/testcafe-reporter-xunit)

This is the **xUnit** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

<p align="center">
    <img src="https://raw.github.com/DevExpress/testcafe-reporter-xunit/master/media/preview.png" alt="preview" />
</p>

## Install

```
npm install -g testcafe-reporter-xunit
```

## Usage

When you run tests from the command line, specify the reporter name by using the `--reporter` option:

```
testcafe chrome 'path/to/test/file.js' --reporter xunit
```


When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('chrome')
    .reporter('xunit') // <-
    .run();
```

## Author
Developer Express Inc. (https://devexpress.com)
