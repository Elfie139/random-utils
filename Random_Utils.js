/*
   This extension was made with TurboBuilder!
   https://turbobuilder-steel.vercel.app/
*/
(async function(Scratch) {
    const variables = {};
    const blocks = [];
    const menus = [];


    if (!Scratch.extensions.unsandboxed) {
        alert("This extension needs to be unsandboxed to run!")
        return
    }

    function doSound(ab, cd, runtime) {
        const audioEngine = runtime.audioEngine;

        const fetchAsArrayBufferWithTimeout = (url) =>
            new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                let timeout = setTimeout(() => {
                    xhr.abort();
                    reject(new Error("Timed out"));
                }, 5000);
                xhr.onload = () => {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
                    }
                };
                xhr.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to request ${url}`));
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url);
                xhr.send();
            });

        const soundPlayerCache = new Map();

        const decodeSoundPlayer = async (url) => {
            const cached = soundPlayerCache.get(url);
            if (cached) {
                if (cached.sound) {
                    return cached.sound;
                }
                throw cached.error;
            }

            try {
                const arrayBuffer = await fetchAsArrayBufferWithTimeout(url);
                const soundPlayer = await audioEngine.decodeSoundPlayer({
                    data: {
                        buffer: arrayBuffer,
                    },
                });
                soundPlayerCache.set(url, {
                    sound: soundPlayer,
                    error: null,
                });
                return soundPlayer;
            } catch (e) {
                soundPlayerCache.set(url, {
                    sound: null,
                    error: e,
                });
                throw e;
            }
        };

        const playWithAudioEngine = async (url, target) => {
            const soundBank = target.sprite.soundBank;

            let soundPlayer;
            try {
                const originalSoundPlayer = await decodeSoundPlayer(url);
                soundPlayer = originalSoundPlayer.take();
            } catch (e) {
                console.warn(
                    "Could not fetch audio; falling back to primitive approach",
                    e
                );
                return false;
            }

            soundBank.addSoundPlayer(soundPlayer);
            await soundBank.playSound(target, soundPlayer.id);

            delete soundBank.soundPlayers[soundPlayer.id];
            soundBank.playerTargets.delete(soundPlayer.id);
            soundBank.soundEffects.delete(soundPlayer.id);

            return true;
        };

        const playWithAudioElement = (url, target) =>
            new Promise((resolve, reject) => {
                const mediaElement = new Audio(url);

                mediaElement.volume = target.volume / 100;

                mediaElement.onended = () => {
                    resolve();
                };
                mediaElement
                    .play()
                    .then(() => {
                        // Wait for onended
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });

        const playSound = async (url, target) => {
            try {
                if (!(await Scratch.canFetch(url))) {
                    throw new Error(`Permission to fetch ${url} denied`);
                }

                const success = await playWithAudioEngine(url, target);
                if (!success) {
                    return await playWithAudioElement(url, target);
                }
            } catch (e) {
                console.warn(`All attempts to play ${url} failed`, e);
            }
        };

        playSound(ab, cd)
    }
    class Extension {
        getInfo() {
            return {
                "blockIconURI": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAloAAAJaCAYAAAD3W+nqAAAAAXNSR0IArs4c6QAAIABJREFUeF7t3QvQdWdVH/CFIJWbqAgVUVAD02ZBgVKLBjUiVhkupYrcGUAkKBCgtSitIloHEdtCrVyjXAQcC4gXBgSmRKIiglxkiJHVqRgLKYqUEWtBUAnSs9s3Tgjf9+U95z3Pc/bez+/MMMNMzn7Ws37rmck/5z1n72ucffbZnw4vAgQIECBAgACBvQtcQ9Dau6kFCRAgQIAAAQL/T0DQchAIECBAgAABAo0EBK1GsJYlQIAAAQIECAhazgABAgQIECBAoJGAoNUI1rIECBAgQIAAAUHLGSBAgAABAgQINBIQtBrBWpYAAQIECBAgIGg5AwQIECBAgACBRgKCViNYyxIgQIAAAQIEBC1ngAABAgQIECDQSEDQagRrWQIECBAgQICAoOUMECBAgAABAgQaCQhajWAtS4AAAQIECBAQtJwBAgQIECBAgEAjAUGrEaxlCRAgQIAAAQKCljNAgAABAgQIEGgkIGg1grUsAQIECBAgQEDQcgYIECBAgAABAo0EBK1GsJYlQIAAAQIECAhazgABAgQIECBAoJGAoNUI1rIECBAgQIAAAUHLGSBAgAABAgQINBIQtBrBWpYAAQIECBAgIGg5AwQIECBAgACBRgKCViNYyxIgQIAAAQIEBC1ngAABAgQIECDQSEDQagRrWQIECBAgQICAoOUMECBAgAABAgQaCQhajWAtS4AAAQIECBAQtJwBAgQIECBAgEAjAUGrEaxlCRAgQIAAAQKCljNAgAABAgQIEGgkIGg1grUsAQIECBAgQEDQcgYIECBAgAABAo0EBK1GsJYlQIAAAQIECAhazgABAgQIECBAoJGAoNUI1rIECBAgQIAAAUHLGSBAgAABAgQINBIQtBrBWpYAAQIECBAgIGg5AwQIECBAgACBRgKCViNYyxIgQIAAAQIEBC1ngAABAgQIECDQSEDQagRrWQIECBAgQICAoOUMECBAgAABAgQaCQhajWAtS4AAAQIECBAQtJwBAgQIECBAgEAjAUGrEaxlCRAgQIAAAQKCljNAgAABAgQIEGgkIGg1grUsAQIECBAgQEDQcgYIECBAgAABAo0EBK1GsJYlQIAAAQIECAhazgABAgQIECBAoJGAoNUI1rIECBAgQIAAAUHLGSBAgAABAgQINBIQtBrBWpYAAQIECBAgIGg5AwQIECBAgACBRgKCViNYyxIgQIAAAQIEBC1ngAABAgQIECDQSEDQagRrWQIECBAgQICAoOUMECBAgAABAgQaCQhajWAtS4AAAQIECBAQtJwBAgQIECBAgEAjAUGrEaxlCRAgQIAAAQKCljNAgAABAgQIEGgkIGg1grUsAQIECBAgQEDQcgYIECBAgAABAo0EBK1GsJYlQIAAAQIECAhazgABAgQIECBAoJGAoNUI1rIECBAgQIAAAUHLGSBAgAABAgQINBIQtBrBWpYAAQIECBAgIGg5AwQIECBAgACBRgKCViNYyxIgQIAAAQIEBC1ngAABAgQIECDQSEDQagRrWQIECBAgQICAoOUMECBAgAABAgQaCQhajWAtS4AAAQIECBAQtJwBAgQIECBAgEAjAUGrEaxlCRAgQIAAAQKCljNAgAABAgQIEGgkIGg1grUsAQIECBAgQEDQcgYIECBAgAABAo0EBK1GsJYlQIAAAQIECAhazgABAgQIECBAoJGAoNUI1rIECBAgQIAAAUHLGSBAgAABAgQINBIQtBrBWpYAAQIECBAgIGg5AwQIECBAgACBRgKCViNYyxIgQIAAAQIEBC1ngAABAgQIECDQSEDQagRrWQIECBAgQICAoOUMECBAgAABAgQaCQhajWAtS4AAAQIECBAQtJwBAgQIECBAgEAjAUGrEaxlCRAgQIAAAQKCljNAgAABAgQIEGgkIGg1grUsAQIECBAgQEDQcgYIECBAgAABAo0EBK1GsJYlQIAAAQIECAhazgABAgQIECBAoJGAoNUI1rIECBAgQIAAAUHLGSBAgAABAgQINBIQtBrBWpYAAQIECBAgIGg5AwQIECBAgACBRgKCViNYyxIgQIAAAQIEBC1ngAABAgQIECDQSEDQagRrWQIECBAgQICAoOUMECBAgAABAgQaCQhajWAtS4AAAQIECBAQtJwBAgQIECBAgEAjAUGrEaxlCRAgQIAAAQKCljNAgAABAgQIEGgkIGg1grUsAQIECBAgQEDQcgYIECBAgAABAo0EBK1GsJYlQIAAAQIECAhazgABAgQIECBAoJGAoNUI1rIECBAgQIAAAUHLGSBAgAABAgQINBIQtBrBWpYAAQIECBAgIGg5AwQIECBAgACBRgKCViNYyxIgQIAAAQIEBC1ngAABAgQIECDQSEDQagRrWQIECBAgQICAoOUMECBAgAABAgQaCQhajWAtS4AAAQIECBAQtJwBAgQIECBAgEAjAUGrEaxlCRAgQIAAAQKCljNAgAABAgQIEGgkIGg1grUsAQIECBAgQEDQcgYIECBAgAABAo0EBK1GsJYlQIAAAQIECAhazgABAgQIECBAoJGAoNUI1rIECBAgQIAAAUHLGSBAgAABAgQINBIQtBrBWpYAAQIECBAgIGg5AwQIECBAgACBRgKCViNYyxIgQIAAAQIEBC1ngAABAgQIECDQSEDQagRrWQIECBAgQICAoOUMECBAgAABAgQaCQhajWAtS4AAAQIECBAQtJwBAgQIECBAgEAjAUGrEaxlCRAgQIAAAQKCljNAgAABAgQIEGgkIGg1grUsAQIECBAgQEDQcgYIECBAgAABAo0EBK1GsJYlQIAAAQIECAhazgABAgQIECBAoJGAoNUI1rIECBAgQIAAAUHLGSBAgAABAgQINBIQtBrBWpYAAQIECBAgIGg5AwQIECBAgACBRgKCViNYyxIgQIAAAQIEBC1ngAABAgQIECDQSEDQagRrWQIECBAgQICAoOUMECBAgAABAgQaCQhajWAtS4AAAQIECBAQtJwBAgQIECBAgEAjAUGrEaxlCRAgQIAAAQKCljNAgAABAgQIEGgkIGg1grUsAQIECBAgQEDQcgYIECBAgAABAo0EBK1GsJYlQIAAAQIECAhazgABAgQIECBAoJGAoNUI1rIECBAgQIAAAUHLGSBAgAABAgQINBIQtBrBWpYAAQIECBAgIGg5AwQIECBAgACBRgKCViNYyxIgQIAAAQIEBC1ngAABAgQIECDQSEDQagRrWQIECBAgQICAoOUMECBAgAABAgQaCQhajWAtS4AAAQIECBAQtJwBAgQIECBAgEAjAUGrEaxlCRAgQIAAAQKCljNAgAABAgQIEGgkIGg1grUsAQIECBAgQEDQcgYIECBAgAABAo0EBK1GsJYlQIAAAQIECAhazgABAgQIECBAoJGAoNUI1rIECBAgQIAAAUHLGSBAgAABAgQINBIQtBrBWpYAAQIECBAgIGg5AwQIECBAgACBRgKCViNYyxIgQIAAAQIEBC1ngAABAgQIECDQSEDQagRrWQIECBAgQICAoOUMECBAgAABAgQaCQha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",
                "id": "randutils",
                "name": "Random Utils",
                "color1": "#292929",
                "color2": "#1c1c1c",
                "blocks": blocks
            }
        }
    }
    blocks.push({
        opcode: `power`,
        blockType: Scratch.BlockType.REPORTER,
        text: `[NUM1]power[NUM2]`,
        arguments: {
            "NUM1": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2,
            },
            "NUM2": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2,
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`power`] = async (args, util) => {
        return (args["NUM1"] ** args["NUM2"])
    };

    blocks.push({
        opcode: `root`,
        blockType: Scratch.BlockType.REPORTER,
        text: `[NUM1]root[NUM2]`,
        arguments: {
            "NUM1": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 5,
            },
            "NUM2": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2,
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`root`] = async (args, util) => {
        return (args["NUM1"] ** (1 / args["NUM2"]))
    };

    blocks.push({
        opcode: `reportertoboolean`,
        blockType: Scratch.BlockType.BOOLEAN,
        text: `[REPORTER]`,
        arguments: {
            "REPORTER": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'true',
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`reportertoboolean`] = async (args, util) => {
        return args["REPORTER"]
    };

    Scratch.extensions.register(new Extension());
})(Scratch);