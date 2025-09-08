// Bridge file for tests that import './utils/test-helpers'
// Forward all exports to the consolidated helpers in src/test-utils
// This file was a temporary compatibility bridge and has been retired.
// Keep it harmless to avoid Jest test discovery. Import helpers from '../../test-utils/test-helpers'.
// Retired compatibility bridge - keep a tiny test to satisfy Jest discovery until all imports are migrated.
module.exports = {}

test('placeholder - utils/test-helpers bridge', () => {
    expect(true).toBe(true)
})
