# Arbol 1.0.0

I have built many Node applications with Expressjs. I started to notice that I prefered a particular method of wrapping express functionality and structuring my applications. Thus, Arbol library was born.

# Getting Started

This simple example demonstrates the core idea behind Arbol. You create individual service functions that receive the express request. They can either return results or the Promise of a result
and internall Arbol takes care of responding accordingly. If you encounter an error, you can either return it or throw it... Arbol will handle that either way as well.

```javascript
const { Tree, Branch } = require('./index');

function serviceA(req) {
  return 'Hello from Service A';
}
function serviceB(req) {
  return 'Hello from Service B';
}
function serviceC(req) {
  return 'Hello from Service C';
}
function serviceD(req) {
  return 'Hello from Service D';
}

const tree = new Tree({
  port: 3000
});

tree
  .addBranch(
    new Branch('/api')
      .addBranch(
        new Branch('/test')
          .addLeaf('get', '/a', serviceA)
          .addLeaf('get', '/b', serviceB)
          .addBranch(new Branch('/sub').addLeaf('get', '/c', serviceC))
      )
      .addBranch(new Branch('/other').addLeaf('get', '/d', serviceD))
  )
  .start(() => console.log('Server started'));
```

# Using Validation

I like using the `joi` library for JSON schema validation. So I used it for Arbol's built in validation capabilities.

```javascript
const { Tree, Check, Branch } = require('./index');
const Joi = require('joi');

const requireQueryValue = Joi.object({ test: Joi.number().required() });

function serviceWithValidation(req) {
  Check.query(requireQueryValue)(req);
  return 'Hello from validated service';
}

const tree = new Tree({
  port: 3000
});

tree
  .addBranch(new Branch('/api').addLeaf('get', '/', serviceWithValidation))
  .start(() => console.log('Server started'));
```

# More to Come

There are other features within Arbol already. I haven't had time to get them all documented yet. However, I am thorough with my JSDoc comments so you can probably
figure out how to use most of the features on your own by reading the intellisense that will appear in most editors.
