# ComponentCommunication

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.7.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## TODO

* add proper way to handle styling for svg, use encapsulation, not global config, or consider to move styles in lib 
  * current approach is bad, need to refactor code.
* add layout for large graphs - ✔
  * <http://kateto.net/netscix2016>
  * <https://news.ycombinator.com/item?id=17946383>
* Add sidebar with possibility to select components - ✔
* Add possibility to see data contracts from diagram 
* Fetch definition of component communication form source - ✔
* zooming, proper size selection.
  * <https://stackoverflow.com/questions/16178366/d3-js-set-initial-zoom-level>