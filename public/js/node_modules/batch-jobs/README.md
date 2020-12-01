# batch-jobs
## Installation
```bash
$ npm install batch-jobs
```

## API
```js
const BatchJobs = require('batch-jobs')
const batchJobs = new BatchJobs(10)

// Set the concurrency in the constructor or with the following function:
batchJobs.setConcurrency(20)

batchJobs.on('progress', console.log)
batchJobs.on('end', console.log)

batchJobs.push(done => fetchData(1, done))
batchJobs.push(done => fetchData(2, done))

batchJobs.start()

function fetchData(amount, done) {
  setTimeout(() => {
    done(new Array(amount).fill(amount))
  }, 500)
}
```

## Events
### Progress
```js
{
  total: 2,
  running: 1,
  pending: 0,
  data: [ [1] ]
}
```

### End
```js
[ [1], [2, 2] ]
```
