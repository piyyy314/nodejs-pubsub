/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var assert = require('assert');

var PKG = require('../package.json');

// Parses a caret/tilde/plain semver range string (e.g. "^0.30.0") into its
// numeric [major, minor, patch] parts so tests can assert on the minimum
// version allowed by the range without requiring the `semver` package.
function parseVersionParts(range) {
  var match = /(\d+)\.(\d+)\.(\d+)/.exec(range);
  assert(match, 'Expected a parseable semver range, got: ' + range);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

describe('package.json', function() {
  describe('dependencies', function() {
    it('should declare @google-cloud/common as a dependency', function() {
      assert(PKG.dependencies);
      assert.strictEqual(typeof PKG.dependencies['@google-cloud/common'], 'string');
    });

    it('should require @google-cloud/common at the patched ^0.30.0 range', function() {
      assert.strictEqual(PKG.dependencies['@google-cloud/common'], '^0.30.0');
    });

    it('should not allow a @google-cloud/common version below 0.30.0 (regression: pre-fix vulnerable range)', function() {
      var range = PKG.dependencies['@google-cloud/common'];
      var parts = parseVersionParts(range);
      var major = parts[0];
      var minor = parts[1];
      var patch = parts[2];

      var atLeastPatched =
        major > 0 || minor > 30 || (minor === 30 && patch >= 0);

      assert.strictEqual(
        atLeastPatched,
        true,
        'Expected @google-cloud/common range "' +
          range +
          '" to require at least version 0.30.0'
      );
    });

    it('should use a caret range so patch/minor updates are allowed but major bumps are not', function() {
      var range = PKG.dependencies['@google-cloud/common'];
      assert.strictEqual(range.charAt(0), '^');
    });
  });

  describe('metadata', function() {
    it('should remain valid, parseable JSON exposing a version string', function() {
      assert.strictEqual(typeof PKG.version, 'string');
    });

    it('should still list other pre-existing dependencies untouched by the bump', function() {
      assert.strictEqual(PKG.dependencies.arrify, '^1.0.0');
      assert.strictEqual(PKG.dependencies.extend, '^3.0.1');
    });
  });
});