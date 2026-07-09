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
var fs = require('fs');
var path = require('path');

var PKG_PATH = path.join(__dirname, '../package.json');
var PKG = require(PKG_PATH);

// Matches simple caret/tilde/exact semver ranges, e.g. "^1.2.3", "~1.2.3",
// "1.2.3".
var SEMVER_RANGE_RE = /^[\^~]?\d+\.\d+\.\d+$/;

describe('package.json', function() {
  describe('file integrity', function() {
    it('should be valid, parseable JSON', function() {
      var raw = fs.readFileSync(PKG_PATH, 'utf8');
      assert.doesNotThrow(function() {
        JSON.parse(raw);
      });
    });

    it('should not have been mutated by a bad merge (no dupe keys collapse)', function() {
      var raw = fs.readFileSync(PKG_PATH, 'utf8');
      var parsed = JSON.parse(raw);
      assert.deepEqual(Object.keys(parsed).sort(), Object.keys(PKG).sort());
    });
  });

  describe('dependencies', function() {
    it('should have a dependencies object', function() {
      assert.strictEqual(typeof PKG.dependencies, 'object');
      assert.notStrictEqual(PKG.dependencies, null);
    });

    var expectedDependencyVersions = {
      '@google-cloud/common': '^0.18.0',
      arrify: '^1.0.0',
      'async-each': '^1.0.1',
      extend: '^3.0.1',
      'google-auto-auth': '^0.9.0',
      'google-gax': '^0.16.1',
      'google-proto-files': '^0.18.0',
      grpc: '^1.8.4',
      is: '^3.0.1',
      'lodash.merge': '^4.6.0',
      'lodash.snakecase': '^4.1.1',
      protobufjs: '^7.5.6',
      uuid: '^11.1.1',
    };

    Object.keys(expectedDependencyVersions).forEach(function(depName) {
      it('should pin "' + depName + '" to ' + expectedDependencyVersions[depName], function() {
        assert.strictEqual(
          PKG.dependencies[depName],
          expectedDependencyVersions[depName]
        );
      });
    });

    it('should have exactly the expected set of dependencies', function() {
      assert.deepEqual(
        Object.keys(PKG.dependencies).sort(),
        Object.keys(expectedDependencyVersions).sort()
      );
    });

    it('should specify a valid semver range for every dependency', function() {
      Object.keys(PKG.dependencies).forEach(function(depName) {
        var range = PKG.dependencies[depName];
        assert.ok(
          SEMVER_RANGE_RE.test(range),
          depName + ' has an invalid semver range: ' + range
        );
      });
    });

    it('should have bumped protobufjs to a major version >= 7', function() {
      var version = PKG.dependencies.protobufjs.replace(/^[\^~]/, '');
      var major = parseInt(version.split('.')[0], 10);
      assert.ok(major >= 7, 'protobufjs major version should be >= 7');
    });

    it('should have bumped uuid to a major version >= 11', function() {
      var version = PKG.dependencies.uuid.replace(/^[\^~]/, '');
      var major = parseInt(version.split('.')[0], 10);
      assert.ok(major >= 11, 'uuid major version should be >= 11');
    });
  });

  describe('devDependencies', function() {
    it('should have a devDependencies object', function() {
      assert.strictEqual(typeof PKG.devDependencies, 'object');
      assert.notStrictEqual(PKG.devDependencies, null);
    });

    var expectedDevDependencyVersions = {
      '@google-cloud/nodejs-repo-tools': '^3.0.0',
      async: '^2.6.0',
      codecov: '^3.0.0',
      eslint: '^9.0.0',
      'eslint-config-prettier': '^2.8.0',
      'eslint-plugin-node': '^6.0.0',
      'eslint-plugin-prettier': '^2.3.1',
      'ink-docstrap': '^1.3.2',
      'intelli-espower-loader': '^1.0.1',
      jsdoc: '^4.0.0',
      mocha: '^6.0.0',
      nyc: '^12.0.0',
      'power-assert': '^1.4.4',
      prettier: '^1.9.1',
      proxyquire: '^1.7.10',
    };

    Object.keys(expectedDevDependencyVersions).forEach(function(depName) {
      it(
        'should pin "' + depName + '" to ' + expectedDevDependencyVersions[depName],
        function() {
          assert.strictEqual(
            PKG.devDependencies[depName],
            expectedDevDependencyVersions[depName]
          );
        }
      );
    });

    it('should have exactly the expected set of devDependencies', function() {
      assert.deepEqual(
        Object.keys(PKG.devDependencies).sort(),
        Object.keys(expectedDevDependencyVersions).sort()
      );
    });

    it('should specify a valid semver range for every devDependency', function() {
      Object.keys(PKG.devDependencies).forEach(function(depName) {
        var range = PKG.devDependencies[depName];
        assert.ok(
          SEMVER_RANGE_RE.test(range),
          depName + ' has an invalid semver range: ' + range
        );
      });
    });
  });

  describe('dependency/devDependency consistency', function() {
    it('should not declare the same package in both dependencies and devDependencies', function() {
      var depNames = Object.keys(PKG.dependencies);
      var devDepNames = Object.keys(PKG.devDependencies);

      var overlap = depNames.filter(function(name) {
        return devDepNames.indexOf(name) !== -1;
      });

      assert.deepEqual(overlap, []);
    });
  });

  describe('unrelated fields', function() {
    it('should not have changed the package name', function() {
      assert.strictEqual(PKG.name, '@google-cloud/pubsub');
    });

    it('should still expose a version string used by the client libraries', function() {
      assert.strictEqual(typeof PKG.version, 'string');
      assert.ok(PKG.version.length > 0);
    });

    it('should not have changed the main entry point', function() {
      assert.strictEqual(PKG.main, './src/index.js');
    });
  });
});