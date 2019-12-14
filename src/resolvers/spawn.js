const { spawn } = require('child_process')

async function exec (command, args) {
  let stdout = ''
  let stderr = ''

  return new Promise((resolve, reject) => {
    const sub = spawn(command, args, { windowsHide: true })

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
