// =====================================
// Meryem Birthday Web — Access Gate
// -------------------------------------
// The secret key is NOT stored in plain
// text anywhere in the source code.
// It exists only as an encrypted
// fingerprint (obfuscated stamp) that
// is verified at runtime.
// =====================================

(function () {
  "use strict";

  // Session flag name (nothing secret here)
  var GATE_KEY = "mbw_gate_ok";

  // In-memory fallback when sessionStorage is blocked
  var unlockedInMemory = false;

  // -----------------------------------
  // Encrypted fingerprint parameters.
  // The real key never appears here.
  // -----------------------------------

  var SEED_A = "n7x#Q2pL";
  var SEED_B = "k9Z$w5Rf";

  // Reversed, double-seeded XOR stamp of the key.
  var STAMP = [123, 64, 85, 20, 7, 121, 40, 10, 112, 80, 107, 69, 123];

  // Cross-check sums of the key characters.
  var SUM_EXPECTED = 1115;
  var SUMSQ_EXPECTED = 104857;

  var KEY_LENGTH = 13;

  /**
   * Mix one character code with both seeds.
   * @param {number} code character code
   * @param {number} idx  position
   * @returns {number} mixed fingerprint byte
   */
  function mix(code, idx) {
    var a = SEED_A.charCodeAt(idx % 8);
    var b = SEED_B.charCodeAt((idx * 3) % 8);
    return code ^ a ^ b ^ 0x33;
  }

  /**
   * Verify a candidate key without ever
   * comparing against plain text.
   * @param {string} input candidate key
   * @returns {boolean} true when the key matches
   */
  function verify(input) {
    if (!input || input.length !== KEY_LENGTH) {
      return false;
    }

    var sum = 0;
    var sumSq = 0;

    for (var i = 0; i < KEY_LENGTH; i++) {
      var code = input.charCodeAt(i);
      sum += code;
      sumSq += code * code;
      if (mix(code, i) !== STAMP[KEY_LENGTH - 1 - i]) {
        return false;
      }
    }

    return sum === SUM_EXPECTED && sumSq === SUMSQ_EXPECTED;
  }

  // -----------------------------------
  // Public API
  // -----------------------------------

  window.MBWGate = {

    /**
     * Attempt to unlock with a candidate key.
     * @param {string} input candidate key
     * @returns {boolean} success
     */
    unlock: function (input) {
      if (!verify(input)) {
        return false;
      }
      try {
        sessionStorage.setItem(GATE_KEY, "1");
      } catch (e) {
        /* storage unavailable — fall back to in-memory flag */
        unlockedInMemory = true;
      }
      return true;
    },

    /**
     * Whether the current browser session is unlocked.
     * @returns {boolean}
     */
    isUnlocked: function () {
      try {
        return unlockedInMemory || sessionStorage.getItem(GATE_KEY) === "1";
      } catch (e) {
        return unlockedInMemory;
      }
    },

    /**
     * Lock the session again.
     */
    lock: function () {
      unlockedInMemory = false;
      try {
        sessionStorage.removeItem(GATE_KEY);
      } catch (e) {
        /* ignore */
      }
    }
  };
})();
