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

var pkg = require('../package.json');

describe('package.json', function() {
  var raw;

  before(function() {
    raw = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8');
  });

  it('should be valid, parseable JSON', function() {
    assert.doesNotThrow(function() {
      JSON.parse(raw);
    });
  });

  describe('dependencies', function() {
    // These are the packages that were bumped in this change. Pinning the
    // exact expected range here guards against accidental downgrades or
    // typos creeping back in.
    var expectedVersions = {
      '@google-cloud/common': '^0.18.0',
      'google-gax': '^0.16.1',
      'google-proto-files': '^0.18.0',
      protobufjs: '^7.5.6',
      uuid: '^11.1.1',
    };

    Object.keys(expectedVersions).forEach(function(name) {
      it('should depend on ' + name + ' at ' + expectedVersions[name], function() {
        assert.strictEqual(pkg.dependencies[name], expectedVersions[name]);
      });
    });

    it('should not have downgraded any dependency below the previous version', function() {
      var previousVersions = {
        '@google-cloud/common': '0.16.0',
        'google-gax': '0.14.2',
        'google-proto-files': '0.15.0',
        protobufjs: '6.8.1',
        uuid: '3.1.0',
      };

      Object.keys(previousVersions).forEach(function(name) {
        var previousMajor = parseInt(previousVersions[name].split('.')[0], 10);
        var currentRange = pkg.dependencies[name];

        assert.ok(currentRange, name + ' is missing from dependencies');

        var currentMajor = parseInt(
          currentRange.replace(/^[\^~]/, '').split('.')[0],
          10
        );

        assert.ok(
          currentMajor >= previousMajor,
          name +
            ' major version regressed: ' +
            previousVersions[name] +
            ' -> ' +
            currentRange
        );
      });
    });
  });

  describe('devDependencies', function() {
    var expectedVersions = {
      '@google-cloud/nodejs-repo-tools': '^3.0.0',
      eslint: '^9.0.0',
      jsdoc: '^4.0.0',
      mocha: '^6.0.0',
      nyc: '^12.0.0',
    };

    Object.keys(expectedVersions).forEach(function(name) {
      it(
        'should depend on ' + name + ' at ' + expectedVersions[name],
        function() {
          assert.strictEqual(pkg.devDependencies[name], expectedVersions[name]);
        }
      );
    });
  });

  it('should not declare the same package in both dependencies and devDependencies', function() {
    var deps = Object.keys(pkg.dependencies || {});
    var devDeps = Object.keys(pkg.devDependencies || {});

    var overlap = deps.filter(function(name) {
      return devDeps.indexOf(name) !== -1;
    });

    assert.deepEqual(overlap, []);
  });

  it('should use valid semver range strings for all dependency versions', function() {
    var semverRangePattern = /^[\^~]?\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

    ['dependencies', 'devDependencies'].forEach(function(section) {
      Object.keys(pkg[section] || {}).forEach(function(name) {
        var version = pkg[section][name];

        assert.ok(
          semverRangePattern.test(version),
          section + '.' + name + ' has an invalid version range: ' + version
        );
      });
    });
  });

  it('should not have any empty dependency version strings', function() {
    ['dependencies', 'devDependencies'].forEach(function(section) {
      Object.keys(pkg[section] || {}).forEach(function(name) {
        assert.notStrictEqual(pkg[section][name], '');
        assert.notStrictEqual(pkg[section][name], undefined);
      });
    });
  });
});