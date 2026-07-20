/**
 * Copyright 2018, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const fs = require(`fs`);
const path = require(`path`);
const test = require(`ava`);

const pkgPath = path.join(__dirname, `..`, `package.json`);

test(`should be valid, parseable JSON`, t => {
  t.notThrows(() => JSON.parse(fs.readFileSync(pkgPath, `utf8`)));
});

test(`should pin @google-cloud/pubsub to the patched 0.20.0 version`, t => {
  const pkg = require(pkgPath);
  t.is(pkg.dependencies[`@google-cloud/pubsub`], `0.20.0`);
});

test(`should not depend on the vulnerable 0.16.3 version of @google-cloud/pubsub`, t => {
  const pkg = require(pkgPath);
  t.not(pkg.dependencies[`@google-cloud/pubsub`], `0.16.3`);
});

test(`should declare @google-cloud/pubsub as an exact (non-range) semver version`, t => {
  const pkg = require(pkgPath);
  const version = pkg.dependencies[`@google-cloud/pubsub`];
  t.regex(version, /^\d+\.\d+\.\d+$/);
});

test(`should leave the other declared dependency (yargs) untouched`, t => {
  const pkg = require(pkgPath);
  t.is(pkg.dependencies.yargs, `11.1.1`);
});

test(`should still declare exactly the same two dependencies`, t => {
  const pkg = require(pkgPath);
  t.deepEqual(Object.keys(pkg.dependencies).sort(), [
    `@google-cloud/pubsub`,
    `yargs`,
  ]);
});