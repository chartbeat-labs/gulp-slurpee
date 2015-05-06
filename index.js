'use strict';

var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var util = require('util');
var argv = require('yargs').argv;
var Promise = require('bluebird');

/**
 * Looks up what gulp bin should be used.
 * In order of priority:
 * 	1. Global gulp
 * 	2. Gulp local to where script is ran.
 * 	3. Our own gulp bin.
 */
function getGulpBin() {
  var globalGulp = '/usr/local/bin/gulp';

  if (fs.existsSync(globalGulp)) {
    return globalGulp;
  }

  var localGulpPath = 'node_modules/gulp/bin/gulp.js';

  var localGulp = path.join(process.cwd(), localGulpPath);

  if (fs.existsSync(localGulp)) {
    return localGulp;
  }

  var selfGulp = path.join(__dirname, localGulpPath);

  if (fs.existsSync(selfGulp)) {
    return selfGulp;
  }
}

var TASK = {
  COMMAND: getGulpBin(),
  FILE: 'gulpfile.js'
};

/**
 * Does this directory have a task file?
 * @param  {string}  directory
 * @return {boolean}
 */
function taskFileExists(directory) {
  return fs.existsSync(path.join(directory, TASK.FILE));
}

/**
 * For a given base path this will find and return an array of all paths that
 * contain a task file.
 * @param  {Array.<string>} dirs Array of directory paths.
 * @return {Array.<string>}
 */
function getTaskFilePaths(dirs) {
  var directories = [];

  // Loop through every directory path
  dirs.forEach(function(dir) {

    // If a task file exists in this directory and we have not
    // yet added it to our array of directories then add it.
    if (taskFileExists(dir) && directories.indexOf(dir) === -1) {
      directories.push(dir);

    // Ensure the directory we're accessing is a directory
    } else if (fs.statSync(dir).isDirectory()) {

      // Read all contents of the file directory and map them to have
      // the full path to their location.
      var filesInDir = fs.readdirSync(dir).map(function(d) {
        return path.join(dir, d);
      });

      // Recursively call this function to gather all children directories.
      directories = directories.concat(getTaskFilePaths(filesInDir));
    }
  });

  return directories;
}

var childProcs = [];

/**
 * Kills all child processes.
 * @param  {string} dirWithErr The directory where the error ocured.
 */
var killAllTasks = (function() {
  var triggered = false;

  return function(dirWithErr) {
    // Only run when first invoked.
    if (triggered) {
      return;
    }
    triggered = true;

    childProcs.forEach(function(child) {
      child.kill();
    });

    console.log('\n');
    console.log('Encountered an error in: ' + dirWithErr);
    console.log('Please resolve errors and try again.\n');
  };
})();

/**
 * Spawn a task in a directory
 * @param  {string} directory Directory to spawn task in
 * @param  {string} task      Task we want to run
 * @return {ChildProcess}
 */
function spawnTask(directory, task) {
  var child = spawn(TASK.COMMAND, [task], {
    cwd: directory
  });

  // Debug string used when outputting in terminal
  // If the directory path is long then only add one tab so that
  // all output aligns in the console.
  var tabLength = directory.length > 22 ? '\t' : '\t\t';
  var debugStr = util.format('(%s)%s-> ', directory, tabLength);

  // Handles std{out,err} from child process.
  function dataMsg(data) {
    process.stdout.write(debugStr + data);
  }

  child.stdout.on('data', dataMsg);
  child.stderr.on('data', dataMsg);

  return child;
}

/**
 * Exported function that begins the process of spawning individual gulp tasks.
 */
exports.run = function() {
  var task = '';
  var argDirectories;
  var runArguments = arguments.length ?
    Array.prototype.slice.call(arguments) :
    argv._;
  var lastArgv = runArguments.pop();

  /**
   * Guess what our task is.
   * We check the last process argument value to see if
   * it exists on the file system, and if it does
   * then the last argument is a directory and hence
   * we should use the `default` task.
   */
  if (fs.existsSync(lastArgv)) {
    task = 'default';
    // Re-join full directory list
    argDirectories = runArguments.concat(lastArgv);
  } else {
    task = lastArgv;
    // Ensure always array
    argDirectories = [].concat(runArguments);
  }

  // Array of directories we will run our task in.
  var taskDirectories = getTaskFilePaths(argDirectories);

  console.log('Running cmd:   ' + TASK.COMMAND + ' ' + task);
  console.log('In directories: ');
  taskDirectories.forEach(function(dir) {
    console.log('           ' + dir);
  });
  console.log('\n----------\n');

  // Return a promise that will be resolved when all the tasks complete
  return new Promise(function(resolve, reject) {
    if (!taskDirectories.length) {
      resolve();
      return;
    }

    var waitingForDirs = [].concat(taskDirectories);
    var doneWithDir = function(dir) {
      var index = waitingForDirs.indexOf(dir);
      if (index > -1) {
        waitingForDirs.splice(index, 1);
      }
      if (waitingForDirs.length === 0) {
        // If all child processes have finished, we're done.
        resolve();
      }
    };

    taskDirectories.forEach(function(dir) {
      var childProc = spawnTask(dir, task);
      childProcs.push(childProc);

      childProc.on('exit', function(code) {
        if (code === 0) {
          // 0 exit code means success
          doneWithDir(dir);
        } else {
          // non-zero exit means failure
          reject();

          killAllTasks(dir);
          process.exit(1);
        }
      });
    });
  });
};
