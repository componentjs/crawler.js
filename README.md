# Component Crawler

http://component-crawler.herokuapp.com/

Crawl github users for components. Only works with Chrome right now due to a lack of vendor prefixing.

Some notes:

- It skips `component.json`s with `private: true`.
- It skips repositories with issues disabled.
- It tries to skip bare repositories, but sometimes fails.
- The `.version` could be wrong if not updated correctly (the crawler only checks `master`).
- GitHub data is added as `.github` to each `component.json`.
- Watcher counts are not included because GitHub's search API does not include that field.

## API

### GET /.json

Returns an object:

- `users` - an object of all the users crawled.
- `components` - array of `component.json`s.

### GET /log

Return an event source stream of updates.

### GET /:user

Return all a user's components.

### PATCH /:user

Update all the components of a user.

### GET /:user/:repo

Return a repo's `component.json`.


## Development

### Setup

- create an AWS [S3](http://aws.amazon.com/en/s3/) bucket
- create an AWS [IAM](http://aws.amazon.com/en/iam/) user 
  - copy the ACCESS KEY and the SECRET
  - apply the __AmazonS3FullAccess__ policy to the user
- run these commands in your terminal:

```
export S3_KEY='<YOUR_KEY>'
export S3_SECRET='<YOUR_SECRET>'
export S3_BUCKET='<YOUR_BUCKET_NAME>'
```

### Test

`npm test`

### Start the app

`npm start` then open `localhost:3000` in your browser.
At the `localhost:3000/` you can type in a github username or organisation at the bottom and
after a while you can see the result at `localhost:3000/.json`

## License

The MIT License (MIT)

Copyright (c) 2014 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
