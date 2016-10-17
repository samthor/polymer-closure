/*
 * Copyright 2016 The Closure Compiler Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const gulp = require('gulp');
const vulcanize = require('gulp-vulcanize');
const crisper = require('gulp-crisper');

gulp.task('merge', function() {
  return gulp.src('src/elements.html')
    .pipe(vulcanize({
      excludes: ['bower_components/polymer/polymer.html'],  // polymer doesn't compile properly
    }))
    .pipe(crisper({onlySplit: true}))  // don't inline script, since we compile it again
    .pipe(gulp.dest('dest'));
});

const closure = require('google-closure-compiler-js').gulp();
const fs = require('fs');

gulp.task('compile', ['merge'], function() {
  // nb. This is a bit awkward, but we need to load the Polymer externs so that
  // Closure can compile Polymer code correctly.
  const externsPath =
      'node_modules/google-closure-compiler-js/contrib/externs/polymer-1.0.js';
  const externsSrc = fs.readFileSync(externsPath, 'utf-8');

  return gulp.src('dest/elements.js')
    .pipe(closure({
      polymerPass: true,  // !! IMPORTANT !!
      externs: [
        {'src': externsSrc, 'path': 'polymer-1.0.js'}
      ],
      compilationLevel: 'SIMPLE',
      warningLevel: 'VERBOSE',
      jsOutputFile: 'elements.min.js',
      createSourceMap: true,
    }))
    .pipe(gulp.dest('dest'));
});

gulp.task('default', ['compile']);
