# MOBDEVE CovIProg
Welcome to the Public-But-Not-So-Public API of **CovIProg**! This is a joint project of CovID and ProgramPlan to create a singular database server for both projects. This makes use of a REST API to function, therefore there will be no views. This is purely for educational purposes only.

**Status:** [![Heroku App Status](http://heroku-shields.herokuapp.com/covid-progplan)](https://covid-progplan.herokuapp.com)

## Usage
This API is deployed on [Heroku](https://covid-progplan.herokuapp.com/). However, you'll soon notice that, when opening the link, it only shows you a single line. This is intentional. The API has routes to be accessed via an HTTP Request for any functionality may be done.

The API's route is exposed through `/api/PROJECT/METHOD`. `PROJECT` may be replaced with either `covid` for CovID-related methods, or `progp` for ProgramPlan-related methods. Then, `METHOD` will be changed to the respective method route name.

A note: don't forget to set your `Content-Type` request header to `application/json`. This is especially true when using `XMLHttpRequest` to make your requests (like Neal is). Just call `.setRequestHeader("Content-Type", "application/json");`, then probably do `JSON.stringify()` to be extra sure.

## Security
There is no authentication measures in place, sadly, with the lack of time. Not to worry, there is expected to be **no** sensitive data present on this server. There will only be dummy data present.

## For Android Applications
As making an HTTP request on Android through Java will be nigh difficult, you are suggested to use [GSON](https://github.com/google/gson) and [RetroFit](https://square.github.io/retrofit/) in conjunction with your application to complete such requests in a JSON manner.

## Credits
Made by the Captain Stone team: Estella, Garcia, Ho, Lim 💓💓💓
