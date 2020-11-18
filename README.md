# izi-chat-v3

## How to start

1. npm ci (from scratch)
2. npm start

## How to test
1. npm ci (from scratch)
2. npm run test

## How to build for production
1. npm ci
2. npm run build
3. npm ci --prod
4. NODE_ENV=prod node dist/main

## CODE CONVENTIONS

### IMPORT/EXPORT


### 1. No export default outside index.js

```
// services/my-service.js

// BAD
const myFunction = (ctx, a, b) => { 
  return a + b
}

export default { myFunction }
```
```
// services/my-service.js

// GOOD

export const myFunction = (ctx, a, b) => { 
  return a + b
}

// STILL GOOD

const myFunction2 = (ctx, a, b) => { 
  return a + b
}

export { myFunction2 }

```

### 2. No export inside index.js

```
// services/index.js

// BAD

import { myFunction } from './my-service'

export { myFunction }

export const myFunction2 = (ctx, a, b) => {
  return a - b
}
```
```
// services/index.js

// GOOD

import { myFunction } from './my-service'
import { myFunction2 } from './my-service2'


export default { myFunction, myFunction2 }

```