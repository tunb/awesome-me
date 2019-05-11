# OVERVIEW

## Javascript basic documents
  * Overview: About compiler
  * Data Types: Supported data types
  * Functions: Global functions
## Testing API documents
  * Assert and Expect api

** Noted :** All injected function have "$" at a prefix

Example: $view, etc

# BASIC

This sandbox compiler using **javascript** as primary language

  **JavaScript** is a interpreted, object oriented, high level scripting language.
  **JavaScript** contains a standard library of objects, such as Array, Date, and Math, and a core set of language elements such as operators, control structures, and statements.

  **Please noted**: this compiler is not support fully javascript, harmful function are removed, DOM object also removed

  [Read more](https://www.w3schools.com/js/)

# BASIC DATATYPES

  ## Supported Data Types:
  * [String](https://www.w3schools.com/js/js_string_methods.asp)
  * [Object](https://www.w3schools.com/js/js_objects.asp)
  * [Array](https://www.w3schools.com/js/js_arrays.asp)
  * [Number](https://www.w3schools.com/js/js_numbers.asp)
  * [BigNumber](http://mikemcl.github.io/bignumber.js/)
  * [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
  * [Date](https://www.w3schools.com/js/js_dates.asp)
  * [Error](https://www.w3schools.com/js/js_errors.asp)
  * [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

# BASIC FUNCTIONS

  ## Supported Functions:
  * [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)
  * [Math](https://www.w3schools.com/js/js_math.asp)
  * [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
  * [units](https://github.com/ethereumjs/ethereumjs-units) : convert ethereum unit library
  * [moment](https://momentjs.com/) : datetime library
  * [fetch](https://github.com/axios/axios) : fetch data library (axios)
  * [clearInterval](https://www.w3schools.com/jsref/met_win_clearinterval.asp)
  * [setInterval](https://www.w3schools.com/jsref/met_win_setinterval.asp)
  * [setTimeout](https://www.w3schools.com/jsref/met_win_settimeout.asp)
  * [clearTimeout](https://www.w3schools.com/jsref/met_win_cleartimeout.asp)
  * console: including console.log, console.image, console.info, console.error: will show at your console devtool
  * $view: including $view.image, $view.show, $view.table: will show at UI

# FUNCTIONS

## Global Functions:
  * $KMeans: K-Means clustering in JavaScript.
  * $hamsters: 100% Vanilla Javascript Multithreading & Parallel Execution Library [https://www.hamsters.io]
  * $CryptoJS: JavaScript library of crypto standards.
  * $MerkleTree: Construct Merkle Trees and verify proofs in JavaScript.
  * $BayesClassifier: This is a Naive Bayes classifier implementation written in JavaScript.

## Example:
```javascript
$native.log('log on your console')
$native.info('log on your console')
$native.error('log on your console')
$native.image('https://www.belightsoft.com/products/imagetricks/img/core-image-filters@2x.jpg')

console.log('log on result')
console.log({ hello: 1, arrs: [1, 2, 3] })
console.image('https://www.belightsoft.com/products/imagetricks/img/core-image-filters@2x.jpg')
console.table([1, 2, 'hello'])
console.table({ hello: 1, arrs: [1, 2, 3] })

const value = new BigNumber('10000')

fetch({
  url: 'your-url',
  method: 'GET'
}).then((response) => {
  const { data } = response
  console.log(data)
}).catch((err) => {
  console.error(err.message)
})

// $KMeans 
function KMeans () {
  const data = [
    [6,5],
    [9,10],
    [10,1],
    [5,5]
  ];

  const kmeans = $KMeans({
    data: data,
    k: 3
  })

  kmeans.on('iteration', function(self) {
    draw.call(self)
  })

  kmeans.on('end', function(self) {
    console.log(self.iterations)
  })

  kmeans.run()
}
// $hamsters.js 
function hamsters () {
  const params = {
    array: [0,1,2,3,4,5,6,7,8,9],
    threads: 2,
    aggregate: true
  }
  $hamsters.run(params, function() {
      const arr = params.array
      arr.forEach(function(item) {
        rtn.data.push((item * 120)/10)
      })
  }, function(results) {
    console.log(results)
  })
}
// $CryptoJS
function CryptoJS () {
  const message, nonce
  const hashDigest = $CryptoJS.sha256(nonce + message)
}
// $MerkleTree
function MerkleTree () {

  const leaves = ['a', 'b', 'c'].map(x => $CryptoJS.sha256(x))
  const tree = new $MerkleTree(leaves, SHA256)
  const root = tree.getRoot().toString('hex')
  const leaf = $CryptoJS.sha256('a')
  const proof = tree.getProof(leaf)
  console.log(tree.verify(proof, leaf, root)) // true


  const badLeaves = ['a', 'x', 'c'].map(x => $CryptoJS.sha256(x))
  const badTree = new $MerkleTree(badLeaves, SHA256)
  const badLeaf = $CryptoJS.sha256('x')
  const badProof = tree.getProof(badLeaf)
  console.log(tree.verify(badProof, leaf, root))
}
// $BayesClassifier
function BayesClassifier () {
  const classifier = new $BayesClassifier()

  const positiveDocuments = [
    `I love tacos.`,
    `Dude, that burrito was epic!`,
    `Holy cow, these nachos are so good and tasty.`,
    `I am drooling over the awesome bean and cheese quesadillas.`
  ]

  const negativeDocuments = [
    `Gross, worst taco ever.`,
    `The buritos gave me horrible diarrhea.`,
    `I'm going to puke if I eat another bad nacho.`,
    `I'd rather die than eat those nasty enchiladas.`
  ]

  classifier.addDocuments(positiveDocuments, `positive`)
  classifier.addDocuments(negativeDocuments, `negative`)

  classifier.train()

  console.log(classifier.classify(`I heard the mexican restaurant is great!`))
  console.log(classifier.classify(`I don't want to eat there again.`))
  console.log(classifier.classify(`The torta is epicly bad.`))
  console.log(classifier.classify(`The torta is tasty.`))

  console.log(classifier.getClassifications(`Burritos are the meaning of life.`))
}
```

# TESTING

  We supported a simple test framework running on compiler, making asynchronous testing simple and fun.
  It tests run serially, allowing for flexible and accurate reporting, while mapping uncaught exceptions to the correct test case

### EXAMPLE:
```javascript
describe('Test Math Function', () => {
  it('Add work fine', async () => {
    const value = 2 + 2
    expect(value).to.equal(4)
  })
})
// OR
suite('Test Math Function', () => {
  test('Array Contain', async () => {
    const shoppingList = [
      'diapers',
      'kleenex',
      'trash bags',
      'paper towels',
      'beer',
    ]
    expect(shoppingList).toContain('beer')
  })
})
```

## ASYNCHRONOUS CODE
Testing asynchronous code could not be simpler! Simply invoke the callback when your test is complete.
By adding a callback (usually named done) to it(), It will know that it should wait for this function to be called to complete the test.
This callback accepts both an Error instance (or subclass thereof) or a falsy value; anything else will cause a failed test.

```javascript
describe('Test payout contract', () => {
  it('is Allow Withdraw', async () => {
    const isAllow = await view({
      inputs: [],
      contract: Payout,
      functionName: 'isAllowed'
    })
    expect(isAllow[0].value).to.equal(false)
  })
})
```

# TESTING ASSERT

  The assert style is exposed through assert interface. This provides the classic assert-dot notation, similar to that packaged with node.js.
  This assert module, however, provides several additional tests and is browser compatible
  In all cases, the assert style allows you to include an optional message as the last parameter in the assert statement.
  These will be included in the error messages should your assertion not pass.

```javascript
var assert = require('chai').assert
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

assert.typeOf(foo, 'string'); // without optional message
assert.typeOf(foo, 'string', 'foo is a string'); // with optional message
assert.equal(foo, 'bar', 'foo equal "bar"');
assert.lengthOf(foo, 3, "foo's value has a length of 3");
assert.lengthOf(beverages.tea, 3, 'beverages has 3 types of tea');
```

* [More Information](https://www.chaijs.com/api/assert/)

# TESTING EXPECT

  The BDD style is exposed through expect or should interfaces. In both scenarios, you chain together natural language assertions.
```javascript
var expect = require('chai').expect
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

expect(foo).to.be.a('string');
expect(foo).to.equal('bar');
expect(foo).to.have.lengthOf(3);
expect(beverages).to.have.property('tea').with.lengthOf(3);
```
  Expect also allows you to include arbitrary messages to prepend to any failed assertions that might occur.
  This comes in handy when being used with non-descript topics such as booleans or numbers.

  * [More Information](https://www.chaijs.com/api/bdd/)