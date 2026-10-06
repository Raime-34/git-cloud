const { spawn } = require('child_process')

function runGit(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, {
      cwd,
      windowsHide: true,
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', (err) => {
      // ENOTFOUND / git не в PATH
      reject(err)
    })

    child.on('close', (code) => {
      resolve({ code, stdout, stderr })
    })
  })
}

async function gitVersion() {
  try {
    const { code, stdout, stderr } = await runGit(['--version'])
    if (code !== 0) {
      return { ok: false, error: stderr.trim() || 'git failed' }
    }
    // "git version 2.45.2"
    const version = stdout.trim().replace(/^git version\s+/i, '')
    return { ok: true, version, raw: stdout.trim() }
  } catch (err) {
    return {
      ok: false,
      error: err.code === 'ENOENT' ? 'git not found in PATH' : String(err.message),
    }
  }
}

async function cloneRepo(repoUrl) {
    const version = await gitVersion();
    if (!version.ok) {
        return { ok: false, error: 'Git is not intalled' }
    }

    const { code, stdout, stderr } = await runGit(
        ['clone', repoUrl]
    )

    if (code !== 0) {
      return { ok: false, error: stderr.trim() || 'clone failed' }
    }
    return { ok: true, path: targetDir }
}

module.exports = { gitVersion, cloneRepo }