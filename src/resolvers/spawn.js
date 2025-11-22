const { spawn } = require('node:child_process')
const os = require('node:os')

const spawnOptions = os.platform() === 'win32' ? {
  shell: true,
  windowsHide: true
} : {}

async function exec(command, args) {
  let stdout = ''
  let stderr = ''

  return new Promise((resolve, reject) => {
    const sub = spawn(command, args, spawnOptions)

    const handleError = err => {
      if (!err) err = new Error(stderr)
      err.stderr = stderr
      err.stdout = stdout
      reject(err)
    }

    sub.stdout.on('data', data => { stdout += data.toString() })
    sub.stderr.on('data', data => { stderr += data.toString() })

    sub.on('close', (code) => {
      if (code) {
        handleError()
      } else {
        resolve(stdout)
      }
    })
    sub.on('error', handleError)
  })
}

module.exports = exec
