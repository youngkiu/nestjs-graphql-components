<p align="center">
  <a href="http://nestjs.com"><img src="https://nestjs.com/img/logo_text.svg" alt="Nest Logo" width="320" /></a>
</p>


[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

# GraphQL version of Algoan NestJS components

A collection of [NestJS](https://docs.nestjs.com) components. This repository is maintained with [lerna](https://github.com/lerna/lerna).

## Table of contents

- [Algoan NestJS components](#algoan-nestjs-components)
  - [Table of contents](#table-of-contents)
  - [NestJS Logging interceptor](#nestjs-gql-logging-interceptor)
  - [NestJS Http Exception Filter](#nestjs-gql-exception-filter)

## NestJS Logging interceptor

A simple NestJS interceptor catching request details and logging it using the built-in [Logger](https://docs.nestjs.com/techniques/logger#logger) class. It will use the default Logger implementation unless you pass your own to your Nest application.

See [the documentation here](packages/gql-logging-interceptor/).

## NestJS Http Exception Filter

A simple NestJS Http Exception Filter.

See [the documentation here](packages/gql-exception-filter/).

# Contribution

This repository is managed by [Lerna.js](https://lerna.js.org). If you want to contribute, you need to follow these instructions:

Install root dependencies:

```bash
npm install
```

That's it!
