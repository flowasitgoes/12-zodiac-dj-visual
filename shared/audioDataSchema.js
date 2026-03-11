/**
 * Shared audio data schema. Used by server (to send) and client (to consume).
 * @typedef {Object} AudioData
 * @property {number} time - Playback time in seconds
 * @property {number} energy - Normalized RMS (0-1)
 * @property {number} bass - Low frequency energy (0-1)
 * @property {number} treble - High frequency energy (0-1)
 * @property {number} centroid - Spectral centroid (Hz)
 * @property {number} spread - Spectral spread
 * @property {number} flatness - Spectral flatness (0-1)
 * @property {boolean} beat - True on beat hit
 */

function createDefault() {
  return {
    time: 0,
    energy: 0,
    bass: 0,
    treble: 0,
    centroid: 0,
    spread: 0,
    flatness: 0,
    beat: false
  };
}

module.exports = { createDefault };
