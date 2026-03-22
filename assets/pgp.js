// ============================================================
//  GPG Key generation — pure Web Crypto, no external libs
//  Produces OpenPGP v4 packets importable by GnuPG 2.x
// ============================================================

// ── OpenPGP packet helpers ────────────────────────────────────

/** New-format packet length encoding (RFC 4880 §4.2.2) */
function pgpLen(n) {
    if (n < 192) {
        return new Uint8Array([n]);
    } else if (n < 8384) {
        const b = n - 192;
        return new Uint8Array([((b >> 8) & 0xFF) + 192, b & 0xFF]);
    } else {
        return new Uint8Array([0xFF, (n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF]);
    }
}

/** Wrap body in a new-format OpenPGP packet */
function pgpPacket(tag, body) {
    return concatBytes(new Uint8Array([0xC0 | tag]), pgpLen(body.length), body);
}

/** Big-endian uint32 */
function pgpUint32(n) {
    return new Uint8Array([(n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF]);
}

/** Big-endian uint16 */
function pgpUint16(n) {
    return new Uint8Array([(n >>> 8) & 0xFF, n & 0xFF]);
}

/**
 * OpenPGP MPI encoding.
 * Strips leading zeros, computes actual bit length, prepends 2-byte bit count.
 */
function pgpMPI(bytes) {
    let start = 0;
    while (start < bytes.length - 1 && bytes[start] === 0) start++;
    bytes = bytes.slice(start);

    const highByte = bytes[0];
    let bits = (bytes.length - 1) * 8;
    for (let b = highByte; b > 0; b >>= 1) bits++;

    return concatBytes(pgpUint16(bits), bytes);
}

// ── V4 Fingerprint & Key ID ───────────────────────────────────

async function v4Fingerprint(keyBody) {
    // SHA-1( 0x99 || uint16(len) || key_body )
    const data = concatBytes(
        new Uint8Array([0x99]),
        pgpUint16(keyBody.length),
        keyBody,
    );
    const hash = await crypto.subtle.digest('SHA-1', data);
    return new Uint8Array(hash);
}

function v4KeyId(fingerprint) {
    return fingerprint.slice(12); // last 8 bytes
}

// ── CRC-24 (ASCII armor checksum) ────────────────────────────

function crc24(data) {
    let crc = 0xB704CE;
    for (let i = 0; i < data.length; i++) {
        crc ^= data[i] << 16;
        for (let j = 0; j < 8; j++) {
            crc <<= 1;
            if (crc & 0x1000000) crc ^= 0x1864CFB;
        }
    }
    return crc & 0xFFFFFF;
}

// ── ASCII Armor ───────────────────────────────────────────────

function armorBlock(type, data) {
    const b64    = bytesToB64(data);
    const lines  = b64.match(/.{1,76}/g) || [''];
    const crc    = crc24(data);
    const crcB64 = bytesToB64(new Uint8Array([(crc >> 16) & 0xFF, (crc >> 8) & 0xFF, crc & 0xFF]));
    return `-----BEGIN PGP ${type}-----\n\n${lines.join('\n')}\n=${crcB64}\n-----END PGP ${type}-----`;
}

// ── Ed25519 OID (RFC 4880bis §13.3) ──────────────────────────

const ED25519_OID = new Uint8Array([0x2B, 0x06, 0x01, 0x04, 0x01, 0xDA, 0x47, 0x0F, 0x01]);

// ── Public key body builders ──────────────────────────────────

function buildEd25519PubBody(timestamp, pubKeyBytes) {
    const oidField = concatBytes(new Uint8Array([ED25519_OID.length]), ED25519_OID);
    // MPI: 263 bits. Value = 0x40 ++ pubKeyBytes (32 bytes).
    // bit count = 263 = 0x0107; data starts with 0x40 (the prefix byte).
    const mpiField = concatBytes(pgpUint16(263), new Uint8Array([0x40]), pubKeyBytes);
    return concatBytes(
        new Uint8Array([4]),       // version
        pgpUint32(timestamp),      // creation time
        new Uint8Array([22]),       // algorithm: EdDSA (22)
        oidField,
        mpiField,
    );
}

function buildRSAPubBody(timestamp, nBytes, eBytes) {
    return concatBytes(
        new Uint8Array([4]),       // version
        pgpUint32(timestamp),      // creation time
        new Uint8Array([1]),        // algorithm: RSA (1)
        pgpMPI(nBytes),            // MPI(n)
        pgpMPI(eBytes),            // MPI(e)
    );
}

// ── Secret key material builders ─────────────────────────────

/** Simple sum of bytes mod 65536 (S2K usage 0, unencrypted) */
function secretKeyChecksum(secretBytes) {
    let sum = 0;
    for (let i = 0; i < secretBytes.length; i++) sum = (sum + secretBytes[i]) & 0xFFFF;
    return pgpUint16(sum);
}

function buildEd25519SecretBody(pubBody, seedBytes) {
    // Ed25519 private scalar MPI: 254 bits declared (0x00FE)
    const secretMPI = concatBytes(pgpUint16(254), seedBytes);
    const checksum  = secretKeyChecksum(secretMPI);
    return concatBytes(pubBody, new Uint8Array([0x00]), secretMPI, checksum);
}

function buildRSASecretBody(pubBody, dBytes, pBytes, qBytes, uBytes) {
    const secretMPIs = concatBytes(
        pgpMPI(dBytes),
        pgpMPI(pBytes),
        pgpMPI(qBytes),
        pgpMPI(uBytes),
    );
    const checksum = secretKeyChecksum(secretMPIs);
    return concatBytes(pubBody, new Uint8Array([0x00]), secretMPIs, checksum);
}

// ── Shared self-sig construction ──────────────────────────────

/**
 * Build a v4 self-certification signature packet (type 0x10).
 * `pubBody`  — the public key body bytes (used to compute fingerprint/key-id)
 * `uidBytes` — raw UTF-8 UID
 * `pkAlgo`   — OpenPGP algorithm id (22=EdDSA, 1=RSA)
 * `timestamp`— Unix creation time
 * `doSign`   — async function(hashInput: Uint8Array) => sigMPIs: Uint8Array
 */
async function buildSelfSigPacket(pubBody, uidBytes, pkAlgo, timestamp, doSign) {
    const sigType  = 0x10;  // positive certification
    const hashAlgo = 8;     // SHA-256

    // Hashed subpackets
    const spCreationTime = concatBytes(new Uint8Array([5, 2]), pgpUint32(timestamp));
    const spKeyFlags     = new Uint8Array([2, 27, 0x03]);  // certify + sign
    const spPrefHash     = new Uint8Array([2, 21, 8]);     // SHA-256
    const spFeatures     = new Uint8Array([2, 30, 1]);     // MDC

    const hashedSubpkts    = concatBytes(spCreationTime, spKeyFlags, spPrefHash, spFeatures);
    const hashedSubpktsLen = pgpUint16(hashedSubpkts.length);

    // Fingerprint → key id for issuer subpacket
    const fingerprint        = await v4Fingerprint(pubBody);
    const keyId              = v4KeyId(fingerprint);
    const spIssuer           = concatBytes(new Uint8Array([9, 16]), keyId);
    const unhashedSubpkts    = spIssuer;
    const unhashedSubpktsLen = pgpUint16(unhashedSubpkts.length);

    // Sig trailer (RFC 4880 §5.2.4)
    const trailerLen = 6 + hashedSubpkts.length;
    const sigTrailer = concatBytes(
        new Uint8Array([4, sigType, pkAlgo, hashAlgo]),
        hashedSubpktsLen,
        hashedSubpkts,
        new Uint8Array([4, 0xFF]),
        pgpUint32(trailerLen),
    );

    // Hash input = key_hash_data || uid_hash_data || sig_trailer
    const keyHashData = concatBytes(new Uint8Array([0x99]), pgpUint16(pubBody.length), pubBody);
    const uidHashData = concatBytes(new Uint8Array([0xB4]), pgpUint32(uidBytes.length), uidBytes);
    const hashInput   = concatBytes(keyHashData, uidHashData, sigTrailer);

    // SHA-256 digest (for left-two-bytes quick check field)
    const digest  = new Uint8Array(await crypto.subtle.digest('SHA-256', hashInput));
    const leftTwo = digest.slice(0, 2);

    // Caller produces the actual signature MPIs
    const sigMPIs = await doSign(hashInput);

    const sigBody = concatBytes(
        new Uint8Array([4, sigType, pkAlgo, hashAlgo]),
        hashedSubpktsLen,
        hashedSubpkts,
        unhashedSubpktsLen,
        unhashedSubpkts,
        leftTwo,
        sigMPIs,
    );

    return pgpPacket(2, sigBody);
}

// ── Ed25519 key generation ────────────────────────────────────

async function generateEd25519GPGPair(uid) {
    const timestamp = Math.floor(Date.now() / 1000);

    const keyPair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);

    // 32-byte raw public key
    const pubRaw  = new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey));
    // 32-byte seed from JWK 'd' field
    const privJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
    const seed    = b64urlToBytes(privJwk.d);

    const pubBody  = buildEd25519PubBody(timestamp, pubRaw);
    const secBody  = buildEd25519SecretBody(pubBody, seed);

    const uidStr   = uid || 'Generated by Passgen <passgen@local>';
    const uidBytes = new TextEncoder().encode(uidStr);

    const sigPacket = await buildSelfSigPacket(pubBody, uidBytes, 22, timestamp, async (hashInput) => {
        // Ed25519 (PureEdDSA): sign the full message — Web Crypto does NOT pre-hash
        const sigRaw = new Uint8Array(await crypto.subtle.sign({ name: 'Ed25519' }, keyPair.privateKey, hashInput));
        const rBytes = sigRaw.slice(0, 32);
        const sBytes = sigRaw.slice(32, 64);
        return concatBytes(pgpMPI(rBytes), pgpMPI(sBytes));
    });

    const secPacket = pgpPacket(5, secBody);
    const pubPacket = pgpPacket(6, pubBody);
    const uidPacket = pgpPacket(13, uidBytes);

    const privateKeyData = concatBytes(secPacket, uidPacket, sigPacket);
    const publicKeyData  = concatBytes(pubPacket, uidPacket, sigPacket);

    return {
        privateKey: armorBlock('PRIVATE KEY BLOCK', privateKeyData),
        publicKey:  armorBlock('PUBLIC KEY BLOCK',  publicKeyData),
    };
}

// ── RSA key generation ────────────────────────────────────────

async function generateRSAGPGPair(bits, uid) {
    const timestamp = Math.floor(Date.now() / 1000);

    const keyPair = await crypto.subtle.generateKey(
        {
            name:           'RSASSA-PKCS1-v1_5',
            modulusLength:  bits,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash:           'SHA-256',
        },
        true,
        ['sign', 'verify'],
    );

    const jwk     = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
    const nBytes  = b64urlToBytes(jwk.n);
    const eBytes  = b64urlToBytes(jwk.e);
    const dBytes  = b64urlToBytes(jwk.d);
    const pBytes  = b64urlToBytes(jwk.p);
    const qBytes  = b64urlToBytes(jwk.q);
    const qiBytes = b64urlToBytes(jwk.qi); // u = qi (q inverse mod p in JWK = OpenPGP u)

    const pubBody = buildRSAPubBody(timestamp, nBytes, eBytes);
    const secBody = buildRSASecretBody(pubBody, dBytes, pBytes, qBytes, qiBytes);

    const uidStr   = uid || 'Generated by Passgen <passgen@local>';
    const uidBytes = new TextEncoder().encode(uidStr);

    const sigPacket = await buildSelfSigPacket(pubBody, uidBytes, 1, timestamp, async (hashInput) => {
        // RSASSA-PKCS1-v1_5 with SHA-256: Web Crypto hashes internally
        const sigRaw = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keyPair.privateKey, hashInput));
        return pgpMPI(sigRaw);
    });

    const secPacket = pgpPacket(5, secBody);
    const pubPacket = pgpPacket(6, pubBody);
    const uidPacket = pgpPacket(13, uidBytes);

    const privateKeyData = concatBytes(secPacket, uidPacket, sigPacket);
    const publicKeyData  = concatBytes(pubPacket, uidPacket, sigPacket);

    return {
        privateKey: armorBlock('PRIVATE KEY BLOCK', privateKeyData),
        publicKey:  armorBlock('PUBLIC KEY BLOCK',  publicKeyData),
    };
}

// ── GPG tab setup ─────────────────────────────────────────────

(function setupGPG() {
    const typeSelect  = document.getElementById('gpg-type');
    const uidInput    = document.getElementById('gpg-uid');
    const resultEl    = document.getElementById('gpg-result');
    const generateBtn = document.getElementById('gpg-generate');
    const clearBtn    = document.getElementById('gpg-clear');
    const downloadBtn = document.getElementById('gpg-download');

    function renderResult(pair, baseName) {
        resultEl.innerHTML = '';
        const enc = new TextEncoder();

        [
            { label: 'gpg_private_label', val: pair.privateKey },
            { label: 'gpg_public_label',  val: pair.publicKey  },
        ].forEach(({ label, val }) => {
            const block = document.createElement('div');
            block.className = 'ssh-key-block';

            const header = document.createElement('div');
            header.className = 'ssh-key-header';

            const labelEl = document.createElement('span');
            labelEl.className   = 'gen-label';
            labelEl.textContent = t(label);

            const copyBtn = document.createElement('button');
            copyBtn.type      = 'button';
            copyBtn.className = 'pw-copy-btn';
            copyBtn.innerHTML = ICON_COPY;
            copyBtn.title     = t('btn_copy');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(val).then(() => {
                    copyBtn.innerHTML = ICON_CHECK;
                    copyBtn.classList.add('copied');
                    setTimeout(() => { copyBtn.innerHTML = ICON_COPY; copyBtn.classList.remove('copied'); }, 2000);
                });
            });

            header.appendChild(labelEl);
            header.appendChild(copyBtn);

            const textarea = document.createElement('textarea');
            textarea.className    = 'ssh-key-textarea';
            textarea.readOnly     = true;
            textarea.spellcheck   = false;
            textarea.autocomplete = 'off';
            textarea.value        = val;
            textarea.rows         = val.split('\n').length + 1;

            block.appendChild(header);
            block.appendChild(textarea);
            resultEl.appendChild(block);
        });

        requestAnimationFrame(() => {
            resultEl.querySelectorAll('.ssh-key-textarea').forEach(ta => {
                if (ta.scrollHeight > 0) {
                    ta.style.height = 'auto';
                    ta.style.height = Math.min(ta.scrollHeight, 380) + 'px';
                }
            });
        });

        downloadBtn.classList.remove('hidden');
        downloadBtn.onclick = () => {
            downloadZip(`${baseName}.zip`, [
                { name: `${baseName}.asc`,     bytes: enc.encode(pair.privateKey) },
                { name: `${baseName}.pub.asc`, bytes: enc.encode(pair.publicKey)  },
            ]);
        };
    }

    function clearResult() {
        resultEl.innerHTML = '';
        downloadBtn.classList.add('hidden');
        downloadBtn.onclick = null;
    }

    async function generate() {
        generateBtn.disabled    = true;
        generateBtn.textContent = t('gpg_generating');
        try {
            const type = typeSelect.value;
            const uid  = uidInput.value.trim() || '';

            let pair;
            if (type === 'ed25519') {
                pair = await generateEd25519GPGPair(uid);
            } else {
                const bits = type === 'rsa4096' ? 4096 : 3072;
                pair = await generateRSAGPGPair(bits, uid);
            }

            const randBuf  = new Uint8Array(4);
            crypto.getRandomValues(randBuf);
            const baseName = 'gpg_' + Array.from(randBuf, b => b.toString(16).padStart(2, '0')).join('');
            renderResult(pair, baseName);
        } catch (err) {
            showError(err.message || 'GPG key generation failed');
        } finally {
            generateBtn.disabled    = false;
            generateBtn.textContent = t('btn_generate');
        }
    }

    clearBtn.addEventListener('click', clearResult);
    generateBtn.addEventListener('click', generate);
})();
